from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload
from src.domain.purchase_entities import Supplier, PurchaseOrder
from src.ports.purchase_repository import PurchaseRepository
from src.infrastructure.database.models import SupplierModel, PurchaseOrderModel, ProductModel

class PostgresPurchaseRepository(PurchaseRepository):
    def __init__(self, session: Session):
        self.session = session

    def add_supplier(self, supplier: Supplier) -> Supplier:
        model = SupplierModel(
            id=str(supplier.id),
            name=supplier.name,
            email=supplier.email,
            phone=supplier.phone,
            ruc=supplier.ruc,
            contact_name=supplier.contact_name,
            contact_position=supplier.contact_position,
            is_active=supplier.is_active
        )
        
        # Add associations
        if supplier.product_ids:
            for p_id in supplier.product_ids:
                product = self.session.query(ProductModel).filter(ProductModel.id == str(p_id)).first()
                if product:
                    model.products.append(product)

        self.session.add(model)
        self.session.commit()
        
        # Refresh to load relationships
        self.session.refresh(model)
        return self._to_supplier_entity(model)

    def get_suppliers(self) -> List[Supplier]:
        # Eager load products and purchase_orders -> product to avoid N+1 and ensure data availability
        models = self.session.query(SupplierModel).options(
            joinedload(SupplierModel.products),
            joinedload(SupplierModel.purchase_orders).joinedload(PurchaseOrderModel.product)
        ).all()
        
        return [self._to_supplier_entity(m) for m in models]

    def get_supplier(self, supplier_id: UUID) -> Optional[Supplier]:
        model = self.session.query(SupplierModel).options(
            joinedload(SupplierModel.products)
        ).filter(SupplierModel.id == str(supplier_id)).first()
        if not model:
            return None
        return self._to_supplier_entity(model)

    def update_supplier(self, supplier: Supplier) -> Supplier:
        model = self.session.query(SupplierModel).filter(SupplierModel.id == str(supplier.id)).first()
        if model:
            model.name = supplier.name
            model.email = supplier.email
            model.phone = supplier.phone
            model.ruc = supplier.ruc
            model.contact_name = supplier.contact_name
            model.contact_position = supplier.contact_position
            model.is_active = supplier.is_active
            
            # Update products
            model.products = []
            if supplier.product_ids:
                for p_id in supplier.product_ids:
                    product = self.session.query(ProductModel).filter(ProductModel.id == str(p_id)).first()
                    if product:
                        model.products.append(product)
            
            self.session.commit()
            self.session.refresh(model)
            return self._to_supplier_entity(model)
        return supplier

    def delete_supplier(self, supplier_id: UUID) -> bool:
        model = self.session.query(SupplierModel).filter(SupplierModel.id == str(supplier_id)).first()
        if model:
            self.session.delete(model)
            self.session.commit()
            return True
        return False

    def _to_supplier_entity(self, m: SupplierModel) -> Supplier:
        return Supplier(
            id=UUID(str(m.id)),
            name=m.name,
            email=m.email,
            phone=m.phone,
            ruc=m.ruc,
            contact_name=m.contact_name,
            contact_position=m.contact_position,
            is_active=m.is_active,
            products=list(set([p.name for p in m.products] + [po.product.name for po in m.purchase_orders if po.product])),
            product_ids=list(set([UUID(str(p.id)) for p in m.products] + [UUID(str(po.product_id)) for po in m.purchase_orders if po.product_id]))
        )

    def add_purchase_order(self, order: PurchaseOrder) -> PurchaseOrder:
        model = PurchaseOrderModel(
            id=str(order.id),
            supplier_id=str(order.supplier_id),
            product_id=str(order.product_id),
            quantity=order.quantity,
            unit_price=order.unit_price,
            total_amount=order.total_amount,
            tax_amount=order.tax_amount,
            currency=order.currency,
            savings_amount=order.savings_amount,
            status=order.status,
            is_rejected=order.is_rejected,
            rejection_reason=order.rejection_reason,
            invoice_number=order.invoice_number,
            referral_guide_number=order.referral_guide_number,
            invoice_path=order.invoice_path,
            referral_guide_path=order.referral_guide_path,
            expected_delivery_date=order.expected_delivery_date,
            actual_delivery_date=order.actual_delivery_date,
            freight_amount=order.freight_amount,
            other_expenses_amount=order.other_expenses_amount,
            other_expenses_description=order.other_expenses_description,
            created_at=order.created_at
        )
        self.session.add(model)
        self.session.commit()
        return order

    def get_purchase_orders(self) -> List[PurchaseOrder]:
        models = self.session.query(PurchaseOrderModel).all()
        orders = []
        for m in models:
            orders.append(self._to_entity(m))
        return orders

    def get_purchase_order(self, order_id: UUID) -> Optional[PurchaseOrder]:
        model = self.session.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == str(order_id)).first()
        if not model:
            return None
        return self._to_entity(model)

    def update_purchase_order(self, order: PurchaseOrder) -> PurchaseOrder:
        model = self.session.query(PurchaseOrderModel).filter(PurchaseOrderModel.id == str(order.id)).first()
        if model:
            model.status = order.status
            model.is_rejected = order.is_rejected
            model.rejection_reason = order.rejection_reason
            model.actual_delivery_date = order.actual_delivery_date
            model.invoice_number = order.invoice_number
            model.referral_guide_number = order.referral_guide_number
            model.invoice_path = order.invoice_path
            model.referral_guide_path = order.referral_guide_path
            model.supplier_id = str(order.supplier_id)
            model.product_id = str(order.product_id)
            self.session.commit()
        return order

    def link_product_to_supplier(self, supplier_id: UUID, product_id: UUID) -> bool:
        supplier = self.session.query(SupplierModel).filter(SupplierModel.id == str(supplier_id)).first()
        product = self.session.query(ProductModel).filter(ProductModel.id == str(product_id)).first()
        
        if supplier and product:
            if product not in supplier.products:
                supplier.products.append(product)
                self.session.commit()
                return True
        return False

    def _to_entity(self, m: PurchaseOrderModel) -> PurchaseOrder:
        return PurchaseOrder(
            id=UUID(str(m.id)),
            supplier_id=UUID(str(m.supplier_id)),
            product_id=UUID(str(m.product_id)),
            quantity=m.quantity,
            unit_price=m.unit_price,
            total_amount=m.total_amount,
            tax_amount=m.tax_amount,
            currency=m.currency,
            savings_amount=m.savings_amount,
            status=m.status,
            is_rejected=m.is_rejected,
            rejection_reason=m.rejection_reason,
            invoice_number=m.invoice_number,
            referral_guide_number=m.referral_guide_number,
            invoice_path=m.invoice_path,
            referral_guide_path=m.referral_guide_path,
            actual_delivery_date=m.actual_delivery_date,
            freight_amount=m.freight_amount,
            other_expenses_amount=m.other_expenses_amount,
            other_expenses_description=m.other_expenses_description,
            supplier_name=m.supplier.name if m.supplier else None,
            product_name=m.product.name if m.product else None,
            created_at=m.created_at
        )
