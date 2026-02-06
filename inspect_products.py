
from sqlalchemy import create_engine, text
DATABASE_URL = "postgresql://postgres:Dj3sMDnIv7qdQpp7@db.zinshpnfzneiduwvwesx.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT name, image_path, stock, is_preorder FROM products"))
    rows = res.fetchall()
    print("--- Product Data ---")
    for row in rows:
        print(f"Name: {row[0]}")
        print(f"  Stock: {row[2]}")
        print(f"  Is Preorder: {row[3]}")
        print(f"  Image Path: {row[1]}")
        print("-" * 20)
