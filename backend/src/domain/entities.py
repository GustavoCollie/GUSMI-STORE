"""
Entidades de dominio para el módulo de inventario.
"""
from dataclasses import dataclass, field
from decimal import Decimal
from uuid import UUID, uuid4
from typing import Optional
from datetime import datetime, timedelta, timezone

from .exceptions import InvalidStockError, InsufficientStockError


def get_local_time():
    # Para Perú (GMT-5)
    tz = timezone(timedelta(hours=-5))
    return datetime.now(tz)


@dataclass
class Product:
    """
    Entidad Product que representa un producto en el inventario.
    
    Reglas de negocio:
    - El stock nunca puede ser negativo
    - El precio debe ser un valor decimal para precisión
    - Cada producto tiene un SKU único
    """
    
    name: str
    description: str
    stock: int
    sku: str
    retail_price: Optional[Decimal] = None
    image_path: Optional[str] = None
    tech_sheet_path: Optional[str] = None
    is_preorder: bool = False
    preorder_price: Optional[Decimal] = None
    estimated_delivery_date: Optional[datetime] = None
    preorder_description: Optional[str] = None
    stripe_price_id: Optional[str] = None
    has_pending_purchase_orders: bool = False
    id: UUID = field(default_factory=uuid4)
    updated_at: datetime = field(default_factory=get_local_time)
    
    def __post_init__(self) -> None:
        """Valida que el stock inicial no sea negativo."""
        if self.stock < 0:
            raise InvalidStockError(self.stock)
    
    def add_stock(self, quantity: int) -> None:
        """
        Añade stock al producto.
        
        Args:
            quantity: Cantidad a añadir (debe ser positiva)
            
        Raises:
            ValueError: Si la cantidad no es positiva
        """
        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")
        
        self.stock += quantity
    
    def remove_stock(self, quantity: int) -> None:
        """
        Remueve stock del producto.
        
        Args:
            quantity: Cantidad a remover (debe ser positiva)
            
        Raises:
            ValueError: Si la cantidad no es positiva
            InsufficientStockError: Si no hay suficiente stock
        """
        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")
        
        if self.stock < quantity:
            raise InsufficientStockError(
                available=self.stock,
                requested=quantity
            )
        
        self.stock -= quantity


@dataclass
class User:
    """
    User Domain Entity.
    """
    email: str
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    verification_token: Optional[str] = None
    id: UUID = field(default_factory=uuid4)





@dataclass
class Movement:
    """
    Entidad Movement que representa cualquier entrada o salida de stock.
    """
    product_id: UUID
    quantity: int
    type: str  # 'INGRESO', 'VENTA', 'CONSUMO INTERNO', 'RETURN'
    reference: str  # Orden de Compra, Factura, etc.
    document_path: Optional[str] = None
    applicant: Optional[str] = None
    applicant_area: Optional[str] = None
    is_returnable: bool = False
    return_deadline: Optional[datetime] = None
    recipient_email: Optional[str] = None
    sales_order_id: Optional[UUID] = None
    parent_id: Optional[UUID] = None
    product_name: Optional[str] = None
    id: UUID = field(default_factory=uuid4)
    date: datetime = field(default_factory=get_local_time)

