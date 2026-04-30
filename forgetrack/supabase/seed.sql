-- ==========================================
-- FORGETRACK SCHEMA & SEED DATA
-- ==========================================

-- 1. SCHEMA DEFINITION

CREATE TABLE public.students (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    usn TEXT UNIQUE NOT NULL,
    admission_number TEXT,
    email TEXT,
    branch_code TEXT NOT NULL,
    batch TEXT DEFAULT '2024-2028',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.sessions (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    topic TEXT NOT NULL,
    month_number INTEGER NOT NULL,
    duration_hours DECIMAL(3,1) DEFAULT 2.0,
    session_type TEXT DEFAULT 'offline',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.import_log (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    total_rows INTEGER NOT NULL,
    imported_rows INTEGER NOT NULL,
    skipped_rows INTEGER NOT NULL,
    warnings TEXT,
    column_mapping TEXT,
    status TEXT NOT NULL
);

CREATE TABLE public.attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    session_id INTEGER NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    present BOOLEAN NOT NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    marked_by TEXT DEFAULT 'system',
    import_id INTEGER REFERENCES public.import_log(id) ON DELETE SET NULL,
    UNIQUE(student_id, session_id)
);

CREATE TABLE public.materials (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Extend public.users to link to auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('mentor', 'student')),
    student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Constraints via Trigger
CREATE OR REPLACE FUNCTION public.check_attendance_date_bounds()
RETURNS TRIGGER AS $$
DECLARE
    session_date DATE;
BEGIN
    SELECT date INTO session_date FROM public.sessions WHERE id = NEW.session_id;
    
    IF session_date < '2025-08-04' THEN
        RAISE EXCEPTION 'Attendance date cannot be before 2025-08-04';
    END IF;
    
    IF session_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Attendance date cannot be in the future';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_attendance_date_trigger
BEFORE INSERT OR UPDATE ON public.attendance
FOR EACH ROW EXECUTE FUNCTION public.check_attendance_date_bounds();

-- 2. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Students Table RLS
CREATE POLICY "mentors_all_students" ON public.students FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'mentor')
);
CREATE POLICY "students_read_own" ON public.students FOR SELECT USING (
    id = (SELECT student_id FROM public.users WHERE id = auth.uid())
);

-- Sessions Table RLS
CREATE POLICY "mentors_all_sessions" ON public.sessions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'mentor')
);
CREATE POLICY "students_read_sessions" ON public.sessions FOR SELECT USING (true);

-- Attendance Table RLS
CREATE POLICY "mentors_all_attendance" ON public.attendance FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'mentor')
);
CREATE POLICY "students_read_own_attendance" ON public.attendance FOR SELECT USING (
    student_id = (SELECT student_id FROM public.users WHERE id = auth.uid())
);

-- Materials Table RLS
CREATE POLICY "mentors_all_materials" ON public.materials FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'mentor')
);
CREATE POLICY "students_read_materials" ON public.materials FOR SELECT USING (true);

-- Import Log Table RLS
CREATE POLICY "mentors_all_imports" ON public.import_log FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'mentor')
);

-- Users Table RLS
CREATE POLICY "users_read_self_or_mentor" ON public.users FOR SELECT USING (
    id = auth.uid() OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'mentor')
);

-- 3. AUTO-USER CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_student() 
RETURNS TRIGGER AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users (default password = usn)
  -- Note: In Supabase, creating an auth user typically happens via API, 
  -- but we can insert directly into auth.users in Postgres for a seed.
  -- For security, in production we'd use the admin API. 
  -- This is a simplified seed-friendly approach.
  new_user_id := gen_random_uuid();
  
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at)
  VALUES (
    new_user_id, 
    NEW.usn || '@forge.local', 
    crypt(NEW.usn, gen_salt('bf')), 
    now()
  );

  -- Insert into public.users
  INSERT INTO public.users (id, email, role, student_id, display_name)
  VALUES (
    new_user_id, 
    NEW.usn || '@forge.local', 
    'student', 
    NEW.id, 
    NEW.name
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_student_created
  AFTER INSERT ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student();

-- 4. DUMMY DATA SEEDING

-- Mentors (Create auth users first)
DO $$
DECLARE mentor_uid UUID := gen_random_uuid();
DECLARE cofac_uid UUID := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at) 
  VALUES 
  (mentor_uid, 'nischay@theboringpeople.in', crypt('password123', gen_salt('bf')), now()),
  (cofac_uid, 'varun@theboringpeople.in', crypt('password123', gen_salt('bf')), now());

  INSERT INTO public.users (id, email, role, display_name) 
  VALUES 
  (mentor_uid, 'nischay@theboringpeople.in', 'mentor', 'Nischay B K'),
  (cofac_uid, 'varun@theboringpeople.in', 'mentor', 'Varun');
END $$;

-- Insert Students (this will trigger auth.user creation for them)
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
('Neha Verma', '4SH24CS010', 'IS'),
('Kabir Das', '4SH24CS011', 'CS'),
('Zara Khan', '4SH24CS012', 'AI'),
('Aryan Mehta', '4SH24CS013', 'CS'),
('Kavya Nair', '4SH24CS014', 'IS'),
('Vivaan Rao', '4SH24CS015', 'AI'),
('Myra Reddy', '4SH24CS016', 'CS'),
('Krishna Iyer', '4SH24CS017', 'IS'),
('Aarohi Kulkarni', '4SH24CS018', 'CS'),
('Dev Joshi', '4SH24CS019', 'AI'),
('Nandini Rao', '4SH24CS020', 'IS'),
('Ishaan Sharma', '4SH24CS021', 'CS'),
('Sanya Patel', '4SH24CS022', 'AI'),
('Rudra Desai', '4SH24CS023', 'CS'),
('Aditi Singh', '4SH24CS024', 'IS'),
('Omkar Verma', '4SH24CS025', 'CS');

-- Insert Sessions
INSERT INTO public.sessions (date, topic, month_number) VALUES
('2025-08-04', 'Intro to The Forge & Environment Setup', 4),
('2025-08-06', '8-Layer AI Stack', 4),
('2025-08-11', 'LLM Fundamentals & Prompt Engineering', 4),
('2025-08-13', 'Vector Databases & Embeddings', 4),
('2025-08-18', 'pgvector RAG Implementation', 4),
('2025-09-01', 'ReAct Agent Pattern', 5),
('2025-09-03', 'Building Custom Tools for Agents', 5),
('2025-09-08', 'LangChain Integration Deep Dive', 5),
('2025-09-10', 'Memory Management in LLMs', 5),
('2025-09-15', 'Tiered Autonomy Multi-Agent Systems', 5),
('2025-10-06', 'Deploying AI Models to Production', 6),
('2025-10-08', 'Monitoring & Observability for LLMs', 6),
('2025-10-13', 'Fine-tuning Fundamentals', 6),
('2025-10-15', 'Advanced RAG Strategies', 6),
('2025-10-20', 'Capstone Project Kickoff', 6);

-- Insert Import Logs
INSERT INTO public.import_log (filename, uploaded_by, total_rows, imported_rows, skipped_rows, status) VALUES
('month4_attendance.csv', 'Nischay B K', 125, 125, 0, 'completed'),
('month5_attendance.csv', 'Varun', 125, 120, 5, 'completed');

-- Seed Attendance (Randomized ~85% present rate)
DO $$
DECLARE
    student_record RECORD;
    session_record RECORD;
    is_present BOOLEAN;
BEGIN
    FOR session_record IN SELECT id FROM public.sessions LOOP
        FOR student_record IN SELECT id FROM public.students LOOP
            is_present := random() < 0.85;
            INSERT INTO public.attendance (student_id, session_id, present)
            VALUES (student_record.id, session_record.id, is_present);
        END LOOP;
    END LOOP;
END $$;

-- Insert Materials
INSERT INTO public.materials (session_id, title, type, url)
SELECT id, 'Presentation Slides', 'slides', 'https://docs.google.com/presentation/'
FROM public.sessions;

INSERT INTO public.materials (session_id, title, type, url)
SELECT id, 'Session Recording', 'recording', 'https://youtube.com/'
FROM public.sessions;
