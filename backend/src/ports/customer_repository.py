from abc import ABC, abstractmethod
from typing import Optional


class CustomerRepository(ABC):
    @abstractmethod
    def save(self, customer) -> None:
        pass

    @abstractmethod
    def find_by_email(self, email: str) -> Optional[object]:
        pass

    @abstractmethod
    def find_by_id(self, customer_id: str) -> Optional[object]:
        pass

    @abstractmethod
    def find_by_google_id(self, google_id: str) -> Optional[object]:
        pass
