
from sqlalchemy import create_engine, text
DATABASE_URL = "postgresql://postgres:Dj3sMDnIv7qdQpp7@db.zinshpnfzneiduwvwesx.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT name, image_path FROM products"))
    rows = res.fetchall()
    print(f"Total: {len(rows)}")
    with_images = [r for r in rows if r[1] is not None]
    print(f"With Images: {len(with_images)}")
    for r in with_images:
        print(f"  {r[0]}: {r[1]}")
