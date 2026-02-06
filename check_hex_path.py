
import requests
API_URL = "https://almacenes-collie.vercel.app/api/v1/public/products"
r = requests.get(API_URL)
if r.status_code == 200:
    for p in r.json():
        img = p.get('image_path', '')
        print(f"[{p.get('name')}] Hex: {img.encode('utf-8').hex()}")
