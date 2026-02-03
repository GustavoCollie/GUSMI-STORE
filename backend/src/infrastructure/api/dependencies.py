"""
Dependency Injection para FastAPI.
"""
import os
from typing import Generator, Any
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from src.infrastructure.database.models import CustomerModel

from src.application.services import InventoryService
from src.infrastructure.database.config import SessionLocal
from src.infrastructure.repositories.postgres_repository import PostgreSQLProductRepository
from src.infrastructure.repositories.postgres_user_repository import PostgreSQLUserRepository
from src.infrastructure.repositories.in_memory_repository import InMemoryProductRepository
from src.infrastructure.repositories.postgres_sales_repository import PostgresSalesRepository
from src.ports.repository import ProductRepository, UserRepository
from src.ports.sales_repository import SalesRepository


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


def get_sales_repository(db: Session = Depends(get_db)) -> SalesRepository:
    """
    Proporciona el repositorio de ventas.
    """
    return PostgresSalesRepository(db)


def get_inventory_service(
    repository: ProductRepository = Depends(get_repository),
    sales_repository: SalesRepository = Depends(get_sales_repository)
) -> InventoryService:
    """
    Proporciona el servicio de inventario con las dependencias inyectadas.
    """
    return InventoryService(repository, sales_repository)


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


# --- Public Ecommerce Dependencies ---
from src.infrastructure.repositories.postgres_customer_repository import PostgresCustomerRepository
from src.application.customer_auth_service import CustomerAuthService
from src.application.stripe_service import StripeService
from src.application.ecommerce_service import EcommerceService


def get_customer_auth_service(
    db: Session = Depends(get_db),
) -> CustomerAuthService:
    repo = PostgresCustomerRepository(db)
    return CustomerAuthService(customer_repository=repo)


def get_ecommerce_service(
    repository: ProductRepository = Depends(get_repository),
    sales_repository: SalesRepository = Depends(get_sales_repository),
) -> EcommerceService:
    return EcommerceService(
        product_repository=repository,
        sales_repository=sales_repository,
        stripe_service=StripeService(),
    )
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Header

security = HTTPBearer()

def get_current_customer(
    auth_credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: CustomerAuthService = Depends(get_customer_auth_service),
) -> CustomerModel:
    customer = auth_service.get_customer_from_token(auth_credentials.credentials)
    if not customer:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")
    return customer
