"""
Application services for inventory management.
"""
from decimal import Decimal
from uuid import UUID
from typing import Optional
from datetime import datetime

from src.domain.entities import Product
from src.domain.exceptions import ProductNotFoundError
from src.ports.repository import ProductRepository


class InventoryService:
    """
    Orchestrates inventory management use cases.
    Acts as an intermediary between the API and the domain layer.
    """
    
    def __init__(self, repository: ProductRepository):
        self._repository = repository
    
    def create_product(
        self,
        name: str,
        description: str,
        stock: int,
        sku: str,
        reference: str = "Registro Inicial",
        document_path: Optional[str] = None
    ) -> Product:
        """
        Creates a new product in the inventory and records an initial movement.
        
        Raises:
            InvalidStockError: If initial stock is negative.
        """
        product = Product(
            name=name,
            description=description,
            stock=stock,
            sku=sku
        )
        saved_product = self._repository.save(product)

        # Record initial movement if stock > 0
        if stock > 0:
            from src.domain.entities import Movement
            movement = Movement(
                product_id=saved_product.id,
                quantity=stock,
                type="ENTRY",
                reference=reference,
                document_path=document_path
            )
            if hasattr(self._repository, 'save_movement'):
                self._repository.save_movement(movement)
        
        return saved_product
    
    def get_product(self, product_id: UUID) -> Product:
        """
        Retrieves a product by its ID.
        
        Raises:
            ProductNotFoundError: If the product does not exist.
        """
        product = self._repository.find_by_id(product_id)
        
        if product is None:
            raise ProductNotFoundError(str(product_id))
        
        return product
    
    def receive_stock(self, product_id: UUID, quantity: int, reference: str = "N/A", document_path: Optional[str] = None) -> Product:
        """
        Añade stock al producto y registra el movimiento.
        """
        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")
        
        product = self.get_product(product_id)
        product.add_stock(quantity)
        
        from src.domain.entities import Movement
        movement = Movement(
            product_id=product.id,
            quantity=quantity,
            type="ENTRY",
            reference=reference,
            document_path=document_path
        )
        
        self._repository.save(product)
        if hasattr(self._repository, 'save_movement'):
            self._repository.save_movement(movement)
            
        return product
    
    def sell_product(
        self, 
        product_id: UUID, 
        quantity: int, 
        reference: str = "N/A",
        applicant: Optional[str] = None,
        applicant_area: Optional[str] = None,
        is_returnable: bool = False,
        return_deadline: Optional[datetime] = None,
        recipient_email: Optional[str] = None,
        document_path: Optional[str] = None
    ) -> Product:
        """
        Reduce stock para una venta y registra el movimiento de salida.
        """
        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")
        
        product = self.get_product(product_id)
        product.remove_stock(quantity)
        
        from src.domain.entities import Movement
        movement = Movement(
            product_id=product.id,
            quantity=quantity,
            type="EXIT",
            reference=reference,
            applicant=applicant,
            applicant_area=applicant_area,
            is_returnable=is_returnable,
            return_deadline=return_deadline,
            recipient_email=recipient_email,
            document_path=document_path
        )
        
        self._repository.save(product)
        if hasattr(self._repository, 'save_movement'):
            self._repository.save_movement(movement)
            
        return product

    def get_movements(self) -> list:
        """
        Retorna todos los movimientos registrados.
        """
        if hasattr(self._repository, 'find_all_movements'):
            return self._repository.find_all_movements()
        return []

    def list_products(self) -> list[Product]:
        """Lists all products in the inventory."""
        return self._repository.find_all()

    def update_product(
        self,
        product_id: UUID,
        name: str,
        description: str,
        sku: str
    ) -> Product:
        """
        Full update of product details (PUT).
        """
        product = self.get_product(product_id)
        product.name = name
        product.description = description
        product.sku = sku
        
        return self._repository.save(product)

    def patch_product(
        self,
        product_id: UUID,
        initial_reference: Optional[str] = None,
        initial_document_path: Optional[str] = None,
        **kwargs
    ) -> Product:
        """
        Partial update of product details (PATCH).
        Also allows updating initial traceability if provided.
        """
        product = self.get_product(product_id)
        
        # Actualizar datos del producto
        for key, value in kwargs.items():
            if value is not None and hasattr(product, key):
                setattr(product, key, value)
        
        updated_product = self._repository.save(product)
        
        # Actualizar trazabilidad inicial si se solicita
        if initial_reference is not None or initial_document_path is not None:
            if hasattr(self._repository, 'find_initial_movement') and hasattr(self._repository, 'update_movement'):
                initial_move = self._repository.find_initial_movement(product_id)
                if initial_move:
                    if initial_reference is not None:
                        initial_move.reference = initial_reference
                    if initial_document_path is not None:
                        initial_move.document_path = initial_document_path
                    self._repository.update_movement(initial_move)
        
        return updated_product

    def delete_product(self, product_id: UUID) -> bool:
        """Deletes a product permanently."""
        return self._repository.delete(product_id)
