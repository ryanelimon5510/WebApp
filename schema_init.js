const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:BKnF7vmXMcm0wIVC@db.zowdrxhcebsjhprhktwl.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

const schema = `
-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing tables and types to ensure clean slate
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS role_type CASCADE;
DROP TYPE IF EXISTS status_type CASCADE;

-- ENUMs
CREATE TYPE role_type AS ENUM ('STUDENT', 'TEACHER');
CREATE TYPE status_type AS ENUM ('PRESENT', 'REJECTED');

-- 1. Profiles Table (Linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role role_type NOT NULL DEFAULT 'STUDENT',
    student_number VARCHAR(50),
    mobile_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_code VARCHAR(20) UNIQUE NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    room_lat DOUBLE PRECISION,
    room_lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enrollments Table
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, class_id)
);

-- 4. Sessions Table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    active_qr_token VARCHAR(255) NOT NULL,
    token_expiry TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- 5. Attendance Logs Table
CREATE TABLE public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scan_time TIMESTAMPTZ DEFAULT NOW(),
    student_lat DOUBLE PRECISION,
    student_lng DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION,
    status status_type NOT NULL,
    UNIQUE(session_id, student_id)
);

-- RLS Setup (Row Level Security for profiles)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Other tables don't need RLS because Spring Boot will hit them as 'postgres' role
`;

async function executeSchema() {
  try {
    await client.connect();
    console.log("Connected to Supabase.");
    await client.query(schema);
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing db:", error);
  } finally {
    await client.end();
  }
}

executeSchema();
