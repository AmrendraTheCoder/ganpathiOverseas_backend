-- =====================================================
-- GANPATHI OVERSEAS - OPERATOR DATABASE SETUP (COMPATIBLE)
-- Works with existing integer-based schema
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Check what we're working with first
SELECT 'Starting operator database setup (compatible mode)...' as status;

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'finance', 'operator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create machine_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE machine_type AS ENUM ('offset', 'digital', 'finishing', 'cutting', 'binding', 'lamination');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create machine_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE machine_status AS ENUM ('idle', 'running', 'maintenance', 'breakdown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create job_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to users table if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role user_role DEFAULT 'operator';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'salary') THEN
        ALTER TABLE users ADD COLUMN salary DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hire_date') THEN
        ALTER TABLE users ADD COLUMN hire_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Create machines table with integer ID to match existing schema
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type machine_type NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100),
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

-- Add missing columns to job_sheets table if they don't exist
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'paper_type') THEN
        ALTER TABLE job_sheets ADD COLUMN paper_type VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'paper_size') THEN
        ALTER TABLE job_sheets ADD COLUMN paper_size VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'colors') THEN
        ALTER TABLE job_sheets ADD COLUMN colors VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'estimated_cost') THEN
        ALTER TABLE job_sheets ADD COLUMN estimated_cost DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'selling_price') THEN
        ALTER TABLE job_sheets ADD COLUMN selling_price DECIMAL(12,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'order_date') THEN
        ALTER TABLE job_sheets ADD COLUMN order_date DATE DEFAULT CURRENT_DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'created_by') THEN
        ALTER TABLE job_sheets ADD COLUMN created_by UUID REFERENCES auth.users(id);
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
END $$;

-- Create job schedules table using integer IDs to match existing schema
CREATE TABLE IF NOT EXISTS job_schedules (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    machine_id INTEGER NOT NULL REFERENCES machines(id),
    
    -- Schedule details
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    
    -- Actual timing
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    actual_duration_minutes INTEGER,
    
    -- Notes
    notes TEXT,
    rescheduled_reason TEXT,
    
    -- Audit
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create detailed time logs table for operators using integer IDs
CREATE TABLE IF NOT EXISTS time_logs (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    machine_id INTEGER REFERENCES machines(id),
    
    -- Time tracking
    clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    break_start_time TIMESTAMP WITH TIME ZONE,
    break_end_time TIMESTAMP WITH TIME ZONE,
    total_work_minutes INTEGER,
    total_break_minutes INTEGER DEFAULT 0,
    
    -- Work details
    task_description TEXT NOT NULL,
    work_stage VARCHAR(100) NOT NULL,
    quantity_processed INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'break', 'completed', 'paused')),
    
    -- Notes
    notes TEXT,
    issues_reported TEXT,
    
    -- Metrics
    productivity_score DECIMAL(5,2), -- calculated metric
    quality_score DECIMAL(5,2), -- supervisor rating
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job progress table using integer IDs
CREATE TABLE IF NOT EXISTS job_progress (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    quantity_completed INTEGER DEFAULT 0,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    estimated_completion TIMESTAMP WITH TIME ZONE,
    issues_encountered TEXT,
    resolution_notes TEXT,
    progress_photos TEXT[],
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    operator_id UUID REFERENCES auth.users(id),
    notes TEXT,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_schedules_operator ON job_schedules(operator_id);
CREATE INDEX IF NOT EXISTS idx_job_schedules_machine ON job_schedules(machine_id);
CREATE INDEX IF NOT EXISTS idx_job_schedules_date ON job_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_job_schedules_status ON job_schedules(status);
CREATE INDEX IF NOT EXISTS idx_job_schedules_job ON job_schedules(job_sheet_id);

CREATE INDEX IF NOT EXISTS idx_time_logs_operator ON time_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_job ON time_logs(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_time_logs_status ON time_logs(status);

CREATE INDEX IF NOT EXISTS idx_machines_current_operator ON machines(current_operator_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

CREATE INDEX IF NOT EXISTS idx_job_sheets_assigned_to ON job_sheets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_sheets_status ON job_sheets(status);
CREATE INDEX IF NOT EXISTS idx_job_sheets_priority ON job_sheets(priority);

CREATE INDEX IF NOT EXISTS idx_job_progress_job ON job_progress(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_job_progress_operator ON job_progress(operator_id);

-- Enable RLS on new tables
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;

-- Create basic policies (drop first if they exist, then create)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON machines;
CREATE POLICY "Allow all for authenticated users" ON machines FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON job_schedules;
CREATE POLICY "Allow all for authenticated users" ON job_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON time_logs;
CREATE POLICY "Allow all for authenticated users" ON time_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON job_progress;
CREATE POLICY "Allow all for authenticated users" ON job_progress FOR ALL USING (true);

-- =====================================================
-- DEMO DATA INSERTION
-- =====================================================

-- Insert demo users into auth.users (if they don't exist)
INSERT INTO auth.users (id, email, created_at, updated_at, email_confirmed_at, encrypted_password)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'admin@ganpathioverseas.com', NOW(), NOW(), NOW(), '$2a$10$example'),
    ('22222222-2222-2222-2222-222222222222', 'supervisor@ganpathioverseas.com', NOW(), NOW(), NOW(), '$2a$10$example'),
    ('33333333-3333-3333-3333-333333333333', 'finance@ganpathioverseas.com', NOW(), NOW(), NOW(), '$2a$10$example'),
    ('44444444-4444-4444-4444-444444444444', 'operator1@ganpathioverseas.com', NOW(), NOW(), NOW(), '$2a$10$example'),
    ('55555555-5555-5555-5555-555555555555', 'operator2@ganpathioverseas.com', NOW(), NOW(), NOW(), '$2a$10$example')
ON CONFLICT (id) DO NOTHING;

-- Insert demo users into users table
INSERT INTO users (id, username, full_name, email, role, phone, address, salary) VALUES
('11111111-1111-1111-1111-111111111111', 'admin', 'Rajesh Kumar', 'admin@ganpathioverseas.com', 'admin', '+91 98765 43210', 'Mumbai, Maharashtra', 80000),
('22222222-2222-2222-2222-222222222222', 'supervisor', 'Priya Sharma', 'supervisor@ganpathioverseas.com', 'supervisor', '+91 98765 43211', 'Mumbai, Maharashtra', 60000),
('33333333-3333-3333-3333-333333333333', 'finance', 'Amit Patel', 'finance@ganpathioverseas.com', 'finance', '+91 98765 43212', 'Mumbai, Maharashtra', 55000),
('44444444-4444-4444-4444-444444444444', 'operator1', 'Suresh Yadav', 'operator1@ganpathioverseas.com', 'operator', '+91 98765 43213', 'Mumbai, Maharashtra', 35000),
('55555555-5555-5555-5555-555555555555', 'operator2', 'Deepak Singh', 'operator2@ganpathioverseas.com', 'operator', '+91 98765 43214', 'Mumbai, Maharashtra', 38000)
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    salary = EXCLUDED.salary;

-- Insert demo machines (using SERIAL ID so we can reference them)
INSERT INTO machines (name, type, model, serial_number, current_operator_id, hourly_rate, status) VALUES
('Offset Press 1', 'offset', 'HP Indigo 12000', 'HP12000-2022-001', '44444444-4444-4444-4444-444444444444', 500, 'idle'),
('Digital Press 1', 'digital', 'Xerox Versant 180', 'XV180-2021-002', '55555555-5555-5555-5555-555555555555', 300, 'idle'),
('Cutting Machine', 'cutting', 'Polar 115X', 'P115X-2020-003', '44444444-4444-4444-4444-444444444444', 150, 'idle'),
('Lamination Unit', 'lamination', 'GMP Saturn 540', 'GMP540-2021-004', '55555555-5555-5555-5555-555555555555', 200, 'idle');

-- Insert demo job sheets (update existing or insert new based on existing structure)
INSERT INTO job_sheets (
    job_number, title, description, party_id, status, priority, quantity, colors, 
    paper_type, paper_size, estimated_cost, selling_price, due_date, assigned_to, 
    machine_id, created_by, job_date
) VALUES
('JOB000001', 'Business Card Printing', '1000 premium business cards with spot UV finish', 
 (SELECT id FROM parties LIMIT 1), 'in_progress', 2, 1000, '4+0', 
 'Art Card 300gsm', '90mm x 54mm', 3500, 5000, CURRENT_DATE + INTERVAL '5 days', 
 '44444444-4444-4444-4444-444444444444', 2, '22222222-2222-2222-2222-222222222222', CURRENT_DATE),
 
('JOB000002', 'Brochure Printing', '500 tri-fold brochures for marketing campaign', 
 (SELECT id FROM parties LIMIT 1), 'pending', 1, 500, '4+4', 
 'Art Paper 150gsm', 'A4 tri-fold', 8000, 12000, CURRENT_DATE + INTERVAL '7 days', 
 '55555555-5555-5555-5555-555555555555', 1, '22222222-2222-2222-2222-222222222222', CURRENT_DATE),
 
('JOB000003', 'Annual Report Printing', '200 copies of 50-page annual report', 
 (SELECT id FROM parties LIMIT 1), 'in_progress', 3, 200, '4+4', 
 'Art Paper 120gsm', 'A4', 15000, 22000, CURRENT_DATE + INTERVAL '10 days', 
 '44444444-4444-4444-4444-444444444444', 1, '22222222-2222-2222-2222-222222222222', CURRENT_DATE)
ON CONFLICT (job_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    assigned_to = EXCLUDED.assigned_to;

-- Insert demo schedules for today and upcoming days
INSERT INTO job_schedules (job_sheet_id, operator_id, machine_id, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_duration_minutes, status, created_by) VALUES
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), '44444444-4444-4444-4444-444444444444', 2, CURRENT_DATE, '09:00:00', '12:00:00', 180, 'scheduled', '22222222-2222-2222-2222-222222222222'),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000002'), '55555555-5555-5555-5555-555555555555', 1, CURRENT_DATE, '14:00:00', '17:00:00', 180, 'scheduled', '22222222-2222-2222-2222-222222222222'),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000003'), '44444444-4444-4444-4444-444444444444', 1, CURRENT_DATE + INTERVAL '1 day', '09:00:00', '16:00:00', 420, 'scheduled', '22222222-2222-2222-2222-222222222222');

-- Insert demo job progress
INSERT INTO job_progress (job_sheet_id, stage, status, progress_percentage, quantity_completed, operator_id, started_at, notes) VALUES
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), 'design_approval', 'completed', 100, 1000, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days', 'Design approved by client'),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), 'printing', 'in_progress', 60, 600, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 hours', 'Printing in progress, good quality'),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000002'), 'design_approval', 'pending', 0, 0, '55555555-5555-5555-5555-555555555555', NULL, 'Waiting for client approval'),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000003'), 'design_approval', 'completed', 100, 200, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day', 'Design finalized'),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000003'), 'printing', 'in_progress', 30, 60, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 hours', 'Annual report printing started');

-- Insert demo time logs for today
INSERT INTO time_logs (job_sheet_id, operator_id, machine_id, clock_in_time, task_description, work_stage, quantity_processed, status, total_work_minutes) VALUES
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), '44444444-4444-4444-4444-444444444444', 2, NOW() - INTERVAL '2 hours', 'Setting up business card printing job', 'printing', 600, 'active', 120),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000003'), '44444444-4444-4444-4444-444444444444', 1, NOW() - INTERVAL '1 hour', 'Continuing annual report printing', 'printing', 50, 'active', 60);

-- Final success message
SELECT 'Operator database setup completed successfully! ✅' as message, 
       'Tables created: machines, job_schedules, time_logs, job_progress' as tables_created,
       'Demo data: 5 users, 4 machines, 3 jobs, schedules, and time logs' as demo_data,
       'Compatible with existing integer-based schema' as compatibility; 