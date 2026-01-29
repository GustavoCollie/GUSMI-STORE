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
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
else:
    print("Base de datos no encontrada.")
