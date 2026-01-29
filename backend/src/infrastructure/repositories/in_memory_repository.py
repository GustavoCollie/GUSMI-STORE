"""
Implementación en memoria del repositorio de productos.
"""
from copy import deepcopy
from typing import Dict, Optional
from uuid import UUID

from src.domain.entities import Product, Movement, get_local_time
from src.domain.exceptions import ProductNotFoundError


class InMemoryProductRepository:
    """
    Implementación en memoria del repositorio de productos.
    
    Esta implementación mantiene los productos en un diccionario
    Python en memoria. Es útil para desarrollo y testing.
    
    Nota: Los datos se pierden al reiniciar la aplicación.
    """
    
    def __init__(self) -> None:
        """Inicializa el repositorio con un diccionario vacío."""
        self._products: Dict[UUID, Product] = {}
    
    def save(self, product: Product) -> Product:
        """
        Guarda o actualiza un producto.
        
        Args:
            product: Producto a guardar
            
        Returns:
            Una copia del producto guardado
        """
        # Guardamos una copia para evitar mutaciones externas
        # Ensure updated_at is preserved or updated
        if not product.updated_at:
             product.updated_at = get_local_time()
        self._products[product.id] = deepcopy(product)
        return deepcopy(product)
    
    def find_by_id(self, product_id: UUID) -> Optional[Product]:
        """
        Busca un producto por ID.
        
        Args:
            product_id: UUID del producto
            
        Returns:
            Una copia del producto si existe, None en caso contrario
        """
        product = self._products.get(product_id)
        return deepcopy(product) if product else None
    
    def update_stock(self, product_id: UUID, quantity: int) -> Product:
        """
        Actualiza el stock de un producto.
        
        Args:
            product_id: UUID del producto
            quantity: Nueva cantidad de stock
            
        Returns:
            El producto actualizado
            
        Raises:
            ProductNotFoundError: Si el producto no existe
        """
        product = self._products.get(product_id)
        
        if product is None:
            raise ProductNotFoundError(str(product_id))
        
        product.stock = quantity

        product.updated_at = get_local_time()
        return deepcopy(product)

    def find_all(self) -> list[Product]:
        """
        Busca todos los productos.
            
        Returns:
            Lista de copias de los productos
        """
        return [deepcopy(p) for p in self._products.values()]

    def delete(self, product_id: UUID) -> bool:
        """
        Elimina un producto y sus movimientos asociados en memoria.
        """
        if product_id in self._products:
            del self._products[product_id]
            # Limpiar movimientos asociados si existen
            if hasattr(self, '_movements'):
                self._movements = [m for m in self._movements if m.product_id != product_id]
            return True
        return False

    def find_initial_movement(self, product_id: UUID) -> Optional['Movement']:
        """
        Busca el primer movimiento de entrada de un producto en memoria.
        """
        if not hasattr(self, '_movements'):
            return None
        
        movements = [m for m in self._movements if m.product_id == product_id and m.type == 'ENTRY']
        if not movements:
            return None
            
        # El más antiguo (primero en la lista pues se guardan por orden de llegada)
        return deepcopy(sorted(movements, key=lambda x: x.date)[0])

    def update_movement(self, movement: 'Movement') -> 'Movement':
        """
        Actualiza un movimiento existente en memoria.
        """
        if not hasattr(self, '_movements'):
            return movement
            
        for i, m in enumerate(self._movements):
            if m.id == movement.id:
                self._movements[i].reference = movement.reference
                self._movements[i].document_path = movement.document_path
                self._movements[i].recipient_email = movement.recipient_email
                break
        return movement

    def save_movement(self, movement: 'Movement') -> 'Movement':
        """
        Registra un movimiento en memoria con hora local.
        """
        if not hasattr(self, '_movements'):
            self._movements = []
        
        # Asegurar que tenga fecha local si no se provee
        if not movement.date:
            from datetime import datetime, timedelta, timezone
            tz = timezone(timedelta(hours=-5))
            movement.date = datetime.now(tz)
            
        self._movements.append(deepcopy(movement))
        return movement

    def find_all_movements(self) -> list['Movement']:
        """
        Retorna todos los movimientos registrados en memoria.
        """
        if not hasattr(self, '_movements'):
            return []
        return sorted(deepcopy(self._movements), key=lambda x: x.date, reverse=True)
