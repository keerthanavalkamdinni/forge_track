import pg8000.native
import sys

host = "db.gzlzrblmeuszvrenwzqr.supabase.co"
database = "postgres"
port = 5432
user = "postgres"

password = "keerthana@2006"
if len(sys.argv) > 1:
    password = sys.argv[1]

try:
    print(f"Connecting to {host}...")
    con = pg8000.native.Connection(user=user, host=host, database=database, port=port, password=password)
    print("Connected! Reading seed.sql...")
    
    with open('seed.sql', 'r', encoding='utf-8') as f:
        sql = f.read()

    # We need to execute the sql. pg8000 native run() supports single statements.
    # To execute a whole script, we can wrap it in a single DO block or parse it.
    # Actually, wrapping the whole thing won't work because of CREATE TABLE.
    # Let's try just passing the whole string. 
    try:
        con.run(sql)
        print("Successfully executed SQL!")
    except Exception as e:
        print(f"Failed to execute entire script at once: {e}")
        # fallback simple split (might break DO blocks, but let's see)

except Exception as e:
    print(f"Connection error: {e}")

