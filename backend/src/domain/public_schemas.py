"""
Schemas for the public ecommerce API (no API key required).
"""
from decimal import Decimal
from uuid import UUID
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator


# --- Product Schemas ---

class PublicProductResponse(BaseModel):
    id: UUID
    name: str
    description: str
    stock: int
    retail_price: Decimal
    image_path: Optional[str] = None
    is_preorder: bool = False
    preorder_price: Optional[Decimal] = None
    estimated_delivery_date: Optional[datetime] = None
    preorder_description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator("image_path", mode="before")
    @classmethod
    def normalize_paths(cls, v):
        if not v: return v
        if v.startswith("http"): return v  # External URLs (e.g. Supabase Storage)
        for prefix in ["/tmp/uploads/", "uploads/"]:
            if v.startswith(prefix):
                v = v.replace(prefix, "", 1)
        v = v.lstrip("/")
        if not v.startswith("uploads/"):
            v = "uploads/" + v
        return "/" + v


# --- Customer Auth Schemas ---

class CustomerRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1, max_length=200)
    phone: Optional[str] = None


class CustomerLogin(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    credential: str  # Google JWT token from Identity Services


class CustomerTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    customer_id: str
    email: str
    full_name: Optional[str] = None
    has_discount: bool = False


# --- Cart / Checkout Schemas ---

class CartItem(BaseModel):
    product_id: UUID
    product_name: str
    quantity: int = Field(..., gt=0)
    unit_price: Decimal = Field(..., ge=0)
    image_path: Optional[str] = None


class CreateCheckoutSessionRequest(BaseModel):
    items: List[CartItem]
    customer_email: EmailStr
    customer_name: str
    shipping_address: Optional[str] = None
    apply_discount: bool = False


class CheckoutSessionResponse(BaseModel):
    session_id: str
    checkout_url: str


# --- Order Schemas ---

class EcommerceOrderCreate(BaseModel):
    session_id: str  # Stripe checkout session ID


class EcommerceOrderItem(BaseModel):
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    tax_amount: Decimal
    total_amount: Decimal


class EcommerceOrderResponse(BaseModel):
    order_ids: list
    items: list
    total_amount: float
    status: str = "PENDING"
    delivery_date: Optional[str] = None
    message: Optional[str] = None
