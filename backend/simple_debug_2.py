import sqlite3
import os

def check(path):
    print(f"\n--- Checking {os.path.abspath(path)} ---")
    if not os.path.exists(path):
        print("File does not exist")
        return
    try:
        conn = sqlite3.connect(path)
        cursor = conn.cursor()
        # Verify table existence
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='products'")
        if not cursor.fetchone():
            print("Table 'products' does not exist")
            return
            
        cursor.execute("SELECT name, is_preorder FROM products WHERE name = 'Monitor LED 27\"'")
        res = cursor.fetchone()
        print(f"Result for Monitor LED 27\": {res}")
        
        cursor.execute("SELECT name, is_preorder FROM products LIMIT 3")
        rows = cursor.fetchall()
        print(f"First 3 products: {rows}")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

# Check both possible locations
check("backend/inventory.db")
check("inventory.db")
