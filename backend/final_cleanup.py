
import sqlite3
import os

def cleanup():
    db_path = 'inventory.db'
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    try:
        # Tables to wipe
        tables = [
            'movements', 'purchase_orders', 'sales_orders', 
            'supplier_product', 'suppliers', 'products', 'customers'
        ]
        
        cur.execute("PRAGMA foreign_keys = OFF")
        for table in tables:
            try:
                cur.execute(f"DELETE FROM {table}")
                print(f"Cleared {table}")
            except sqlite3.OperationalError:
                print(f"Table {table} does not exist, skipping.")
        
        cur.execute("DELETE FROM sqlite_sequence")
        conn.commit()
        print("Cleanup successful.")
        
        # Verify
        for table in tables:
            try:
                count = cur.execute(f"SELECT count(*) FROM {table}").fetchone()[0]
                print(f"Table {table} now has {count} rows.")
            except:
                pass
                
    except Exception as e:
        print(f"Cleanup failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    cleanup()
