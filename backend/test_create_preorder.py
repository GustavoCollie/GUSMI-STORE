import requests
headers = {"X-API-Key": "dev-secret-key"}
data = {
    "name": "Preorder Test",
    "description": "Test product",
    "sku": "SKU-PRE-TEST",
    "retail_price": 100,
    "is_preorder": "true" # Sending as string, as FormData would
}
# Using data parameter sends it as application/x-www-form-urlencoded, which is what Form(...) expects
r = requests.post("http://localhost:8000/api/v1/products", headers=headers, data=data)
print(f"Status: {r.status_code}")
print(f"Response: {r.json()}")
