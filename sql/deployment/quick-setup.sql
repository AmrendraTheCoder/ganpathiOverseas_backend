-- Quick setup for essential tables to stop immediate errors
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

-- Create parties table
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

-- Create party_transactions table (this is what the app is looking for)
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

-- Create machines table
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

-- Create expenses table
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

-- Insert sample data
INSERT INTO parties (id, name, contact_person, phone, email, current_balance, credit_limit)
VALUES 
    ('22222222-2222-2222-2222-222222222222', 'ABC Enterprises', 'Rajesh Kumar', '+91-9876543211', 'rajesh@abcenterprise.com', 0, 100000),
    ('33333333-3333-3333-3333-333333333333', 'XYZ Pvt Ltd', 'Priya Sharma', '+91-9876543212', 'priya@xyzpvt.com', 0, 150000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO party_transactions (id, party_id, type, amount, description, balance_after, transaction_date)
VALUES 
    ('aaa11111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'payment', 25000.00, 'Payment received for business cards printing', 25000.00, '2024-12-15'),
    ('aaa22222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'payment', 45000.00, 'Payment for brochure printing project', 45000.00, '2024-12-16')
ON CONFLICT (id) DO NOTHING; 