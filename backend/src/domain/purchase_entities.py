from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID, uuid4
from typing import Optional, List
from datetime import datetime, timezone, timedelta

def get_local_time():
    tz = timezone(timedelta(hours=-5))
    return datetime.now(tz)

@dataclass
class Supplier:
    name: str
    email: str
    phone: str
    ruc: str
    contact_name: str = ""
    contact_position: str = ""
    is_active: bool = True
    products: List[str] = field(default_factory=list)
    product_ids: List[UUID] = field(default_factory=list)
    id: UUID = field(default_factory=uuid4)

@dataclass
class PurchaseOrder:
    supplier_id: UUID
    product_id: UUID
    quantity: int
    unit_price: Decimal
    total_amount: Decimal  # Coste Total de Adquisición (CTA)
    tax_amount: Decimal = Decimal("0.00") # IGV/Tax
    currency: str = "USD" # USD, PEN
    savings_amount: Decimal = Decimal("0.00") # Ahorro Total de Costes
    status: str = "PENDING"  # PENDING, RECEIVED, REJECTED
    expected_delivery_date: Optional[datetime] = None
    actual_delivery_date: Optional[datetime] = None
    is_rejected: bool = False
    rejection_reason: Optional[str] = None
    invoice_number: Optional[str] = None
    referral_guide_number: Optional[str] = None
    invoice_path: Optional[str] = None
    referral_guide_path: Optional[str] = None
    freight_amount: Decimal = Decimal("0.00")
    other_expenses_amount: Decimal = Decimal("0.00")
    other_expenses_description: Optional[str] = None
    id: UUID = field(default_factory=uuid4)
    supplier_name: Optional[str] = None
    product_name: Optional[str] = None
    created_at: datetime = field(default_factory=get_local_time)

@dataclass
class PurchaseKPIs:
    quality_rate: float  # % pedidos rechazados
    total_cta: Decimal   # Total Cost of Acquisition
    total_savings: Decimal # Total savings
    on_time_delivery_rate: float # % compliance with deadlines
    total_orders: int
    rejected_orders: int
