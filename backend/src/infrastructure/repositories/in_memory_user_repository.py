"""
In-Memory User Repository.
"""
from typing import Optional
from uuid import UUID

from src.domain.entities import User
from src.ports.repository import UserRepository


class InMemoryUserRepository(UserRepository):
    """
    In-memory implementation of UserRepository for development/testing.
    """
    
    def __init__(self):
        self._users: dict[UUID, User] = {}
        self._email_index: dict[str, UUID] = {}
    
    def save(self, user: User) -> User:
        """Save or update a user."""
        self._users[user.id] = user
        self._email_index[user.email] = user.id
        return user
    
    def find_by_email(self, email: str) -> Optional[User]:
        """Find user by email."""
        user_id = self._email_index.get(email)
        if user_id:
            return self._users.get(user_id)
        return None
    
    def find_by_id(self, user_id: UUID) -> Optional[User]:
        """Find user by ID."""
        return self._users.get(user_id)
