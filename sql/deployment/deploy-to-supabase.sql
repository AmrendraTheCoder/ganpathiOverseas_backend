-- =============================================
-- Ganpathi Overseas ERP - Remote Supabase Setup
-- =============================================
-- This script sets up the complete database schema for production deployment

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table with authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'finance', 'operator')),
    password_hash TEXT,
    phone VARCHAR(20),
    address TEXT,
    salary DECIMAL(10,2),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parties (customers/clients) table
CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    gst_number VARCHAR(50),
    credit_limit DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create machines table
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    serial_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    maintenance_date DATE,
    operator_id UUID REFERENCES users(id),
    hourly_rate DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_sheets table
CREATE TABLE IF NOT EXISTS job_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    party_id UUID NOT NULL REFERENCES parties(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 2,
    quantity INTEGER NOT NULL,
    colors VARCHAR(50),
    paper_type VARCHAR(100),
    size VARCHAR(50),
    finishing_requirements TEXT,
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    selling_price DECIMAL(10,2) NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES users(id),
    machine_id UUID REFERENCES machines(id),
    design_files TEXT[],
    sample_images TEXT[],
    completion_photos TEXT[],
    special_instructions TEXT,
    client_feedback TEXT,
    internal_notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    job_id UUID REFERENCES job_sheets(id),
    vendor_name VARCHAR(255),
    invoice_number VARCHAR(100),
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank', 'cheque', 'online')),
    receipt_url TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_frequency VARCHAR(20),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create party_transactions table (financial transactions between company and parties)
CREATE TABLE IF NOT EXISTS party_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    party_id UUID NOT NULL REFERENCES parties(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'order', 'adjustment')),
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    balance_after DECIMAL(12,2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- Create job_progress table for tracking work stages
CREATE TABLE IF NOT EXISTS job_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_sheets(id),
    stage VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    operator_id UUID REFERENCES users(id),
    notes TEXT,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create paper_types table
CREATE TABLE IF NOT EXISTS paper_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    gsm INTEGER,
    size VARCHAR(50),
    color VARCHAR(50),
    finish VARCHAR(50),
    cost_per_sheet DECIMAL(8,4),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    supplier VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_logs table for operator time tracking
CREATE TABLE IF NOT EXISTS time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_sheets(id),
    operator_id UUID NOT NULL REFERENCES users(id),
    machine_id UUID REFERENCES machines(id),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    break_time_minutes INTEGER DEFAULT 0,
    notes TEXT,
    productivity_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_sheets_party_id ON job_sheets(party_id);
CREATE INDEX IF NOT EXISTS idx_job_sheets_status ON job_sheets(status);
CREATE INDEX IF NOT EXISTS idx_job_sheets_assigned_to ON job_sheets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_sheets_created_at ON job_sheets(created_at);
CREATE INDEX IF NOT EXISTS idx_party_transactions_party_id ON party_transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_party_transactions_type ON party_transactions(type);
CREATE INDEX IF NOT EXISTS idx_party_transactions_date ON party_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_party_transactions_is_deleted ON party_transactions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_job_progress_job_id ON job_progress(job_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_operator_id ON time_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_job_id ON time_logs(job_id);

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (you can make these more restrictive later)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON parties FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON machines FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON job_sheets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON party_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON job_progress FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON paper_types FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON time_logs FOR ALL USING (true);

-- Create functions for auto-generating job numbers
CREATE OR REPLACE FUNCTION generate_job_number() RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
    next_sequence INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Get the next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 4) AS INTEGER)), 0) + 1
    INTO next_sequence
    FROM job_sheets
    WHERE job_number LIKE 'GO' || year_part || '%';
    
    sequence_part := LPAD(next_sequence::TEXT, 4, '0');
    
    RETURN 'GO' || year_part || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-set job number
CREATE OR REPLACE FUNCTION set_job_number() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
        NEW.job_number := generate_job_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for job_sheets
CREATE TRIGGER job_number_trigger
    BEFORE INSERT ON job_sheets
    FOR EACH ROW
    EXECUTE FUNCTION set_job_number();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_sheets_updated_at BEFORE UPDATE ON job_sheets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_party_transactions_updated_at BEFORE UPDATE ON party_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_progress_updated_at BEFORE UPDATE ON job_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_paper_types_updated_at BEFORE UPDATE ON paper_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, username, name, role, password_hash, phone, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@ganpathioverseas.com',
    'admin',
    'System Administrator',
    'admin',
    '$2a$12$LQv3c1yqBCFcXz7d1dtjdO1f8x2A6JZP4Bk1qG2C4Bz2Y0Q1A2B3C',
    '+91-9876543210',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample parties
INSERT INTO parties (id, name, contact_person, phone, email, address, current_balance, credit_limit)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'ABC Enterprises', 'Rajesh Kumar', '+91-9876543211', 'rajesh@abcenterprise.com', '123 Business District, Mumbai, MH 400001', 0, 100000),
    ('33333333-3333-3333-3333-333333333333', 'XYZ Pvt Ltd', 'Priya Sharma', '+91-9876543212', 'priya@xyzpvt.com', '456 Commercial Complex, Delhi, DL 110001', 0, 150000),
    ('77777777-7777-7777-7777-777777777777', 'Global Enterprises Ltd', 'Amit Patel', '+91-9876543215', 'amit@globalent.com', '789 Corporate Tower, Pune, MH 411001', 0, 200000),
    ('88888888-8888-8888-8888-888888888888', 'Marketing Pro Agency', 'Sneha Gupta', '+91-9876543216', 'sneha@marketingpro.com', '321 Creative Plaza, Bangalore, KA 560001', 0, 75000),
    ('99999999-9999-9999-9999-999999999999', 'Premium Packaging Co', 'Vikram Singh', '+91-9876543217', 'vikram@premiumpack.com', '654 Industrial Area, Chennai, TN 600001', 0, 120000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample machines
INSERT INTO machines (id, name, type, model, operator_id, hourly_rate, is_active)
VALUES 
    ('55555555-5555-5555-5555-555555555555', 'Offset Press 1', 'Offset Printing', 'Heidelberg SM52', null, 500.00, true),
    ('66666666-6666-6666-6666-666666666666', 'Digital Press 1', 'Digital Printing', 'HP Indigo 7800', null, 300.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample party transactions
INSERT INTO party_transactions (id, party_id, type, amount, description, balance_after, transaction_date)
VALUES 
    ('aaa11111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'payment', 25000.00, 'Payment received for business cards printing', 25000.00, '2024-12-15'),
    ('aaa22222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'payment', 45000.00, 'Payment for brochure printing project', 45000.00, '2024-12-16'),
    ('aaa33333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'payment', 75000.00, 'Payment for catalog printing', 75000.00, '2024-12-17'),
    ('aaa44444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 'payment', 35000.00, 'Payment for poster printing', 35000.00, '2024-12-18'),
    ('aaa55555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 'payment', 55000.00, 'Payment for packaging design', 55000.00, '2024-12-19'),
    ('aaa66666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 'payment', 18000.00, 'Additional payment for letterhead', 43000.00, '2024-12-20'),
    ('aaa77777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'payment', 28000.00, 'Payment for invoice printing', 73000.00, '2024-12-21'),
    ('aaa88888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 'payment', 42000.00, 'Payment for annual report printing', 117000.00, '2024-12-22'),
    ('aaa99999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 'payment', 22000.00, 'Payment for flyer printing', 57000.00, '2024-12-23'),
    ('aaaaaaa1-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 'payment', 31000.00, 'Payment for product labels', 86000.00, '2024-12-24'),
    ('aaaaaaa2-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'payment', 15000.00, 'Payment for envelope printing', 58000.00, '2024-12-25')
ON CONFLICT (id) DO NOTHING;

-- Insert sample expenses (to show realistic costs)
INSERT INTO expenses (id, category, description, amount, expense_date, vendor_name, created_by)
VALUES 
    ('bbb11111-1111-1111-1111-111111111111', 'Materials', 'Paper stock purchase - A4 sheets', 25000.00, '2024-12-10', 'Paper Supply Co', '11111111-1111-1111-1111-111111111111'),
    ('bbb22222-2222-2222-2222-222222222222', 'Materials', 'Ink cartridges for digital press', 15000.00, '2024-12-12', 'Ink Solutions Ltd', '11111111-1111-1111-1111-111111111111'),
    ('bbb33333-3333-3333-3333-333333333333', 'Utilities', 'Monthly electricity bill', 8000.00, '2024-12-05', 'State Electricity Board', '11111111-1111-1111-1111-111111111111'),
    ('bbb44444-4444-4444-4444-444444444444', 'Maintenance', 'Offset press service', 12000.00, '2024-12-08', 'Machine Service Pro', '11111111-1111-1111-1111-111111111111'),
    ('bbb55555-5555-5555-5555-555555555555', 'Materials', 'Binding materials purchase', 8500.00, '2024-12-14', 'Binding Supplies Inc', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

COMMENT ON DATABASE postgres IS 'Ganpathi Overseas ERP System Database';
COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE parties IS 'Customer and vendor information';
COMMENT ON TABLE job_sheets IS 'Print job orders and specifications';
COMMENT ON TABLE machines IS 'Printing and finishing equipment';
COMMENT ON TABLE expenses IS 'Business expenses and costs';
COMMENT ON TABLE party_transactions IS 'Financial transactions and payments';
COMMENT ON TABLE job_progress IS 'Job workflow and progress tracking';
COMMENT ON TABLE time_logs IS 'Operator time tracking and productivity'; 