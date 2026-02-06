
from sqlalchemy import create_engine, text
DATABASE_URL = "postgresql://postgres:Dj3sMDnIv7qdQpp7@db.zinshpnfzneiduwvwesx.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    res = conn.execute(text("SELECT name, image_path FROM products WHERE name ILIKE '%Tablet%' OR name ILIKE '%Monitor%'"))
    for row in res.fetchall():
        name, path = row
        print(f"Product: {name}")
        if path:
            print(f"  Path Length: {len(path)}")
            print(f"  Path starts with /tmp: {path.startswith('/tmp')}")
            print(f"  Path ends with: {path[-10:]}")
        else:
            print("  Path is None")
