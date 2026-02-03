import requests
headers = {"X-API-Key": "dev-secret-key"}
# Get first product ID
r = requests.get("http://localhost:8000/api/v1/products", headers=headers)
product_id = r.json()[0]['id']
print(f"Patching product {product_id} to be pre-order...")

data = {
    "is_preorder": "true"
}
r = requests.patch(f"http://localhost:8000/api/v1/products/{product_id}", headers=headers, data=data)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
