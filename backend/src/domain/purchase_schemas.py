from decimal import Decimal
from uuid import UUID
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: str = Field(..., description="Contact email")
    phone: Optional[str] = Field(None, max_length=50)
    ruc: str = Field(..., min_length=11, max_length=11, description="RUC del proveedor (11 dígitos)")
    contact_name: Optional[str] = Field(None, max_length=200)
    contact_position: Optional[str] = Field(None, max_length=100)
    is_active: bool = True
    product_ids: List[UUID] = Field(default_factory=list)

class SupplierUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    email: Optional[str] = None
    phone: Optional[str] = None
    ruc: Optional[str] = Field(None, min_length=11, max_length=11)
    contact_name: Optional[str] = None
    contact_position: Optional[str] = None
    is_active: Optional[bool] = None
    product_ids: Optional[List[UUID]] = None

class SupplierResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    ruc: str
    contact_name: Optional[str] = None
    contact_position: Optional[str] = None
    is_active: bool = True
    products: List[str] = []
    product_ids: List[UUID] = []
    
    model_config = ConfigDict(from_attributes=True)

class PurchaseOrderCreate(BaseModel):
    supplier_id: UUID
    product_id: UUID
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., gt=0)
    expected_delivery_date: Optional[datetime] = None
    currency: str = Field(default="USD", pattern="^(USD|PEN)$")
    savings_amount: Decimal = Field(default=Decimal("0.00"))
    freight_amount: Decimal = Field(default=Decimal("0.00"))
    other_expenses_amount: Decimal = Field(default=Decimal("0.00"))
    other_expenses_description: Optional[str] = Field(None, max_length=255)

class PurchaseOrderUpdate(BaseModel):
    status: Optional[str] = None # RECEIVED, REJECTED
    actual_delivery_date: Optional[datetime] = None
    is_rejected: Optional[bool] = None
    rejection_reason: Optional[str] = None
    invoice_number: Optional[str] = None
    referral_guide_number: Optional[str] = None
    invoice_path: Optional[str] = None
    referral_guide_path: Optional[str] = None

class PurchaseOrderResponse(BaseModel):
    id: UUID
    supplier_id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    tax_amount: Decimal
    currency: str
    savings_amount: Decimal
    status: str
    is_rejected: Optional[bool] = False
    rejection_reason: Optional[str] = None
    invoice_number: Optional[str] = None
    referral_guide_number: Optional[str] = None
    invoice_path: Optional[str] = None
    referral_guide_path: Optional[str] = None
    expected_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    freight_amount: Decimal
    other_expenses_amount: Decimal
    other_expenses_description: Optional[str] = None
    created_at: datetime
    
    supplier_name: Optional[str] = None
    product_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class PurchaseKPIsResponse(BaseModel):
    quality_rate: float
    total_cta: Decimal
    total_savings: Decimal
    on_time_delivery_rate: float
    total_orders: int
    rejected_orders: int
