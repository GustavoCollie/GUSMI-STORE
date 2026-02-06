
import requests
API_URL = "https://almacenes-collie.vercel.app/api/v1/public/products"
BASE_URL = "https://almacenes-collie.vercel.app"

r = requests.get(API_URL)
if r.status_code == 200:
    products = r.json()
    for p in products:
        name = p.get('name')
        img = p.get('image_path')
        if img:
            full_url = f"{BASE_URL}{img}"
            try:
                img_res = requests.head(full_url)
                print(f"Product: {name}")
                print(f"  URL: {full_url}")
                print(f"  Status: {img_res.status_code}")
            except Exception as e:
                print(f"Product: {name} | Error: {e}")
        else:
            print(f"Product: {name} | No Image")
else:
    print(f"API Error: {r.status_code}")
