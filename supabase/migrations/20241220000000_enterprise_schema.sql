-- Enterprise Job Management System Database Schema
-- Created: 2024-12-20
-- Purpose: Comprehensive role-based job management system

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- 1. USER ROLES ENUM
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'finance', 'operator');

-- 2. JOB STATUS ENUM  
CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- 3. EXPENSE CATEGORIES ENUM
CREATE TYPE expense_category AS ENUM ('ink', 'salary', 'electricity', 'rent', 'chemicals', 'maintenance', 'other');

-- 4. MACHINE TYPES ENUM
CREATE TYPE machine_type AS ENUM ('offset', 'digital', 'finishing', 'cutting', 'binding', 'lamination');

-- 5. USERS TABLE (Extended from auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    phone VARCHAR(20),
    address TEXT,
    hire_date DATE DEFAULT CURRENT_DATE,
    salary DECIMAL(10,2) DEFAULT 0,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PARTIES TABLE (Customers/Clients)
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    postal_code VARCHAR(10),
    gst_number VARCHAR(20),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. MACHINES TABLE
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type machine_type NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    maintenance_date DATE,
    operator_id UUID REFERENCES auth.users(id),
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. JOB SHEETS TABLE
CREATE TABLE job_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    party_id UUID REFERENCES parties(id) NOT NULL,
    machine_id UUID REFERENCES machines(id),
    assigned_to UUID REFERENCES auth.users(id),
    status job_status DEFAULT 'pending',
    priority INTEGER DEFAULT 1, -- 1=Low, 2=Medium, 3=High, 4=Urgent
    
    -- Specifications
    paper_type VARCHAR(100),
    paper_size VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    colors VARCHAR(50),
    finishing_requirements TEXT,
    
    -- Pricing
    estimated_cost DECIMAL(12,2) DEFAULT 0,
    actual_cost DECIMAL(12,2) DEFAULT 0,
    selling_price DECIMAL(12,2) DEFAULT 0,
    
    -- Dates
    order_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Files and attachments
    design_files TEXT[], -- Array of file URLs
    sample_images TEXT[], -- Array of image URLs
    completion_photos TEXT[], -- Photos of completed work
    
    -- Additional details
    special_instructions TEXT,
    client_feedback TEXT,
    internal_notes TEXT,
    
    -- Audit fields
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- 9. EXPENSES TABLE
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category expense_category NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    job_id UUID REFERENCES job_sheets(id), -- Optional: link to specific job
    vendor_name VARCHAR(100),
    invoice_number VARCHAR(50),
    payment_method VARCHAR(50) DEFAULT 'cash',
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20), -- monthly, quarterly, annually
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- 10. PARTY TRANSACTIONS TABLE (Invoices and Payments)
CREATE TABLE party_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID REFERENCES parties(id) NOT NULL,
    job_id UUID REFERENCES job_sheets(id), -- Optional: link to specific job
    type VARCHAR(20) NOT NULL CHECK (type IN ('invoice', 'payment', 'credit', 'debit')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    invoice_url TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- 11. JOB PROGRESS TABLE (Track job progress with timestamps)
CREATE TABLE job_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES job_sheets(id) NOT NULL,
    stage VARCHAR(100) NOT NULL, -- e.g., 'Design', 'Printing', 'Finishing', 'Quality Check'
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    operator_id UUID REFERENCES auth.users(id),
    notes TEXT,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. SYSTEM SETTINGS TABLE
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_editable BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_parties_is_active ON parties(is_active);
CREATE INDEX idx_job_sheets_status ON job_sheets(status);
CREATE INDEX idx_job_sheets_party_id ON job_sheets(party_id);
CREATE INDEX idx_job_sheets_assigned_to ON job_sheets(assigned_to);
CREATE INDEX idx_job_sheets_due_date ON job_sheets(due_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_party_transactions_party_id ON party_transactions(party_id);
CREATE INDEX idx_party_transactions_type ON party_transactions(type);
CREATE INDEX idx_party_transactions_status ON party_transactions(status);
CREATE INDEX idx_job_progress_job_id ON job_progress(job_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- CREATE UPDATED_AT TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_job_sheets_updated_at BEFORE UPDATE ON job_sheets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_party_transactions_updated_at BEFORE UPDATE ON party_transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- INSERT DEFAULT SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES
('company_name', 'Ganpathi Overseas', 'Company name for invoices and reports', 'company'),
('company_address', '', 'Company address for invoices', 'company'),
('company_phone', '', 'Company phone number', 'company'),
('company_email', '', 'Company email address', 'company'),
('company_gst', '', 'Company GST number', 'company'),
('default_credit_days', '30', 'Default credit days for new parties', 'finance'),
('job_number_prefix', 'JOB', 'Prefix for auto-generated job numbers', 'jobs'),
('invoice_number_prefix', 'INV', 'Prefix for auto-generated invoice numbers', 'finance'),
('backup_frequency', 'daily', 'Database backup frequency', 'system'),
('max_file_upload_size', '10', 'Maximum file upload size in MB', 'system');

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY; 