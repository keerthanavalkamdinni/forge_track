import pg8000.native

host = "db.ewxqwhmpjgcpsxhrwjgo.supabase.co"
database = "postgres"
port = 5432
user = "postgres"
password = "keerthana@2006"

try:
    con = pg8000.native.Connection(user=user, host=host, database=database, port=port, password=password)
    print("Successfully connected to the database!")
    res = con.run("SELECT count(*) FROM public.students")
    print(f"Count of students: {res[0][0]}")
except Exception as e:
    print(f"Error: {e}")
