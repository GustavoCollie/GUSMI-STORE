from typing import Annotated, Optional
from uuid import UUID
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks

from src.application.services import InventoryService
from src.domain.exceptions import (
    InsufficientStockError,
    InvalidStockError,
    ProductNotFoundError
)
from src.domain.schemas import (
    ProductCreateRequest,
    ProductResponse,
    StockOperationRequest,
    ProductUpdateRequest,
    MovementResponse
)
from .dependencies import get_inventory_service
from .security import get_api_key


router = APIRouter(
    tags=["Products"],
    dependencies=[Depends(get_api_key)]
)


@router.get(
    "/movements",
    response_model=list[MovementResponse],
    summary="Historial de movimientos",
    description="Retorna el historial completo de entradas y salidas para trazabilidad"
)
def get_movements(
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)]
) -> list[MovementResponse]:
    movements = inv_service.get_movements()
    return [MovementResponse.model_validate(m) for m in movements]


@router.get(
    "",
    response_model=list[ProductResponse],
    summary="Listar productos",
    description="Obtiene todos los productos del inventario"
)
def list_products(
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)]
) -> list[ProductResponse]:
    return inv_service.list_products()


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear nuevo producto",
    description="Crea un nuevo producto en el inventario con soporte para Guía de Remisión"
)
async def create_product(
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)],
    name: str = Form(...),
    description: str = Form(...),
    stock: int = Form(...),
    sku: str = Form(...),
    reference: str = Form("Registro Inicial"),
    file: Optional[UploadFile] = File(None)
) -> ProductResponse:
    document_path = None
    if file:
        import os
        upload_dir = "uploads/documents"
        os.makedirs(upload_dir, exist_ok=True)
        document_path = f"{upload_dir}/{uuid.uuid4()}_{file.filename}"
        with open(document_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
    try:
        product = inv_service.create_product(
            name=name,
            description=description,
            stock=stock,
            sku=sku,
            reference=reference,
            document_path=document_path
        )
        return ProductResponse.model_validate(product)
    except InvalidStockError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Obtener producto",
    description="Obtiene un producto por su ID"
)
def get_product(
    product_id: UUID,
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)]
) -> ProductResponse:
    try:
        product = inv_service.get_product(product_id)
        return ProductResponse.model_validate(product)
    except ProductNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Actualizar producto (Reemplazo)",
    description="Actualiza todos los campos de un producto"
)
def update_product(
    product_id: UUID,
    request: ProductCreateRequest,
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)]
) -> ProductResponse:
    try:
        product = inv_service.update_product(
            product_id=product_id,
            name=request.name,
            description=request.description,
            sku=request.sku
        )
        return ProductResponse.model_validate(product)
    except ProductNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Actualizar producto (Parcial)",
    description="Actualiza datos del producto y opcionalmente su trazabilidad inicial (referencia y documento)"
)
async def patch_product(
    product_id: UUID,
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)],
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    sku: Optional[str] = Form(None),
    initial_reference: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
) -> ProductResponse:
    document_path = None
    if file:
        import os
        upload_dir = "uploads/documents"
        os.makedirs(upload_dir, exist_ok=True)
        document_path = f"{upload_dir}/{uuid.uuid4()}_{file.filename}"
        with open(document_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
            
    try:
        # Preparar kwargs para campos de producto
        product_updates = {}
        if name is not None: product_updates['name'] = name
        if description is not None: product_updates['description'] = description
        if sku is not None: product_updates['sku'] = sku

        product = inv_service.patch_product(
            product_id=product_id,
            initial_reference=initial_reference,
            initial_document_path=document_path,
            **product_updates
        )
        return ProductResponse.model_validate(product)
    except ProductNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar producto",
    description="Elimina un producto de forma permanente"
)
def delete_product(
    product_id: UUID,
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)]
):
    deleted = inv_service.delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"message": "Producto eliminado exitosamente"}


@router.post(
    "/{product_id}/receive-stock",
    response_model=ProductResponse,
    summary="Añadir stock",
    description="Incrementa el stock con una referencia y un documento opcional (ej. Factura, Guía de Remisión)"
)
async def receive_stock(
    product_id: UUID,
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)],
    quantity: int = Form(...),
    reference: str = Form(...),
    file: Optional[UploadFile] = File(None)
) -> ProductResponse:
    print(f"DEBUG: receive_stock called. File: {file}, Filename: {file.filename if file else 'None'}")
    document_path = None
    if file:
        import os
        upload_dir = "uploads/documents"
        os.makedirs(upload_dir, exist_ok=True)
        document_path = f"{upload_dir}/{uuid.uuid4()}_{file.filename}"
        with open(document_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
    
    try:
        product = inv_service.receive_stock(
            product_id=product_id, 
            quantity=quantity,
            reference=reference,
            document_path=document_path
        )
        return ProductResponse.model_validate(product)
    except ProductNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


async def send_movement_email(email: str, movement_data: dict):
    from src.infrastructure.services.pdf_service import PDFService
    from src.infrastructure.security.email_service import SMTPEmailService
    
    pdf_service = PDFService()
    email_service = SMTPEmailService()
    pdf_content = pdf_service.generate_movement_receipt(movement_data)
    await email_service.send_receipt_email(email, movement_data, pdf_content)

@router.post(
    "/{product_id}/sell",
    response_model=ProductResponse,
    summary="Registrar Salida / Vender",
    description="Registra una salida de inventario con documento de soporte, datos del solicitante y tipo de salida (consumo/devolutivo)"
)
async def sell_product(
    background_tasks: BackgroundTasks,
    product_id: UUID,
    inv_service: Annotated[InventoryService, Depends(get_inventory_service)],
    quantity: int = Form(...),
    reference: str = Form(...),
    applicant: str = Form(...),
    applicant_area: str = Form(...),
    is_returnable: bool = Form(False),
    return_deadline: Optional[datetime] = Form(None),
    recipient_email: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
) -> ProductResponse:
    document_path = None
    if file:
        import os
        upload_dir = "uploads/documents"
        os.makedirs(upload_dir, exist_ok=True)
        document_path = f"{upload_dir}/{uuid.uuid4()}_{file.filename}"
        with open(document_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

    try:
        product = inv_service.sell_product(
            product_id=product_id, 
            quantity=quantity,
            reference=reference,
            applicant=applicant,
            applicant_area=applicant_area,
            is_returnable=is_returnable,
            return_deadline=return_deadline,
            recipient_email=recipient_email,
            document_path=document_path
        )
        
        # Enviar correo en segundo plano si es devolutivo y tiene email
        if is_returnable and recipient_email:
            movement_data = {
                "product_name": product.name,
                "type": "EXIT",
                "reference": reference,
                "quantity": quantity,
                "applicant": applicant,
                "applicant_area": applicant_area,
                "is_returnable": is_returnable,
                "return_deadline": str(return_deadline) if return_deadline else "N/A",
                "recipient_email": recipient_email
            }
            background_tasks.add_task(send_movement_email, recipient_email, movement_data)

        return ProductResponse.model_validate(product)
    except ProductNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except (InsufficientStockError, ValueError) as e:
        raise HTTPException(status_code=400, detail=str(e))
