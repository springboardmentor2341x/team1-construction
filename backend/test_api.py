import urllib.request
import json

# Test Registration
data = json.dumps({
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "Client",
    "department": "IT",
    "employee_id": "EMP001",
    "mobile": "1234567890",
    "address": "123 Test Street"
}).encode()

req = urllib.request.Request(
    "http://127.0.0.1:8000/auth/register",
    data=data,
    headers={"Content-Type": "application/json"}
)

try:
    resp = urllib.request.urlopen(req)
    print("Register Response:", resp.read().decode())
except Exception as e:
    print("Register Error:", e)

# Test Login
data2 = json.dumps({
    "email": "test@example.com",
    "password": "password123"
}).encode()

req2 = urllib.request.Request(
    "http://127.0.0.1:8000/auth/login",
    data=data2,
    headers={"Content-Type": "application/json"}
)

try:
    resp2 = urllib.request.urlopen(req2)
    result = json.loads(resp2.read().decode())
    print("Login Response:", json.dumps(result, indent=2))
    token = result.get("access_token")

    # Test /auth/me with token
    if token:
        req3 = urllib.request.Request(
            "http://127.0.0.1:8000/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        resp3 = urllib.request.urlopen(req3)
        print("Profile Response:", json.loads(resp3.read().decode()))
except Exception as e:
    print("Login Error:", e)

print("\nAll tests completed!")
