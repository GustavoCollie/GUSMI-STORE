"""
Auth Service.
"""
from typing import Optional
from uuid import uuid4

from src.domain.entities import User
from src.domain.schemas import UserCreate, Token, UserLogin
from src.ports.repository import UserRepository
from src.ports.security import PasswordHasher, TokenProvider, EmailService

class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        password_hasher: PasswordHasher,
        token_provider: TokenProvider,
        email_service: EmailService
    ):
        self._user_repository = user_repository
        self._password_hasher = password_hasher
        self._token_provider = token_provider
        self._email_service = email_service

    async def register_user(self, user_create: UserCreate) -> User:
        """Registro de usuario."""
        existing = self._user_repository.find_by_email(user_create.email)
        if existing:
            raise ValueError("Email already registered")
        
        hashed_pw = self._password_hasher.hash(user_create.password)
        
        # Generate token first to store it
        token = self._token_provider.create_access_token(
            {"email": user_create.email, "type": "verification"}
        )

        user = User(
            email=user_create.email,
            hashed_password=hashed_pw,
            is_active=True,
            is_verified=False,
            verification_token=token
        )
        
        saved_user = self._user_repository.save(user)
        
        # Send verification email
        await self._email_service.send_verification_email(user.email, token)
        
        return saved_user

    async def authenticate_user(self, user_login: UserLogin) -> Token:
        """Autenticación de usuario."""
        user = self._user_repository.find_by_email(user_login.email)
        if not user:
            raise ValueError("Invalid credentials")
            
        if not self._password_hasher.verify(user_login.password, user.hashed_password):
            raise ValueError("Invalid credentials")
        
        if not user.is_verified:
            raise ValueError("Account not verified. Please check your email.")
            
        access_token = self._token_provider.create_access_token(
            {"sub": str(user.id), "email": user.email}
        )
        
        return Token(access_token=access_token, token_type="bearer")

    async def request_password_reset(self, email: str):
        """Solicitud de recuperación de contraseña."""
        user = self._user_repository.find_by_email(email)
        if not user:
            # Don't reveal valid emails
            return

        token = self._token_provider.create_access_token(
            {"email": user.email, "type": "reset"}
        )
        await self._email_service.send_password_reset_email(user.email, token)

    async def reset_password(self, token: str, new_password: str):
        """Restablecimiento de contraseña."""
        payload = self._token_provider.decode_token(token)
        if not payload or payload.get("type") != "reset":
            raise ValueError("Invalid token")
            
        email = payload.get("email")
        user = self._user_repository.find_by_email(email)
        if not user:
            raise ValueError("User not found")
            
        user.hashed_password = self._password_hasher.hash(new_password)
        self._user_repository.save(user)

    async def verify_email(self, token: str):
        """Verificación de email."""
        payload = self._token_provider.decode_token(token)
        if not payload or payload.get("type") != "verification":
            raise ValueError("Invalid token")
            
        email = payload.get("email")
        user = self._user_repository.find_by_email(email)
        if not user:
            raise ValueError("User not found")
        
        # If already verified, just return success
        if user.is_verified:
            return
        
        if user.verification_token != token:
            raise ValueError("El enlace de verificación es inválido o ha expirado.")
            
        user.is_verified = True
        user.verification_token = None # Clear token after use
        self._user_repository.save(user)
