from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Annotated, Optional
from uuid import UUID
from datetime import datetime
from fastapi.responses import FileResponse

from src.application.purchase_service import PurchaseService
from src.domain.purchase_schemas import (
    SupplierCreate, SupplierResponse, SupplierUpdate,
    PurchaseOrderCreate, PurchaseOrderResponse, 
    PurchaseOrderUpdate, PurchaseKPIsResponse,
    PurchaseOrderDetailUpdate
)
from src.infrastructure.api.dependencies import get_db, get_inventory_service
from src.application.services import InventoryService
from src.infrastructure.repositories.postgres_purchase_repository import PostgresPurchaseRepository
from src.infrastructure.api.security import get_api_key
import uuid
import os
import logging
from fastapi import File, UploadFile, Form

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Purchasing"],
    dependencies=[Depends(get_api_key)]
)

def get_purchase_service(
    db=Depends(get_db), 
    inv_service: InventoryService = Depends(get_inventory_service)
) -> PurchaseService:
    repo = PostgresPurchaseRepository(db)
    return PurchaseService(repo, inv_service)

@router.post("/suppliers", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier(
    request: SupplierCreate,
    service: Annotated[PurchaseService, Depends(get_purchase_service)]
):
    supplier = service.create_supplier(
        request.name, 
        request.email, 
        request.ruc, 
        request.phone,
        request.contact_name,
        request.contact_position,
        request.product_ids,
        request.is_active
    )
    return SupplierResponse.model_validate(supplier)

@router.get("/suppliers", response_model=List[SupplierResponse])
def list_suppliers(service: Annotated[PurchaseService, Depends(get_purchase_service)]):
    return service.list_suppliers()

@router.patch("/suppliers/{supplier_id}", response_model=SupplierResponse)
def update_supplier(
    supplier_id: UUID,
    request: SupplierUpdate,
    service: Annotated[PurchaseService, Depends(get_purchase_service)]
):
    updated = service.update_supplier(supplier_id, **request.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return SupplierResponse.model_validate(updated)

@router.delete("/suppliers/{supplier_id}")
def delete_supplier(
    supplier_id: UUID,
    service: Annotated[PurchaseService, Depends(get_purchase_service)]
):
    success = service.delete_supplier(supplier_id)
    if not success:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted successfully"}

@router.post("/orders", response_model=PurchaseOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    request: PurchaseOrderCreate,
    service: Annotated[PurchaseService, Depends(get_purchase_service)]
):
    try:
        order = service.create_purchase_order(
            supplier_id=request.supplier_id,
            product_id=request.product_id,
            quantity=request.quantity,
            unit_price=request.unit_price,
            currency=request.currency,
            expected_delivery_date=request.expected_delivery_date,
            savings_amount=request.savings_amount,
            freight_amount=request.freight_amount,
            other_expenses_amount=request.other_expenses_amount,
            other_expenses_description=request.other_expenses_description
        )
        return PurchaseOrderResponse.model_validate(order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders", response_model=List[PurchaseOrderResponse])
def list_orders(service: Annotated[PurchaseService, Depends(get_purchase_service)]):
    orders = service.list_purchase_orders()
    return [PurchaseOrderResponse.model_validate(o) for o in orders]

@router.get("/orders/{order_id}/pdf")
def get_order_pdf(
    order_id: UUID,
    service: Annotated[PurchaseService, Depends(get_purchase_service)]
):
    try:
        pdf_path = service.get_order_pdf(order_id)
        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="PDF generation failed")
            
        return FileResponse(
            path=pdf_path, 
            filename=os.path.basename(pdf_path),
            media_type='application/pdf'
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating PDF: {str(e)}")

@router.patch("/orders/{order_id}", response_model=PurchaseOrderResponse)
async def update_order(
    order_id: UUID,
    service: Annotated[PurchaseService, Depends(get_purchase_service)],
    status: Optional[str] = Form(None),
    actual_delivery_date: Optional[str] = Form(None), # Recibido como ISO string
    is_rejected: bool = Form(False),  # Default False para evitar errores de parsing
    rejection_reason: Optional[str] = Form(None),
    invoice_number: Optional[str] = Form(None),
    referral_guide_number: Optional[str] = Form(None),
    invoice_file: Optional[UploadFile] = File(None),
    referral_guide_file: Optional[UploadFile] = File(None)
):
    logger.info(f"PATCH order {order_id} - status: {status}, rejected: {is_rejected}")
    try:
        invoice_path = None
        referral_guide_path = None
        upload_dir = "uploads/documents"
        os.makedirs(upload_dir, exist_ok=True)

        if invoice_file:
            invoice_path = f"{upload_dir}/{uuid.uuid4()}_{invoice_file.filename}"
            with open(invoice_path, "wb") as buffer:
                content = await invoice_file.read()
                buffer.write(content)
        
        if referral_guide_file:
            referral_guide_path = f"{upload_dir}/{uuid.uuid4()}_{referral_guide_file.filename}"
            with open(referral_guide_path, "wb") as buffer:
                content = await referral_guide_file.read()
                buffer.write(content)

        # Convertir fecha si viene
        delivery_date = None
        if actual_delivery_date:
            try:
                delivery_date = datetime.fromisoformat(actual_delivery_date.replace('Z', '+00:00'))
            except Exception as e:
                logger.warning(f"Failed to parse delivery date {actual_delivery_date}: {str(e)}")

        order = service.update_order_status(
            order_id=order_id,
            status=status,
            actual_delivery_date=delivery_date,
            is_rejected=is_rejected,
            rejection_reason=rejection_reason,
            invoice_number=invoice_number,
            referral_guide_number=referral_guide_number,
            invoice_path=invoice_path,
            referral_guide_path=referral_guide_path
        )
        return PurchaseOrderResponse.model_validate(order)
    except ValueError as e:
        logger.error(f"ValueError in update_order {order_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in update_order {order_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/orders/{order_id}")
def delete_order(
    order_id: UUID,
    service: Annotated[PurchaseService, Depends(get_purchase_service)]
):
    success = service.delete_purchase_order(order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order deleted successfully"}

@router.patch("/orders/{order_id}/detail", response_model=PurchaseOrderResponse)
def update_order_detail(
    order_id: UUID,
    request: PurchaseOrderDetailUpdate,
    service: Annotated[PurchaseService, Depends(get_purchase_service)]
):
    order = service.update_purchase_order(order_id, **request.model_dump(exclude_unset=True))
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return PurchaseOrderResponse.model_validate(order)

@router.get("/kpis", response_model=PurchaseKPIsResponse)
def get_kpis(service: Annotated[PurchaseService, Depends(get_purchase_service)]):
    return service.calculate_kpis()
