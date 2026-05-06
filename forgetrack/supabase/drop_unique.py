import pg8000.native

host = "db.ewxqwhmpjgcpsxhrwjgo.supabase.co"
database = "postgres"
port = 5432
user = "postgres"
password = "keerthana@2006"

try:
    con = pg8000.native.Connection(user=user, host=host, database=database, port=port, password=password)
    print("Connected! Dropping UNIQUE constraint on sessions.date...")
    
    # Try to find the constraint name
    res = con.run("""
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.sessions'::regclass
        AND contype = 'u';
    """)
    
    for row in res:
        constraint_name = row[0]
        print(f"Dropping constraint: {constraint_name}")
        con.run(f"ALTER TABLE public.sessions DROP CONSTRAINT {constraint_name};")
        
    print("Successfully dropped UNIQUE constraint!")
except Exception as e:
    print(f"Error: {e}")
