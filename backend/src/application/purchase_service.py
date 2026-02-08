from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from datetime import datetime
from src.domain.purchase_entities import Supplier, PurchaseOrder, PurchaseKPIs
from src.ports.purchase_repository import PurchaseRepository

# PDF Generation
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import os

class PurchaseService:
    def __init__(self, repo: PurchaseRepository, inventory_service=None):
        self.repo = repo
        self.inventory_service = inventory_service

    def create_supplier(self, name: str, email: str, ruc: str, phone: Optional[str] = None, contact_name: str = "", contact_position: str = "", product_ids: List[UUID] = None, is_active: bool = True) -> Supplier:
        supplier = Supplier(
            name=name, 
            email=email, 
            ruc=ruc, 
            phone=phone or "", 
            contact_name=contact_name, 
            contact_position=contact_position, 
            is_active=is_active,
            product_ids=product_ids or []
        )
        return self.repo.add_supplier(supplier)

    def update_supplier(self, id: UUID, **kwargs) -> Optional[Supplier]:
        supplier = self.repo.get_supplier(id)
        if not supplier:
            return None
        
        # Update fields dynamically
        for key, value in kwargs.items():
            if hasattr(supplier, key) and value is not None:
                setattr(supplier, key, value)
        
        return self.repo.update_supplier(supplier)

    def delete_supplier(self, id: UUID) -> bool:
        return self.repo.delete_supplier(id)

    def list_suppliers(self, skip: int = 0, limit: int = 100) -> List[Supplier]:
        return self.repo.get_suppliers(skip=skip, limit=limit)

    def create_purchase_order(
        self, 
        supplier_id: UUID, 
        product_id: UUID, 
        quantity: int, 
        unit_price: Decimal,
        currency: str = "USD",
        expected_delivery_date: Optional[datetime] = None,
        savings_amount: Decimal = Decimal("0.00"),
        freight_amount: Decimal = Decimal("0.00"),
        other_expenses_amount: Decimal = Decimal("0.00"),
        other_expenses_description: Optional[str] = None
    ) -> PurchaseOrder:
        
        # Calculate Taxes and Total
        subtotal = Decimal(quantity) * unit_price
        tax_rate = Decimal("0.18") # IGV 18%
        tax_amount = subtotal * tax_rate
        # Total = (Subtotal + Taxes) + Freight + Other Expenses - Savings
        total_amount = subtotal + tax_amount + freight_amount + other_expenses_amount - savings_amount

        order = PurchaseOrder(
            supplier_id=supplier_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price,
            total_amount=total_amount,
            tax_amount=tax_amount,
            currency=currency,
            savings_amount=savings_amount,
            freight_amount=freight_amount,
            other_expenses_amount=other_expenses_amount,
            other_expenses_description=other_expenses_description,
            expected_delivery_date=expected_delivery_date,
            status="PENDING"
        )
        
        # Automatic association
        self.repo.link_product_to_supplier(supplier_id, product_id)
        
        return self.repo.add_purchase_order(order)

    def list_purchase_orders(self, skip: int = 0, limit: int = 100) -> List[PurchaseOrder]:
        return self.repo.get_purchase_orders(skip=skip, limit=limit)
    
    def get_order_pdf(self, order_id: UUID) -> str:
        """Generates PDF for order and returns file path"""
        order = self.repo.get_purchase_order(order_id)
        if not order:
            raise ValueError("Order not found")
        
        # Ensure uploads/orders directory exists
        pdf_dir = "uploads/orders"
        os.makedirs(pdf_dir, exist_ok=True)
        filename = f"OC-{str(order.id)[:8]}.pdf"
        filepath = os.path.join(pdf_dir, filename)
        
        # Create PDF
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Header
        elements.append(Paragraph(f"ORDEN DE COMPRA: #{str(order.id)[:8].upper()}", styles['Title']))
        elements.append(Paragraph(f"Fecha: {order.created_at.strftime('%Y-%m-%d')}", styles['Normal']))
        elements.append(Spacer(1, 12))
        
        # Supplier Info
        elements.append(Paragraph(f"PROVEEDOR: {order.supplier_name}", styles['Heading2']))
        elements.append(Paragraph(f"RUC: (Consultar Sistema)", styles['Normal'])) # In a real scenario fetch supplier details
        elements.append(Spacer(1, 12))
        
        # Order Details Table
        # Data
        data = [
            ["Producto", "Cantidad", "Unidad", "Precio Unit.", "Subtotal"],
            [order.product_name, str(order.quantity), "UND", f"{order.currency} {order.unit_price}", f"{order.currency} {order.quantity * order.unit_price}"],
            ["", "", "", "IGV (18%)", f"{order.currency} {order.tax_amount}"],
            ["", "", "", "Transporte/Flete", f"{order.currency} {order.freight_amount}"],
            ["", "", "", f"Otros: {order.other_expenses_description or 'N/A'}", f"{order.currency} {order.other_expenses_amount}"],
            ["", "", "", "Descuentos", f"-{order.currency} {order.savings_amount}"],
            ["", "", "", "TOTAL", f"{order.currency} {order.total_amount}"]
        ]
        
        t = Table(data)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 48))
        
        # Signatures
        elements.append(Paragraph("_" * 40, styles['Normal']))
        elements.append(Paragraph("Jefe de Comercio - GUSMI", styles['Normal']))
        
        doc.build(elements)
        return filepath

    def update_order_status(
        self, 
        order_id: UUID, 
        status: str, 
        actual_delivery_date: Optional[datetime] = None,
        is_rejected: bool = False,
        rejection_reason: Optional[str] = None,
        invoice_number: Optional[str] = None,
        referral_guide_number: Optional[str] = None,
        invoice_path: Optional[str] = None,
        referral_guide_path: Optional[str] = None
    ) -> PurchaseOrder:
        order = self.repo.get_purchase_order(order_id)
        if not order:
            raise ValueError("Order not found")
        
        previous_status = order.status
        if status is not None:
            order.status = status
        if is_rejected is not None:
            order.is_rejected = is_rejected
        if rejection_reason is not None:
            order.rejection_reason = rejection_reason
        order.invoice_number = invoice_number
        order.referral_guide_number = referral_guide_number
        order.invoice_path = invoice_path
        order.referral_guide_path = referral_guide_path
        
        if actual_delivery_date:
            order.actual_delivery_date = actual_delivery_date
        
        # Primero intentamos la asociación para asegurar que el proveedor está vinculado
        self.repo.link_product_to_supplier(order.supplier_id, order.product_id)

        # Debug logging
        import logging
        logger = logging.getLogger(__name__)
        logger.info(f"🔍 DEBUG: About to check stock update. status={status}, inventory_service={self.inventory_service is not None}")

        # Si el estado es RECEIVED, verificamos si ya se procesó el stock
        # Esto permite re-intentar si hubo un error parcial previamente
        if status == "RECEIVED" and self.inventory_service:
            logger.info(f"✅ Entering RECEIVED block for order {order_id}")
            
            # Verificar si ya existe un movimiento para esta OC
            # Usamos el prefijo de la OC en la referencia para identificarlo
            oc_ref = f"OC {str(order_id)[:8]}"
            movements = self.inventory_service.get_movements()
            already_processed = any(oc_ref in (m.reference or "") for m in movements)
            
            logger.info(f"🔍 Movements check: found {len(movements)} total movements, already_processed={already_processed}")
            
            if not already_processed:
                logger.info(f"Processing stock for order {order_id}. Product: {order.product_id}")
                reference = f"ENTRADA POR COMPRA: {oc_ref} | Factura: {invoice_number or 'N/A'} | Guía: {referral_guide_number or 'N/A'}"
                doc_path = invoice_path or referral_guide_path
                
                try:
                    self.inventory_service.receive_stock(
                        product_id=order.product_id,
                        quantity=order.quantity,
                        reference=reference,
                        document_path=doc_path
                    )
                    logger.info(f"Stock updated successfully for order {order_id}")
                except Exception as e:
                    logger.error(f"Error updating stock for order {order_id}: {str(e)}")
                    # No actualizamos la orden en la BD si el stock falló, para permitir reintento
                    raise e
            else:
                logger.info(f"Stock for order {order_id} was already processed. Skipping.")
        else:
            logger.warning(f"⚠️ Skipping stock update: status={status}, has_inventory_service={self.inventory_service is not None}")

        # Guardar cambios en la orden
        updated_order = self.repo.update_purchase_order(order)
        return updated_order

    def update_purchase_order(self, order_id: UUID, **kwargs) -> Optional[PurchaseOrder]:
        """Provides a general editing for pending orders"""
        order = self.repo.get_purchase_order(order_id)
        if not order:
            return None
        
        # Only allow significant changes if it's PENDING
        if order.status != "PENDING":
             # Optional: restricted update for non-pending orders (e.g. only description)
             # For now let's keep it simple or allow all if requested
             pass

        for key, value in kwargs.items():
            if hasattr(order, key) and value is not None:
                setattr(order, key, value)
        
        # Recalculate totals if quantity, price or fees changed
        subtotal = Decimal(order.quantity) * order.unit_price
        tax_rate = Decimal("0.18")
        order.tax_amount = subtotal * tax_rate
        order.total_amount = subtotal + order.tax_amount + order.freight_amount + order.other_expenses_amount - order.savings_amount

        return self.repo.update_purchase_order(order)

    def delete_purchase_order(self, order_id: UUID) -> bool:
        return self.repo.delete_purchase_order(order_id)

    def calculate_kpis(self) -> PurchaseKPIs:
        orders = self.repo.get_purchase_orders()
        total_orders = len(orders)
        if total_orders == 0:
            return PurchaseKPIs(0.0, Decimal("0.00"), Decimal("0.00"), 0.0, 0, 0)

        # Quality: % rejected orders
        rejected_orders = [o for o in orders if o.is_rejected or o.status == "REJECTED"]
        quality_rate = (len(rejected_orders) / total_orders) * 100

        # Costs: CTA and Savings
        total_cta = sum((o.total_amount for o in orders), Decimal("0.00"))
        total_savings = sum((o.savings_amount for o in orders), Decimal("0.00"))

        # Plazos: Compliance (on-time / total finished)
        finished_orders = [o for o in orders if o.actual_delivery_date is not None]
        if not finished_orders:
            on_time_rate = 0.0
        else:
            on_time_orders = [
                o for o in finished_orders 
                if o.expected_delivery_date and o.actual_delivery_date <= o.expected_delivery_date
            ]
            on_time_rate = (len(on_time_orders) / len(finished_orders)) * 100

        return PurchaseKPIs(
            quality_rate=quality_rate,
            total_cta=total_cta,
            total_savings=total_savings,
            on_time_delivery_rate=on_time_rate,
            total_orders=total_orders,
            rejected_orders=len(rejected_orders)
        )
