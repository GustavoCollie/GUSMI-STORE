
import requests
BASE_URL = "https://almacenes-collie.vercel.app"
API_URL = f"{BASE_URL}/api/v1/public/products"

r = requests.get(API_URL)
if r.status_code == 200:
    for p in r.json():
        if "Tablet" in p.get('name'):
            full_url = f"{BASE_URL}{p.get('image_path')}"
            img_data = requests.get(full_url).content
            print(f"Tablet Magic Bytes: {img_data[:4].hex()}")
            # JPEG starts with ffd8ffe0 or ffd8ffe1 or ffd8ffdb
        if "Monitor" in p.get('name'):
            full_url = f"{BASE_URL}{p.get('image_path')}"
            img_data = requests.get(full_url).content
            print(f"Monitor Magic Bytes: {img_data[:4].hex()}")
