-- =====================================================
-- GANPATHI OVERSEAS - OPERATOR DATABASE SETUP
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Add additional machine status enum values if not exists
DO $$ BEGIN
    CREATE TYPE machine_status AS ENUM ('idle', 'running', 'maintenance', 'breakdown');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add machine status column to machines table if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'status') THEN
        ALTER TABLE machines ADD COLUMN status machine_status DEFAULT 'idle';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'machines' AND column_name = 'current_operator_id') THEN
        ALTER TABLE machines ADD COLUMN current_operator_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create job schedules table for operator scheduling
CREATE TABLE IF NOT EXISTS job_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    machine_id UUID NOT NULL REFERENCES machines(id),
    
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

-- Create detailed time logs table for operators
CREATE TABLE IF NOT EXISTS time_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_sheet_id UUID NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES auth.users(id),
    machine_id UUID REFERENCES machines(id),
    
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

-- Enhance job_progress table with more operator-specific fields if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'progress_percentage') THEN
        ALTER TABLE job_progress ADD COLUMN progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'quantity_completed') THEN
        ALTER TABLE job_progress ADD COLUMN quantity_completed INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'quality_rating') THEN
        ALTER TABLE job_progress ADD COLUMN quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'estimated_completion') THEN
        ALTER TABLE job_progress ADD COLUMN estimated_completion TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'issues_encountered') THEN
        ALTER TABLE job_progress ADD COLUMN issues_encountered TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'resolution_notes') THEN
        ALTER TABLE job_progress ADD COLUMN resolution_notes TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'progress_photos') THEN
        ALTER TABLE job_progress ADD COLUMN progress_photos TEXT[];
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_schedules_operator ON job_schedules(operator_id);
CREATE INDEX IF NOT EXISTS idx_job_schedules_machine ON job_schedules(machine_id);
CREATE INDEX IF NOT EXISTS idx_job_schedules_date ON job_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_job_schedules_status ON job_schedules(status);

CREATE INDEX IF NOT EXISTS idx_time_logs_operator ON time_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_job ON time_logs(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(clock_in_time);
CREATE INDEX IF NOT EXISTS idx_time_logs_status ON time_logs(status);

CREATE INDEX IF NOT EXISTS idx_machines_current_operator ON machines(current_operator_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

-- Create or replace function to generate job numbers
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    job_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_id
    FROM job_sheets
    WHERE job_number ~ '^JOB[0-9]+$';
    
    job_number := 'JOB' || LPAD(next_id::TEXT, 6, '0');
    RETURN job_number;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at if the function exists
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_job_schedules_updated_at ON job_schedules;
        CREATE TRIGGER update_job_schedules_updated_at 
            BEFORE UPDATE ON job_schedules
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
        DROP TRIGGER IF EXISTS update_time_logs_updated_at ON time_logs;
        CREATE TRIGGER update_time_logs_updated_at 
            BEFORE UPDATE ON time_logs
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE job_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Create basic policies (allow all for now - can be refined later)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON job_schedules;
CREATE POLICY "Allow all for authenticated users" ON job_schedules
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users" ON time_logs;
CREATE POLICY "Allow all for authenticated users" ON time_logs
    FOR ALL USING (true);

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

-- Insert demo parties
INSERT INTO parties (id, name, contact_person, phone, email, address, city, state, gst_number, credit_limit, current_balance, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ABC Corporation', 'Ravi Gupta', '+91 99888 77766', 'ravi@abccorp.com', '123 Business Park, Andheri East', 'Mumbai', 'Maharashtra', '27ABCDE1234F1Z5', 500000, 45000, '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'XYZ Industries', 'Sunita Joshi', '+91 99888 77767', 'sunita@xyzind.com', '456 Industrial Area, Powai', 'Mumbai', 'Maharashtra', '27XYZAB5678G2H3', 300000, 125000, '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tech Solutions Pvt Ltd', 'Manoj Kumar', '+91 99888 77768', 'manoj@techsol.com', '789 Tech Hub, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '27TECHP9012I3J4', 200000, 75000, '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    contact_person = EXCLUDED.contact_person,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- Insert demo machines
INSERT INTO machines (id, name, type, model, serial_number, current_operator_id, hourly_rate, status) VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Offset Press 1', 'offset', 'HP Indigo 12000', 'HP12000-2022-001', '44444444-4444-4444-4444-444444444444', 500, 'idle'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Digital Press 1', 'digital', 'Xerox Versant 180', 'XV180-2021-002', '55555555-5555-5555-5555-555555555555', 300, 'idle'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Cutting Machine', 'cutting', 'Polar 115X', 'P115X-2020-003', '44444444-4444-4444-4444-444444444444', 150, 'idle'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Lamination Unit', 'lamination', 'GMP Saturn 540', 'GMP540-2021-004', '55555555-5555-5555-5555-555555555555', 200, 'idle')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    model = EXCLUDED.model,
    current_operator_id = EXCLUDED.current_operator_id,
    status = EXCLUDED.status;

-- Insert demo job sheets
INSERT INTO job_sheets (id, job_number, title, description, party_id, status, priority, quantity, colors, paper_type, paper_size, estimated_cost, selling_price, due_date, assigned_to, machine_id, created_by) VALUES
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'JOB000001', 'Business Card Printing', '1000 premium business cards with spot UV finish', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'in_progress', 2, 1000, '4+0', 'Art Card 300gsm', '90mm x 54mm', 3500, 5000, CURRENT_DATE + INTERVAL '5 days', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'JOB000002', 'Brochure Printing', '500 tri-fold brochures for marketing campaign', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pending', 1, 500, '4+4', 'Art Paper 150gsm', 'A4 tri-fold', 8000, 12000, CURRENT_DATE + INTERVAL '7 days', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222'),
('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'JOB000003', 'Annual Report Printing', '200 copies of 50-page annual report', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'in_progress', 3, 200, '4+4', 'Art Paper 120gsm', 'A4', 15000, 22000, CURRENT_DATE + INTERVAL '10 days', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    assigned_to = EXCLUDED.assigned_to;

-- Insert demo schedules for today and upcoming days
INSERT INTO job_schedules (id, job_id, operator_id, machine_id, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_duration_minutes, status, created_by) VALUES
('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', CURRENT_DATE, '09:00:00', '12:00:00', 180, 'scheduled', '22222222-2222-2222-2222-222222222222'),
('llllllll-llll-llll-llll-llllllllllll', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE, '14:00:00', '17:00:00', 180, 'scheduled', '22222222-2222-2222-2222-222222222222'),
('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', CURRENT_DATE + INTERVAL '1 day', '09:00:00', '16:00:00', 420, 'scheduled', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- Insert demo job progress
INSERT INTO job_progress (id, job_id, stage, status, progress_percentage, quantity_completed, operator_id, started_at, notes) VALUES
('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'design_approval', 'completed', 100, 1000, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days', 'Design approved by client'),
('oooooooo-oooo-oooo-oooo-oooooooooooo', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'printing', 'in_progress', 60, 600, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 hours', 'Printing in progress, good quality'),
('pppppppp-pppp-pppp-pppp-pppppppppppp', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'design_approval', 'pending', 0, 0, '55555555-5555-5555-5555-555555555555', NULL, 'Waiting for client approval'),
('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'design_approval', 'completed', 100, 200, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day', 'Design finalized'),
('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'printing', 'in_progress', 30, 60, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 hours', 'Annual report printing started')
ON CONFLICT (id) DO NOTHING;

-- Insert demo time logs for today
INSERT INTO time_logs (id, job_sheet_id, operator_id, machine_id, clock_in_time, task_description, work_stage, quantity_processed, status, total_work_minutes) VALUES
('ssssssss-ssss-ssss-ssss-ssssssssssss', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW() - INTERVAL '2 hours', 'Setting up business card printing job', 'printing', 600, 'active', 120),
('tttttttt-tttt-tttt-tttt-tttttttttttt', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', '44444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '1 hour', 'Continuing annual report printing', 'printing', 50, 'active', 60)
ON CONFLICT (id) DO NOTHING;

-- Add comments
COMMENT ON TABLE job_schedules IS 'Daily/weekly scheduling of jobs to operators and machines';
COMMENT ON TABLE time_logs IS 'Detailed time tracking for operators with clock in/out functionality';
COMMENT ON COLUMN job_progress.progress_percentage IS 'Percentage completion of the job stage (0-100)';
COMMENT ON COLUMN job_progress.quantity_completed IS 'Number of units completed in this stage';
COMMENT ON COLUMN time_logs.productivity_score IS 'Calculated productivity metric based on time and output';
COMMENT ON COLUMN time_logs.quality_score IS 'Quality rating given by supervisor (1-5)';

-- Final success message
SELECT 'Operator database setup completed successfully!' as message; 