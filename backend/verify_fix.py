import requests
import sys

def verify():
    print("Verifying pre-order persistence...")
    try:
        r = requests.get("http://localhost:8000/api/v1/products", headers={"X-API-Key": "dev-secret-key"})
        r.raise_for_status()
        products = r.json()
        
        target = next((p for p in products if p['name'] == 'Monitor LED 27"'), None)
        if not target:
            print("FAILURE: Monitor LED 27\" not found")
            return

        print(f"Monitor LED 27\" is_preorder: {target.get('is_preorder')}")
        
        if target.get('is_preorder') is True:
            print("SUCCESS: is_preorder is True")
        else:
            print(f"FAILURE: is_preorder is {target.get('is_preorder')}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    verify()
