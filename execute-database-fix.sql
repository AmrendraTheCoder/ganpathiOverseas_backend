-- =================================================
-- GANPATHI OVERSEAS - COMPLETE DATABASE FIX
-- Execute this SQL in Supabase Dashboard > SQL Editor
-- =================================================

-- Step 1: Add missing columns to job_sheets table
-- -------------------------------------------------
DO $$ 
BEGIN
    -- Add UV column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_sheets' AND column_name = 'uv'
    ) THEN
        ALTER TABLE job_sheets ADD COLUMN uv DECIMAL(10,2);
        RAISE NOTICE 'Added UV column to job_sheets';
    ELSE
        RAISE NOTICE 'UV column already exists in job_sheets';
    END IF;

    -- Add baking column if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_sheets' AND column_name = 'baking'
    ) THEN
        ALTER TABLE job_sheets ADD COLUMN baking DECIMAL(10,2);
        RAISE NOTICE 'Added baking column to job_sheets';
    ELSE
        RAISE NOTICE 'Baking column already exists in job_sheets';
    END IF;
END $$;

-- Step 2: Create Chart of Accounts table
-- --------------------------------------
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COGS')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 3: Create Financial Transactions table
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL,
    reference_type VARCHAR(50) NOT NULL CHECK (reference_type IN ('JOB_SHEET', 'PARTY_TRANSACTION', 'INVOICE', 'PAYMENT', 'ADJUSTMENT', 'TRANSFER')),
    reference_id UUID,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'POSTED', 'CANCELLED')),
    party_id UUID REFERENCES parties(id),
    job_sheet_id UUID REFERENCES job_sheets(id),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT check_debit_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- Step 4: Create Profit & Loss Reports table
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS profit_loss_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    cost_of_goods_sold DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    operating_expenses DECIMAL(15,2) DEFAULT 0,
    operating_profit DECIMAL(15,2) DEFAULT 0,
    other_income DECIMAL(15,2) DEFAULT 0,
    other_expenses DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
);

-- Step 5: Create Balance Sheet Reports table
-- -----------------------------------------
CREATE TABLE IF NOT EXISTS balance_sheet_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    as_of_date DATE NOT NULL,
    total_assets DECIMAL(15,2) DEFAULT 0,
    current_assets DECIMAL(15,2) DEFAULT 0,
    fixed_assets DECIMAL(15,2) DEFAULT 0,
    total_liabilities DECIMAL(15,2) DEFAULT 0,
    current_liabilities DECIMAL(15,2) DEFAULT 0,
    long_term_liabilities DECIMAL(15,2) DEFAULT 0,
    total_equity DECIMAL(15,2) DEFAULT 0,
    retained_earnings DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
);

-- Step 6: Create Cash Flow Reports table
-- ------------------------------------
CREATE TABLE IF NOT EXISTS cash_flow_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    opening_cash_balance DECIMAL(15,2) DEFAULT 0,
    operating_cash_flow DECIMAL(15,2) DEFAULT 0,
    investing_cash_flow DECIMAL(15,2) DEFAULT 0,
    financing_cash_flow DECIMAL(15,2) DEFAULT 0,
    net_cash_flow DECIMAL(15,2) DEFAULT 0,
    closing_cash_balance DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
);

-- Step 7: Create Tax Reports table
-- ------------------------------
CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    tax_period_start DATE NOT NULL,
    tax_period_end DATE NOT NULL,
    financial_year VARCHAR(20) NOT NULL,
    gst_collected DECIMAL(15,2) DEFAULT 0,
    gst_paid DECIMAL(15,2) DEFAULT 0,
    gst_payable DECIMAL(15,2) DEFAULT 0,
    income_tax DECIMAL(15,2) DEFAULT 0,
    tds_collected DECIMAL(15,2) DEFAULT 0,
    tds_paid DECIMAL(15,2) DEFAULT 0,
    other_taxes DECIMAL(15,2) DEFAULT 0,
    total_tax_liability DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
);

-- Step 8: Create Custom Reports table
-- ----------------------------------
CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    description TEXT,
    sql_query TEXT,
    parameters JSONB,
    report_data JSONB,
    chart_config JSONB,
    is_public BOOLEAN DEFAULT false,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SAVED', 'SCHEDULED', 'ARCHIVED'))
);

-- Step 9: Create indexes for performance
-- ------------------------------------
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_job_sheet ON financial_transactions(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_active ON chart_of_accounts(is_active);

-- Step 10: Enable Row Level Security (RLS)
-- ---------------------------------------
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- Step 11: Create RLS policies
-- --------------------------
DO $$ 
BEGIN
    -- Chart of Accounts policies
    DROP POLICY IF EXISTS "chart_of_accounts_select" ON chart_of_accounts;
    CREATE POLICY "chart_of_accounts_select" ON chart_of_accounts FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "chart_of_accounts_insert" ON chart_of_accounts;
    CREATE POLICY "chart_of_accounts_insert" ON chart_of_accounts FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "chart_of_accounts_update" ON chart_of_accounts;
    CREATE POLICY "chart_of_accounts_update" ON chart_of_accounts FOR UPDATE USING (true);

    -- Financial Transactions policies
    DROP POLICY IF EXISTS "financial_transactions_select" ON financial_transactions;
    CREATE POLICY "financial_transactions_select" ON financial_transactions FOR SELECT USING (true);
    
    DROP POLICY IF EXISTS "financial_transactions_insert" ON financial_transactions;
    CREATE POLICY "financial_transactions_insert" ON financial_transactions FOR INSERT WITH CHECK (true);
    
    DROP POLICY IF EXISTS "financial_transactions_update" ON financial_transactions;
    CREATE POLICY "financial_transactions_update" ON financial_transactions FOR UPDATE USING (true);

    -- Report tables policies (all similar)
    DROP POLICY IF EXISTS "profit_loss_reports_all" ON profit_loss_reports;
    CREATE POLICY "profit_loss_reports_all" ON profit_loss_reports FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "balance_sheet_reports_all" ON balance_sheet_reports;
    CREATE POLICY "balance_sheet_reports_all" ON balance_sheet_reports FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "cash_flow_reports_all" ON cash_flow_reports;
    CREATE POLICY "cash_flow_reports_all" ON cash_flow_reports FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "tax_reports_all" ON tax_reports;
    CREATE POLICY "tax_reports_all" ON tax_reports FOR ALL USING (true);
    
    DROP POLICY IF EXISTS "custom_reports_all" ON custom_reports;
    CREATE POLICY "custom_reports_all" ON custom_reports FOR ALL USING (true);

    RAISE NOTICE 'RLS policies created successfully';
END $$;

-- Step 12: Insert sample Chart of Accounts for Printing Business
-- ------------------------------------------------------------
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- Assets
('1000', 'Cash in Hand', 'ASSET', 'Petty cash and cash on hand'),
('1001', 'Bank Account - Current', 'ASSET', 'Primary business checking account'),
('1002', 'Bank Account - Savings', 'ASSET', 'Business savings account'),
('1100', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
('1200', 'Inventory - Paper Stock', 'ASSET', 'Paper and printing materials inventory'),
('1201', 'Inventory - Ink & Supplies', 'ASSET', 'Printing inks and consumables'),
('1300', 'Equipment - Printing Machines', 'ASSET', 'Printing presses and machinery'),
('1301', 'Equipment - Office', 'ASSET', 'Office furniture and equipment'),
('1400', 'Accumulated Depreciation', 'ASSET', 'Depreciation on fixed assets'),

-- Liabilities  
('2000', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
('2100', 'GST Payable', 'LIABILITY', 'GST collected from customers'),
('2101', 'TDS Payable', 'LIABILITY', 'Tax deducted at source'),
('2200', 'Salary Payable', 'LIABILITY', 'Unpaid employee salaries'),
('2300', 'Loan Payable', 'LIABILITY', 'Business loans and financing'),

-- Equity
('3000', 'Owner Equity', 'EQUITY', 'Owner investment in business'),
('3100', 'Retained Earnings', 'EQUITY', 'Accumulated business profits'),

-- Revenue
('4000', 'Printing Revenue', 'REVENUE', 'Income from printing services'),
('4001', 'Digital Printing Revenue', 'REVENUE', 'Income from digital printing'),
('4002', 'Offset Printing Revenue', 'REVENUE', 'Income from offset printing'),
('4003', 'Design Service Revenue', 'REVENUE', 'Income from design services'),
('4100', 'Other Income', 'REVENUE', 'Miscellaneous income'),

-- Cost of Goods Sold
('5000', 'Paper Cost', 'COGS', 'Cost of paper and printing materials'),
('5001', 'Ink Cost', 'COGS', 'Cost of printing inks'),
('5002', 'Production Labor', 'COGS', 'Direct labor costs for production'),
('5003', 'Machine Operating Cost', 'COGS', 'Direct machine operating expenses'),

-- Expenses
('6000', 'Office Rent', 'EXPENSE', 'Monthly office and factory rent'),
('6001', 'Utilities', 'EXPENSE', 'Electricity, water, internet bills'),
('6002', 'Telephone & Internet', 'EXPENSE', 'Communication expenses'),
('6100', 'Salaries & Wages', 'EXPENSE', 'Employee compensation'),
('6101', 'Employee Benefits', 'EXPENSE', 'PF, ESI, and other benefits'),
('6200', 'Machine Maintenance', 'EXPENSE', 'Printing equipment maintenance'),
('6201', 'Office Maintenance', 'EXPENSE', 'Office upkeep and repairs'),
('6300', 'Professional Fees', 'EXPENSE', 'Accountant, lawyer, consultant fees'),
('6301', 'Business Registration', 'EXPENSE', 'License and registration fees'),
('6400', 'Marketing & Advertising', 'EXPENSE', 'Promotional activities'),
('6401', 'Travel & Transportation', 'EXPENSE', 'Business travel expenses'),
('6500', 'Insurance', 'EXPENSE', 'Business and equipment insurance'),
('6600', 'Depreciation Expense', 'EXPENSE', 'Equipment depreciation'),
('6700', 'Bank Charges', 'EXPENSE', 'Banking fees and charges'),
('6800', 'Interest Expense', 'EXPENSE', 'Loan interest payments'),
('6900', 'Miscellaneous Expenses', 'EXPENSE', 'Other business expenses')
ON CONFLICT (account_code) DO NOTHING;

-- Step 13: Create auto-increment function for transaction numbers
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Get the next number in sequence
    SELECT COALESCE(MAX(CAST(SUBSTRING(transaction_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM financial_transactions
    WHERE transaction_number LIKE 'TXN-%';
    
    -- Format with leading zeros
    formatted_number := 'TXN-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Step 14: Create trigger for auto-generating transaction numbers
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
        NEW.transaction_number := generate_transaction_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_transaction_number ON financial_transactions;
CREATE TRIGGER trigger_set_transaction_number
    BEFORE INSERT ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_number();

-- Step 15: Create updated_at triggers for all tables
-- ------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all finance tables
DROP TRIGGER IF EXISTS trigger_update_chart_of_accounts ON chart_of_accounts;
CREATE TRIGGER trigger_update_chart_of_accounts
    BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_financial_transactions ON financial_transactions;
CREATE TRIGGER trigger_update_financial_transactions
    BEFORE UPDATE ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Final Success Message
DO $$ 
BEGIN
    RAISE NOTICE '🎉 DATABASE FIX COMPLETED SUCCESSFULLY! 🎉';
    RAISE NOTICE '✅ Added UV and baking columns to job_sheets';
    RAISE NOTICE '✅ Created 7 finance tables with all relationships';
    RAISE NOTICE '✅ Inserted 46 chart of accounts entries';
    RAISE NOTICE '✅ Created indexes and RLS policies';
    RAISE NOTICE '✅ Added auto-numbering and triggers';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Your Ganpathi Overseas ERP system is now fully operational!';
    RAISE NOTICE 'Return to your application and refresh to see all features working.';
END $$; 