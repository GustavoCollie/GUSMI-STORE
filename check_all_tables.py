
import os
from sqlalchemy import create_engine, text

# Project: wbjikwsuakjrcokgklxl
DATABASE_URL = "postgresql://postgres:ZksWew7slD1h1Ais@db.wbjikwsuakjrcokgklxl.supabase.co:5432/postgres"

REQUIRED_TABLES = [
    "users",
    "products",
    "movements",
    "suppliers",
    "supplier_product",
    "purchase_orders",
    "customers",
    "sales_orders"
]

def check_all():
    print(f"Checking database: {DATABASE_URL.split('@')[-1]}")
    engine = create_engine(DATABASE_URL)
    
    try:
        with engine.connect() as conn:
            print("\n--- [1] Checking Existing Tables ---")
            res = conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            existing_tables = [row[0] for row in res.fetchall()]
            
            print(f"Found {len(existing_tables)} tables in public schema.")
            
            missing = []
            for t in REQUIRED_TABLES:
                if t in existing_tables:
                    print(f"✅ {t}")
                else:
                    print(f"❌ {t} (MISSING)")
                    missing.append(t)
            
            if missing:
                print(f"\n⚠️  Missing tables: {', '.join(missing)}")
            else:
                print("\n✨ All required tables exist.")
                
            print("\n--- [2] Checking Product Schema ---")
            if "products" in existing_tables:
                res = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'"))
                for col in res.fetchall():
                    print(f"Column: {col[0]} ({col[1]})")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_all()
