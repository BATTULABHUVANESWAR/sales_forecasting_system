import requests

url = "http://127.0.0.1:5000/api/forecast"

payload = {
    "store_id": "S001",
    "department_id": "D038",
    "horizon": 4
}

response = requests.post(
    url,
    json=payload
)

print("Status:", response.status_code)
print(response.json())