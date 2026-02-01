from decimal import Decimal
from typing import List, Optional
from datetime import date
from pydantic import BaseModel

class MonthlyDataPoint(BaseModel):
    month: str              # "Ene 2025", "Feb 2025"...
    purchase_cost: Decimal  # Total gastado en compras ese mes
    sales_revenue: Decimal  # Total facturado en ventas ese mes

class TopProductMetric(BaseModel):
    product_name: str
    product_id: str
    total_cost: Decimal     # Costo total de compras del producto
    total_sales: Decimal    # Total de ventas del producto
    margin: Decimal         # Margen = ((ventas - costo) / ventas) * 100

class UnitCostMetric(BaseModel):
    product_name: str
    product_id: str
    avg_purchase_cost: Decimal   # Costo unitario promedio de compra
    avg_sale_price: Decimal      # Precio unitario promedio de venta
    unit_profit: Decimal         # Ganancia por unidad = sale_price - purchase_cost

class DailyPricePoint(BaseModel):
    day: str                    # "01", "02"... o "01 Feb"
    avg_purchase_price: Decimal # Precio unitario promedio de compra ese día
    avg_sale_price: Decimal     # Precio unitario promedio de venta ese día

class PriceVariationResponse(BaseModel):
    month_label: str            # "Febrero 2026"
    product_name: Optional[str] = None
    data: List[DailyPricePoint]

class AnalyticsSummary(BaseModel):
    total_revenue: Decimal
    total_cost: Decimal
    gross_profit: Decimal
    margin_percentage: Decimal
    total_stock: int
    sales_growth: Optional[Decimal] = None
    monthly_data: List[MonthlyDataPoint]
    top_products: List[TopProductMetric]
    unit_costs: List[UnitCostMetric]
