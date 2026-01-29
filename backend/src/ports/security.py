"""
Security Ports (Interfaces).
"""
from typing import Protocol, Optional
from src.domain.entities import User

class PasswordHasher(Protocol):
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        ...
    
    def hash(self, password: str) -> str:
        ...

class TokenProvider(Protocol):
    def create_access_token(self, data: dict) -> str:
        ...
    
    def decode_token(self, token: str) -> Optional[dict]:
        ...

class EmailService(Protocol):
    async def send_verification_email(self, email: str, token: str):
        ...
    
    async def send_password_reset_email(self, email: str, token: str):
        ...

    async def send_receipt_email(self, email: str, movement_data: dict, pdf_content: bytes):
        ...
