import urllib.request
import json
import os

url = "https://ewxqwhmpjgcpsxhrwjgo.supabase.co/rest/v1/students?select=*"
anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eHF3aG1wamdjcHN4aHJ3amdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTE2NDAsImV4cCI6MjA5MzEyNzY0MH0.d95oRx9Z8PRB83sE0pk52sS1BRLuXNDQtId53v2VEUM"

req = urllib.request.Request(url)
req.add_header('apikey', anon_key)
req.add_header('Authorization', f'Bearer {anon_key}')

try:
    response = urllib.request.urlopen(req)
    data = json.loads(response.read())
    print(f"Students found via REST: {len(data)}")
    if len(data) > 0:
        print(data[0])
except Exception as e:
    print(f"Error: {e}")
