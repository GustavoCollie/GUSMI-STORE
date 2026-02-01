from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from src.infrastructure.database.models import SalesOrderModel, PurchaseOrderModel, ProductModel
from decimal import Decimal
from datetime import datetime, timedelta
import calendar

MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
MONTH_NAMES_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

class PostgresAnalyticsRepository:
    def __init__(self, session: Session):
        self.session = session

    def get_analytics_data(self, start_date: datetime, end_date: datetime, product_id: Optional[str] = None) -> Dict[str, Any]:
        """Aggregates purchase costs and sales revenue with monthly breakdown and top products."""

        # --- Monthly Data (last 12 months from end_date) ---
        monthly_data = []
        for i in range(11, -1, -1):
            # Calculate month start/end
            ref_date = end_date - timedelta(days=i * 30)
            month_start = ref_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            last_day = calendar.monthrange(month_start.year, month_start.month)[1]
            month_end = month_start.replace(day=last_day, hour=23, minute=59, second=59)

            # Purchase cost for this month
            purchase_q = self.session.query(
                func.coalesce(func.sum(PurchaseOrderModel.total_amount), 0)
            ).filter(
                PurchaseOrderModel.status != 'REJECTED',
                PurchaseOrderModel.created_at >= month_start,
                PurchaseOrderModel.created_at <= month_end,
            )
            if product_id:
                purchase_q = purchase_q.filter(PurchaseOrderModel.product_id == product_id)
            purchase_cost = Decimal(str(purchase_q.scalar() or 0))

            # Sales revenue for this month
            sales_q = self.session.query(
                func.coalesce(func.sum(SalesOrderModel.total_amount), 0)
            ).filter(
                SalesOrderModel.status != 'CANCELLED',
                SalesOrderModel.created_at >= month_start,
                SalesOrderModel.created_at <= month_end,
            )
            if product_id:
                sales_q = sales_q.filter(SalesOrderModel.product_id == product_id)
            sales_revenue = Decimal(str(sales_q.scalar() or 0))

            month_label = f"{MONTH_NAMES[month_start.month - 1]} {month_start.year}"

            # Avoid duplicate months (the timedelta approximation can repeat)
            if monthly_data and monthly_data[-1]['month'] == month_label:
                monthly_data[-1]['purchase_cost'] += purchase_cost
                monthly_data[-1]['sales_revenue'] += sales_revenue
            else:
                monthly_data.append({
                    "month": month_label,
                    "purchase_cost": purchase_cost,
                    "sales_revenue": sales_revenue,
                })

        # --- Top Products (by total sales, top 5) ---
        # Get all products with sales or purchases in the date range
        product_stats: Dict[str, Dict] = {}

        # Purchases aggregated by product
        purchase_rows = self.session.query(
            PurchaseOrderModel.product_id,
            func.sum(PurchaseOrderModel.total_amount).label('total_cost')
        ).filter(
            PurchaseOrderModel.status != 'REJECTED',
            PurchaseOrderModel.created_at >= start_date,
            PurchaseOrderModel.created_at <= end_date,
        )
        if product_id:
            purchase_rows = purchase_rows.filter(PurchaseOrderModel.product_id == product_id)
        purchase_rows = purchase_rows.group_by(PurchaseOrderModel.product_id).all()

        for row in purchase_rows:
            pid = str(row.product_id)
            product_stats.setdefault(pid, {'total_cost': Decimal(0), 'total_sales': Decimal(0)})
            product_stats[pid]['total_cost'] = Decimal(str(row.total_cost or 0))

        # Sales aggregated by product
        sales_rows = self.session.query(
            SalesOrderModel.product_id,
            func.sum(SalesOrderModel.total_amount).label('total_sales')
        ).filter(
            SalesOrderModel.status != 'CANCELLED',
            SalesOrderModel.created_at >= start_date,
            SalesOrderModel.created_at <= end_date,
        )
        if product_id:
            sales_rows = sales_rows.filter(SalesOrderModel.product_id == product_id)
        sales_rows = sales_rows.group_by(SalesOrderModel.product_id).all()

        for row in sales_rows:
            pid = str(row.product_id)
            product_stats.setdefault(pid, {'total_cost': Decimal(0), 'total_sales': Decimal(0)})
            product_stats[pid]['total_sales'] = Decimal(str(row.total_sales or 0))

        # Resolve product names
        product_ids = list(product_stats.keys())
        products_map = {}
        if product_ids:
            products = self.session.query(ProductModel).filter(ProductModel.id.in_(product_ids)).all()
            products_map = {str(p.id): p.name for p in products}

        top_products = []
        for pid, stats in product_stats.items():
            total_sales = stats['total_sales']
            total_cost = stats['total_cost']
            margin = ((total_sales - total_cost) / total_sales * 100) if total_sales > 0 else Decimal(0)
            top_products.append({
                "product_name": products_map.get(pid, "Desconocido"),
                "product_id": pid,
                "total_cost": total_cost,
                "total_sales": total_sales,
                "margin": margin.quantize(Decimal('0.01')) if isinstance(margin, Decimal) else Decimal(str(round(margin, 2))),
            })

        top_products.sort(key=lambda x: x['total_sales'], reverse=True)

        # --- Unit Costs per product ---
        unit_cost_data: Dict[str, Dict] = {}

        # Avg purchase unit cost per product (total_amount / quantity)
        purchase_unit_rows = self.session.query(
            PurchaseOrderModel.product_id,
            func.sum(PurchaseOrderModel.total_amount).label('total_cost'),
            func.sum(PurchaseOrderModel.quantity).label('total_qty'),
        ).filter(
            PurchaseOrderModel.status != 'REJECTED',
            PurchaseOrderModel.created_at >= start_date,
            PurchaseOrderModel.created_at <= end_date,
        )
        if product_id:
            purchase_unit_rows = purchase_unit_rows.filter(PurchaseOrderModel.product_id == product_id)
        purchase_unit_rows = purchase_unit_rows.group_by(PurchaseOrderModel.product_id).all()

        for row in purchase_unit_rows:
            pid = str(row.product_id)
            total_cost_val = Decimal(str(row.total_cost or 0))
            total_qty = int(row.total_qty or 0)
            unit_cost_data.setdefault(pid, {'avg_purchase_cost': Decimal(0), 'avg_sale_price': Decimal(0)})
            unit_cost_data[pid]['avg_purchase_cost'] = (total_cost_val / Decimal(total_qty)).quantize(Decimal('0.01')) if total_qty > 0 else Decimal(0)

        # Avg sale unit price per product (total_amount / quantity)
        sales_unit_rows = self.session.query(
            SalesOrderModel.product_id,
            func.sum(SalesOrderModel.total_amount).label('total_sales'),
            func.sum(SalesOrderModel.quantity).label('total_qty'),
        ).filter(
            SalesOrderModel.status != 'CANCELLED',
            SalesOrderModel.created_at >= start_date,
            SalesOrderModel.created_at <= end_date,
        )
        if product_id:
            sales_unit_rows = sales_unit_rows.filter(SalesOrderModel.product_id == product_id)
        sales_unit_rows = sales_unit_rows.group_by(SalesOrderModel.product_id).all()

        for row in sales_unit_rows:
            pid = str(row.product_id)
            total_sales_val = Decimal(str(row.total_sales or 0))
            total_qty = int(row.total_qty or 0)
            unit_cost_data.setdefault(pid, {'avg_purchase_cost': Decimal(0), 'avg_sale_price': Decimal(0)})
            unit_cost_data[pid]['avg_sale_price'] = (total_sales_val / Decimal(total_qty)).quantize(Decimal('0.01')) if total_qty > 0 else Decimal(0)

        # Build unit_costs list (only products with activity on both sides, or at least one)
        all_unit_pids = list(unit_cost_data.keys())
        if all_unit_pids:
            extra_products = self.session.query(ProductModel).filter(ProductModel.id.in_(all_unit_pids)).all()
            for p in extra_products:
                if str(p.id) not in products_map:
                    products_map[str(p.id)] = p.name

        unit_costs = []
        for pid, costs in unit_cost_data.items():
            avg_purchase = costs['avg_purchase_cost']
            avg_sale = costs['avg_sale_price']
            unit_costs.append({
                "product_name": products_map.get(pid, "Desconocido"),
                "product_id": pid,
                "avg_purchase_cost": avg_purchase,
                "avg_sale_price": avg_sale,
                "unit_profit": (avg_sale - avg_purchase).quantize(Decimal('0.01')),
            })

        unit_costs.sort(key=lambda x: x['unit_profit'], reverse=True)

        # --- Total Stock ---
        stock_q = self.session.query(func.coalesce(func.sum(ProductModel.stock), 0))
        if product_id:
            stock_q = stock_q.filter(ProductModel.id == product_id)
        total_stock = int(stock_q.scalar() or 0)

        # --- Summary totals ---
        total_revenue = sum(s['total_sales'] for s in product_stats.values())
        total_cost = sum(s['total_cost'] for s in product_stats.values())
        gross_profit = total_revenue - total_cost
        margin_pct = (gross_profit / total_revenue * 100) if total_revenue > 0 else Decimal(0)

        return {
            "total_revenue": total_revenue,
            "total_cost": total_cost,
            "gross_profit": gross_profit,
            "margin_percentage": margin_pct,
            "total_stock": total_stock,
            "monthly_data": monthly_data,
            "top_products": top_products[:5],
            "unit_costs": unit_costs,
        }

    def get_price_variation(self, year: int, month: int, product_id: Optional[str] = None) -> Dict[str, Any]:
        """Returns daily average unit purchase price and sale price within a given month."""
        last_day = calendar.monthrange(year, month)[1]
        month_label = f"{MONTH_NAMES_FULL[month - 1]} {year}"

        # Resolve product name if filtered
        product_name = None
        if product_id:
            product = self.session.query(ProductModel).filter(ProductModel.id == product_id).first()
            product_name = product.name if product else None

        data = []
        for day in range(1, last_day + 1):
            day_start = datetime(year, month, day, 0, 0, 0)
            day_end = datetime(year, month, day, 23, 59, 59)

            # Avg purchase unit price for this day
            pq = self.session.query(
                func.sum(PurchaseOrderModel.total_amount).label('total'),
                func.sum(PurchaseOrderModel.quantity).label('qty'),
            ).filter(
                PurchaseOrderModel.status != 'REJECTED',
                PurchaseOrderModel.created_at >= day_start,
                PurchaseOrderModel.created_at <= day_end,
            )
            if product_id:
                pq = pq.filter(PurchaseOrderModel.product_id == product_id)
            p_row = pq.one()
            p_total = Decimal(str(p_row.total or 0))
            p_qty = int(p_row.qty or 0)
            avg_purchase = (p_total / Decimal(p_qty)).quantize(Decimal('0.01')) if p_qty > 0 else None

            # Avg sale unit price for this day
            sq = self.session.query(
                func.sum(SalesOrderModel.total_amount).label('total'),
                func.sum(SalesOrderModel.quantity).label('qty'),
            ).filter(
                SalesOrderModel.status != 'CANCELLED',
                SalesOrderModel.created_at >= day_start,
                SalesOrderModel.created_at <= day_end,
            )
            if product_id:
                sq = sq.filter(SalesOrderModel.product_id == product_id)
            s_row = sq.one()
            s_total = Decimal(str(s_row.total or 0))
            s_qty = int(s_row.qty or 0)
            avg_sale = (s_total / Decimal(s_qty)).quantize(Decimal('0.01')) if s_qty > 0 else None

            # Only include days that have at least one data point
            if avg_purchase is not None or avg_sale is not None:
                data.append({
                    "day": f"{day:02d}",
                    "avg_purchase_price": avg_purchase or Decimal(0),
                    "avg_sale_price": avg_sale or Decimal(0),
                })

        return {
            "month_label": month_label,
            "product_name": product_name,
            "data": data,
        }
