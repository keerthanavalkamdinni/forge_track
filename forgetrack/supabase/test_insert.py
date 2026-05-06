import urllib.request
import json

url = "https://ewxqwhmpjgcpsxhrwjgo.supabase.co/rest/v1/students"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eHF3aG1wamdjcHN4aHJ3amdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTE2NDAsImV4cCI6MjA5MzEyNzY0MH0.d95oRx9Z8PRB83sE0pk52sS1BRLuXNDQtId53v2VEUM"

data = {
    "name": "Test Student",
    "usn": "TEST001",
    "branch_code": "CS",
    "is_active": True
}
encoded_data = json.dumps(data).encode('utf-8')

req = urllib.request.Request(url, data=encoded_data, method='POST')
req.add_header('apikey', anon_key)
req.add_header('Authorization', f'Bearer {anon_key}')
req.add_header('Content-Type', 'application/json')
req.add_header('Prefer', 'return=representation')

try:
    response = urllib.request.urlopen(req)
    response_data = json.loads(response.read())
    print("Success! Data inserted:")
    print(response_data)
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} - {e.reason}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
