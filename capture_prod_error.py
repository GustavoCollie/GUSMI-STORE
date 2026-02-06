
import requests
URL = "https://almacenes-collie.vercel.app/api/v1/public/products"
r = requests.get(URL)
if r.status_code == 200:
    for p in r.json():
        print(f"Product: {p.get('name')}")
        print(f"  Image: {p.get('image_path')}")
else:
    print(f"Error {r.status_code}: {r.text}")
