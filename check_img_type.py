
import requests
API_URL = "https://almacenes-collie.vercel.app/api/v1/public/products"
r = requests.get(API_URL)
if r.status_code == 200:
    for p in r.json():
        img = p.get('image_path', '')
        is_http = img.startswith('http') if img else False
        print(f"[{p.get('name')}]: IS_HTTP={is_http} | Path={img[:20]}...")
