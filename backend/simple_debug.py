import sqlite3
import os

db_path = "backend/inventory.db"
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("SELECT name, stock, retail_price, is_preorder, estimated_delivery_date FROM products")
rows = cursor.fetchall()

print(f"{'Name':<20} | {'Stock':<6} | {'Price':<10} | {'Preorder':<8} | {'Date':<18}")
print("-" * 75)

for row in rows:
    print(f"{str(row[0]):<20} | {str(row[1]):<6} | {str(row[2]):<10} | {str(row[3]):<8} | {str(row[4]):<18}")

conn.close()
