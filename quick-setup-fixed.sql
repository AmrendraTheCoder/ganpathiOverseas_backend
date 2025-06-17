-- Quick setup for essential tables - FIXED VERSION
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (essential for authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'finance', 'operator')),
    password_hash TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create parties table with UUID id
CREATE TABLE IF NOT EXISTS parties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    current_balance DECIMAL(12,2) DEFAULT 0,
    credit_limit DECIMAL(12,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create party_transactions table with UUID party_id to match parties.id
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

-- Create machines table with UUID id
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    model VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    hourly_rate DECIMAL(8,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create job_sheets table with UUID references
CREATE TABLE IF NOT EXISTS job_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    party_id UUID NOT NULL REFERENCES parties(id),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 2,
    quantity INTEGER NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    assigned_to UUID REFERENCES users(id),
    machine_id UUID REFERENCES machines(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT false
);

-- Create expenses table with UUID references
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_party_transactions_party_id ON party_transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_party_transactions_type ON party_transactions(type);
CREATE INDEX IF NOT EXISTS idx_party_transactions_date ON party_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_job_sheets_party_id ON job_sheets(party_id);
CREATE INDEX IF NOT EXISTS idx_job_sheets_status ON job_sheets(status);
CREATE INDEX IF NOT EXISTS idx_job_sheets_assigned_to ON job_sheets(assigned_to);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON parties FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON party_transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON machines FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON job_sheets FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON expenses FOR ALL USING (true);

-- Insert default admin user
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

-- Insert operator user for testing
INSERT INTO users (id, email, username, name, role, password_hash, phone, is_active)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'operator@ganpathioverseas.com',
    'operator',
    'Machine Operator',
    'operator',
    '$2a$12$LQv3c1yqBCFcXz7d1dtjdO1f8x2A6JZP4Bk1qG2C4Bz2Y0Q1A2B3C',
    '+91-9876543213',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert sample parties with UUID ids
INSERT INTO parties (id, name, contact_person, phone, email, address, current_balance, credit_limit)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'ABC Enterprises', 'Rajesh Kumar', '+91-9876543211', 'rajesh@abcenterprise.com', '123 Business District, Mumbai, MH 400001', 0, 100000),
    ('33333333-3333-3333-3333-333333333333', 'XYZ Pvt Ltd', 'Priya Sharma', '+91-9876543212', 'priya@xyzpvt.com', '456 Commercial Complex, Delhi, DL 110001', 0, 150000),
    ('77777777-7777-7777-7777-777777777777', 'Global Enterprises Ltd', 'Amit Patel', '+91-9876543215', 'amit@globalent.com', '789 Corporate Tower, Pune, MH 411001', 0, 200000)
ON CONFLICT (id) DO NOTHING;

-- Insert sample machines
INSERT INTO machines (id, name, type, model, hourly_rate, is_active)
VALUES 
    ('55555555-5555-5555-5555-555555555555', 'Offset Press 1', 'Offset Printing', 'Heidelberg SM52', 500.00, true),
    ('66666666-6666-6666-6666-666666666666', 'Digital Press 1', 'Digital Printing', 'HP Indigo 7800', 300.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample party transactions with UUID party_id references
INSERT INTO party_transactions (id, party_id, type, amount, description, balance_after, transaction_date)
VALUES 
    ('aaa11111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'payment', 25000.00, 'Payment received for business cards printing', 25000.00, '2024-12-15'),
    ('aaa22222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'payment', 45000.00, 'Payment for brochure printing project', 45000.00, '2024-12-16'),
    ('aaa33333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 'payment', 75000.00, 'Payment for catalog printing', 75000.00, '2024-12-17'),
    ('aaa44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'payment', 18000.00, 'Additional payment for letterhead', 43000.00, '2024-12-20'),
    ('aaa55555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'payment', 28000.00, 'Payment for invoice printing', 73000.00, '2024-12-21')
ON CONFLICT (id) DO NOTHING;

-- Insert sample job sheets
INSERT INTO job_sheets (id, job_number, title, description, party_id, quantity, selling_price, status, priority, created_by, assigned_to, machine_id)
VALUES 
    ('jjj11111-1111-1111-1111-111111111111', 'GO24001', 'Business Cards for ABC Enterprises', 'Premium business cards with UV coating', '22222222-2222-2222-2222-222222222222', 1000, 25000.00, 'in_progress', 3, '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666'),
    ('jjj22222-2222-2222-2222-222222222222', 'GO24002', 'Company Brochures', 'Tri-fold brochures for XYZ Pvt Ltd', '33333333-3333-3333-3333-333333333333', 500, 45000.00, 'pending', 2, '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555')
ON CONFLICT (id) DO NOTHING;

-- Insert sample expenses
INSERT INTO expenses (id, category, description, amount, expense_date, created_by)
VALUES 
    ('eee11111-1111-1111-1111-111111111111', 'Materials', 'Paper stock purchase - A4 sheets', 25000.00, '2024-12-10', '11111111-1111-1111-1111-111111111111'),
    ('eee22222-2222-2222-2222-222222222222', 'Materials', 'Ink cartridges for digital press', 15000.00, '2024-12-12', '11111111-1111-1111-1111-111111111111'),
    ('eee33333-3333-3333-3333-333333333333', 'Utilities', 'Monthly electricity bill', 8000.00, '2024-12-05', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING; 