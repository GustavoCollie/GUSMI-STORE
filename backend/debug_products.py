from sqlalchemy import create_engine
from src.infrastructure.database.models import ProductModel, PurchaseOrderModel
from src.infrastructure.database.config import SQLALCHEMY_DATABASE_URL

engine = create_engine(SQLALCHEMY_DATABASE_URL)
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

products = db.query(ProductModel).all()
print(f"{'Name':<20} | {'Stock':<6} | {'Price':<10} | {'Preorder':<8} | {'Date':<18} | {'Pending PO':<10}")
print("-" * 85)

for p in products:
    has_pending_po = any(po.status == "PENDING" for po in p.purchase_orders)
    date_str = str(p.estimated_delivery_date) if p.estimated_delivery_date else "None"
    print(f"{p.name:<20} | {p.stock:<6} | {str(p.retail_price):<10} | {str(p.is_preorder):<8} | {date_str:<18} | {str(has_pending_po):<10}")

db.close()
