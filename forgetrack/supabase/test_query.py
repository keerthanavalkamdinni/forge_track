import pg8000.native

host = "db.gzlzrblmeuszvrenwzqr.supabase.co"
database = "postgres"
port = 5432
user = "postgres"
password = "keerthana@2006"

try:
    con = pg8000.native.Connection(user=user, host=host, database=database, port=port, password=password)
    res = con.run("SELECT * FROM public.students")
    print(f"Students count: {len(res)}")
    for row in res:
        print(row)
except Exception as e:
    print(f"Error: {e}")
