"""
Interfaces y puertos para el repositorio de productos.
"""
from typing import Optional, Protocol
from uuid import UUID

from src.domain.entities import Product, User, Movement


class ProductRepository(Protocol):
    """
    Interface del repositorio de productos usando typing.Protocol.
    
    Esta interfaz define el contrato que cualquier implementación
    de repositorio debe cumplir, siguiendo el principio de
    inversión de dependencias (SOLID).
    """
    
    def save(self, product: Product) -> Product:
        """
        Guarda o actualiza un producto en el repositorio.
        
        Args:
            product: Producto a guardar
            
        Returns:
            El producto guardado
        """
        ...
    
    def find_by_id(self, product_id: UUID) -> Optional[Product]:
        """
        Busca un producto por su ID.
        
        Args:
            product_id: UUID del producto
            
        Returns:
            El producto si existe, None en caso contrario
        """
        ...
    
    def update_stock(self, product_id: UUID, quantity: int) -> Product:
        """
        Actualiza el stock de un producto.
        
        Args:
            product_id: UUID del producto
            quantity: Cantidad a establecer
            
        Returns:
            El producto actualizado
            
        Raises:
            ProductNotFoundError: Si el producto no existe
        """
        ...

    def find_all(self) -> list[Product]:
        """
        Retorna todos los productos del repositorio.
        
        Returns:
            Lista de productos
        """
        ...

    def delete(self, product_id: UUID) -> bool:
        """
        Elimina un producto del repositorio.
        
        Args:
            product_id: UUID del producto
            
        Returns:
            True si se eliminó, False si no existía
        """
        ...

    def save_movement(self, movement: 'Movement') -> 'Movement':
        """
        Registra un movimiento (entrada o salida) en el repositorio.
        """
        ...

    def find_all_movements(self) -> list['Movement']:
        """
        Retorna todos los movimientos registrados.
        """
        ...

    def find_initial_movement(self, product_id: UUID) -> Optional['Movement']:
        """
        Busca el primer movimiento de entrada de un producto.
        """
        ...

    def update_movement(self, movement: 'Movement') -> 'Movement':
        """
        Actualiza los datos de un movimiento existente.
        """
        ...


class UserRepository(Protocol):
    """
    Interface for User Repository.
    """
    
    def save(self, user: User) -> User:
        ...
    
    def find_by_email(self, email: str) -> Optional[User]:
        ...
    
    def find_by_id(self, user_id: UUID) -> Optional[User]:
        ...
