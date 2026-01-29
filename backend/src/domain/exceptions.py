"""
Excepciones de dominio para el módulo de inventario.
"""


class DomainException(Exception):
    """Excepción base para todas las excepciones de dominio."""
    pass


class InsufficientStockError(DomainException):
    """Se lanza cuando se intenta vender más stock del disponible."""
    
    def __init__(self, available: int, requested: int):
        self.available = available
        self.requested = requested
        super().__init__(
            f"Stock insuficiente. Disponible: {available}, Solicitado: {requested}"
        )


class InvalidStockError(DomainException):
    """Se lanza cuando se intenta establecer un stock negativo."""
    
    def __init__(self, stock: int):
        self.stock = stock
        super().__init__(f"El stock no puede ser negativo. Valor recibido: {stock}")


class ProductNotFoundError(DomainException):
    """Se lanza cuando un producto no existe."""
    
    def __init__(self, product_id: str):
        self.product_id = product_id
        super().__init__(f"Producto con ID {product_id} no encontrado")
