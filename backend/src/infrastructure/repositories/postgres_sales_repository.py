from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from src.domain.sales_entities import SalesOrder
from src.ports.sales_repository import SalesRepository
from src.infrastructure.database.models import SalesOrderModel, ProductModel

class PostgresSalesRepository(SalesRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, sales_order: SalesOrder) -> None:
        model = SalesOrderModel(
            id=str(sales_order.id),
            customer_name=sales_order.customer_name,
            customer_email=sales_order.customer_email,
            product_id=str(sales_order.product_id),
            quantity=sales_order.quantity,
            unit_price=sales_order.unit_price,
            subtotal=sales_order.subtotal,
            tax_amount=sales_order.tax_amount,
            total_amount=sales_order.total_amount,
            shipping_cost=sales_order.shipping_cost,
            shipping_type=sales_order.shipping_type,
            shipping_address=sales_order.shipping_address,
            delivery_date=sales_order.delivery_date,
            status=sales_order.status,
            created_at=sales_order.created_at
        )
        self.session.add(model)
        self.session.commit()

    def find_by_id(self, order_id: UUID) -> Optional[SalesOrder]:
        model = self.session.query(SalesOrderModel).filter(SalesOrderModel.id == str(order_id)).first()
        if not model:
            return None
        return self._to_entity(model)

    def find_all(self) -> List[SalesOrder]:
        models = self.session.query(SalesOrderModel).all()
        return [self._to_entity(m) for m in models]

    def update_status(self, order_id: UUID, status: str) -> None:
        model = self.session.query(SalesOrderModel).filter(SalesOrderModel.id == str(order_id)).first()
        if model:
            model.status = status
            self.session.commit()

    def update(self, sales_order: SalesOrder) -> None:
        model = self.session.query(SalesOrderModel).filter(SalesOrderModel.id == str(sales_order.id)).first()
        if model:
            model.customer_name = sales_order.customer_name
            model.customer_email = sales_order.customer_email
            model.product_id = str(sales_order.product_id)
            model.quantity = sales_order.quantity
            model.unit_price = sales_order.unit_price
            model.subtotal = sales_order.subtotal
            model.tax_amount = sales_order.tax_amount
            model.total_amount = sales_order.total_amount
            model.shipping_cost = sales_order.shipping_cost
            model.shipping_type = sales_order.shipping_type
            model.shipping_address = sales_order.shipping_address
            model.delivery_date = sales_order.delivery_date
            # Status is typically managed separately, but we can update it if needed.
            # Keeping status update separate via update_status is safer for workflow, 
            # but if the user edits the order, they might reset status? 
            # For now, let's assume editing doesn't revert status automatically unless logic says so.
            # But here we are just mapping fields.
            # model.status = sales_order.status 
            
            self.session.commit()

    def delete(self, order_id: UUID) -> None:
        model = self.session.query(SalesOrderModel).filter(SalesOrderModel.id == str(order_id)).first()
        if model:
            self.session.delete(model)
            self.session.commit()

    def get_kpis(self) -> dict:
        orders = self.session.query(SalesOrderModel).all()
        total_revenue = sum(o.total_amount for o in orders)
        pending_deliveries = sum(1 for o in orders if o.status == "PENDING")
        
        # Simple top selling products (by revenue)
        product_revenue = {}
        for o in orders:
            p_id = o.product_id
            product_revenue[p_id] = product_revenue.get(p_id, 0) + o.total_amount
            
        top_selling = []
        for p_id, revenue in sorted(product_revenue.items(), key=lambda item: item[1], reverse=True)[:5]:
            product = self.session.query(ProductModel).filter(ProductModel.id == p_id).first()
            top_selling.append({
                "product_name": product.name if product else "Unknown",
                "revenue": float(revenue)
            })
            
        return {
            "total_sales_count": len(orders),
            "total_revenue": float(total_revenue),
            "pending_deliveries": pending_deliveries,
            "top_selling_products": top_selling
        }

    def _to_entity(self, m: SalesOrderModel) -> SalesOrder:
        return SalesOrder(
            id=UUID(str(m.id)),
            customer_name=m.customer_name,
            customer_email=m.customer_email,
            product_id=UUID(str(m.product_id)),
            quantity=m.quantity,
            unit_price=m.unit_price,
            subtotal=m.subtotal,
            tax_amount=m.tax_amount,
            total_amount=m.total_amount,
            shipping_cost=m.shipping_cost,
            shipping_type=m.shipping_type,
            shipping_address=m.shipping_address,
            delivery_date=m.delivery_date,
            status=m.status,
            created_at=m.created_at,
            product_name=m.product.name if m.product else None
        )
