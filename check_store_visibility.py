
from sqlalchemy import create_engine, text
from decimal import Decimal

# Project: wbjikwsuakjrcokgklxl
DATABASE_URL = "postgresql://postgres:ZksWew7slD1h1Ais@db.wbjikwsuakjrcokgklxl.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)

def check_visibility():
    print(f"Checking product visibility on: {DATABASE_URL.split('@')[-1]}")
    with engine.connect() as conn:
        res = conn.execute(text("SELECT id, name, stock, retail_price, is_preorder FROM products"))
        products = res.fetchall()
        
        print(f"\nTotal products found: {len(products)}")
        for p in products:
            pid, name, stock, price, preorder = p
            
            # Implementation check
            has_price = (price is not None and float(price) > 0)
            has_availability = (stock > 0 or preorder)
            
            is_visible = has_price and has_availability
            
            print(f"Product: {name}")
            print(f"  Stock: {stock}")
            print(f"  Retail Price: {price}")
            print(f"  Is Preorder: {preorder}")
            
            status = "✅ VISIBLE" if is_visible else "❌ HIDDEN"
            reason = ""
            if not has_price: reason += "[Missing Price] "
            if not has_availability: reason += "[No Stock/Not Preorder] "
            
            print(f"  Status: {status} {reason}")
            print("-" * 30)

if __name__ == "__main__":
    check_visibility()
