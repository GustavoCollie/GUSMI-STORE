import logging
import asyncio
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from src.infrastructure.database.config import SessionLocal
from src.infrastructure.database.models import MovementModel, ProductModel
from src.infrastructure.security.email_service import SMTPEmailService

logger = logging.getLogger(__name__)

class SchedulerService:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.email_service = SMTPEmailService()

    def start(self):
        """Inicia el planificador de tareas."""
        if not self.scheduler.running:
            # Ejecutar cada día a las 8:00 AM (ajustable)
            # Para pruebas, podemos ponerlo cada 1 hora o usar 'interval'
            self.scheduler.add_job(
                self.check_return_deadlines, 
                'cron', 
                hour=8, 
                minute=0,
                id='return_reminder_job',
                replace_existing=True
            )
            self.scheduler.start()
            logger.info("Scheduler started. Return deadline check job scheduled daily at 8:00 AM.")

    def shutdown(self):
        """Apaga el planificador."""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler shutdown.")

    def check_return_deadlines(self):
        """Busca movimientos que vencen mañana y envía recordatorios."""
        logger.info("Checking return deadlines...")
        session = SessionLocal()
        try:
            # Buscar movimientos que vencen en las próximas 24 horas
            tomorrow = (datetime.now() + timedelta(days=1)).date()
            
            # Nota: return_deadline es DATETIME en SQLite, comparamos por fecha
            movements = session.query(MovementModel).filter(
                MovementModel.is_returnable == True,
                MovementModel.recipient_email != None
            ).all()

            for mov in movements:
                if mov.return_deadline:
                    # Si el vencimiento es mañana
                    if mov.return_deadline.date() == tomorrow:
                        logger.info(f"Found pending return for {mov.recipient_email}. Sending reminder.")
                        
                        # Obtener nombre del producto
                        product = session.query(ProductModel).filter(ProductModel.id == mov.product_id).first()
                        product_name = product.name if product else "Producto Desconocido"

                        movement_data = {
                            "product_name": product_name,
                            "quantity": mov.quantity,
                            "applicant": mov.applicant,
                            "reference": mov.reference,
                            "return_deadline": mov.return_deadline.strftime('%d-%m-%Y')
                        }

                        # Ejecutar envío asíncrono en el bucle de eventos
                        asyncio.run(self.email_service.send_return_reminder(mov.recipient_email, movement_data))

        except Exception as e:
            logger.error(f"Error in scheduler job: {e}")
        finally:
            session.close()

# Singleton instance
scheduler_service = SchedulerService()
