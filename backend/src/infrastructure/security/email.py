"""
Mock Email Service Adapter.
"""
import logging
from src.ports.security import EmailService

logger = logging.getLogger(__name__)

class MockEmailService(EmailService):
    async def send_verification_email(self, email: str, token: str):
        logger.info(f"--- MOCK EMAIL --- To: {email} | Subject: Verify Account | Body: Token {token}")
        print(f"--- MOCK EMAIL --- To: {email} | Subject: Verify Account | Body: Token {token}")

    async def send_password_reset_email(self, email: str, token: str):
        logger.info(f"--- MOCK EMAIL --- To: {email} | Subject: Reset Password | Body: Token {token}")
        print(f"--- MOCK EMAIL --- To: {email} | Subject: Reset Password | Body: Token {token}")

    async def send_receipt_email(self, email: str, movement_data: dict, pdf_content: bytes):
        logger.info(f"--- MOCK EMAIL --- To: {email} | Subject: Receipt and PDF | Body: {len(pdf_content)} bytes")
        print(f"--- MOCK EMAIL --- To: {email} | Subject: Receipt and PDF | Body: {len(pdf_content)} bytes")
