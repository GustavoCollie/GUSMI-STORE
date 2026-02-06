
import requests
API_URL = "https://almacenes-collie.vercel.app/api/v1/public/products"
r = requests.get(API_URL)
if r.status_code == 200:
    for p in r.json():
        if "Tablet" in p.get('name'):
            print(f"Tablet Filename: {p.get('image_path').split('/')[-1]}")
