from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from src.domain.sales_entities import SalesOrder

class SalesRepository(ABC):
    @abstractmethod
    def save(self, sales_order: SalesOrder) -> None:
        pass

    @abstractmethod
    def find_by_id(self, order_id: UUID) -> Optional[SalesOrder]:
        pass

    @abstractmethod
    def find_all(self) -> List[SalesOrder]:
        pass

    @abstractmethod
    def update_status(self, order_id: UUID, status: str) -> None:
        pass

    @abstractmethod
    def update(self, sales_order: SalesOrder) -> None:
        pass

    @abstractmethod
    def delete(self, order_id: UUID) -> None:
        pass
        
    @abstractmethod
    def get_kpis(self) -> dict:
        pass
