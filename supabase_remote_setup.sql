-- =====================================================
-- GANPATHI OVERSEAS - OPERATOR DATABASE SETUP FOR REMOTE SUPABASE
-- Run this in your Supabase SQL Editor (remote instance)
-- =====================================================

-- Create enums if they don't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'finance', 'operator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE machine_type AS ENUM ('offset', 'digital', 'finishing', 'cutting', 'binding', 'lamination');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE machine_status AS ENUM ('idle', 'running', 'maintenance', 'breakdown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- First, create the auth users (this is required for foreign key references)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES 
    ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@ganpathioverseas.com', '$2a$10$example', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'supervisor@ganpathioverseas.com', '$2a$10$example', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'finance@ganpathioverseas.com', '$2a$10$example', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'authenticated', 'authenticated', 'operator1@ganpathioverseas.com', '$2a$10$example', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', ''),
    ('00000000-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'authenticated', 'authenticated', 'operator2@ganpathioverseas.com', '$2a$10$example', NOW(), NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Add columns to users table if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE public.users ADD COLUMN role user_role DEFAULT 'operator';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE public.users ADD COLUMN username VARCHAR(50) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE public.users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE public.users ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'salary') THEN
        ALTER TABLE public.users ADD COLUMN salary DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'auth_user_id') THEN
        ALTER TABLE public.users ADD COLUMN auth_user_id UUID;
    END IF;
END $$;

-- Check if users table has integer or UUID id and handle accordingly
DO $$ 
DECLARE
    id_type TEXT;
    has_password_hash BOOLEAN := FALSE;
    has_password BOOLEAN := FALSE;
BEGIN
    -- Get the data type of the id column in users table
    SELECT data_type INTO id_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'id';
    
    -- Check if password_hash column exists and is required
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_hash'
        AND is_nullable = 'NO'
    ) INTO has_password_hash;
    
    -- Check if password column exists and is required
    SELECT EXISTS(
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password'
        AND is_nullable = 'NO'
    ) INTO has_password;
    
    IF id_type = 'integer' THEN
        -- Users table has integer IDs, create new users with integer IDs and link to auth.users via auth_user_id
        IF has_password_hash THEN
            INSERT INTO public.users (email, auth_user_id, role, username, name, phone, address, salary, password_hash) VALUES
            ('admin@ganpathioverseas.com', '11111111-1111-1111-1111-111111111111', 'admin', 'admin', 'Rajesh Kumar', '+91 98765 43210', 'Mumbai, Maharashtra', 80000, '$2a$10$dummy.hash.for.setup'),
            ('supervisor@ganpathioverseas.com', '22222222-2222-2222-2222-222222222222', 'supervisor', 'supervisor', 'Priya Sharma', '+91 98765 43211', 'Mumbai, Maharashtra', 60000, '$2a$10$dummy.hash.for.setup'),
            ('finance@ganpathioverseas.com', '33333333-3333-3333-3333-333333333333', 'finance', 'finance', 'Amit Patel', '+91 98765 43212', 'Mumbai, Maharashtra', 55000, '$2a$10$dummy.hash.for.setup'),
            ('operator1@ganpathioverseas.com', '44444444-4444-4444-4444-444444444444', 'operator', 'operator1', 'Suresh Yadav', '+91 98765 43213', 'Mumbai, Maharashtra', 35000, '$2a$10$dummy.hash.for.setup'),
            ('operator2@ganpathioverseas.com', '55555555-5555-5555-5555-555555555555', 'operator', 'operator2', 'Deepak Singh', '+91 98765 43214', 'Mumbai, Maharashtra', 38000, '$2a$10$dummy.hash.for.setup')
            ON CONFLICT (email) DO NOTHING;
        ELSIF has_password THEN
            INSERT INTO public.users (email, auth_user_id, role, username, name, phone, address, salary, password) VALUES
            ('admin@ganpathioverseas.com', '11111111-1111-1111-1111-111111111111', 'admin', 'admin', 'Rajesh Kumar', '+91 98765 43210', 'Mumbai, Maharashtra', 80000, 'dummy_password'),
            ('supervisor@ganpathioverseas.com', '22222222-2222-2222-2222-222222222222', 'supervisor', 'supervisor', 'Priya Sharma', '+91 98765 43211', 'Mumbai, Maharashtra', 60000, 'dummy_password'),
            ('finance@ganpathioverseas.com', '33333333-3333-3333-3333-333333333333', 'finance', 'finance', 'Amit Patel', '+91 98765 43212', 'Mumbai, Maharashtra', 55000, 'dummy_password'),
            ('operator1@ganpathioverseas.com', '44444444-4444-4444-4444-444444444444', 'operator', 'operator1', 'Suresh Yadav', '+91 98765 43213', 'Mumbai, Maharashtra', 35000, 'dummy_password'),
            ('operator2@ganpathioverseas.com', '55555555-5555-5555-5555-555555555555', 'operator', 'operator2', 'Deepak Singh', '+91 98765 43214', 'Mumbai, Maharashtra', 38000, 'dummy_password')
            ON CONFLICT (email) DO NOTHING;
        ELSE
            INSERT INTO public.users (email, auth_user_id, role, username, name, phone, address, salary) VALUES
            ('admin@ganpathioverseas.com', '11111111-1111-1111-1111-111111111111', 'admin', 'admin', 'Rajesh Kumar', '+91 98765 43210', 'Mumbai, Maharashtra', 80000),
            ('supervisor@ganpathioverseas.com', '22222222-2222-2222-2222-222222222222', 'supervisor', 'supervisor', 'Priya Sharma', '+91 98765 43211', 'Mumbai, Maharashtra', 60000),
            ('finance@ganpathioverseas.com', '33333333-3333-3333-3333-333333333333', 'finance', 'finance', 'Amit Patel', '+91 98765 43212', 'Mumbai, Maharashtra', 55000),
            ('operator1@ganpathioverseas.com', '44444444-4444-4444-4444-444444444444', 'operator', 'operator1', 'Suresh Yadav', '+91 98765 43213', 'Mumbai, Maharashtra', 35000),
            ('operator2@ganpathioverseas.com', '55555555-5555-5555-5555-555555555555', 'operator', 'operator2', 'Deepak Singh', '+91 98765 43214', 'Mumbai, Maharashtra', 38000)
            ON CONFLICT (email) DO NOTHING;
        END IF;
    ELSE
        -- Users table has UUID IDs, insert directly
        IF has_password_hash THEN
            INSERT INTO public.users (id, email, role, username, name, phone, address, salary, password_hash) VALUES
            ('11111111-1111-1111-1111-111111111111', 'admin@ganpathioverseas.com', 'admin', 'admin', 'Rajesh Kumar', '+91 98765 43210', 'Mumbai, Maharashtra', 80000, '$2a$10$dummy.hash.for.setup'),
            ('22222222-2222-2222-2222-222222222222', 'supervisor@ganpathioverseas.com', 'supervisor', 'supervisor', 'Priya Sharma', '+91 98765 43211', 'Mumbai, Maharashtra', 60000, '$2a$10$dummy.hash.for.setup'),
            ('33333333-3333-3333-3333-333333333333', 'finance@ganpathioverseas.com', 'finance', 'finance', 'Amit Patel', '+91 98765 43212', 'Mumbai, Maharashtra', 55000, '$2a$10$dummy.hash.for.setup'),
            ('44444444-4444-4444-4444-444444444444', 'operator1@ganpathioverseas.com', 'operator', 'operator1', 'Suresh Yadav', '+91 98765 43213', 'Mumbai, Maharashtra', 35000, '$2a$10$dummy.hash.for.setup'),
            ('55555555-5555-5555-5555-555555555555', 'operator2@ganpathioverseas.com', 'operator', 'operator2', 'Deepak Singh', '+91 98765 43214', 'Mumbai, Maharashtra', 38000, '$2a$10$dummy.hash.for.setup')
            ON CONFLICT (id) DO NOTHING;
        ELSIF has_password THEN
            INSERT INTO public.users (id, email, role, username, name, phone, address, salary, password) VALUES
            ('11111111-1111-1111-1111-111111111111', 'admin@ganpathioverseas.com', 'admin', 'admin', 'Rajesh Kumar', '+91 98765 43210', 'Mumbai, Maharashtra', 80000, 'dummy_password'),
            ('22222222-2222-2222-2222-222222222222', 'supervisor@ganpathioverseas.com', 'supervisor', 'supervisor', 'Priya Sharma', '+91 98765 43211', 'Mumbai, Maharashtra', 60000, 'dummy_password'),
            ('33333333-3333-3333-3333-333333333333', 'finance@ganpathioverseas.com', 'finance', 'finance', 'Amit Patel', '+91 98765 43212', 'Mumbai, Maharashtra', 55000, 'dummy_password'),
            ('44444444-4444-4444-4444-444444444444', 'operator1@ganpathioverseas.com', 'operator', 'operator1', 'Suresh Yadav', '+91 98765 43213', 'Mumbai, Maharashtra', 35000, 'dummy_password'),
            ('55555555-5555-5555-5555-555555555555', 'operator2@ganpathioverseas.com', 'operator', 'operator2', 'Deepak Singh', '+91 98765 43214', 'Mumbai, Maharashtra', 38000, 'dummy_password')
            ON CONFLICT (id) DO NOTHING;
        ELSE
            INSERT INTO public.users (id, email, role, username, name, phone, address, salary) VALUES
            ('11111111-1111-1111-1111-111111111111', 'admin@ganpathioverseas.com', 'admin', 'admin', 'Rajesh Kumar', '+91 98765 43210', 'Mumbai, Maharashtra', 80000),
            ('22222222-2222-2222-2222-222222222222', 'supervisor@ganpathioverseas.com', 'supervisor', 'supervisor', 'Priya Sharma', '+91 98765 43211', 'Mumbai, Maharashtra', 60000),
            ('33333333-3333-3333-3333-333333333333', 'finance@ganpathioverseas.com', 'finance', 'finance', 'Amit Patel', '+91 98765 43212', 'Mumbai, Maharashtra', 55000),
            ('44444444-4444-4444-4444-444444444444', 'operator1@ganpathioverseas.com', 'operator', 'operator1', 'Suresh Yadav', '+91 98765 43213', 'Mumbai, Maharashtra', 35000),
            ('55555555-5555-5555-5555-555555555555', 'operator2@ganpathioverseas.com', 'operator', 'operator2', 'Deepak Singh', '+91 98765 43214', 'Mumbai, Maharashtra', 38000)
            ON CONFLICT (id) DO NOTHING;
        END IF;
    END IF;
END $$;

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type machine_type NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    maintenance_date DATE,
    operator_id UUID REFERENCES auth.users(id),
    current_operator_id UUID REFERENCES auth.users(id),
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    status machine_status DEFAULT 'idle',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add columns to job_sheets table if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'assigned_to') THEN
        ALTER TABLE job_sheets ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'machine_id') THEN
        ALTER TABLE job_sheets ADD COLUMN machine_id INTEGER REFERENCES machines(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'priority') THEN
        ALTER TABLE job_sheets ADD COLUMN priority INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'status') THEN
        ALTER TABLE job_sheets ADD COLUMN status job_status DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'started_at') THEN
        ALTER TABLE job_sheets ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'completed_at') THEN
        ALTER TABLE job_sheets ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'title') THEN
        ALTER TABLE job_sheets ADD COLUMN title VARCHAR(200);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'job_number') THEN
        ALTER TABLE job_sheets ADD COLUMN job_number VARCHAR(50) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'quantity') THEN
        ALTER TABLE job_sheets ADD COLUMN quantity INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'due_date') THEN
        ALTER TABLE job_sheets ADD COLUMN due_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'colors') THEN
        ALTER TABLE job_sheets ADD COLUMN colors VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'paper_type') THEN
        ALTER TABLE job_sheets ADD COLUMN paper_type VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'paper_size') THEN
        ALTER TABLE job_sheets ADD COLUMN paper_size VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'estimated_cost') THEN
        ALTER TABLE job_sheets ADD COLUMN estimated_cost DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'selling_price') THEN
        ALTER TABLE job_sheets ADD COLUMN selling_price DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'created_by') THEN
        ALTER TABLE job_sheets ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create operator tables
CREATE TABLE IF NOT EXISTS job_schedules (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    machine_id INTEGER NOT NULL REFERENCES machines(id),
    scheduled_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    estimated_duration INTEGER DEFAULT 0, -- in minutes
    actual_duration INTEGER DEFAULT 0, -- in minutes
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_logs table for clock in/out functionality
CREATE TABLE IF NOT EXISTS time_logs (
    id SERIAL PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    job_sheet_id INTEGER REFERENCES job_sheets(id),
    machine_id INTEGER REFERENCES machines(id),
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(5,2) DEFAULT 0,
    break_hours DECIMAL(5,2) DEFAULT 0,
    productivity_score INTEGER DEFAULT 0, -- 1-100
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_progress table for tracking completion
CREATE TABLE IF NOT EXISTS job_progress (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    stage VARCHAR(50) NOT NULL, -- setup, printing, finishing, quality_check, completed
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    quality_rating INTEGER DEFAULT 0 CHECK (quality_rating >= 0 AND quality_rating <= 5),
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all for authenticated users" ON machines FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON job_schedules FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON time_logs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON job_progress FOR ALL USING (auth.role() = 'authenticated');

-- Insert demo data for machines
INSERT INTO machines (name, type, model, serial_number, operator_id, current_operator_id, hourly_rate, status) VALUES
('HP Indigo 12000', 'digital', 'HP Indigo 12000 Digital Press', 'HPI12000-001', '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 150.00, 'running'),
('Xerox Versant 180', 'digital', 'Xerox Versant 180 Press', 'XER180-002', '55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 120.00, 'idle'),
('Polar 115X', 'cutting', 'Polar 115X Paper Cutter', 'POL115X-003', '44444444-4444-4444-4444-444444444444', NULL, 80.00, 'idle'),
('GMP Saturn 540', 'lamination', 'GMP Saturn 540 Laminator', 'GMP540-004', '55555555-5555-5555-5555-555555555555', NULL, 90.00, 'maintenance')
ON CONFLICT (serial_number) DO NOTHING;

-- Update job_sheets with demo data enhancements
UPDATE job_sheets SET 
    assigned_to = '44444444-4444-4444-4444-444444444444',
    machine_id = 1,
    priority = 1,
    status = 'in_progress',
    started_at = NOW() - INTERVAL '2 hours',
    title = 'Business Card Printing',
    job_number = 'JOB-2024-001',
    quantity = 1000,
    due_date = CURRENT_DATE + INTERVAL '1 day',
    colors = '4+0',
    paper_type = 'Art Card 300gsm',
    paper_size = '54x90mm',
    estimated_cost = 2500.00,
    selling_price = 3500.00,
    created_by = '11111111-1111-1111-1111-111111111111'
WHERE id = (SELECT id FROM job_sheets ORDER BY created_at DESC LIMIT 1 OFFSET 0);

UPDATE job_sheets SET 
    assigned_to = '44444444-4444-4444-4444-444444444444',
    machine_id = 2,
    priority = 2,
    status = 'pending',
    title = 'Annual Report Printing',
    job_number = 'JOB-2024-002',
    quantity = 100,
    due_date = CURRENT_DATE + INTERVAL '5 days',
    colors = '4+4',
    paper_type = 'Maplitho 80gsm',
    paper_size = 'A4',
    estimated_cost = 15000.00,
    selling_price = 22000.00,
    created_by = '11111111-1111-1111-1111-111111111111'
WHERE id = (SELECT id FROM job_sheets ORDER BY created_at DESC LIMIT 1 OFFSET 1);

-- Insert additional job sheets if none exist
INSERT INTO job_sheets (
    party_id, assigned_to, machine_id, priority, status, title, job_number, 
    quantity, due_date, colors, paper_type, paper_size, estimated_cost, 
    selling_price, created_by, created_at
)
SELECT 
    p.id, 
    '55555555-5555-5555-5555-555555555555',
    3, 2, 'pending', 'Brochure Printing', 'JOB-2024-003',
    500, CURRENT_DATE + INTERVAL '3 days', '4+4', 'Art Paper 150gsm', 'A4 Tri-fold',
    8000.00, 12000.00, '22222222-2222-2222-2222-222222222222', NOW()
FROM parties p 
WHERE p.name LIKE '%Corporation%' 
AND NOT EXISTS (SELECT 1 FROM job_sheets WHERE job_number = 'JOB-2024-003')
LIMIT 1;

-- Insert job schedules
INSERT INTO job_schedules (job_sheet_id, operator_id, machine_id, scheduled_date, start_time, end_time, estimated_duration, status) 
SELECT 
    js.id, '44444444-4444-4444-4444-444444444444', js.machine_id, CURRENT_DATE, '09:00:00', '17:00:00', 480, 'in_progress'
FROM job_sheets js 
WHERE js.job_number = 'JOB-2024-001'
AND NOT EXISTS (SELECT 1 FROM job_schedules WHERE job_sheet_id = js.id)
LIMIT 1;

INSERT INTO job_schedules (job_sheet_id, operator_id, machine_id, scheduled_date, start_time, end_time, estimated_duration, status) 
SELECT 
    js.id, '44444444-4444-4444-4444-444444444444', js.machine_id, CURRENT_DATE + INTERVAL '1 day', '09:00:00', '15:00:00', 360, 'scheduled'
FROM job_sheets js 
WHERE js.job_number = 'JOB-2024-002'
AND NOT EXISTS (SELECT 1 FROM job_schedules WHERE job_sheet_id = js.id)
LIMIT 1;

INSERT INTO job_schedules (job_sheet_id, operator_id, machine_id, scheduled_date, start_time, end_time, estimated_duration, status) 
SELECT 
    js.id, '55555555-5555-5555-5555-555555555555', js.machine_id, CURRENT_DATE + INTERVAL '2 days', '10:00:00', '16:00:00', 360, 'scheduled'
FROM job_sheets js 
WHERE js.job_number = 'JOB-2024-003'
AND NOT EXISTS (SELECT 1 FROM job_schedules WHERE job_sheet_id = js.id)
LIMIT 1;

-- Insert time logs (operator clocked in)
INSERT INTO time_logs (operator_id, job_sheet_id, machine_id, clock_in, total_hours, productivity_score) 
SELECT 
    '44444444-4444-4444-4444-444444444444', js.id, js.machine_id, NOW() - INTERVAL '2 hours', 2.0, 85
FROM job_sheets js 
WHERE js.job_number = 'JOB-2024-001'
AND NOT EXISTS (SELECT 1 FROM time_logs WHERE job_sheet_id = js.id AND operator_id = '44444444-4444-4444-4444-444444444444')
LIMIT 1;

-- Insert job progress
INSERT INTO job_progress (job_sheet_id, operator_id, stage, completion_percentage, quality_rating, notes) 
SELECT 
    js.id, '44444444-4444-4444-4444-444444444444', 'printing', 65, 4, 'Good progress, quality looking excellent'
FROM job_sheets js 
WHERE js.job_number = 'JOB-2024-001'
AND NOT EXISTS (SELECT 1 FROM job_progress WHERE job_sheet_id = js.id)
LIMIT 1;

INSERT INTO job_progress (job_sheet_id, operator_id, stage, completion_percentage, quality_rating, notes) 
SELECT 
    js.id, '44444444-4444-4444-4444-444444444444', 'setup', 0, 0, 'Waiting for materials'
FROM job_sheets js 
WHERE js.job_number = 'JOB-2024-002'
AND NOT EXISTS (SELECT 1 FROM job_progress WHERE job_sheet_id = js.id)
LIMIT 1;

-- Final message
SELECT 'Operator database setup completed successfully! All tables created with demo data.' as status; 