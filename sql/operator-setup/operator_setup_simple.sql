-- =====================================================
-- GANPATHI OVERSEAS - OPERATOR DATABASE SETUP (SIMPLE VERSION)
-- Skip user insertion since users already exist
-- Run this SQL in Supabase SQL Editor
-- =====================================================

SELECT 'Starting simple operator database setup...' as status;

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

-- Create operator tables
CREATE TABLE IF NOT EXISTS job_schedules (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    machine_id INTEGER NOT NULL REFERENCES machines(id),
    scheduled_date DATE NOT NULL,
    scheduled_start_time TIME NOT NULL,
    scheduled_end_time TIME NOT NULL,
    estimated_duration_minutes INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    actual_duration_minutes INTEGER,
    notes TEXT,
    rescheduled_reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_logs (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    machine_id INTEGER REFERENCES machines(id),
    clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out_time TIMESTAMP WITH TIME ZONE,
    break_start_time TIMESTAMP WITH TIME ZONE,
    break_end_time TIMESTAMP WITH TIME ZONE,
    total_work_minutes INTEGER,
    total_break_minutes INTEGER DEFAULT 0,
    task_description TEXT NOT NULL,
    work_stage VARCHAR(100) NOT NULL,
    quantity_processed INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'break', 'completed', 'paused')),
    notes TEXT,
    issues_reported TEXT,
    productivity_score DECIMAL(5,2),
    quality_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Enable RLS
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON machines;
CREATE POLICY "Allow all for authenticated users" ON machines FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON job_schedules;
CREATE POLICY "Allow all for authenticated users" ON job_schedules FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON time_logs;
CREATE POLICY "Allow all for authenticated users" ON time_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON job_progress;
CREATE POLICY "Allow all for authenticated users" ON job_progress FOR ALL USING (true);

-- Insert demo machines (users already exist)
INSERT INTO machines (name, type, model, serial_number, current_operator_id, hourly_rate, status) VALUES
('Offset Press 1', 'offset', 'HP Indigo 12000', 'HP12000-001', '44444444-4444-4444-4444-444444444444', 500, 'idle'),
('Digital Press 1', 'digital', 'Xerox Versant 180', 'XV180-002', '55555555-5555-5555-5555-555555555555', 300, 'idle'),
('Cutting Machine', 'cutting', 'Polar 115X', 'P115X-003', '44444444-4444-4444-4444-444444444444', 150, 'idle'),
('Lamination Unit', 'lamination', 'GMP Saturn 540', 'GMP540-004', '55555555-5555-5555-5555-555555555555', 200, 'idle')
ON CONFLICT (serial_number) DO UPDATE SET
    current_operator_id = EXCLUDED.current_operator_id,
    status = EXCLUDED.status;

-- Add missing foreign key constraint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'job_sheets_machine_id_fkey') THEN
        ALTER TABLE job_sheets ADD CONSTRAINT job_sheets_machine_id_fkey FOREIGN KEY (machine_id) REFERENCES machines(id);
    END IF;
END $$;

-- Insert demo job sheets (if they don't exist)
INSERT INTO job_sheets (
    job_number, title, description, party_id, status, priority, quantity, colors, 
    paper_type, paper_size, estimated_cost, selling_price, due_date, assigned_to, 
    machine_id, created_by, job_date
) VALUES
('JOB000001', 'Business Card Printing', '1000 premium business cards with spot UV finish', 
 (SELECT id FROM parties LIMIT 1), 'in_progress', 2, 1000, '4+0', 
 'Art Card 300gsm', '90mm x 54mm', 3500, 5000, CURRENT_DATE + INTERVAL '5 days', 
 '44444444-4444-4444-4444-444444444444', 1, '22222222-2222-2222-2222-222222222222', CURRENT_DATE),
 
('JOB000002', 'Brochure Printing', '500 tri-fold brochures for marketing campaign', 
 (SELECT id FROM parties LIMIT 1), 'pending', 1, 500, '4+4', 
 'Art Paper 150gsm', 'A4 tri-fold', 8000, 12000, CURRENT_DATE + INTERVAL '7 days', 
 '55555555-5555-5555-5555-555555555555', 2, '22222222-2222-2222-2222-222222222222', CURRENT_DATE)
ON CONFLICT (job_number) DO NOTHING;

-- Insert schedules and time logs
INSERT INTO job_schedules (job_sheet_id, operator_id, machine_id, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_duration_minutes, status, created_by) VALUES
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), '44444444-4444-4444-4444-444444444444', 1, CURRENT_DATE, '09:00:00', '12:00:00', 180, 'in_progress', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

INSERT INTO time_logs (job_sheet_id, operator_id, machine_id, clock_in_time, task_description, work_stage, quantity_processed, status) VALUES
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), '44444444-4444-4444-4444-444444444444', 1, NOW() - INTERVAL '2 hours', 'Setting up business card printing job', 'Setup', 0, 'active');

INSERT INTO job_progress (job_sheet_id, stage, status, progress_percentage, quantity_completed, quality_rating, operator_id, time_spent_minutes) VALUES
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), 'Setup', 'completed', 100, 0, 5, '44444444-4444-4444-4444-444444444444', 60),
((SELECT id FROM job_sheets WHERE job_number = 'JOB000001'), 'Printing', 'in_progress', 45, 450, 4, '44444444-4444-4444-4444-444444444444', 120);

SELECT 'Simple operator database setup completed! ✅' as message; 