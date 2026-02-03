"""
Implementación de ProductRepository para PostgreSQL usando SQLAlchemy.
"""
from decimal import Decimal
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session, joinedload

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
            retail_price=model.retail_price,
            image_path=model.image_path,
            tech_sheet_path=model.tech_sheet_path,
            is_preorder=bool(model.is_preorder) if hasattr(model, 'is_preorder') else False,
            preorder_price=model.preorder_price,
            estimated_delivery_date=model.estimated_delivery_date,
            preorder_description=model.preorder_description,
            stripe_price_id=model.stripe_price_id,
            has_pending_purchase_orders=any(po.status == "PENDING" for po in model.purchase_orders),
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
            sales_order_id=UUID(model.sales_order_id) if model.sales_order_id else None,
            parent_id=UUID(model.parent_id) if model.parent_id else None,
            product_name=model.product_name or (model.product.name if model.product else None),
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
            retail_price=entity.retail_price,
            image_path=entity.image_path,
            tech_sheet_path=entity.tech_sheet_path,
            is_preorder=entity.is_preorder,
            preorder_price=entity.preorder_price,
            estimated_delivery_date=entity.estimated_delivery_date,
            preorder_description=entity.preorder_description,
            stripe_price_id=entity.stripe_price_id,
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
            existing.retail_price = product.retail_price
            existing.image_path = product.image_path
            existing.tech_sheet_path = product.tech_sheet_path
            existing.is_preorder = product.is_preorder
            existing.preorder_price = product.preorder_price
            existing.estimated_delivery_date = product.estimated_delivery_date
            existing.preorder_description = product.preorder_description
            existing.stripe_price_id = product.stripe_price_id

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
            sales_order_id=str(movement.sales_order_id) if movement.sales_order_id else None,
            parent_id=str(movement.parent_id) if movement.parent_id else None,
            product_name=movement.product_name,
            date=movement.date
        )
        self._session.add(model)
        self._session.commit()
        return movement

    def find_all_movements(self) -> list['Movement']:
        """
        Busca todos los movimientos en la base de datos.
        """
        models = self._session.query(MovementModel)\
            .options(joinedload(MovementModel.product))\
            .order_by(MovementModel.date.desc())\
            .all()
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
