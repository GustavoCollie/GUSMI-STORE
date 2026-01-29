from decimal import Decimal
from uuid import UUID
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator, EmailStr


class ProductCreateRequest(BaseModel):
    """Schema for product creation request."""
    
    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    description: str = Field(..., min_length=1, max_length=1000, description="Product description")
    stock: int = Field(..., ge=0, description="Initial stock (cannot be negative)")
    sku: str = Field(..., min_length=1, max_length=50, description="Unique product SKU")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Laptop HP Pavilion",
                "description": "Laptop with Intel i7 processor, 16GB RAM",
                "stock": 10,
                "sku": "LAP-HP-001"
            }
        }
    )


class ProductResponse(BaseModel):
    """Schema for product response."""
    
    id: UUID
    name: str
    description: str
    stock: int
    sku: str
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class StockOperationRequest(BaseModel):
    """Schema for stock operations (receive/sell)."""
    
    quantity: int = Field(..., gt=0, description="Quantity (must be positive)")
    reference: str = Field(..., description="Purchase Order, Invoice, or Reference number")
    applicant: Optional[str] = None
    applicant_area: Optional[str] = None
    is_returnable: bool = False
    return_deadline: Optional[datetime] = None
    recipient_email: Optional[EmailStr] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "quantity": 5,
                "reference": "OC-2026-001"
            }
        }
    )


class MovementResponse(BaseModel):
    """Schema for movement response."""
    id: UUID
    product_id: UUID
    quantity: int
    type: str
    reference: str
    document_path: Optional[str] = None
    applicant: Optional[str] = None
    applicant_area: Optional[str] = None
    is_returnable: bool = False
    return_deadline: Optional[datetime] = None
    recipient_email: Optional[str] = None
    date: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProductUpdateRequest(BaseModel):
    """Schema for partial product update (PATCH)."""
    
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Descriptive error message")
    details: dict | None = Field(default=None, description="Additional error details")


# --- Auth Schemas ---

class UserCreate(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(BaseModel):
    id: UUID
    email: str
    is_active: bool
    is_verified: bool
    
    model_config = ConfigDict(from_attributes=True)

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
