-- Complete Database Setup for Ganpathi Overseas Enterprise System
-- Run this script in Supabase SQL Editor step by step

-- =====================================================
-- STEP 1: CREATE ENUMS FIRST (MOST IMPORTANT)
-- =====================================================

-- Drop existing types if they exist to avoid conflicts
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS expense_category CASCADE;
DROP TYPE IF EXISTS machine_type CASCADE;

-- Create ENUMs fresh
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'finance', 'operator');
CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE expense_category AS ENUM ('ink', 'salary', 'electricity', 'rent', 'chemicals', 'maintenance', 'other');
CREATE TYPE machine_type AS ENUM ('offset', 'digital', 'finishing', 'cutting', 'binding', 'lamination');

-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- 1. Create or update parties table
CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
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
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to parties table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'is_active') THEN
        ALTER TABLE parties ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'contact_person') THEN
        ALTER TABLE parties ADD COLUMN contact_person VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'phone') THEN
        ALTER TABLE parties ADD COLUMN phone VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'email') THEN
        ALTER TABLE parties ADD COLUMN email VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'address') THEN
        ALTER TABLE parties ADD COLUMN address TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'city') THEN
        ALTER TABLE parties ADD COLUMN city VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'state') THEN
        ALTER TABLE parties ADD COLUMN state VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'postal_code') THEN
        ALTER TABLE parties ADD COLUMN postal_code VARCHAR(10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'gst_number') THEN
        ALTER TABLE parties ADD COLUMN gst_number VARCHAR(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'credit_limit') THEN
        ALTER TABLE parties ADD COLUMN credit_limit DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'current_balance') THEN
        ALTER TABLE parties ADD COLUMN current_balance DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'notes') THEN
        ALTER TABLE parties ADD COLUMN notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'created_by') THEN
        ALTER TABLE parties ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'created_at') THEN
        ALTER TABLE parties ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'updated_at') THEN
        ALTER TABLE parties ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. USERS TABLE (Extended from auth.users)
CREATE TABLE IF NOT EXISTS users (
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

-- 3. MACHINES TABLE
CREATE TABLE IF NOT EXISTS machines (
    id SERIAL PRIMARY KEY,
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

-- 4. Add missing columns to existing job_sheets table if they don't exist
DO $$ 
BEGIN
    -- Add job_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'job_number') THEN
        ALTER TABLE job_sheets ADD COLUMN job_number VARCHAR(50) UNIQUE;
        -- Generate job numbers for existing records
        UPDATE job_sheets SET job_number = 'JOB' || LPAD(id::text, 6, '0') WHERE job_number IS NULL;
        ALTER TABLE job_sheets ALTER COLUMN job_number SET NOT NULL;
    END IF;

    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'title') THEN
        ALTER TABLE job_sheets ADD COLUMN title VARCHAR(200);
        UPDATE job_sheets SET title = COALESCE(description, 'Untitled Job') WHERE title IS NULL;
        ALTER TABLE job_sheets ALTER COLUMN title SET NOT NULL;
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'status') THEN
        ALTER TABLE job_sheets ADD COLUMN status job_status DEFAULT 'pending';
    END IF;

    -- Add machine_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'machine_id') THEN
        ALTER TABLE job_sheets ADD COLUMN machine_id INTEGER REFERENCES machines(id);
    END IF;

    -- Add assigned_to column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'assigned_to') THEN
        ALTER TABLE job_sheets ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
    END IF;

    -- Add priority column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'priority') THEN
        ALTER TABLE job_sheets ADD COLUMN priority INTEGER DEFAULT 1;
    END IF;

    -- Add pricing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'estimated_cost') THEN
        ALTER TABLE job_sheets ADD COLUMN estimated_cost DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'actual_cost') THEN
        ALTER TABLE job_sheets ADD COLUMN actual_cost DECIMAL(12,2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'selling_price') THEN
        ALTER TABLE job_sheets ADD COLUMN selling_price DECIMAL(12,2) DEFAULT 0;
    END IF;

    -- Add date columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'order_date') THEN
        ALTER TABLE job_sheets ADD COLUMN order_date DATE DEFAULT CURRENT_DATE;
        UPDATE job_sheets SET order_date = job_date WHERE order_date IS NULL AND job_date IS NOT NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'due_date') THEN
        ALTER TABLE job_sheets ADD COLUMN due_date DATE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'started_at') THEN
        ALTER TABLE job_sheets ADD COLUMN started_at TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'completed_at') THEN
        ALTER TABLE job_sheets ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add file columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'design_files') THEN
        ALTER TABLE job_sheets ADD COLUMN design_files TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'sample_images') THEN
        ALTER TABLE job_sheets ADD COLUMN sample_images TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'completion_photos') THEN
        ALTER TABLE job_sheets ADD COLUMN completion_photos TEXT[];
    END IF;

    -- Add additional detail columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'special_instructions') THEN
        ALTER TABLE job_sheets ADD COLUMN special_instructions TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'client_feedback') THEN
        ALTER TABLE job_sheets ADD COLUMN client_feedback TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'internal_notes') THEN
        ALTER TABLE job_sheets ADD COLUMN internal_notes TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'created_by') THEN
        ALTER TABLE job_sheets ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;

    -- Add quantity column if it doesn't exist (you have imp which might be similar)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'quantity') THEN
        ALTER TABLE job_sheets ADD COLUMN quantity INTEGER DEFAULT 0;
        UPDATE job_sheets SET quantity = COALESCE(imp, 0) WHERE quantity = 0;
    END IF;

    -- Add colors column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'colors') THEN
        ALTER TABLE job_sheets ADD COLUMN colors VARCHAR(50);
    END IF;

    -- Add finishing_requirements column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'finishing_requirements') THEN
        ALTER TABLE job_sheets ADD COLUMN finishing_requirements TEXT;
    END IF;

    -- Add is_deleted column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'is_deleted') THEN
        ALTER TABLE job_sheets ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;

END $$;

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    category expense_category NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    job_id INTEGER REFERENCES job_sheets(id),
    vendor_name VARCHAR(100),
    invoice_number VARCHAR(50),
    payment_method VARCHAR(50) DEFAULT 'cash',
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- 6. PARTY TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS party_transactions (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id) NOT NULL,
    job_id INTEGER REFERENCES job_sheets(id),
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
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- 7. JOB PROGRESS TABLE
CREATE TABLE IF NOT EXISTS job_progress (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES job_sheets(id) NOT NULL,
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    operator_id UUID REFERENCES auth.users(id),
    notes TEXT,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_editable BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES
-- =====================================================

DO $$ BEGIN
    -- Only create indexes if the columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'is_active') THEN
        CREATE INDEX IF NOT EXISTS idx_parties_is_active ON parties(is_active);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_job_sheets_status ON job_sheets(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'party_id') THEN
        CREATE INDEX IF NOT EXISTS idx_job_sheets_party_id ON job_sheets(party_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'assigned_to') THEN
        CREATE INDEX IF NOT EXISTS idx_job_sheets_assigned_to ON job_sheets(assigned_to);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'due_date') THEN
        CREATE INDEX IF NOT EXISTS idx_job_sheets_due_date ON job_sheets(due_date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'job_number') THEN
        CREATE INDEX IF NOT EXISTS idx_job_sheets_job_number ON job_sheets(job_number);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'category') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'expense_date') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'job_id') THEN
        CREATE INDEX IF NOT EXISTS idx_expenses_job_id ON expenses(job_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'party_id') THEN
        CREATE INDEX IF NOT EXISTS idx_party_transactions_party_id ON party_transactions(party_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'type') THEN
        CREATE INDEX IF NOT EXISTS idx_party_transactions_type ON party_transactions(type);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'status') THEN
        CREATE INDEX IF NOT EXISTS idx_party_transactions_status ON party_transactions(status);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_progress' AND column_name = 'job_id') THEN
        CREATE INDEX IF NOT EXISTS idx_job_progress_job_id ON job_progress(job_id);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_logs' AND column_name = 'table_name') THEN
        CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
    END IF;
END $$;

-- =====================================================
-- STEP 4: CREATE TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_parties_updated_at ON parties;
DROP TRIGGER IF EXISTS update_job_sheets_updated_at ON job_sheets;
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
DROP TRIGGER IF EXISTS update_party_transactions_updated_at ON party_transactions;
DROP TRIGGER IF EXISTS update_machines_updated_at ON machines;

-- Create triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_job_sheets_updated_at BEFORE UPDATE ON job_sheets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_party_transactions_updated_at BEFORE UPDATE ON party_transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- STEP 5: INSERT DEFAULT DATA
-- =====================================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'company_name', 'Ganpathi Overseas', 'Company name for invoices and reports', 'company'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'company_name');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'company_address', '', 'Company address for invoices', 'company'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'company_address');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'company_phone', '', 'Company phone number', 'company'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'company_phone');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'company_email', '', 'Company email address', 'company'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'company_email');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'company_gst', '', 'Company GST number', 'company'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'company_gst');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'default_credit_days', '30', 'Default credit days for new parties', 'finance'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'default_credit_days');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'job_number_prefix', 'JOB', 'Prefix for auto-generated job numbers', 'jobs'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'job_number_prefix');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'invoice_number_prefix', 'INV', 'Prefix for auto-generated invoice numbers', 'finance'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'invoice_number_prefix');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'backup_frequency', 'daily', 'Database backup frequency', 'system'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'backup_frequency');

INSERT INTO system_settings (setting_key, setting_value, description, category) 
SELECT 'max_file_upload_size', '10', 'Maximum file upload size in MB', 'system'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE setting_key = 'max_file_upload_size');

-- =====================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: CREATE HELPER FUNCTIONS FOR RLS (AFTER ENUMS)
-- =====================================================

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result FROM users WHERE id = user_id;
    RETURN COALESCE(user_role_result, 'operator'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is supervisor or admin
CREATE OR REPLACE FUNCTION is_supervisor_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'supervisor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is finance or admin
CREATE OR REPLACE FUNCTION is_finance_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'finance');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 8: CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- USERS TABLE POLICIES
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_delete_policy" ON users;

CREATE POLICY "users_select_policy" ON users FOR SELECT USING (
    auth.uid() = id OR 
    is_admin(auth.uid()) OR
    (is_supervisor_or_admin(auth.uid()) AND is_active = true)
);

CREATE POLICY "users_insert_policy" ON users FOR INSERT WITH CHECK (
    is_admin(auth.uid())
);

CREATE POLICY "users_update_policy" ON users FOR UPDATE USING (
    is_admin(auth.uid()) OR 
    (auth.uid() = id AND is_active = true)
);

CREATE POLICY "users_delete_policy" ON users FOR DELETE USING (
    is_admin(auth.uid())
);

-- PARTIES TABLE POLICIES
DROP POLICY IF EXISTS "parties_select_policy" ON parties;
DROP POLICY IF EXISTS "parties_insert_policy" ON parties;
DROP POLICY IF EXISTS "parties_update_policy" ON parties;
DROP POLICY IF EXISTS "parties_delete_policy" ON parties;

CREATE POLICY "parties_select_policy" ON parties FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_supervisor_or_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM job_sheets 
        WHERE job_sheets.party_id = parties.id 
        AND job_sheets.assigned_to = auth.uid()
    )
);

CREATE POLICY "parties_insert_policy" ON parties FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid())
);

CREATE POLICY "parties_update_policy" ON parties FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid())
);

CREATE POLICY "parties_delete_policy" ON parties FOR DELETE USING (
    is_admin(auth.uid())
);

-- MACHINES TABLE POLICIES
DROP POLICY IF EXISTS "machines_select_policy" ON machines;
DROP POLICY IF EXISTS "machines_insert_policy" ON machines;
DROP POLICY IF EXISTS "machines_update_policy" ON machines;
DROP POLICY IF EXISTS "machines_delete_policy" ON machines;

CREATE POLICY "machines_select_policy" ON machines FOR SELECT USING (
    auth.uid() IS NOT NULL
);

CREATE POLICY "machines_insert_policy" ON machines FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid())
);

CREATE POLICY "machines_update_policy" ON machines FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid())
);

CREATE POLICY "machines_delete_policy" ON machines FOR DELETE USING (
    is_admin(auth.uid())
);

-- JOB SHEETS TABLE POLICIES
DROP POLICY IF EXISTS "job_sheets_select_policy" ON job_sheets;
DROP POLICY IF EXISTS "job_sheets_insert_policy" ON job_sheets;
DROP POLICY IF EXISTS "job_sheets_update_policy" ON job_sheets;
DROP POLICY IF EXISTS "job_sheets_delete_policy" ON job_sheets;

CREATE POLICY "job_sheets_select_policy" ON job_sheets FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_supervisor_or_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid()) OR
    assigned_to = auth.uid()
);

CREATE POLICY "job_sheets_insert_policy" ON job_sheets FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid())
);

CREATE POLICY "job_sheets_update_policy" ON job_sheets FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid()) OR
    (assigned_to = auth.uid() AND get_user_role(auth.uid()) = 'operator')
);

CREATE POLICY "job_sheets_delete_policy" ON job_sheets FOR DELETE USING (
    is_admin(auth.uid())
);

-- EXPENSES TABLE POLICIES
DROP POLICY IF EXISTS "expenses_select_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_update_policy" ON expenses;
DROP POLICY IF EXISTS "expenses_delete_policy" ON expenses;

CREATE POLICY "expenses_select_policy" ON expenses FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid())
);

CREATE POLICY "expenses_insert_policy" ON expenses FOR INSERT WITH CHECK (
    is_finance_or_admin(auth.uid())
);

CREATE POLICY "expenses_update_policy" ON expenses FOR UPDATE USING (
    is_finance_or_admin(auth.uid())
);

CREATE POLICY "expenses_delete_policy" ON expenses FOR DELETE USING (
    is_admin(auth.uid())
);

-- PARTY TRANSACTIONS TABLE POLICIES
DROP POLICY IF EXISTS "party_transactions_select_policy" ON party_transactions;
DROP POLICY IF EXISTS "party_transactions_insert_policy" ON party_transactions;
DROP POLICY IF EXISTS "party_transactions_update_policy" ON party_transactions;
DROP POLICY IF EXISTS "party_transactions_delete_policy" ON party_transactions;

CREATE POLICY "party_transactions_select_policy" ON party_transactions FOR SELECT USING (
    is_admin(auth.uid()) OR
    is_finance_or_admin(auth.uid()) OR
    is_supervisor_or_admin(auth.uid())
);

CREATE POLICY "party_transactions_insert_policy" ON party_transactions FOR INSERT WITH CHECK (
    is_finance_or_admin(auth.uid())
);

CREATE POLICY "party_transactions_update_policy" ON party_transactions FOR UPDATE USING (
    is_finance_or_admin(auth.uid())
);

CREATE POLICY "party_transactions_delete_policy" ON party_transactions FOR DELETE USING (
    is_admin(auth.uid())
);

-- JOB PROGRESS TABLE POLICIES
DROP POLICY IF EXISTS "job_progress_select_policy" ON job_progress;
DROP POLICY IF EXISTS "job_progress_insert_policy" ON job_progress;
DROP POLICY IF EXISTS "job_progress_update_policy" ON job_progress;
DROP POLICY IF EXISTS "job_progress_delete_policy" ON job_progress;

CREATE POLICY "job_progress_select_policy" ON job_progress FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM job_sheets 
        WHERE job_sheets.id = job_progress.job_id 
        AND (
            is_admin(auth.uid()) OR
            is_supervisor_or_admin(auth.uid()) OR
            is_finance_or_admin(auth.uid()) OR
            job_sheets.assigned_to = auth.uid()
        )
    )
);

CREATE POLICY "job_progress_insert_policy" ON job_progress FOR INSERT WITH CHECK (
    is_supervisor_or_admin(auth.uid()) OR
    EXISTS (
        SELECT 1 FROM job_sheets 
        WHERE job_sheets.id = job_progress.job_id 
        AND job_sheets.assigned_to = auth.uid()
    )
);

CREATE POLICY "job_progress_update_policy" ON job_progress FOR UPDATE USING (
    is_supervisor_or_admin(auth.uid()) OR
    (operator_id = auth.uid())
);

CREATE POLICY "job_progress_delete_policy" ON job_progress FOR DELETE USING (
    is_supervisor_or_admin(auth.uid())
);

-- SYSTEM SETTINGS TABLE POLICIES
DROP POLICY IF EXISTS "system_settings_select_policy" ON system_settings;
DROP POLICY IF EXISTS "system_settings_insert_policy" ON system_settings;
DROP POLICY IF EXISTS "system_settings_update_policy" ON system_settings;
DROP POLICY IF EXISTS "system_settings_delete_policy" ON system_settings;

CREATE POLICY "system_settings_select_policy" ON system_settings FOR SELECT USING (
    auth.uid() IS NOT NULL
);

CREATE POLICY "system_settings_insert_policy" ON system_settings FOR INSERT WITH CHECK (
    is_admin(auth.uid())
);

CREATE POLICY "system_settings_update_policy" ON system_settings FOR UPDATE USING (
    is_admin(auth.uid())
);

CREATE POLICY "system_settings_delete_policy" ON system_settings FOR DELETE USING (
    is_admin(auth.uid())
);

-- AUDIT LOGS TABLE POLICIES
DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_update_policy" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete_policy" ON audit_logs;

CREATE POLICY "audit_logs_select_policy" ON audit_logs FOR SELECT USING (
    is_admin(auth.uid()) OR user_id = auth.uid()
);

CREATE POLICY "audit_logs_insert_policy" ON audit_logs FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_logs_update_policy" ON audit_logs FOR UPDATE USING (false);
CREATE POLICY "audit_logs_delete_policy" ON audit_logs FOR DELETE USING (false);

-- =====================================================
-- STEP 9: CREATE DASHBOARD FUNCTIONS
-- =====================================================

-- Function to get dashboard stats based on user role
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    role user_role;
    stats JSON;
BEGIN
    role := get_user_role(user_id);
    
    CASE role
        WHEN 'admin' THEN
            SELECT json_build_object(
                'total_users', (SELECT COUNT(*) FROM users WHERE is_active = true),
                'total_jobs', (SELECT COUNT(*) FROM job_sheets WHERE is_deleted = false),
                'active_jobs', (SELECT COUNT(*) FROM job_sheets WHERE status IN ('pending', 'in_progress') AND is_deleted = false),
                'total_parties', (SELECT COUNT(*) FROM parties WHERE is_active = true),
                'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment'),
                'pending_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND status = 'pending'),
                'monthly_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE))
            ) INTO stats;
            
        WHEN 'supervisor' THEN
            SELECT json_build_object(
                'total_jobs', (SELECT COUNT(*) FROM job_sheets WHERE is_deleted = false),
                'active_jobs', (SELECT COUNT(*) FROM job_sheets WHERE status IN ('pending', 'in_progress') AND is_deleted = false),
                'completed_today', (SELECT COUNT(*) FROM job_sheets WHERE status = 'completed' AND DATE(completed_at) = CURRENT_DATE),
                'my_jobs', (SELECT COUNT(*) FROM job_sheets WHERE created_by = user_id AND is_deleted = false),
                'overdue_jobs', (SELECT COUNT(*) FROM job_sheets WHERE due_date < CURRENT_DATE AND status != 'completed' AND is_deleted = false)
            ) INTO stats;
            
        WHEN 'finance' THEN
            SELECT json_build_object(
                'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment'),
                'pending_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND status = 'pending'),
                'overdue_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND status = 'overdue'),
                'monthly_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)),
                'monthly_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment' AND transaction_date >= date_trunc('month', CURRENT_DATE))
            ) INTO stats;
            
        WHEN 'operator' THEN
            SELECT json_build_object(
                'assigned_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND status IN ('pending', 'in_progress') AND is_deleted = false),
                'completed_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND status = 'completed'),
                'jobs_today', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND DATE(started_at) = CURRENT_DATE),
                'pending_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND status = 'pending' AND is_deleted = false)
            ) INTO stats;
    END CASE;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETE! Database setup is done.
-- ===================================================== 