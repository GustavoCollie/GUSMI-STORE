
import requests
import json

URL = "https://almacenes-collie.vercel.app/api/v1/public/products"

def capture_error():
    print(f"Requesting: {URL}")
    try:
        response = requests.get(URL)
        print(f"Status Code: {response.status_code}")
        
        try:
            data = response.json()
            print("\n--- Error details from server ---")
            print(json.dumps(data, indent=2))
        except:
            print("\nResponse is not JSON:")
            print(response.text[:500])
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    capture_error()
