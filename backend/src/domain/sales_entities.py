from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID, uuid4
from typing import Optional
from datetime import datetime, timezone, timedelta

def get_local_time():
    tz = timezone(timedelta(hours=-5))
    return datetime.now(tz)

@dataclass
class SalesOrder:
    customer_name: str
    customer_email: str
    product_id: UUID
    quantity: int
    unit_price: Decimal
    subtotal: Decimal
    tax_amount: Decimal  # IGV (18%)
    total_amount: Decimal
    shipping_cost: Decimal = Decimal("0.00")
    shipping_type: str = "PICKUP"  # PICKUP, DELIVERY
    shipping_address: Optional[str] = None
    delivery_date: Optional[datetime] = None
    status: str = "PENDING"  # PENDING, COMPLETED, CANCELLED
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=get_local_time)
    
    product_name: Optional[str] = None
