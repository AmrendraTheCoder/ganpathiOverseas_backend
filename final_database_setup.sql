-- Final Database Setup for Ganpathi Overseas Enterprise System
-- This script avoids trigger disable issues by using a safer approach
-- Run this script in Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE ENUMS FIRST
-- =====================================================

DO $$ BEGIN
    -- Create user_role enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'finance', 'operator');
    END IF;
END $$;

DO $$ BEGIN
    -- Create job_status enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    END IF;
END $$;

DO $$ BEGIN
    -- Create expense_category enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_category') THEN
        CREATE TYPE expense_category AS ENUM ('ink', 'salary', 'electricity', 'rent', 'chemicals', 'maintenance', 'other');
    END IF;
END $$;

DO $$ BEGIN
    -- Create machine_type enum if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'machine_type') THEN
        CREATE TYPE machine_type AS ENUM ('offset', 'digital', 'finishing', 'cutting', 'binding', 'lamination');
    END IF;
END $$;

-- =====================================================
-- STEP 2: CREATE SAFE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if the column exists
    IF TG_TABLE_NAME IS NOT NULL THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = TG_TABLE_SCHEMA
            AND table_name = TG_TABLE_NAME 
            AND column_name = 'updated_at'
        ) THEN
            NEW.updated_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- STEP 3: ADD UPDATED_AT COLUMNS FIRST (AVOID TRIGGER ISSUES)
-- =====================================================

-- Add updated_at to parties if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'updated_at') THEN
        ALTER TABLE parties ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at to users if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at to job_sheets if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'updated_at') THEN
        ALTER TABLE job_sheets ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add updated_at to party_transactions if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'updated_at') THEN
        ALTER TABLE party_transactions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- STEP 4: EXTEND PARTIES TABLE
-- =====================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'contact_person') THEN
        ALTER TABLE parties ADD COLUMN contact_person VARCHAR(100);
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'is_active') THEN
        ALTER TABLE parties ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'notes') THEN
        ALTER TABLE parties ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parties' AND column_name = 'created_by') THEN
        ALTER TABLE parties ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update current_balance from existing balance
UPDATE parties SET current_balance = COALESCE(balance, 0) 
WHERE current_balance = 0 AND balance IS NOT NULL;

-- =====================================================
-- STEP 5: EXTEND USERS TABLE
-- =====================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'username') THEN
        ALTER TABLE users ADD COLUMN username VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role user_role DEFAULT 'operator';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(20);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'hire_date') THEN
        ALTER TABLE users ADD COLUMN hire_date DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'salary') THEN
        ALTER TABLE users ADD COLUMN salary DECIMAL(10,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_by') THEN
        ALTER TABLE users ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Update usernames for existing users
UPDATE users SET username = COALESCE(name, 'user' || id::text) 
WHERE username IS NULL;

-- Update emails for users without emails
UPDATE users SET email = COALESCE(email, 'user' || id::text || '@ganpathioverseas.com') 
WHERE email IS NULL OR email = '';

-- =====================================================
-- STEP 6: EXTEND JOB_SHEETS TABLE
-- =====================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'job_number') THEN
        ALTER TABLE job_sheets ADD COLUMN job_number VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'title') THEN
        ALTER TABLE job_sheets ADD COLUMN title VARCHAR(200);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'status') THEN
        ALTER TABLE job_sheets ADD COLUMN status job_status DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'machine_id') THEN
        ALTER TABLE job_sheets ADD COLUMN machine_id INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'assigned_to') THEN
        ALTER TABLE job_sheets ADD COLUMN assigned_to UUID REFERENCES auth.users(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'priority') THEN
        ALTER TABLE job_sheets ADD COLUMN priority INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'estimated_cost') THEN
        ALTER TABLE job_sheets ADD COLUMN estimated_cost DECIMAL(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'actual_cost') THEN
        ALTER TABLE job_sheets ADD COLUMN actual_cost DECIMAL(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'selling_price') THEN
        ALTER TABLE job_sheets ADD COLUMN selling_price DECIMAL(12,2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'order_date') THEN
        ALTER TABLE job_sheets ADD COLUMN order_date DATE DEFAULT CURRENT_DATE;
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'design_files') THEN
        ALTER TABLE job_sheets ADD COLUMN design_files TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'sample_images') THEN
        ALTER TABLE job_sheets ADD COLUMN sample_images TEXT[];
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'completion_photos') THEN
        ALTER TABLE job_sheets ADD COLUMN completion_photos TEXT[];
    END IF;
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
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'quantity') THEN
        ALTER TABLE job_sheets ADD COLUMN quantity INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'colors') THEN
        ALTER TABLE job_sheets ADD COLUMN colors VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'finishing_requirements') THEN
        ALTER TABLE job_sheets ADD COLUMN finishing_requirements TEXT;
    END IF;
END $$;

-- Update job_sheets data migration
UPDATE job_sheets SET job_number = 'JOB' || LPAD(id::text, 6, '0') 
WHERE job_number IS NULL;

UPDATE job_sheets SET title = COALESCE(description, 'Untitled Job') 
WHERE title IS NULL;

UPDATE job_sheets SET selling_price = COALESCE(rate, 0) 
WHERE selling_price = 0 AND rate IS NOT NULL;

UPDATE job_sheets SET order_date = job_date 
WHERE order_date IS NULL AND job_date IS NOT NULL;

UPDATE job_sheets SET quantity = COALESCE(imp, 0) 
WHERE quantity = 0 AND imp IS NOT NULL;

UPDATE job_sheets SET design_files = ARRAY[file_url] 
WHERE file_url IS NOT NULL AND design_files IS NULL;

-- =====================================================
-- STEP 7: EXTEND PARTY_TRANSACTIONS TABLE (SAFELY)
-- =====================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'job_id') THEN
        ALTER TABLE party_transactions ADD COLUMN job_id INTEGER REFERENCES job_sheets(id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'transaction_date') THEN
        ALTER TABLE party_transactions ADD COLUMN transaction_date DATE DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'payment_method') THEN
        ALTER TABLE party_transactions ADD COLUMN payment_method VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'reference_number') THEN
        ALTER TABLE party_transactions ADD COLUMN reference_number VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'invoice_url') THEN
        ALTER TABLE party_transactions ADD COLUMN invoice_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'due_date') THEN
        ALTER TABLE party_transactions ADD COLUMN due_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'status') THEN
        ALTER TABLE party_transactions ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'party_transactions' AND column_name = 'notes') THEN
        ALTER TABLE party_transactions ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Update existing transaction types safely (NO TRIGGER DISABLE NEEDED)
UPDATE party_transactions SET type = 'invoice' WHERE type = 'order';

-- Add constraints safely
DO $$ BEGIN
    -- Drop old constraint if exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'party_transactions_type_check' AND table_name = 'party_transactions') THEN
        ALTER TABLE party_transactions DROP CONSTRAINT party_transactions_type_check;
    END IF;
    -- Add new constraint
    ALTER TABLE party_transactions ADD CONSTRAINT party_transactions_type_check_new 
        CHECK (type IN ('invoice', 'payment', 'credit', 'debit'));
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'party_transactions_status_check' AND table_name = 'party_transactions') THEN
        ALTER TABLE party_transactions ADD CONSTRAINT party_transactions_status_check 
            CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));
    END IF;
END $$;

-- =====================================================
-- STEP 8: CREATE NEW TABLES
-- =====================================================

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
-- STEP 9: CREATE TRIGGERS SAFELY (NO DISABLE NEEDED)
-- =====================================================

-- Create triggers for tables with updated_at columns
DROP TRIGGER IF EXISTS update_parties_updated_at ON parties;
CREATE TRIGGER update_parties_updated_at 
    BEFORE UPDATE ON parties 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_sheets_updated_at ON job_sheets;
CREATE TRIGGER update_job_sheets_updated_at 
    BEFORE UPDATE ON job_sheets 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_party_transactions_updated_at ON party_transactions;
CREATE TRIGGER update_party_transactions_updated_at 
    BEFORE UPDATE ON party_transactions 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_machines_updated_at ON machines;
CREATE TRIGGER update_machines_updated_at 
    BEFORE UPDATE ON machines 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at 
    BEFORE UPDATE ON expenses 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- STEP 10: CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE role IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Parties indexes
CREATE INDEX IF NOT EXISTS idx_parties_is_active ON parties(is_active) WHERE is_active IS NOT NULL;

-- Job sheets indexes
CREATE INDEX IF NOT EXISTS idx_job_sheets_status ON job_sheets(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_sheets_assigned_to ON job_sheets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_sheets_due_date ON job_sheets(due_date) WHERE due_date IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_sheets_job_number ON job_sheets(job_number) WHERE job_number IS NOT NULL;

-- Party transactions indexes
CREATE INDEX IF NOT EXISTS idx_party_transactions_type ON party_transactions(type);
CREATE INDEX IF NOT EXISTS idx_party_transactions_status ON party_transactions(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_party_transactions_transaction_date ON party_transactions(transaction_date) WHERE transaction_date IS NOT NULL;

-- New tables indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_job_id ON expenses(job_id) WHERE job_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_job_progress_job_id ON job_progress(job_id);
CREATE INDEX IF NOT EXISTS idx_job_progress_operator_id ON job_progress(operator_id) WHERE operator_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- STEP 11: INSERT DEFAULT DATA
-- =====================================================

-- System settings
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

-- Sample machines
INSERT INTO machines (name, type, model, is_active, hourly_rate, notes) 
SELECT 'Offset Press 1', 'offset', 'HP Indigo 12000', true, 500.00, 'Main production machine'
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Offset Press 1');

INSERT INTO machines (name, type, model, is_active, hourly_rate, notes) 
SELECT 'Digital Press 1', 'digital', 'Xerox Versant 180', true, 300.00, 'High quality digital printing'
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Digital Press 1');

INSERT INTO machines (name, type, model, is_active, hourly_rate, notes) 
SELECT 'Cutting Machine', 'cutting', 'Polar 115X', true, 150.00, 'Paper cutting and finishing'
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Cutting Machine');

-- =====================================================
-- STEP 12: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 13: CREATE HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result FROM users WHERE id = user_id;
    RETURN COALESCE(user_role_result, 'operator'::user_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_supervisor_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'supervisor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_finance_or_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role(user_id) IN ('admin', 'finance');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 14: CREATE RLS POLICIES
-- =====================================================

-- Basic policies for authenticated users
DROP POLICY IF EXISTS "parties_select_policy" ON parties;
CREATE POLICY "parties_select_policy" ON parties FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "parties_insert_policy" ON parties;
CREATE POLICY "parties_insert_policy" ON parties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "parties_update_policy" ON parties;
CREATE POLICY "parties_update_policy" ON parties FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "job_sheets_select_policy" ON job_sheets;
CREATE POLICY "job_sheets_select_policy" ON job_sheets FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "job_sheets_insert_policy" ON job_sheets;
CREATE POLICY "job_sheets_insert_policy" ON job_sheets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "job_sheets_update_policy" ON job_sheets;
CREATE POLICY "job_sheets_update_policy" ON job_sheets FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "party_transactions_select_policy" ON party_transactions;
CREATE POLICY "party_transactions_select_policy" ON party_transactions FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "party_transactions_insert_policy" ON party_transactions;
CREATE POLICY "party_transactions_insert_policy" ON party_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "party_transactions_update_policy" ON party_transactions;
CREATE POLICY "party_transactions_update_policy" ON party_transactions FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "machines_select_policy" ON machines;
CREATE POLICY "machines_select_policy" ON machines FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "machines_insert_policy" ON machines;
CREATE POLICY "machines_insert_policy" ON machines FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "machines_update_policy" ON machines;
CREATE POLICY "machines_update_policy" ON machines FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "expenses_select_policy" ON expenses;
CREATE POLICY "expenses_select_policy" ON expenses FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "expenses_insert_policy" ON expenses;
CREATE POLICY "expenses_insert_policy" ON expenses FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "expenses_update_policy" ON expenses;
CREATE POLICY "expenses_update_policy" ON expenses FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "job_progress_select_policy" ON job_progress;
CREATE POLICY "job_progress_select_policy" ON job_progress FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "job_progress_insert_policy" ON job_progress;
CREATE POLICY "job_progress_insert_policy" ON job_progress FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "job_progress_update_policy" ON job_progress;
CREATE POLICY "job_progress_update_policy" ON job_progress FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "system_settings_select_policy" ON system_settings;
CREATE POLICY "system_settings_select_policy" ON system_settings FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "system_settings_insert_policy" ON system_settings;
CREATE POLICY "system_settings_insert_policy" ON system_settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "system_settings_update_policy" ON system_settings;
CREATE POLICY "system_settings_update_policy" ON system_settings FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "audit_logs_select_policy" ON audit_logs;
CREATE POLICY "audit_logs_select_policy" ON audit_logs FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "audit_logs_insert_policy" ON audit_logs;
CREATE POLICY "audit_logs_insert_policy" ON audit_logs FOR INSERT WITH CHECK (true);

-- =====================================================
-- STEP 15: CREATE DASHBOARD FUNCTION
-- =====================================================

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
                'total_users', (SELECT COUNT(*) FROM users WHERE COALESCE(is_active, true) = true),
                'total_jobs', (SELECT COUNT(*) FROM job_sheets WHERE COALESCE(is_deleted, false) = false),
                'active_jobs', (SELECT COUNT(*) FROM job_sheets WHERE COALESCE(status::text, 'pending') IN ('pending', 'in_progress') AND COALESCE(is_deleted, false) = false),
                'total_parties', (SELECT COUNT(*) FROM parties WHERE COALESCE(is_active, true) = true),
                'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment'),
                'pending_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND COALESCE(status, 'pending') = 'pending'),
                'monthly_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE))
            ) INTO stats;
            
        WHEN 'supervisor' THEN
            SELECT json_build_object(
                'total_jobs', (SELECT COUNT(*) FROM job_sheets WHERE COALESCE(is_deleted, false) = false),
                'active_jobs', (SELECT COUNT(*) FROM job_sheets WHERE COALESCE(status::text, 'pending') IN ('pending', 'in_progress') AND COALESCE(is_deleted, false) = false),
                'completed_today', (SELECT COUNT(*) FROM job_sheets WHERE COALESCE(status::text, '') = 'completed' AND DATE(completed_at) = CURRENT_DATE),
                'my_jobs', (SELECT COUNT(*) FROM job_sheets WHERE created_by = user_id AND COALESCE(is_deleted, false) = false),
                'overdue_jobs', (SELECT COUNT(*) FROM job_sheets WHERE due_date < CURRENT_DATE AND COALESCE(status::text, 'pending') != 'completed' AND COALESCE(is_deleted, false) = false)
            ) INTO stats;
            
        WHEN 'finance' THEN
            SELECT json_build_object(
                'total_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment'),
                'pending_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND COALESCE(status, 'pending') = 'pending'),
                'overdue_invoices', (SELECT COUNT(*) FROM party_transactions WHERE type = 'invoice' AND COALESCE(status, 'pending') = 'overdue'),
                'monthly_expenses', (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)),
                'monthly_revenue', (SELECT COALESCE(SUM(amount), 0) FROM party_transactions WHERE type = 'payment' AND COALESCE(transaction_date, created_at::date) >= date_trunc('month', CURRENT_DATE))
            ) INTO stats;
            
        WHEN 'operator' THEN
            SELECT json_build_object(
                'assigned_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND COALESCE(status::text, 'pending') IN ('pending', 'in_progress') AND COALESCE(is_deleted, false) = false),
                'completed_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND COALESCE(status::text, '') = 'completed'),
                'jobs_today', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND DATE(started_at) = CURRENT_DATE),
                'pending_jobs', (SELECT COUNT(*) FROM job_sheets WHERE assigned_to = user_id AND COALESCE(status::text, 'pending') = 'pending' AND COALESCE(is_deleted, false) = false)
            ) INTO stats;
    END CASE;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

SELECT 'Database migration completed successfully!' as status;

-- Show final table count
SELECT 
    'Total tables: ' || COUNT(*) as result
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Show enhanced tables
SELECT 
    table_name,
    COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('parties', 'users', 'job_sheets', 'party_transactions', 'machines', 'expenses', 'job_progress', 'system_settings', 'audit_logs')
GROUP BY table_name
ORDER BY table_name; 