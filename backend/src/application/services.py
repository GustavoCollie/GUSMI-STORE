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
    
    def __init__(self, repository: ProductRepository, sales_repository=None):
        self._repository = repository
        self._sales_repository = sales_repository
    
    def create_product(
        self,
        name: str,
        description: str,
        sku: str,
        image_path: Optional[str] = None,
        tech_sheet_path: Optional[str] = None
    ) -> Product:
        """
        Creates a new product with 0 initial stock.
        """
        product = Product(
            name=name,
            description=description,
            stock=0, # Siempre inicia con 0 stock
            sku=sku,
            image_path=image_path,
            tech_sheet_path=tech_sheet_path
        )
        return self._repository.save(product)
    
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
    
    def receive_stock(
        self, 
        product_id: UUID, 
        quantity: int, 
        reference: str = "N/A", 
        document_path: Optional[str] = None,
        is_return: bool = False,
        parent_id: Optional[UUID] = None
    ) -> Product:
        """
        Añade stock al producto y registra el movimiento (Entra por compra o Retorno).
        """
        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")
        
        product = self.get_product(product_id)
        product.add_stock(quantity)
        
        from src.domain.entities import Movement
        movement = Movement(
            product_id=product.id,
            quantity=quantity,
            type="RETURN" if is_return else "INGRESO",
            reference=reference,
            document_path=document_path,
            parent_id=parent_id,
            product_name=product.name
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
        document_path: Optional[str] = None,
        sales_order_id: Optional[UUID] = None
    ) -> Product:
        """
        Reduce stock para una venta y registra el movimiento de salida.
        """
        if quantity <= 0:
            raise ValueError("La cantidad debe ser positiva")
        
        product = self.get_product(product_id)
        product.remove_stock(quantity)
        
        # Determinar el tipo de movimiento
        movement_type = "VENTA" if sales_order_id else "CONSUMO INTERNO"
        
        from src.domain.entities import Movement
        movement = Movement(
            product_id=product.id,
            quantity=quantity,
            type=movement_type,
            reference=reference,
            applicant=applicant,
            applicant_area=applicant_area,
            is_returnable=is_returnable,
            return_deadline=return_deadline,
            recipient_email=recipient_email,
            document_path=document_path,
            sales_order_id=sales_order_id,
            product_name=product.name
        )
        
        self._repository.save(product)
        if hasattr(self._repository, 'save_movement'):
            self._repository.save_movement(movement)
            
        # Actualizar estado de la orden de venta si existe
        if sales_order_id and self._sales_repository:
            self._sales_repository.update_status(sales_order_id, "COMPLETED")
            
        return product

    def get_movements(self) -> list:
        """
        Retorna todos los movimientos registrados.
        """
        if hasattr(self._repository, 'find_all_movements'):
            return self._repository.find_all_movements()
        return []

    def get_pending_returns(self, product_id: Optional[UUID] = None) -> list:
        """
        Calcula qué salidas 'devolutivas' aún no han sido retornadas completamente.
        """
        movements = self.get_movements()
        
        # 1. Filtrar salidas que son retornables
        exits = [m for m in movements if (m.type == 'EXIT' or m.type == 'CONSUMO INTERNO') and m.is_returnable]
        if product_id:
            exits = [m for m in exits if m.product_id == product_id]
            
        # 2. Filtrar retornos
        returns = [m for m in movements if m.type == 'RETURN' and m.parent_id is not None]
        
        pending = []
        for exit_mov in exits:
            # Calcular cuánto se ha devuelto de esta salida específica
            returned_qty = sum(r.quantity for r in returns if r.parent_id == exit_mov.id)
            pending_qty = exit_mov.quantity - returned_qty
            
            if pending_qty > 0:
                product = self.get_product(exit_mov.product_id)
                pending.append({
                    "movement_id": exit_mov.id,
                    "product_id": exit_mov.product_id,
                    "product_name": product.name,
                    "quantity": exit_mov.quantity,
                    "pending_quantity": pending_qty,
                    "applicant": exit_mov.applicant or "N/A",
                    "applicant_area": exit_mov.applicant_area or "N/A",
                    "reference": exit_mov.reference,
                    "date": exit_mov.date,
                    "return_deadline": exit_mov.return_deadline,
                    "recipient_email": exit_mov.recipient_email
                })
                
        return pending

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
