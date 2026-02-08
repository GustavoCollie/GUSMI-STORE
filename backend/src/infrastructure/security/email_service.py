"""
Real Email Service Adapter using SMTP.
"""
import smtplib
import os
import logging
from email import encoders
from email.mime.base import MIMEBase
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.ports.security import EmailService

logger = logging.getLogger(__name__)

class SMTPEmailService(EmailService):
    def __init__(self):
        self.host = os.getenv("SMTP_HOST", "localhost")
        self.port = int(os.getenv("SMTP_PORT", 1025))
        self.user = os.getenv("SMTP_USER", "")
        self.password = os.getenv("SMTP_PASSWORD", "")
        self.sender = os.getenv("SMTP_SENDER", self.user)
        logger.info(f"SMTPEmailService initialized: host={self.host}, port={self.port}, user={self.user}, sender={self.sender}")

    async def send_verification_email(self, email: str, token: str):
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        subject = "Verifica tu cuenta de Inventario"
        body_html = f"""
        <html>
            <body>
                <h2>Bienvenido a Almacenes GUSMI</h2>
                <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
                <a href="{frontend_url}/verify?token={token}" 
                   style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                   Verificar Cuenta
                </a>
                <p>O copia este código: <b>{token}</b></p>
            </body>
        </html>
        """
        await self._send_email(email, subject, body_html, is_html=True)

    async def send_receipt_email(self, email: str, movement_data: dict, pdf_content: bytes):
        subject = f"Recibo de Salida - {movement_data.get('reference')}"
        body_html = f"""
        <html>
            <body>
                <h2>Comprobante de Salida de Almacén</h2>
                <p>Hola {movement_data.get('applicant')},</p>
                <p>Se ha registrado una salida de <b>{movement_data.get('quantity')}</b> unidades de <b>{movement_data.get('product_name')}</b>.</p>
                <p>Adjunto encontrarás el acta de despacho.</p>
            </body>
        </html>
        """
        await self._send_email(email, subject, body_html, is_html=True, attachment=pdf_content, attachment_name=f"acta_{movement_data.get('reference')}.pdf")

    async def send_return_reminder(self, email: str, movement_data: dict):
        subject = f"Recordatorio: Devolución Pendiente - {movement_data.get('product_name')}"
        body_html = f"""
        <html>
            <body>
                <h2>Recordatorio de Devolución de Inventario</h2>
                <p>Hola {movement_data.get('applicant')},</p>
                <p>Te escribimos para recordarte que la fecha límite para devolver <b>{movement_data.get('quantity')}</b> unidades de <b>{movement_data.get('product_name')}</b> 
                   es el <b>{movement_data.get('return_deadline')}</b>.</p>
                <p>Por favor, acércate al almacén para registrar la devolución.</p>
                <p>Referencia del despacho: {movement_data.get('reference')}</p>
            </body>
        </html>
        """
        await self._send_email(email, subject, body_html, is_html=True)

    async def _send_email(self, to_email: str, subject: str, body: str, is_html=False, attachment=None, attachment_name=None):
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = self.sender
        msg['To'] = to_email

        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))

        if attachment:
            logger.info(f"Adding attachment: {attachment_name} ({len(attachment)} bytes)")
            part = MIMEBase('application', 'pdf')
            part.set_payload(attachment)
            encoders.encode_base64(part)
            part.add_header('Content-Disposition', f'attachment; filename="{attachment_name}"')
            msg.attach(part)

        try:
            logger.info(f"Connecting to SMTP {self.host}:{self.port}...")
            server = smtplib.SMTP(self.host, self.port, timeout=10)
            
            # EHLO is called automatically, but let's be explicit if needed
            if self.port in [587, 2525]:
                logger.info("Starting TLS...")
                server.starttls()
            
            if self.user and self.password:
                logger.info(f"Logging in as {self.user}...")
                server.login(self.user, self.password)
            
            logger.info("Sending message...")
            server.send_message(msg)
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
        except Exception as e:
            logger.error(f"SMTP Error during send to {to_email}: {type(e).__name__}: {e}")
            raise

