import sqlite3
import os

db_path = "inventory.db"
if os.path.exists(db_path):
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check existing columns in users
        cursor.execute("PRAGMA table_info(users)")
        columns_users = [col[1] for col in cursor.fetchall()]
        
        if "verification_token" not in columns_users:
            cursor.execute("ALTER TABLE users ADD COLUMN verification_token VARCHAR(500)")
            print("Columna verification_token añadida.")
        
        if "is_verified" not in columns_users:
            cursor.execute("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0")
            print("Columna is_verified añadida.")

        # Check existing columns in movements
        cursor.execute("PRAGMA table_info(movements)")
        columns_movements = [col[1] for col in cursor.fetchall()]

        if "is_returnable" not in columns_movements:
            cursor.execute("ALTER TABLE movements ADD COLUMN is_returnable BOOLEAN DEFAULT 0")
            print("Columna is_returnable añadida a movements.")

        if "return_deadline" not in columns_movements:
            cursor.execute("ALTER TABLE movements ADD COLUMN return_deadline DATETIME")
            print("Columna return_deadline añadida a movements.")

        if "recipient_email" not in columns_movements:
            cursor.execute("ALTER TABLE movements ADD COLUMN recipient_email VARCHAR(255)")
            print("Columna recipient_email añadida a movements.")
            
        if "product_name" not in columns_movements:
            cursor.execute("ALTER TABLE movements ADD COLUMN product_name VARCHAR(200)")
            print("Columna product_name añadida a movements.")
            
        # Check existing columns in suppliers
        cursor.execute("PRAGMA table_info(suppliers)")
        columns_suppliers = [col[1] for col in cursor.fetchall()]
        
        if "ruc" not in columns_suppliers:
            cursor.execute("ALTER TABLE suppliers ADD COLUMN ruc VARCHAR(11)")
            print("Columna ruc añadida a suppliers.")

        if "is_active" not in columns_suppliers:
            cursor.execute("ALTER TABLE suppliers ADD COLUMN is_active BOOLEAN DEFAULT 1")
            print("Columna is_active añadida a suppliers.")
            
        # Check existing columns in products
        cursor.execute("PRAGMA table_info(products)")
        columns_product = [col[1] for col in cursor.fetchall()]

        if "image_path" not in columns_product:
            cursor.execute("ALTER TABLE products ADD COLUMN image_path VARCHAR(500)")
            print("Columna image_path añadida a productos.")

        if "tech_sheet_path" not in columns_product:
            cursor.execute("ALTER TABLE products ADD COLUMN tech_sheet_path VARCHAR(500)")
            print("Columna tech_sheet_path añadida a productos.")

        # Check existing columns in purchase_orders
        cursor.execute("PRAGMA table_info(purchase_orders)")
        columns_purchase = [col[1] for col in cursor.fetchall()]
        
        purchase_cols = [
            ("invoice_number", "VARCHAR(50)"),
            ("referral_guide_number", "VARCHAR(50)"),
            ("invoice_path", "VARCHAR(500)"),
            ("referral_guide_path", "VARCHAR(500)"),
            ("tax_amount", "NUMERIC(10,2) DEFAULT 0"),
            ("currency", "VARCHAR(3) DEFAULT 'USD'"),
            ("savings_amount", "NUMERIC(10,2) DEFAULT 0"),
            ("expected_delivery_date", "DATETIME"),
            ("actual_delivery_date", "DATETIME"),
            ("freight_amount", "NUMERIC(10,2) DEFAULT 0"),
            ("other_expenses_amount", "NUMERIC(10,2) DEFAULT 0"),
            ("other_expenses_description", "VARCHAR(255)")
        ]
        
        for col_name, col_type in purchase_cols:
            if col_name not in columns_purchase:
                cursor.execute(f"ALTER TABLE purchase_orders ADD COLUMN {col_name} {col_type}")
                print(f"Columna {col_name} añadida a purchase_orders.")
                
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
else:
    print("Base de datos no encontrada.")
