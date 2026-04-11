-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop existing tables and types to ensure clean slate
DROP TABLE IF EXISTS public.attendance_logs CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.enrollments CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop enums gracefully if they exist
DO $$ BEGIN
    CREATE TYPE role_type AS ENUM ('STUDENT', 'TEACHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE status_type AS ENUM ('PRESENT', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- Trigger to auto-create profile on Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, mobile_number, student_number)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        CAST(COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT') AS role_type),
        NEW.raw_user_meta_data->>'mobile_number',
        NEW.raw_user_meta_data->>'student_number'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
