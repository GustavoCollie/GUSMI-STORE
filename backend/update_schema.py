
import sqlite3
import os

DB_PATH = 'inventory.db'

def update_schema():
    if not os.path.exists(DB_PATH):
        print(f"Database {DB_PATH} not found.")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Update Products table
    print("Checking 'products' table...")
    cursor.execute("PRAGMA table_info(products)")
    columns = {col[1] for col in cursor.fetchall()}
    
    if 'retail_price' not in columns:
        print("Adding 'retail_price' to products...")
        cursor.execute("ALTER TABLE products ADD COLUMN retail_price NUMERIC(10, 2)")
    
    if 'image_path' not in columns:
        print("Adding 'image_path' to products...")
        cursor.execute("ALTER TABLE products ADD COLUMN image_path TEXT")

    if 'tech_sheet_path' not in columns:
        print("Adding 'tech_sheet_path' to products...")
        cursor.execute("ALTER TABLE products ADD COLUMN tech_sheet_path TEXT")

    # 2. Update Suppliers table
    print("Checking 'suppliers' table...")
    cursor.execute("PRAGMA table_info(suppliers)")
    columns = {col[1] for col in cursor.fetchall()}

    if 'ruc' not in columns:
        print("Adding 'ruc' to suppliers...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN ruc VARCHAR(11)")
        # Note: Adding UNIQUE constraint to existing column in SQLite is complex, usually requires recreation.
        # For now, we just add the column. 

    if 'contact_name' not in columns:
        print("Adding 'contact_name' to suppliers...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN contact_name VARCHAR(200)")
        
    if 'contact_position' not in columns:
        print("Adding 'contact_position' to suppliers...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN contact_position VARCHAR(100)")

    if 'is_active' not in columns:
        print("Adding 'is_active' to suppliers...")
        cursor.execute("ALTER TABLE suppliers ADD COLUMN is_active BOOLEAN DEFAULT 1")

    conn.commit()
    conn.close()
    print("Schema update completed.")

if __name__ == "__main__":
    update_schema()
