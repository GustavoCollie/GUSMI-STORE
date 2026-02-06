
import requests
API_URL = "https://almacenes-collie.vercel.app/api/v1/public/products"
r = requests.get(API_URL)
if r.status_code == 200:
    for p in r.json():
        img = p.get('image_path', '')
        fname = img.split('/')[-1]
        has_space = " " in fname
        has_parens = "(" in fname or ")" in fname
        print(f"[{p.get('name')}]: spaces={has_space}, parens={has_parens}, fname={fname[:20]}...")
