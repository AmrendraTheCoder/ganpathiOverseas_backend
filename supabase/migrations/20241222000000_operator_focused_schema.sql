-- =====================================================
-- GANPATHI OVERSEAS - OPERATOR FOCUSED DATABASE SCHEMA
-- =====================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.time_logs CASCADE;
DROP TABLE IF EXISTS public.job_assignments CASCADE;
DROP TABLE IF EXISTS public.job_schedules CASCADE;
DROP TABLE IF EXISTS public.job_progress CASCADE;
DROP TABLE IF EXISTS public.job_sheets CASCADE;
DROP TABLE IF EXISTS public.machines CASCADE;
DROP TABLE IF EXISTS public.parties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (operators, supervisors, etc.)
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'finance', 'operator')),
    phone VARCHAR(20),
    address TEXT,
    salary DECIMAL(10,2),
    hire_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parties (customers/suppliers)
CREATE TABLE public.parties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    gst_number VARCHAR(50),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Machines
CREATE TABLE public.machines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    machine_type VARCHAR(50) NOT NULL CHECK (machine_type IN ('offset', 'digital', 'finishing', 'cutting', 'binding', 'lamination')),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    maintenance_date DATE,
    current_operator_id INTEGER REFERENCES public.users(id),
    hourly_rate DECIMAL(8,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'maintenance', 'breakdown')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Sheets (main job orders)
CREATE TABLE public.job_sheets (
    id SERIAL PRIMARY KEY,
    job_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    party_id INTEGER NOT NULL REFERENCES public.parties(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    quantity INTEGER NOT NULL,
    
    -- Job specifications
    colors VARCHAR(50),
    paper_type VARCHAR(100),
    size VARCHAR(50),
    finishing_requirements TEXT,
    
    -- Financials
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    selling_price DECIMAL(12,2) DEFAULT 0,
    
    -- Dates
    order_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    estimated_start_date DATE,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    estimated_completion_date DATE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    assigned_operator_id INTEGER REFERENCES public.users(id),
    assigned_machine_id INTEGER REFERENCES public.machines(id),
    
    -- Files and notes
    design_files TEXT[], -- Array of file URLs
    sample_images TEXT[], -- Array of image URLs
    completion_photos TEXT[], -- Array of completion image URLs
    special_instructions TEXT,
    client_feedback TEXT,
    internal_notes TEXT,
    
    -- Audit
    created_by INTEGER REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Schedules (daily/weekly scheduling)
CREATE TABLE public.job_schedules (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES public.job_sheets(id) ON DELETE CASCADE,
    operator_id INTEGER NOT NULL REFERENCES public.users(id),
    machine_id INTEGER NOT NULL REFERENCES public.machines(id),
    
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
    created_by INTEGER REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Progress (detailed progress tracking)
CREATE TABLE public.job_progress (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES public.job_sheets(id) ON DELETE CASCADE,
    stage VARCHAR(100) NOT NULL, -- 'design_approval', 'printing', 'cutting', 'finishing', etc.
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'blocked', 'cancelled')),
    
    -- Progress details
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    quantity_completed INTEGER DEFAULT 0,
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    
    -- Assignment
    operator_id INTEGER REFERENCES public.users(id),
    machine_id INTEGER REFERENCES public.machines(id),
    
    -- Notes and issues
    notes TEXT,
    issues_encountered TEXT,
    resolution_notes TEXT,
    
    -- Files
    progress_photos TEXT[], -- Array of progress photo URLs
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Logs (detailed time tracking for operators)
CREATE TABLE public.time_logs (
    id SERIAL PRIMARY KEY,
    job_sheet_id INTEGER NOT NULL REFERENCES public.job_sheets(id) ON DELETE CASCADE,
    operator_id INTEGER NOT NULL REFERENCES public.users(id),
    machine_id INTEGER REFERENCES public.machines(id),
    
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

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_active ON public.users(is_active);

-- Job sheets indexes
CREATE INDEX idx_job_sheets_status ON public.job_sheets(status);
CREATE INDEX idx_job_sheets_assigned_operator ON public.job_sheets(assigned_operator_id);
CREATE INDEX idx_job_sheets_assigned_machine ON public.job_sheets(assigned_machine_id);
CREATE INDEX idx_job_sheets_due_date ON public.job_sheets(due_date);
CREATE INDEX idx_job_sheets_priority ON public.job_sheets(priority);

-- Job schedules indexes
CREATE INDEX idx_job_schedules_operator ON public.job_schedules(operator_id);
CREATE INDEX idx_job_schedules_machine ON public.job_schedules(machine_id);
CREATE INDEX idx_job_schedules_date ON public.job_schedules(scheduled_date);
CREATE INDEX idx_job_schedules_status ON public.job_schedules(status);

-- Time logs indexes
CREATE INDEX idx_time_logs_operator ON public.time_logs(operator_id);
CREATE INDEX idx_time_logs_job ON public.time_logs(job_sheet_id);
CREATE INDEX idx_time_logs_date ON public.time_logs(clock_in_time);
CREATE INDEX idx_time_logs_status ON public.time_logs(status);

-- Job progress indexes
CREATE INDEX idx_job_progress_job ON public.job_progress(job_sheet_id);
CREATE INDEX idx_job_progress_operator ON public.job_progress(operator_id);
CREATE INDEX idx_job_progress_status ON public.job_progress(status);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - For now, allow all operations for authenticated users
-- (can be refined later for specific role-based access)

CREATE POLICY "Enable all operations for authenticated users" ON public.users
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.parties
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.machines
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.job_sheets
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.job_schedules
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.job_progress
    FOR ALL USING (true);

CREATE POLICY "Enable all operations for authenticated users" ON public.time_logs
    FOR ALL USING (true);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_sheets_updated_at BEFORE UPDATE ON public.job_sheets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_schedules_updated_at BEFORE UPDATE ON public.job_schedules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_progress_updated_at BEFORE UPDATE ON public.job_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_logs_updated_at BEFORE UPDATE ON public.time_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate job numbers
CREATE OR REPLACE FUNCTION public.generate_job_number()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
    job_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_id
    FROM public.job_sheets
    WHERE job_number ~ '^JOB[0-9]+$';
    
    job_number := 'JOB' || LPAD(next_id::TEXT, 6, '0');
    RETURN job_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert demo users
INSERT INTO public.users (username, email, password_hash, name, role, phone, address, salary) VALUES
('admin', 'admin@ganpathioverseas.com', 'password', 'Rajesh Kumar', 'admin', '+91 98765 43210', 'Mumbai, Maharashtra', 80000),
('supervisor', 'supervisor@ganpathioverseas.com', 'password', 'Priya Sharma', 'supervisor', '+91 98765 43211', 'Mumbai, Maharashtra', 60000),
('finance', 'finance@ganpathioverseas.com', 'password', 'Amit Patel', 'finance', '+91 98765 43212', 'Mumbai, Maharashtra', 55000),
('operator1', 'operator1@ganpathioverseas.com', 'password', 'Suresh Yadav', 'operator', '+91 98765 43213', 'Mumbai, Maharashtra', 35000),
('operator2', 'operator2@ganpathioverseas.com', 'password', 'Deepak Singh', 'operator', '+91 98765 43214', 'Mumbai, Maharashtra', 38000);

-- Insert demo parties
INSERT INTO public.parties (name, contact_person, phone, email, address, city, state, gst_number, credit_limit, current_balance) VALUES
('ABC Corporation', 'Ravi Gupta', '+91 99888 77766', 'ravi@abccorp.com', '123 Business Park, Andheri East', 'Mumbai', 'Maharashtra', '27ABCDE1234F1Z5', 500000, 45000),
('XYZ Industries', 'Sunita Joshi', '+91 99888 77767', 'sunita@xyzind.com', '456 Industrial Area, Powai', 'Mumbai', 'Maharashtra', '27XYZAB5678G2H3', 300000, 125000),
('Tech Solutions Pvt Ltd', 'Manoj Kumar', '+91 99888 77768', 'manoj@techsol.com', '789 Tech Hub, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '27TECHP9012I3J4', 200000, 75000);

-- Insert demo machines
INSERT INTO public.machines (name, machine_type, model, serial_number, current_operator_id, hourly_rate, status) VALUES
('Offset Press 1', 'offset', 'HP Indigo 12000', 'HP12000-2022-001', 4, 500, 'idle'),
('Digital Press 1', 'digital', 'Xerox Versant 180', 'XV180-2021-002', 5, 300, 'idle'),
('Cutting Machine', 'cutting', 'Polar 115X', 'P115X-2020-003', 4, 150, 'idle'),
('Lamination Unit', 'lamination', 'GMP Saturn 540', 'GMP540-2021-004', 5, 200, 'idle');

-- Insert demo job sheets
INSERT INTO public.job_sheets (job_number, title, description, party_id, status, priority, quantity, colors, paper_type, size, estimated_cost, selling_price, due_date, assigned_operator_id, assigned_machine_id, created_by) VALUES
('JOB000001', 'Business Card Printing', '1000 premium business cards with spot UV finish', 1, 'scheduled', 2, 1000, '4+0', 'Art Card 300gsm', '90mm x 54mm', 3500, 5000, CURRENT_DATE + INTERVAL '5 days', 4, 2, 2),
('JOB000002', 'Brochure Printing', '500 tri-fold brochures for marketing campaign', 2, 'pending', 1, 500, '4+4', 'Art Paper 150gsm', 'A4 tri-fold', 8000, 12000, CURRENT_DATE + INTERVAL '7 days', 5, 1, 2),
('JOB000003', 'Annual Report Printing', '200 copies of 50-page annual report', 3, 'in_progress', 3, 200, '4+4', 'Art Paper 120gsm', 'A4', 15000, 22000, CURRENT_DATE + INTERVAL '10 days', 4, 1, 2);

-- Insert demo schedules for today and upcoming days
INSERT INTO public.job_schedules (job_sheet_id, operator_id, machine_id, scheduled_date, scheduled_start_time, scheduled_end_time, estimated_duration_minutes, status, created_by) VALUES
(1, 4, 2, CURRENT_DATE, '09:00:00', '12:00:00', 180, 'scheduled', 2),
(2, 5, 1, CURRENT_DATE, '14:00:00', '17:00:00', 180, 'scheduled', 2),
(3, 4, 1, CURRENT_DATE + INTERVAL '1 day', '09:00:00', '16:00:00', 420, 'scheduled', 2);

-- Insert demo job progress
INSERT INTO public.job_progress (job_sheet_id, stage, status, progress_percentage, operator_id, machine_id) VALUES
(1, 'design_approval', 'completed', 100, 4, 2),
(1, 'printing', 'in_progress', 60, 4, 2),
(2, 'design_approval', 'pending', 0, 5, 1),
(3, 'design_approval', 'completed', 100, 4, 1),
(3, 'printing', 'in_progress', 30, 4, 1);

-- Insert demo time logs for today
INSERT INTO public.time_logs (job_sheet_id, operator_id, machine_id, clock_in_time, task_description, work_stage, quantity_processed, status) VALUES
(1, 4, 2, NOW() - INTERVAL '2 hours', 'Setting up business card printing job', 'printing', 600, 'active'),
(3, 4, 1, NOW() - INTERVAL '1 hour', 'Continuing annual report printing', 'printing', 50, 'active');

COMMENT ON TABLE public.users IS 'System users including operators, supervisors, admin, and finance personnel';
COMMENT ON TABLE public.job_sheets IS 'Main job orders with complete specifications and tracking';
COMMENT ON TABLE public.job_schedules IS 'Daily/weekly scheduling of jobs to operators and machines';
COMMENT ON TABLE public.job_progress IS 'Detailed progress tracking for each stage of job completion';
COMMENT ON TABLE public.time_logs IS 'Detailed time tracking for operators with clock in/out functionality';
COMMENT ON TABLE public.machines IS 'Manufacturing machines and equipment';
COMMENT ON TABLE public.parties IS 'Customers and suppliers'; 