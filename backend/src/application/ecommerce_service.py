"""
Ecommerce service — public product listing and order creation from Stripe sessions.
"""
import ast
import logging
from decimal import Decimal
from uuid import UUID, uuid4
from typing import List, Optional
from datetime import datetime, timedelta, timezone

from src.domain.sales_entities import SalesOrder
from src.ports.repository import ProductRepository
from src.ports.sales_repository import SalesRepository
from src.application.stripe_service import StripeService
from src.domain.exceptions import InsufficientStockError

logger = logging.getLogger(__name__)

IGV_RATE = Decimal("0.18")
DISCOUNT_RATE = Decimal("0.02")


class EcommerceService:
    def __init__(
        self,
        product_repository: ProductRepository,
        sales_repository: SalesRepository,
        stripe_service: StripeService,
    ):
        self._products = product_repository
        self._sales = sales_repository
        self._stripe = stripe_service

    def list_public_products(self) -> list:
        """Return products that have a retail_price set and (stock > 0 or is_preorder or pending purchase orders)."""
        all_products = self._products.find_all()
        result = []
        for p in all_products:
            if not p.retail_price or p.retail_price <= 0:
                continue
            
            # Show if has stock OR is explicitly preorder OR has pending purchase orders
            if p.stock > 0 or p.is_preorder or p.has_pending_purchase_orders:
                result.append(p)
        return result

    def get_public_product(self, product_id: UUID):
        product = self._products.find_by_id(product_id)
        if not product or product.retail_price is None:
            return None
        return product

    def create_checkout_session(
        self,
        items: list,
        customer_email: str,
        customer_name: str,
        shipping_address: Optional[str],
        apply_discount: bool = False,
    ) -> dict:
        """Validate stock and create Stripe checkout session."""
        checkout_items = []
        for item in items:
            product = self._products.find_by_id(item.product_id)
            if not product:
                raise ValueError(f"Producto {item.product_id} no encontrado")
            if product.stock < item.quantity and not (product.is_preorder or product.has_pending_purchase_orders):
                raise ValueError(f"Stock insuficiente para {product.name}")
            if product.retail_price is None:
                raise ValueError(f"Producto {product.name} no tiene precio de venta")
            now = datetime.now(timezone(timedelta(hours=-5)))
            
            # 1. Promotional pricing strictly by date
            is_preorder_marked = product.is_preorder
            
            # Ensure estimated_delivery_date is aware before comparison
            est_date = product.estimated_delivery_date
            if est_date and est_date.tzinfo is None:
                est_date = est_date.replace(tzinfo=timezone(timedelta(hours=-5)))
                
            pricing_date_active = est_date is None or est_date > now
            promo_preorder_active = is_preorder_marked and pricing_date_active
            
            unit_price = product.preorder_price if (promo_preorder_active and product.preorder_price) else product.retail_price
            checkout_items.append({
                "product_id": str(product.id),
                "product_name": product.name,
                "unit_price": unit_price,
                "quantity": item.quantity,
                "image_path": product.image_path,
                "stripe_price_id": product.stripe_price_id,
            })

        return self._stripe.create_checkout_session(
            items=checkout_items,
            customer_email=customer_email,
            apply_discount=apply_discount,
        )

    def create_orders_from_session(self, session_id: str) -> dict:
        """Verify Stripe payment and create SalesOrders (one per item)."""
        session_data = self._stripe.verify_session(session_id)
        metadata = session_data["metadata"]
        
        from src.domain.sales_entities import get_local_time
        now = get_local_time()
        delivery_date = now + timedelta(hours=48)
        
        customer_email = metadata.get("customer_email", session_data["customer_email"])
        apply_discount = metadata.get("apply_discount", "False") == "True"
        shipping_type = metadata.get("shipping_type", "DELIVERY")
        shipping_address = metadata.get("shipping_address", "")
        items_json = metadata.get("items_json")
        
        # In mock mode, we might not have items_json if verify_session failed or was empty
        # but with our new _MOCK_SESSIONS it should be there.
        if not items_json:
            # Fallback for old/broken mock sessions
             return {
                "order_ids": [],
                "items": [],
                "total_amount": 0.0,
                "status": "EMPTY",
                "message": "No se encontraron items en la sesión."
            }
        
        import json
        try:
            items = json.loads(items_json)
        except (ValueError, TypeError):
            import ast
            items = ast.literal_eval(items_json)
        
        order_ids = []
        order_items = []
        total = Decimal("0.00")

        for item in items:
            product_id = UUID(item["product_id"])
            product = self._products.find_by_id(product_id)
            if not product:
                continue

            quantity = int(item["quantity"])
            unit_price = Decimal(str(item["unit_price"]))
            if apply_discount:
                unit_price = unit_price * (1 - DISCOUNT_RATE)

            subtotal = unit_price * quantity
            tax = subtotal * IGV_RATE
            item_total = subtotal + tax

            order = SalesOrder(
                id=uuid4(),
                customer_name=customer_email.split("@")[0],
                customer_email=customer_email,
                product_id=product_id,
                quantity=quantity,
                unit_price=unit_price,
                subtotal=subtotal,
                tax_amount=tax,
                total_amount=item_total,
                shipping_type=shipping_type,
                shipping_address=shipping_address,
                delivery_date=delivery_date if shipping_type == "DELIVERY" else None,
                status="PENDING",
            )
            self._sales.save(order)

            # Deduct stock (skip for preorder products with no stock)
            if product.stock > 0:
                try:
                    product.remove_stock(quantity)
                    self._products.save(product)
                except InsufficientStockError:
                    logger.warning(
                        f"Race condition: insufficient stock for {product.name} "
                        f"(available={product.stock}, requested={quantity})"
                    )

            order_ids.append(str(order.id))
            order_items.append({
                "product_id": str(product_id),
                "product_name": product.name,
                "quantity": quantity,
                "unit_price": float(unit_price),
                "subtotal": float(subtotal),
                "tax_amount": float(tax),
                "total_amount": float(item_total),
            })
            total += item_total

        return {
            "order_ids": order_ids,
            "items": order_items,
            "total_amount": float(total),
            "status": "PENDING",
            "delivery_date": delivery_date.isoformat(),
        }
    def get_customer_orders(self, email: str) -> List[dict]:
        """Fetch all orders for a given customer email."""
        orders = self._sales.find_by_email(email)
        return [
            {
                "id": str(order.id),
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "product_id": str(order.product_id),
                "product_name": order.product_name,
                "product_image": order.product_image,
                "quantity": order.quantity,
                "unit_price": float(order.unit_price),
                "subtotal": float(order.subtotal),
                "tax_amount": float(order.tax_amount),
                "shipping_cost": float(order.shipping_cost),
                "shipping_type": order.shipping_type,
                "shipping_address": order.shipping_address,
                "total_amount": float(order.total_amount),
                "status": order.status,
                "delivery_date": order.delivery_date.isoformat() if order.delivery_date else None,
                "created_at": order.created_at.isoformat(),
            }
            for order in orders
        ]
