-- Comprehensive Database Schema Fix
-- Run this in Supabase Dashboard > SQL Editor
-- This will create all missing tables and columns for the finance system

-- 1. Add missing columns to job_sheets table
ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS uv DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS baking DECIMAL(10,2) DEFAULT 0.00;

-- 2. Create account_type ENUM
DO $$ BEGIN
  CREATE TYPE account_type AS ENUM (
    'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COST_OF_GOODS_SOLD'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create chart_of_accounts table
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

-- 4. Create financial_transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  account_id UUID REFERENCES chart_of_accounts(id),
  party_id UUID REFERENCES parties(id),
  debit_amount DECIMAL(15,2) DEFAULT 0,
  credit_amount DECIMAL(15,2) DEFAULT 0,
  reference_number VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create profit_loss_reports table
CREATE TABLE IF NOT EXISTS profit_loss_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name VARCHAR(200) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_cogs DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  net_income DECIMAL(15,2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create balance_sheet_reports table
CREATE TABLE IF NOT EXISTS balance_sheet_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name VARCHAR(200) NOT NULL,
  as_of_date DATE NOT NULL,
  total_assets DECIMAL(15,2) DEFAULT 0,
  total_liabilities DECIMAL(15,2) DEFAULT 0,
  total_equity DECIMAL(15,2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create cash_flow_reports table
CREATE TABLE IF NOT EXISTS cash_flow_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name VARCHAR(200) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  operating_cash_flow DECIMAL(15,2) DEFAULT 0,
  investing_cash_flow DECIMAL(15,2) DEFAULT 0,
  financing_cash_flow DECIMAL(15,2) DEFAULT 0,
  net_cash_flow DECIMAL(15,2) DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create tax_reports table
CREATE TABLE IF NOT EXISTS tax_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name VARCHAR(200) NOT NULL,
  tax_period_start DATE NOT NULL,
  tax_period_end DATE NOT NULL,
  tax_type VARCHAR(50) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  filing_status VARCHAR(50) DEFAULT 'pending',
  due_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create custom_reports table
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name VARCHAR(200) NOT NULL,
  description TEXT,
  sql_query TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chart_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_accounts_active ON chart_of_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);

-- 11. Enable Row Level Security
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies (allow all for now - can be restricted later)
CREATE POLICY IF NOT EXISTS "Allow chart of accounts access" ON chart_of_accounts FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow financial transactions access" ON financial_transactions FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow profit loss reports access" ON profit_loss_reports FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow balance sheet reports access" ON balance_sheet_reports FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow cash flow reports access" ON cash_flow_reports FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow tax reports access" ON tax_reports FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow custom reports access" ON custom_reports FOR ALL USING (true);

-- 13. Insert sample chart of accounts data
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
('1101', 'Cash in Hand', 'ASSET', 'Petty cash and till money'),
('1102', 'Bank Account - Current', 'ASSET', 'Main operating bank account'),
('1201', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
('1301', 'Inventory - Paper Stock', 'ASSET', 'Paper and printing materials'),
('1302', 'Inventory - Ink & Toner', 'ASSET', 'Ink, toner, and printing supplies'),
('1401', 'Equipment - Printing Machines', 'ASSET', 'Printing and production equipment'),
('1402', 'Equipment - Office', 'ASSET', 'Office furniture and equipment'),
('2101', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
('2201', 'Accrued Expenses', 'LIABILITY', 'Unpaid expenses'),
('2301', 'Short-term Loans', 'LIABILITY', 'Short-term borrowings'),
('3101', 'Owner Equity', 'EQUITY', 'Owner''s equity in the business'),
('3201', 'Retained Earnings', 'EQUITY', 'Accumulated business profits'),
('4101', 'Printing Services Revenue', 'REVENUE', 'Revenue from printing jobs'),
('4102', 'Design Services Revenue', 'REVENUE', 'Revenue from design services'),
('4103', 'Binding Services Revenue', 'REVENUE', 'Revenue from binding and finishing'),
('5101', 'Paper and Materials', 'COST_OF_GOODS_SOLD', 'Direct materials cost'),
('5102', 'Ink and Toner', 'COST_OF_GOODS_SOLD', 'Direct ink and toner costs'),
('5103', 'Direct Labor', 'COST_OF_GOODS_SOLD', 'Direct labor costs'),
('6101', 'Office Rent', 'EXPENSE', 'Monthly office rent'),
('6102', 'Utilities', 'EXPENSE', 'Electricity, water, internet'),
('6103', 'Equipment Maintenance', 'EXPENSE', 'Maintenance and repairs'),
('6104', 'Insurance', 'EXPENSE', 'Business insurance premiums'),
('6105', 'Marketing & Advertising', 'EXPENSE', 'Marketing and promotional expenses'),
('6106', 'Professional Services', 'EXPENSE', 'Legal, accounting, and consulting fees'),
('6107', 'Office Supplies', 'EXPENSE', 'General office supplies and stationery')
ON CONFLICT (account_code) DO NOTHING;

-- 14. Verification queries (run separately to check)
-- SELECT 'Chart of Accounts' as table_name, count(*) as records FROM chart_of_accounts;
-- SELECT 'Job Sheets Columns' as info, column_name FROM information_schema.columns 
--   WHERE table_name = 'job_sheets' AND column_name IN ('uv', 'baking');
-- SELECT table_name FROM information_schema.tables 
--   WHERE table_schema = 'public' AND table_name LIKE '%report%' OR table_name IN ('chart_of_accounts', 'financial_transactions');

-- Success message
SELECT 'Database schema setup completed successfully!' as status; 