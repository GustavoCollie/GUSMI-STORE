
from sqlalchemy import create_engine, text
# Project: zinshpnfzneiduwvwesx (NEW and CORRECT)
DATABASE_URL = "postgresql://postgres:Dj3sMDnIv7qdQpp7@db.zinshpnfzneiduwvwesx.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT name, image_path, stock, retail_price FROM products"))
    rows = res.fetchall()
    print(f"Total products in DB: {len(rows)}")
    for row in rows:
        print(f"Product: {row[0]} | Stock: {row[2]} | Price: {row[3]} | Path: {row[1]}")
