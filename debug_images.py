
from sqlalchemy import create_engine, text
DATABASE_URL = "postgresql://postgres:Dj3sMDnIv7qdQpp7@db.zinshpnfzneiduwvwesx.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT name, image_path FROM products"))
    for row in res.fetchall():
        name, path = row
        if path:
            print(f"{name}: START={path[:20]} | END={path[-20:]}")
        else:
            print(f"{name}: NO PATH")
