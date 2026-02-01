from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from src.domain.sales_entities import SalesOrder
from src.ports.sales_repository import SalesRepository

class SalesService:
    def __init__(self, repo: SalesRepository, inventory_service=None):
        self.repo = repo
        self.inventory_service = inventory_service

    def create_sales_order(
        self,
        customer_name: str,
        customer_email: str,
        product_id: UUID,
        quantity: int,
        unit_price: Decimal,
        shipping_cost: Decimal = Decimal("0.00"),
        shipping_type: str = "PICKUP",
        shipping_address: Optional[str] = None,
        delivery_date: Optional[datetime] = None
    ) -> SalesOrder:
        
        # Calculate IGV (18%)
        subtotal = Decimal(quantity) * unit_price
        tax_rate = Decimal("0.18")
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount + shipping_cost

        order = SalesOrder(
            customer_name=customer_name,
            customer_email=customer_email,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            shipping_cost=shipping_cost,
            shipping_type=shipping_type,
            shipping_address=shipping_address,
            delivery_date=delivery_date,
            status="PENDING"
        )
        self.repo.save(order)
        return order

    def list_sales_orders(self) -> List[SalesOrder]:
        return self.repo.find_all()

    def get_sales_order(self, order_id: UUID) -> Optional[SalesOrder]:
        return self.repo.find_by_id(order_id)

    def update_order_status(self, order_id: UUID, status: str) -> None:
        self.repo.update_status(order_id, status)

    def update_sales_order(
        self,
        order_id: UUID,
        customer_name: Optional[str] = None,
        customer_email: Optional[str] = None,
        product_id: Optional[UUID] = None,
        quantity: Optional[int] = None,
        unit_price: Optional[Decimal] = None,
        shipping_cost: Optional[Decimal] = None,
        shipping_type: Optional[str] = None,
        shipping_address: Optional[str] = None,
        delivery_date: Optional[datetime] = None
    ) -> SalesOrder:
        order = self.repo.find_by_id(order_id)
        if not order:
            raise ValueError("Sales order not found")

        # Update fields if provided
        if customer_name is not None: order.customer_name = customer_name
        if customer_email is not None: order.customer_email = customer_email
        if product_id is not None: order.product_id = product_id
        if quantity is not None: order.quantity = quantity
        if unit_price is not None: order.unit_price = unit_price
        if shipping_cost is not None: order.shipping_cost = shipping_cost
        if shipping_type is not None: order.shipping_type = shipping_type
        if shipping_address is not None: order.shipping_address = shipping_address
        if delivery_date is not None: order.delivery_date = delivery_date

        # Recalculate financials
        subtotal = Decimal(order.quantity) * order.unit_price
        tax_rate = Decimal("0.18")
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount + order.shipping_cost

        order.subtotal = subtotal
        order.tax_amount = tax_amount
        order.total_amount = total_amount

        self.repo.update(order)
        return order

    def delete_sales_order(self, order_id: UUID) -> None:
        self.repo.delete(order_id)

    def get_kpis(self) -> dict:
        return self.repo.get_kpis()
