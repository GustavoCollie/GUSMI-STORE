from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Annotated, Optional
from uuid import UUID
from datetime import datetime

from src.application.sales_service import SalesService
from src.domain.sales_schemas import (
    SalesOrderCreate, SalesOrderResponse, 
    SalesOrderUpdate, SalesKPIsResponse
)
from src.infrastructure.api.dependencies import get_db, get_inventory_service
from src.application.services import InventoryService
from src.infrastructure.repositories.postgres_sales_repository import PostgresSalesRepository
from src.infrastructure.api.security import get_api_key
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["Sales"],
    dependencies=[Depends(get_api_key)]
)

def get_sales_service(
    db=Depends(get_db), 
    inv_service: InventoryService = Depends(get_inventory_service)
) -> SalesService:
    repo = PostgresSalesRepository(db)
    return SalesService(repo, inv_service)

@router.post("/orders", response_model=SalesOrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    request: SalesOrderCreate,
    service: Annotated[SalesService, Depends(get_sales_service)]
):
    try:
        order = service.create_sales_order(
            customer_name=request.customer_name,
            customer_email=request.customer_email,
            product_id=request.product_id,
            quantity=request.quantity,
            unit_price=request.unit_price,
            shipping_cost=request.shipping_cost,
            shipping_type=request.shipping_type,
            shipping_address=request.shipping_address,
            delivery_date=request.delivery_date
        )
        return SalesOrderResponse.model_validate(order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/orders", response_model=List[SalesOrderResponse])
def list_orders(service: Annotated[SalesService, Depends(get_sales_service)]):
    orders = service.list_sales_orders()
    return [SalesOrderResponse.model_validate(o) for o in orders]

@router.get("/orders/{order_id}", response_model=SalesOrderResponse)
def get_order(
    order_id: UUID,
    service: Annotated[SalesService, Depends(get_sales_service)]
):
    order = service.get_sales_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sales order not found")
    return SalesOrderResponse.model_validate(order)

@router.patch("/orders/{order_id}", response_model=SalesOrderResponse)
def update_order(
    order_id: UUID,
    request: SalesOrderUpdate,
    service: Annotated[SalesService, Depends(get_sales_service)]
):
    # If status is present, update status
    if request.status:
        service.update_order_status(order_id, request.status)
    
    # Update other fields
    order = service.update_sales_order(
        order_id=order_id,
        customer_name=request.customer_name,
        customer_email=request.customer_email,
        product_id=request.product_id,
        quantity=request.quantity,
        unit_price=request.unit_price,
        shipping_cost=request.shipping_cost,
        shipping_type=request.shipping_type,
        shipping_address=request.shipping_address,
        delivery_date=request.delivery_date
    )
    return SalesOrderResponse.model_validate(order)

@router.delete("/orders/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(
    order_id: UUID,
    service: Annotated[SalesService, Depends(get_sales_service)]
):
    service.delete_sales_order(order_id)
    return None

@router.get("/kpis", response_model=SalesKPIsResponse)
def get_kpis(service: Annotated[SalesService, Depends(get_sales_service)]):
    return service.get_kpis()
