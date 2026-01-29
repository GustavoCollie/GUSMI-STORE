"""
JWT Token Provider Adapter.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
import os
from src.ports.security import TokenProvider

# Configuration (should be in env)
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-super-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class JWTTokenProvider(TokenProvider):
    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    def decode_token(self, token: str) -> Optional[dict]:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
