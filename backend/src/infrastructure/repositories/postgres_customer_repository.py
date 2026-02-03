from typing import Optional
from sqlalchemy.orm import Session

from src.ports.customer_repository import CustomerRepository
from src.infrastructure.database.models import CustomerModel


class PostgresCustomerRepository(CustomerRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, customer: CustomerModel) -> CustomerModel:
        existing = self.session.query(CustomerModel).filter_by(id=customer.id).first()
        if existing:
            existing.email = customer.email
            existing.full_name = customer.full_name
            existing.phone = customer.phone
            existing.hashed_password = customer.hashed_password
            existing.google_id = customer.google_id
            existing.auth_provider = customer.auth_provider
            existing.has_discount = customer.has_discount
            existing.is_verified = customer.is_verified
            self.session.commit()
            return existing
        self.session.add(customer)
        self.session.commit()
        return customer

    def find_by_email(self, email: str) -> Optional[CustomerModel]:
        return self.session.query(CustomerModel).filter_by(email=email).first()

    def find_by_id(self, customer_id: str) -> Optional[CustomerModel]:
        return self.session.query(CustomerModel).filter_by(id=customer_id).first()

    def find_by_google_id(self, google_id: str) -> Optional[CustomerModel]:
        return self.session.query(CustomerModel).filter_by(google_id=google_id).first()
