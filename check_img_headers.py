
import requests
API_URL = "https://almacenes-collie.vercel.app/api/v1/public/products"
BASE_URL = "https://almacenes-collie.vercel.app"
r = requests.get(API_URL)
if r.status_code == 200:
    for p in r.json():
        img = p.get('image_path')
        if img:
            full_url = f"{BASE_URL}{img}"
            img_res = requests.get(full_url, stream=True)
            print(f"Product: {p.get('name')}")
            print(f"  ContentType: {img_res.headers.get('Content-Type')}")
            print(f"  Size: {len(img_res.content)}")
