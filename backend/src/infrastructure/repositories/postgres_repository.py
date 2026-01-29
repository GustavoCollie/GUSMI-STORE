"""
Implementación de ProductRepository para PostgreSQL usando SQLAlchemy.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session

from src.domain.entities import Product, Movement, get_local_time
from src.domain.exceptions import ProductNotFoundError
from src.infrastructure.database.models import ProductModel, MovementModel


class PostgreSQLProductRepository:
    """
    Implementación de ProductRepository usando PostgreSQL y SQLAlchemy.
    
    Esta implementación maneja la persistencia de productos en PostgreSQL,
    realizando el mapeo entre entidades de dominio y modelos de SQLAlchemy.
    """
    
    def __init__(self, session: Session):
        """
        Inicializa el repositorio con una sesión de SQLAlchemy.
        
        Args:
            session: Sesión de SQLAlchemy para operaciones de BD
        """
        self._session = session
    
    def _to_entity(self, model: ProductModel) -> Product:
        """
        Convierte un modelo SQLAlchemy a una entidad de dominio.
        """
        return Product(
            id=UUID(model.id) if isinstance(model.id, str) else model.id,
            name=model.name,
            description=model.description,
            stock=model.stock,
            sku=model.sku,
            updated_at=model.updated_at
        )

    def _movement_to_entity(self, model: MovementModel) -> 'Movement':
        """
        Convierte un modelo de movimiento a una entidad de dominio.
        """
        return Movement(
            id=UUID(model.id) if isinstance(model.id, str) else model.id,
            product_id=UUID(model.product_id) if isinstance(model.product_id, str) else model.product_id,
            quantity=model.quantity,
            type=model.type,
            reference=model.reference,
            document_path=model.document_path,
            applicant=model.applicant,
            applicant_area=model.applicant_area,
            is_returnable=model.is_returnable,
            return_deadline=model.return_deadline,
            recipient_email=model.recipient_email,
            date=model.date
        )
    
    def _to_model(self, entity: Product) -> ProductModel:
        """
        Convierte una entidad de dominio a un modelo SQLAlchemy.
        """
        return ProductModel(
            id=str(entity.id),
            name=entity.name,
            description=entity.description,
            stock=entity.stock,
            sku=entity.sku,
            updated_at=entity.updated_at
        )
    
    def save(self, product: Product) -> Product:
        """
        Guarda o actualiza un producto en la base de datos.
        """
        # Buscar si ya existe
        product_id_str = str(product.id)
        existing = self._session.query(ProductModel).filter_by(id=product_id_str).first()
        
        if existing:
            # Actualizar producto existente
            existing.name = product.name
            existing.description = product.description
            existing.stock = product.stock
            existing.sku = product.sku

            existing.updated_at = get_local_time()
            model = existing
        else:
            # Crear nuevo producto
            model = self._to_model(product)
            self._session.add(model)
        
        self._session.commit()
        
        return self._to_entity(model)
    
    def find_by_id(self, product_id: UUID) -> Optional[Product]:
        """
        Busca un producto por su ID.
        """
        model = self._session.get(ProductModel, str(product_id))
        
        if model is None:
            return None
        
        return self._to_entity(model)
    
    def update_stock(self, product_id: UUID, quantity: int) -> Product:
        """
        Actualiza el stock de un producto.
        """
        product_id_str = str(product_id)
        model = self._session.query(ProductModel).filter_by(id=product_id_str).first()
        
        if model is None:
            raise ProductNotFoundError(product_id_str)
        
        model.stock = quantity

        model.updated_at = get_local_time()
        self._session.commit()
        
        return self._to_entity(model)

    def find_all(self) -> list[Product]:
        """
        Busca todos los productos en la base de datos.
        """
        models = self._session.query(ProductModel).all()
        return [self._to_entity(m) for m in models]

    def delete(self, product_id: UUID) -> bool:
        """
        Elimina un producto en la base de datos.
        """
        model = self._session.get(ProductModel, str(product_id))
        if model:
            self._session.delete(model)
            self._session.commit()
            return True
        return False

    def save_movement(self, movement: 'Movement') -> 'Movement':
        """
        Registra un movimiento en la base de datos.
        """
        model = MovementModel(
            id=str(movement.id),
            product_id=str(movement.product_id),
            quantity=movement.quantity,
            type=movement.type,
            reference=movement.reference,
            document_path=movement.document_path,
            applicant=movement.applicant,
            applicant_area=movement.applicant_area,
            is_returnable=movement.is_returnable,
            return_deadline=movement.return_deadline,
            recipient_email=movement.recipient_email,
            date=movement.date
        )
        self._session.add(model)
        self._session.commit()
        return movement

    def find_all_movements(self) -> list['Movement']:
        """
        Busca todos los movimientos en la base de datos.
        """
        models = self._session.query(MovementModel).order_by(MovementModel.date.desc()).all()
        return [self._movement_to_entity(m) for m in models]

    def find_initial_movement(self, product_id: UUID) -> Optional['Movement']:
        """
        Busca el primer movimiento de entrada de un producto.
        """
        product_id_str = str(product_id)
        model = self._session.query(MovementModel)\
            .filter_by(product_id=product_id_str, type='ENTRY')\
            .order_by(MovementModel.date.asc())\
            .first()
        
        if not model:
            return None
            
        return self._movement_to_entity(model)

    def update_movement(self, movement: 'Movement') -> 'Movement':
        """
        Actualiza un movimiento existente en la base de datos.
        """
        movement_id_str = str(movement.id)
        model = self._session.get(MovementModel, movement_id_str)
        if model:
            model.reference = movement.reference
            model.document_path = movement.document_path
            self._session.commit()
        return movement
