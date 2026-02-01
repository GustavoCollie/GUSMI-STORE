from decimal import Decimal
from uuid import UUID
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class SalesOrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=200)
    customer_email: str = Field(..., description="Customer email")
    product_id: UUID
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., gt=0)
    shipping_cost: Decimal = Field(default=Decimal("0.00"))
    shipping_type: str = Field(default="PICKUP", pattern="^(PICKUP|DELIVERY)$")
    shipping_address: Optional[str] = None
    delivery_date: Optional[datetime] = None

class SalesOrderUpdate(BaseModel):
    status: Optional[str] = None # PENDING, COMPLETED, CANCELLED
    delivery_date: Optional[datetime] = None
    shipping_address: Optional[str] = None
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    product_id: Optional[UUID] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None
    shipping_cost: Optional[Decimal] = None
    shipping_type: Optional[str] = None

class SalesOrderResponse(BaseModel):
    id: UUID
    customer_name: str
    customer_email: str
    product_id: UUID
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal
    shipping_cost: Decimal
    shipping_type: str
    shipping_address: Optional[str] = None
    delivery_date: Optional[datetime] = None
    status: str
    created_at: datetime
    product_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class SalesKPIsResponse(BaseModel):
    total_sales_count: int
    total_revenue: Decimal
    pending_deliveries: int
    top_selling_products: List[dict] = []
