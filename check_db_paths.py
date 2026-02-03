import sqlite3
def check_cols(path):
    print(f"Checking {path}")
    conn = sqlite3.connect(path)
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(products)")
    cols = [c[1] for c in cursor.fetchall()]
    print(f"is_preorder in cols: {'is_preorder' in cols}")
    if 'is_preorder' in cols:
        cursor.execute("SELECT name, is_preorder FROM products LIMIT 5")
        print(f"Data: {cursor.fetchall()}")
    conn.close()

check_cols("backend/inventory.db")
check_cols("inventory.db")
