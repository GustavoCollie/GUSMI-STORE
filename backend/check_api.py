import requests
headers = {"X-API-Key": "dev-secret-key"}
r = requests.get("http://localhost:8000/api/v1/products", headers=headers)
for p in r.json():
    print(f"Name: {p.get('name')}, is_preorder: {p.get('is_preorder')}, type: {type(p.get('is_preorder'))}")
