import pg8000.native
import re

host = "db.ewxqwhmpjgcpsxhrwjgo.supabase.co"
database = "postgres"
port = 5432
user = "postgres"
password = "keerthana@2006"

try:
    print(f"Connecting to {host}...")
    con = pg8000.native.Connection(user=user, host=host, database=database, port=port, password=password)
    print("Connected! Reading seed.sql...")
    
    with open('seed.sql', 'r', encoding='utf-8') as f:
        sql = f.read()

    # Split the SQL script by semicolons, but ignore semicolons inside DO blocks or strings
    # This is hard. A simpler way is to just find all INSERT statements manually
    
    # Actually, we can just run the inserts explicitly
    
    # 1. Mentors & Auth Users
    print("Seeding Mentors...")
    con.run("""
    DO $$
    DECLARE mentor_uid UUID := gen_random_uuid();
    DECLARE cofac_uid UUID := gen_random_uuid();
    BEGIN
      INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at) 
      VALUES 
      (mentor_uid, 'mentor@theboringpeople.in', crypt('password123', gen_salt('bf')), now()),
      (cofac_uid, 'student@theboringpeople.in', crypt('password123', gen_salt('bf')), now())
      ON CONFLICT DO NOTHING;

      INSERT INTO public.users (id, email, role, display_name) 
      VALUES 
      (mentor_uid, 'mentor@theboringpeople.in', 'mentor', 'Nischay B K'),
      (cofac_uid, 'student@theboringpeople.in', 'student', 'Varun')
      ON CONFLICT DO NOTHING;
    END $$;
    """)

    # 2. Students
    print("Seeding Students...")
    con.run("""
    INSERT INTO public.students (name, usn, branch_code) VALUES
    ('Aarav Patel', '4SH24CS001', 'CS'),
    ('Diya Sharma', '4SH24CS002', 'AI'),
    ('Vihaan Kumar', '4SH24CS003', 'IS'),
    ('Ananya Singh', '4SH24CS004', 'CS'),
    ('Arjun Gupta', '4SH24CS005', 'AI'),
    ('Aditya Reddy', '4SH24CS006', 'CS'),
    ('Sai Krishna', '4SH24CS007', 'IS'),
    ('Isha Desai', '4SH24CS008', 'AI'),
    ('Rohan Joshi', '4SH24CS009', 'CS'),
    ('Neha Verma', '4SH24CS010', 'IS')
    ON CONFLICT DO NOTHING;
    """)

    # 3. Sessions
    print("Seeding Sessions...")
    con.run("""
    INSERT INTO public.sessions (date, topic, month_number) VALUES
    ('2025-08-04', 'Intro to The Forge & Environment Setup', 4),
    ('2025-08-06', '8-Layer AI Stack', 4),
    ('2025-08-11', 'LLM Fundamentals & Prompt Engineering', 4),
    ('2025-08-13', 'Vector Databases & Embeddings', 4)
    ON CONFLICT DO NOTHING;
    """)

    # 4. Materials
    print("Seeding Materials...")
    con.run("""
    INSERT INTO public.materials (session_id, title, type, url)
    SELECT id, 'Presentation Slides', 'slides', 'https://docs.google.com/presentation/'
    FROM public.sessions
    ON CONFLICT DO NOTHING;
    """)

    print("Data successfully seeded!")
except Exception as e:
    print(f"Error during seeding: {e}")
