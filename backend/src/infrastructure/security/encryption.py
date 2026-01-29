"""
Password Hashing Adapter.
"""
from passlib.context import CryptContext
from src.ports.security import PasswordHasher

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

class BCryptPasswordHasher(PasswordHasher):
    """
    Adapter for Password Hashing. 
    Note: Renamed to PBKDF2 internally but kept class name for compatibility or will rename if needed.
    """
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def hash(self, password: str) -> str:
        return pwd_context.hash(password)

