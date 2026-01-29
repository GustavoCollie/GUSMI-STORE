"""
Dependency Injection para FastAPI.
"""
import os
from typing import Generator, Any
from fastapi import Depends
from sqlalchemy.orm import Session

from src.application.services import InventoryService
from src.infrastructure.database.config import SessionLocal
from src.infrastructure.repositories.postgres_repository import PostgreSQLProductRepository
from src.infrastructure.repositories.postgres_user_repository import PostgreSQLUserRepository
from src.infrastructure.repositories.in_memory_repository import InMemoryProductRepository
from src.ports.repository import ProductRepository, UserRepository


# Singleton para la versión en memoria
_in_memory_repo = InMemoryProductRepository()


def get_db() -> Generator[Any, None, None]:
    """
    Proporciona una sesión de base de datos o None si se usa la versión en memoria.
    """
    repo_type = os.getenv("REPOSITORY_TYPE", "postgres")
    
    if repo_type == "memory":
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_repository(db: Session = Depends(get_db)) -> ProductRepository:
    """
    Proporciona la implementación del repositorio según la configuración.
    """
    repo_type = os.getenv("REPOSITORY_TYPE", "postgres")
    
    if repo_type == "memory" or db is None:
        return _in_memory_repo
        
    return PostgreSQLProductRepository(db)


def get_inventory_service(repository: ProductRepository = Depends(get_repository)) -> InventoryService:
    """
    Proporciona el servicio de inventario con las dependencias inyectadas.
    """
    return InventoryService(repository)


# --- Auth Dependencies ---
from src.infrastructure.security.encryption import BCryptPasswordHasher
from src.infrastructure.security.tokens import JWTTokenProvider
from src.infrastructure.security.email_service import SMTPEmailService
from src.application.auth_service import AuthService

def get_auth_service(
    db: Session = Depends(get_db)
) -> AuthService:
    repo = PostgreSQLUserRepository(db)
    return AuthService(
        user_repository=repo,
        password_hasher=BCryptPasswordHasher(),
        token_provider=JWTTokenProvider(),
        email_service=SMTPEmailService()
    )
