-- Complete Finance Schema Migration
-- Creates all missing tables, columns, and sample data

-- 1. Add missing columns to job_sheets
ALTER TABLE job_sheets 
ADD COLUMN IF NOT EXISTS uv DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS baking DECIMAL(8,2) DEFAULT 0;

-- 2. Create account_type enum (using CHECK constraint for compatibility)
-- Note: We'll use VARCHAR with CHECK constraint instead of ENUM for broader compatibility

-- 3. Create chart_of_accounts table
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COGS')) NOT NULL,
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create financial_transactions table
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    reference_type VARCHAR(20) CHECK (reference_type IN ('JOB_SHEET', 'INVOICE', 'PAYMENT', 'EXPENSE', 'ADJUSTMENT')) NOT NULL,
    reference_id UUID,
    party_id UUID REFERENCES parties(id),
    account_id UUID REFERENCES chart_of_accounts(id) NOT NULL,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT financial_transactions_amount_check CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- 5. Create profit_loss_reports table
CREATE TABLE IF NOT EXISTS profit_loss_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    total_cogs DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    profit_margin DECIMAL(5,2) DEFAULT 0,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    report_data JSONB,
    status VARCHAR(20) DEFAULT 'DRAFT',
    CONSTRAINT profit_loss_period_check CHECK (period_end >= period_start)
);

-- 6. Create balance_sheet_reports table
CREATE TABLE IF NOT EXISTS balance_sheet_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(100) NOT NULL,
    as_of_date DATE NOT NULL,
    total_assets DECIMAL(15,2) DEFAULT 0,
    current_assets DECIMAL(15,2) DEFAULT 0,
    fixed_assets DECIMAL(15,2) DEFAULT 0,
    total_liabilities DECIMAL(15,2) DEFAULT 0,
    current_liabilities DECIMAL(15,2) DEFAULT 0,
    long_term_liabilities DECIMAL(15,2) DEFAULT 0,
    total_equity DECIMAL(15,2) DEFAULT 0,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    report_data JSONB,
    status VARCHAR(20) DEFAULT 'DRAFT'
);

-- 7. Create cash_flow_reports table
CREATE TABLE IF NOT EXISTS cash_flow_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    operating_cash_flow DECIMAL(15,2) DEFAULT 0,
    investing_cash_flow DECIMAL(15,2) DEFAULT 0,
    financing_cash_flow DECIMAL(15,2) DEFAULT 0,
    net_cash_flow DECIMAL(15,2) DEFAULT 0,
    opening_cash_balance DECIMAL(15,2) DEFAULT 0,
    closing_cash_balance DECIMAL(15,2) DEFAULT 0,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    report_data JSONB,
    status VARCHAR(20) DEFAULT 'DRAFT',
    CONSTRAINT cash_flow_period_check CHECK (period_end >= period_start)
);

-- 8. Create tax_reports table
CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(100) NOT NULL,
    tax_period_start DATE NOT NULL,
    tax_period_end DATE NOT NULL,
    gst_collected DECIMAL(15,2) DEFAULT 0,
    gst_paid DECIMAL(15,2) DEFAULT 0,
    gst_payable DECIMAL(15,2) DEFAULT 0,
    income_tax DECIMAL(15,2) DEFAULT 0,
    tds_deducted DECIMAL(15,2) DEFAULT 0,
    advance_tax DECIMAL(15,2) DEFAULT 0,
    tax_refund DECIMAL(15,2) DEFAULT 0,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    report_data JSONB,
    status VARCHAR(20) DEFAULT 'DRAFT',
    CONSTRAINT tax_period_check CHECK (tax_period_end >= tax_period_start)
);

-- 9. Create custom_reports table
CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    description TEXT,
    sql_query TEXT,
    parameters JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    report_data JSONB,
    status VARCHAR(20) DEFAULT 'DRAFT'
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chart_accounts_code ON chart_of_accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_chart_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_accounts_active ON chart_of_accounts(is_active);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(reference_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);

CREATE INDEX IF NOT EXISTS idx_profit_loss_period ON profit_loss_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_balance_sheet_date ON balance_sheet_reports(as_of_date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_period ON cash_flow_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_tax_reports_period ON tax_reports(tax_period_start, tax_period_end);

-- 11. Enable Row Level Security
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS Policies
CREATE POLICY IF NOT EXISTS "Allow financial transactions access" ON financial_transactions
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow chart of accounts access" ON chart_of_accounts
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow profit loss reports access" ON profit_loss_reports
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow balance sheet reports access" ON balance_sheet_reports
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow cash flow reports access" ON cash_flow_reports
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow tax reports access" ON tax_reports
    FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow custom reports access" ON custom_reports
    FOR ALL USING (true);

-- 13. Insert sample chart of accounts for printing business
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- Assets
('1000', 'Cash in Hand', 'ASSET', 'Petty cash and cash on hand'),
('1001', 'Bank Account - Current', 'ASSET', 'Primary bank account for operations'),
('1002', 'Bank Account - Savings', 'ASSET', 'Savings account for reserves'),
('1100', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
('1200', 'Inventory - Raw Materials', 'ASSET', 'Paper, ink, and other raw materials'),
('1201', 'Inventory - Work in Progress', 'ASSET', 'Jobs currently in production'),
('1202', 'Inventory - Finished Goods', 'ASSET', 'Completed jobs ready for delivery'),
('1500', 'Printing Equipment', 'ASSET', 'Printing machines and equipment'),
('1501', 'Computer Equipment', 'ASSET', 'Computers and design equipment'),
('1502', 'Office Furniture', 'ASSET', 'Desks, chairs, and office furniture'),
('1600', 'Prepaid Expenses', 'ASSET', 'Prepaid rent, insurance, etc.'),

-- Liabilities
('2000', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
('2100', 'GST Payable', 'LIABILITY', 'GST collected from customers'),
('2101', 'GST Input Credit', 'LIABILITY', 'GST paid on purchases'),
('2200', 'TDS Payable', 'LIABILITY', 'Tax deducted at source'),
('2300', 'Employee Provident Fund', 'LIABILITY', 'EPF contributions'),
('2301', 'Professional Tax Payable', 'LIABILITY', 'Professional tax deductions'),
('2400', 'Bank Loan', 'LIABILITY', 'Loans from banks'),
('2500', 'Accrued Expenses', 'LIABILITY', 'Expenses incurred but not yet paid'),

-- Equity
('3000', 'Owner Equity', 'EQUITY', 'Owner''s capital investment'),
('3100', 'Retained Earnings', 'EQUITY', 'Accumulated profits'),
('3200', 'Current Year Earnings', 'EQUITY', 'Current year profit/loss'),

-- Revenue
('4000', 'Printing Revenue', 'REVENUE', 'Income from printing services'),
('4001', 'Design Revenue', 'REVENUE', 'Income from design services'),
('4002', 'Binding Revenue', 'REVENUE', 'Income from binding services'),
('4003', 'Lamination Revenue', 'REVENUE', 'Income from lamination services'),
('4004', 'Digital Printing Revenue', 'REVENUE', 'Income from digital printing'),

-- Cost of Goods Sold
('5000', 'Paper Cost', 'COGS', 'Cost of paper and printing materials'),
('5001', 'Ink Cost', 'COGS', 'Cost of inks and toners'),
('5002', 'Direct Labor Cost', 'COGS', 'Labor directly involved in production'),
('5003', 'Machine Operation Cost', 'COGS', 'Direct machine operation costs'),
('5004', 'Outsourcing Cost', 'COGS', 'Cost of outsourced services'),

-- Operating Expenses
('6000', 'Office Rent', 'EXPENSE', 'Monthly office and factory rent'),
('6001', 'Utilities', 'EXPENSE', 'Electricity, water, internet'),
('6002', 'Equipment Maintenance', 'EXPENSE', 'Machine servicing and repairs'),
('6003', 'Transportation', 'EXPENSE', 'Delivery and travel expenses'),
('6004', 'Marketing Expense', 'EXPENSE', 'Advertising and marketing costs'),
('6005', 'Professional Fees', 'EXPENSE', 'CA, legal, and consultation fees'),
('6006', 'Insurance', 'EXPENSE', 'Equipment and business insurance'),
('6007', 'Depreciation', 'EXPENSE', 'Equipment depreciation'),
('6008', 'Office Supplies', 'EXPENSE', 'Stationery and office supplies'),
('6009', 'Telephone Expense', 'EXPENSE', 'Phone and communication costs'),
('6010', 'Bank Charges', 'EXPENSE', 'Banking fees and charges'),
('6011', 'Staff Salaries', 'EXPENSE', 'Employee salaries and wages'),
('6012', 'Staff Benefits', 'EXPENSE', 'Employee benefits and allowances')

ON CONFLICT (account_code) DO NOTHING;

-- 14. Insert sample financial transactions for demonstration
INSERT INTO financial_transactions (
    transaction_number, transaction_date, reference_type, description,
    account_id, debit_amount, credit_amount, status
)
SELECT 
    'TXN-2024-001', 
    CURRENT_DATE - INTERVAL '10 days',
    'PAYMENT',
    'Cash received from customer',
    (SELECT id FROM chart_of_accounts WHERE account_code = '1000'),
    50000.00,
    0.00,
    'APPROVED'
WHERE EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_code = '1000')

UNION ALL

SELECT 
    'TXN-2024-002', 
    CURRENT_DATE - INTERVAL '8 days',
    'EXPENSE',
    'Paper purchase',
    (SELECT id FROM chart_of_accounts WHERE account_code = '5000'),
    15000.00,
    0.00,
    'APPROVED'
WHERE EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_code = '5000')

UNION ALL

SELECT 
    'TXN-2024-003', 
    CURRENT_DATE - INTERVAL '5 days',
    'INVOICE',
    'Printing job revenue',
    (SELECT id FROM chart_of_accounts WHERE account_code = '4000'),
    0.00,
    35000.00,
    'APPROVED'
WHERE EXISTS (SELECT 1 FROM chart_of_accounts WHERE account_code = '4000');

-- 15. Create sequence for transaction numbers
CREATE SEQUENCE IF NOT EXISTS transaction_number_seq START 1000;

-- 16. Create function to generate transaction numbers
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'TXN-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('transaction_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 17. Create trigger to auto-generate transaction numbers
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
        NEW.transaction_number := generate_transaction_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_transaction_number
    BEFORE INSERT ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_number();

-- Success message
SELECT 'Complete finance schema setup completed successfully!' as result; 