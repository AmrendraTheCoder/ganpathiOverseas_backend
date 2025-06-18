-- Finance Reports Schema Migration
-- This creates the basic finance reporting tables needed for the application

-- Create ENUM types for finance reporting
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM (
        'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COST_OF_GOODS_SOLD'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create chart of accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    account_type account_type NOT NULL,
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for chart of accounts
CREATE INDEX IF NOT EXISTS idx_chart_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_accounts_active ON chart_of_accounts(is_active);

-- Enable RLS and create policies for chart of accounts
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow chart of accounts access" ON chart_of_accounts FOR ALL USING (true);

-- Create financial transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    account_id UUID REFERENCES chart_of_accounts(id),
    party_id INTEGER, -- References parties table but without FK constraint for now
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    reference_number VARCHAR(100),
    created_by UUID, -- References users table but without FK constraint for now
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for financial transactions
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);

-- Enable RLS and create policies for financial transactions
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow financial transactions access" ON financial_transactions FOR ALL USING (true);

-- Insert sample chart of accounts data
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) 
VALUES 
    ('1101', 'Cash in Hand', 'ASSET', 'Petty cash and till money'),
    ('1102', 'Bank Account - Current', 'ASSET', 'Main operating bank account'),
    ('1104', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
    ('2101', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
    ('2102', 'GST Payable', 'LIABILITY', 'GST collected from customers'),
    ('3101', 'Owner Capital', 'EQUITY', 'Initial and additional capital'),
    ('4101', 'Printing Services Revenue', 'REVENUE', 'Revenue from printing jobs'),
    ('5101', 'Paper Cost', 'COST_OF_GOODS_SOLD', 'Cost of paper used in jobs'),
    ('6101', 'Rent Expense', 'EXPENSE', 'Office and production space rent'),
    ('6103', 'Staff Salaries', 'EXPENSE', 'Admin and support staff salaries')
ON CONFLICT (account_code) DO NOTHING;

-- Add missing columns to job_sheets table if they don't exist
ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS baking DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS uv DECIMAL(10,2) DEFAULT 0.00;

-- Add updated_at trigger for new tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at timestamps
CREATE TRIGGER update_chart_of_accounts_updated_at 
    BEFORE UPDATE ON chart_of_accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at 
    BEFORE UPDATE ON financial_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 