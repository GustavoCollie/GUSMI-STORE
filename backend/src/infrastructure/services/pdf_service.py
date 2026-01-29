from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
import io
import os
from datetime import datetime

class PDFService:
    def generate_movement_receipt(self, movement_data: dict) -> bytes:
        """
        Genera un buffer de bytes con el PDF del acta de movimiento.
        """
        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter

        # Título
        p.setFont("Helvetica-Bold", 18)
        p.drawCentredString(width / 2, height - (1 * inch), "ACTA DE RECEPCIÓN / DESPACHO")
        
        p.setFont("Helvetica", 10)
        p.drawCentredString(width / 2, height - (1.3 * inch), f"Fecha de Emisión: {datetime.now().strftime('%d-%m-%Y, %I:%M:%S %p')}")

        p.line(0.75 * inch, height - (1.5 * inch), width - (0.75 * inch), height - (1.5 * inch))

        # Tabla de Información
        y = height - (2.2 * inch)
        
        # Header de la tabla
        p.setFillColor(colors.dodgerblue)
        p.rect(0.75 * inch, y - 0.1 * inch, width - 1.5 * inch, 0.3 * inch, fill=1)
        p.setFillColor(colors.white)
        p.setFont("Helvetica-Bold", 11)
        p.drawString(0.85 * inch, y, "Campo")
        p.drawString(3.0 * inch, y, "Detalle")
        
        y -= 0.3 * inch
        p.setFillColor(colors.black)
        p.setFont("Helvetica", 10)
        
        details = [
            ("Tipo de Movimiento:", "SALIDA (DESPACHO)" if movement_data.get("type") == "EXIT" else "ENTRADA"),
            ("Referencia / Guía:", movement_data.get("reference", "N/A")),
            ("Cantidad:", f"{movement_data.get('quantity', 0)} unidades"),
            ("Solicitante:", movement_data.get("applicant", "N/A")),
            ("Área:", movement_data.get("applicant_area", "N/A")),
            ("Devolutivo:", "SÍ" if movement_data.get("is_returnable") else "NO"),
            ("Fecha Retorno:", movement_data.get("return_deadline", "N/A")),
            ("Email Receptor:", movement_data.get("recipient_email", "N/A"))
        ]

        for i, (label, value) in enumerate(details):
            # Fondo alterno
            if i % 2 == 0:
                p.setFillColor(colors.whitesmoke)
                p.rect(0.75 * inch, y - 0.1 * inch, width - 1.5 * inch, 0.25 * inch, fill=1)
            
            p.setFillColor(colors.black)
            p.drawString(0.85 * inch, y, label)
            p.drawString(3.0 * inch, y, str(value))
            y -= 0.25 * inch

        # Firmas
        y -= 1.5 * inch
        p.line(1 * inch, y, 3.5 * inch, y)
        p.drawCentredString(2.25 * inch, y - 0.2 * inch, "Firma Jefe de Almacén")

        p.line(width - 3.5 * inch, y, width - 1 * inch, y)
        p.drawCentredString(width - 2.25 * inch, y - 0.2 * inch, "Firma Receptor")

        p.showPage()
        p.save()

        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
