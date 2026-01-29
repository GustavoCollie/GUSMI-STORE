"""
Repositorio PostgreSQL para Usuarios.
"""
from typing import Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.domain.entities import User
from src.domain.exceptions import ProductNotFoundError # Reuse or create UserNotFound
from src.infrastructure.database.models import UserModel
from src.ports.repository import UserRepository

class PostgreSQLUserRepository(UserRepository):
    """
    Implementación del repositorio de usuarios con PostgreSQL.
    """
    
    def __init__(self, db: Session):
        self._db = db
    
    def save(self, user: User) -> User:
        """Guarda o actualiza un usuario."""
        user_id_str = str(user.id)
        user_model = self._db.query(UserModel).filter(UserModel.id == user_id_str).first()
        
        if user_model:
            # Update existing
            user_model.email = user.email
            user_model.hashed_password = user.hashed_password
            user_model.is_active = user.is_active
            user_model.is_verified = user.is_verified
            user_model.verification_token = user.verification_token
        else:
            # Create new
            user_model = UserModel(
                id=user_id_str,
                email=user.email,
                hashed_password=user.hashed_password,
                is_active=user.is_active,
                is_verified=user.is_verified,
                verification_token=user.verification_token
            )
            self._db.add(user_model)
        
        self._db.commit()
        return self._to_entity(user_model)

    def find_by_email(self, email: str) -> Optional[User]:
        """Busca un usuario por email."""
        user_model = self._db.query(UserModel).filter(UserModel.email == email).first()
        if not user_model:
            return None
        return self._to_entity(user_model)

    def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Busca un usuario por ID."""
        user_id_str = str(user_id)
        user_model = self._db.query(UserModel).filter(UserModel.id == user_id_str).first()
        if not user_model:
            return None
        return self._to_entity(user_model)

    def _to_entity(self, model: UserModel) -> User:
        """Convierte modelo SQLAlchemy a entidad de dominio."""
        return User(
            id=UUID(model.id) if isinstance(model.id, str) else model.id,
            email=model.email,
            hashed_password=model.hashed_password,
            is_active=model.is_active,
            is_verified=model.is_verified,
            verification_token=model.verification_token
        )
