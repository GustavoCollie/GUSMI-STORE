
from sqlalchemy import create_engine, text
DATABASE_URL = "postgresql://postgres:ZksWew7slD1h1Ais@db.wbjikwsuakjrcokgklxl.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)

FIXES = [
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10, 2);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_sheet_path VARCHAR(500);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(100);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_price DECIMAL(10, 2);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_description VARCHAR(500);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();"
]

def apply_fixes():
    with engine.connect() as conn:
        for sql in FIXES:
            try:
                print(f"Executing: {sql}")
                conn.execute(text(sql))
                conn.commit()
                print("✅ Success")
            except Exception as e:
                print(f"❌ Error: {e}")

if __name__ == "__main__":
    apply_fixes()
