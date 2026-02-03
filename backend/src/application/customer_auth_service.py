"""
Authentication service for ecommerce customers.
Supports email/password and Google OAuth.
"""
import os
import uuid
from typing import Optional
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
import bcrypt

from src.infrastructure.database.models import CustomerModel
from src.ports.customer_repository import CustomerRepository

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-super-secret")
ALGORITHM = "HS256"
CUSTOMER_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours


class CustomerAuthService:
    def __init__(self, customer_repository: CustomerRepository):
        self._repo = customer_repository

    def register(self, email: str, password: str, full_name: str, phone: Optional[str] = None) -> CustomerModel:
        existing = self._repo.find_by_email(email)
        if existing:
            raise ValueError("Ya existe una cuenta con este email")

        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        customer = CustomerModel(
            id=str(uuid.uuid4()),
            email=email,
            hashed_password=hashed,
            full_name=full_name,
            phone=phone,
            auth_provider="email",
            has_discount=True,
            is_verified=True,
        )
        return self._repo.save(customer)

    def login(self, email: str, password: str) -> CustomerModel:
        customer = self._repo.find_by_email(email)
        if not customer:
            raise ValueError("Credenciales inválidas")
        if not customer.hashed_password:
            raise ValueError("Esta cuenta usa Google Sign-In. Por favor inicia sesión con Google.")
        if not bcrypt.checkpw(password.encode("utf-8"), customer.hashed_password.encode("utf-8")):
            raise ValueError("Credenciales inválidas")
        return customer

    def google_auth(self, credential: str) -> CustomerModel:
        """Verify Google JWT and find-or-create customer."""
        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests

            google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
            idinfo = id_token.verify_oauth2_token(
                credential, google_requests.Request(), google_client_id
            )
            google_id = idinfo["sub"]
            email = idinfo["email"]
            full_name = idinfo.get("name", "")
        except Exception as e:
            raise ValueError(f"Token de Google inválido: {str(e)}")

        # Find by google_id first
        customer = self._repo.find_by_google_id(google_id)
        if customer:
            return customer

        # Find by email (maybe registered with email first)
        customer = self._repo.find_by_email(email)
        if customer:
            customer.google_id = google_id
            customer.auth_provider = "google"
            return self._repo.save(customer)

        # Create new
        customer = CustomerModel(
            id=str(uuid.uuid4()),
            email=email,
            full_name=full_name,
            google_id=google_id,
            auth_provider="google",
            has_discount=True,
            is_verified=True,
        )
        return self._repo.save(customer)

    def create_token(self, customer: CustomerModel) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=CUSTOMER_TOKEN_EXPIRE_MINUTES)
        to_encode = {
            "sub": customer.id,
            "email": customer.email,
            "full_name": customer.full_name,
            "type": "customer",
            "exp": expire,
        }
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def verify_token(self, token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "customer":
                return None
            return payload
        except JWTError:
            return None

    def get_customer_from_token(self, token: str) -> Optional[CustomerModel]:
        payload = self.verify_token(token)
        if not payload:
            return None
        return self._repo.find_by_id(payload["sub"])
