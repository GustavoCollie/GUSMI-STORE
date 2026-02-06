
from sqlalchemy import create_engine, text

# Project: wbjikwsuakjrcokgklxl
DATABASE_URL = "postgresql://postgres:ZksWew7slD1h1Ais@db.wbjikwsuakjrcokgklxl.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)

SQL_COMMANDS = [
    # Table: products
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10, 2);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_sheet_path VARCHAR(500);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(100);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_price DECIMAL(10, 2);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_description VARCHAR(500);",
    "ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();",
    
    # Table: purchase_orders
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS savings_amount DECIMAL(10, 2) DEFAULT 0;",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS freight_amount DECIMAL(10, 2) DEFAULT 0;",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS other_expenses_amount DECIMAL(10, 2) DEFAULT 0;",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS other_expenses_description VARCHAR(500);",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(500);",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS is_rejected BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS invoice_path VARCHAR(500);",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS referral_guide_path VARCHAR(500);",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS actual_delivery_date TIMESTAMP WITH TIME ZONE;",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);",
    "ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS referral_guide_number VARCHAR(50);",

    # Table: movements
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS applicant VARCHAR(200);",
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS applicant_area VARCHAR(100);",
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS is_returnable BOOLEAN DEFAULT FALSE;",
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS return_deadline TIMESTAMP WITH TIME ZONE;",
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255);",
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS sales_order_id VARCHAR(36);",
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS parent_id VARCHAR(36);",
    "ALTER TABLE movements ADD COLUMN IF NOT EXISTS product_name VARCHAR(200);",
    
    # Table: sales_orders
    "ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS shipping_type VARCHAR(50) DEFAULT 'DELIVERY';",
    "ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;",
    "ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;",
    "ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;",
    "ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS product_name VARCHAR(200);",
    "ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS product_image VARCHAR(500);",
    
    # Table: suppliers
    "ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS ruc VARCHAR(11) UNIQUE;",
    "ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_name VARCHAR(200);",
    "ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_position VARCHAR(100);",
]

def migrate():
    print(f"Starting migration on: {DATABASE_URL.split('@')[-1]}")
    with engine.connect() as conn:
        for cmd in SQL_COMMANDS:
            try:
                print(f"Running: {cmd[:50]}...")
                conn.execute(text(cmd))
                conn.commit()
            except Exception as e:
                print(f"  ❌ Error: {str(e)[:100]}")
    print("\n✅ Migration complete.")

if __name__ == "__main__":
    migrate()
