-- Finance Reports Schema Migration
-- Created: 2024-12-23
-- Purpose: Add comprehensive financial reporting system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES FOR FINANCE
-- =====================================================

-- Account types for chart of accounts
DO $$ BEGIN
  CREATE TYPE account_type AS ENUM (
      'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COST_OF_GOODS_SOLD'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Report status
DO $$ BEGIN
  CREATE TYPE report_status AS ENUM ('DRAFT', 'FINALIZED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Period types
DO $$ BEGIN
  CREATE TYPE period_type AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Cash flow categories
DO $$ BEGIN
  CREATE TYPE cash_flow_category AS ENUM ('OPERATING', 'INVESTING', 'FINANCING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tax types
DO $$ BEGIN
  CREATE TYPE tax_type AS ENUM ('GST', 'INCOME_TAX', 'TDS', 'PROFESSIONAL_TAX', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CHART OF ACCOUNTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    account_type account_type NOT NULL,
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROFIT & LOSS REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS profit_loss_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(200) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type period_type NOT NULL,
    
    -- Financial data
    total_revenue DECIMAL(15,2) DEFAULT 0,
    cost_of_goods_sold DECIMAL(15,2) DEFAULT 0,
    gross_profit DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    operating_income DECIMAL(15,2) DEFAULT 0,
    other_income DECIMAL(15,2) DEFAULT 0,
    other_expenses DECIMAL(15,2) DEFAULT 0,
    net_income DECIMAL(15,2) DEFAULT 0,
    
    -- Calculated ratios
    gross_profit_margin DECIMAL(5,2) DEFAULT 0,
    net_profit_margin DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    status report_status DEFAULT 'DRAFT',
    notes TEXT,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finalized_at TIMESTAMP WITH TIME ZONE,
    finalized_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROFIT & LOSS LINE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS profit_loss_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES profit_loss_reports(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    category VARCHAR(50) NOT NULL, -- revenue, cogs, expenses, other_income, other_expenses
    line_description VARCHAR(300) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    percentage_of_revenue DECIMAL(5,2) DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BALANCE SHEET REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS balance_sheet_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(200) NOT NULL,
    as_of_date DATE NOT NULL,
    
    -- Assets
    current_assets DECIMAL(15,2) DEFAULT 0,
    fixed_assets DECIMAL(15,2) DEFAULT 0,
    other_assets DECIMAL(15,2) DEFAULT 0,
    total_assets DECIMAL(15,2) DEFAULT 0,
    
    -- Liabilities
    current_liabilities DECIMAL(15,2) DEFAULT 0,
    long_term_liabilities DECIMAL(15,2) DEFAULT 0,
    total_liabilities DECIMAL(15,2) DEFAULT 0,
    
    -- Equity
    owner_equity DECIMAL(15,2) DEFAULT 0,
    retained_earnings DECIMAL(15,2) DEFAULT 0,
    total_equity DECIMAL(15,2) DEFAULT 0,
    
    -- Validation (Assets = Liabilities + Equity)
    balance_difference DECIMAL(15,2) DEFAULT 0,
    is_balanced BOOLEAN DEFAULT false,
    
    -- Metadata
    status report_status DEFAULT 'DRAFT',
    notes TEXT,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finalized_at TIMESTAMP WITH TIME ZONE,
    finalized_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BALANCE SHEET LINE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS balance_sheet_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES balance_sheet_reports(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    category VARCHAR(50) NOT NULL, -- current_assets, fixed_assets, current_liabilities, etc.
    line_description VARCHAR(300) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CASH FLOW REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cash_flow_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(200) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type period_type NOT NULL,
    
    -- Cash flows
    operating_cash_flow DECIMAL(15,2) DEFAULT 0,
    investing_cash_flow DECIMAL(15,2) DEFAULT 0,
    financing_cash_flow DECIMAL(15,2) DEFAULT 0,
    net_cash_flow DECIMAL(15,2) DEFAULT 0,
    
    -- Cash balances
    beginning_cash_balance DECIMAL(15,2) DEFAULT 0,
    ending_cash_balance DECIMAL(15,2) DEFAULT 0,
    
    -- Metadata
    status report_status DEFAULT 'DRAFT',
    notes TEXT,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finalized_at TIMESTAMP WITH TIME ZONE,
    finalized_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CASH FLOW LINE ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS cash_flow_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES cash_flow_reports(id) ON DELETE CASCADE,
    category cash_flow_category NOT NULL,
    line_description VARCHAR(300) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TAX REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(200) NOT NULL,
    tax_type tax_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Tax calculations
    taxable_income DECIMAL(15,2) DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    tax_paid DECIMAL(15,2) DEFAULT 0,
    tax_due DECIMAL(15,2) DEFAULT 0,
    
    -- Due dates and compliance
    due_date DATE,
    filing_date DATE,
    filing_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, FILED, OVERDUE
    
    -- Metadata
    status report_status DEFAULT 'DRAFT',
    notes TEXT,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finalized_at TIMESTAMP WITH TIME ZONE,
    finalized_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOM REPORTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_name VARCHAR(200) NOT NULL,
    description TEXT,
    sql_query TEXT NOT NULL,
    
    -- Report configuration
    is_public BOOLEAN DEFAULT false,
    parameters JSONB, -- For parameterized queries
    
    -- Execution tracking
    last_executed_at TIMESTAMP WITH TIME ZONE,
    execution_count INTEGER DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 0,
    
    -- Scheduling
    is_scheduled BOOLEAN DEFAULT false,
    schedule_expression VARCHAR(100), -- Cron expression
    next_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CUSTOM REPORT EXECUTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS custom_report_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
    executed_by UUID REFERENCES users(id),
    execution_time_ms INTEGER,
    row_count INTEGER,
    status VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, ERROR, TIMEOUT
    error_message TEXT,
    result_data JSONB,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FINANCIAL TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    account_id UUID REFERENCES chart_of_accounts(id),
    party_id INTEGER REFERENCES parties(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    reference_number VARCHAR(100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Chart of accounts indexes
CREATE INDEX IF NOT EXISTS idx_chart_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_accounts_active ON chart_of_accounts(is_active);

-- P&L reports indexes
CREATE INDEX IF NOT EXISTS idx_pl_reports_period ON profit_loss_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_pl_reports_status ON profit_loss_reports(status);
CREATE INDEX IF NOT EXISTS idx_pl_reports_generated_by ON profit_loss_reports(generated_by);

-- Balance sheet indexes
CREATE INDEX IF NOT EXISTS idx_bs_reports_date ON balance_sheet_reports(as_of_date);
CREATE INDEX IF NOT EXISTS idx_bs_reports_status ON balance_sheet_reports(status);

-- Cash flow indexes
CREATE INDEX IF NOT EXISTS idx_cf_reports_period ON cash_flow_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_cf_reports_status ON cash_flow_reports(status);

-- Tax reports indexes
CREATE INDEX IF NOT EXISTS idx_tax_reports_type ON tax_reports(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_reports_due_date ON tax_reports(due_date);
CREATE INDEX IF NOT EXISTS idx_tax_reports_filing_status ON tax_reports(filing_status);

-- Custom reports indexes
CREATE INDEX IF NOT EXISTS idx_custom_reports_public ON custom_reports(is_public);
CREATE INDEX IF NOT EXISTS idx_custom_reports_scheduled ON custom_reports(is_scheduled);

-- Financial transactions indexes
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_report_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Chart of accounts policies
CREATE POLICY "Users can view chart of accounts" ON chart_of_accounts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and finance can manage chart of accounts" ON chart_of_accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

-- P&L reports policies
CREATE POLICY "Users can view P&L reports" ON profit_loss_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance', 'supervisor')
        )
    );

CREATE POLICY "Finance and admin can manage P&L reports" ON profit_loss_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

-- Balance sheet policies
CREATE POLICY "Users can view balance sheet reports" ON balance_sheet_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance', 'supervisor')
        )
    );

CREATE POLICY "Finance and admin can manage balance sheet reports" ON balance_sheet_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

-- Cash flow policies
CREATE POLICY "Users can view cash flow reports" ON cash_flow_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance', 'supervisor')
        )
    );

CREATE POLICY "Finance and admin can manage cash flow reports" ON cash_flow_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

-- Tax reports policies
CREATE POLICY "Users can view tax reports" ON tax_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance', 'supervisor')
        )
    );

CREATE POLICY "Finance and admin can manage tax reports" ON tax_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

-- Custom reports policies
CREATE POLICY "Users can view public custom reports" ON custom_reports
    FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage their own custom reports" ON custom_reports
    FOR ALL USING (created_by = auth.uid());

-- Financial transactions policies
CREATE POLICY "Users can view financial transactions" ON financial_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance', 'supervisor')
        )
    );

CREATE POLICY "Finance and admin can manage financial transactions" ON financial_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

-- =====================================================
-- SAMPLE CHART OF ACCOUNTS DATA (Indian Printing Business)
-- =====================================================

INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- Assets
('1101', 'Cash in Hand', 'ASSET', 'Petty cash and till money'),
('1102', 'Bank Account - Current', 'ASSET', 'Main operating bank account'),
('1103', 'Bank Account - Savings', 'ASSET', 'Savings account'),
('1104', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
('1105', 'Inventory - Raw Materials', 'ASSET', 'Paper, ink, chemicals'),
('1106', 'Inventory - Work in Progress', 'ASSET', 'Jobs in production'),
('1107', 'Inventory - Finished Goods', 'ASSET', 'Completed jobs ready for delivery'),
('1108', 'Prepaid Expenses', 'ASSET', 'Rent, insurance paid in advance'),

('1201', 'Printing Machines', 'ASSET', 'Offset and digital printing machines'),
('1202', 'Finishing Equipment', 'ASSET', 'Cutting, binding, lamination machines'),
('1203', 'Computer & Software', 'ASSET', 'Computers, design software, RIP'),
('1204', 'Furniture & Fixtures', 'ASSET', 'Office and production furniture'),
('1205', 'Vehicles', 'ASSET', 'Delivery vehicles'),

-- Liabilities
('2101', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
('2102', 'GST Payable', 'LIABILITY', 'GST collected from customers'),
('2103', 'TDS Payable', 'LIABILITY', 'Tax deducted at source'),
('2104', 'Employee Salaries Payable', 'LIABILITY', 'Unpaid salaries'),
('2105', 'Electricity Bills Payable', 'LIABILITY', 'Pending electricity bills'),

('2201', 'Bank Loan - Machinery', 'LIABILITY', 'Loan for equipment purchase'),
('2202', 'Vehicle Loan', 'LIABILITY', 'Loan for delivery vehicles'),

-- Equity
('3101', 'Owner Capital', 'EQUITY', 'Initial and additional capital'),
('3102', 'Retained Earnings', 'EQUITY', 'Accumulated profits'),
('3103', 'Current Year Earnings', 'EQUITY', 'Current year profit/loss'),

-- Revenue
('4101', 'Printing Services Revenue', 'REVENUE', 'Revenue from printing jobs'),
('4102', 'Design Services Revenue', 'REVENUE', 'Revenue from design work'),
('4103', 'Finishing Services Revenue', 'REVENUE', 'Binding, cutting, lamination'),
('4104', 'Rush Job Premium', 'REVENUE', 'Extra charges for urgent jobs'),
('4105', 'Other Revenue', 'REVENUE', 'Miscellaneous income'),

-- Cost of Goods Sold
('5101', 'Paper Cost', 'COST_OF_GOODS_SOLD', 'Cost of paper used in jobs'),
('5102', 'Ink Cost', 'COST_OF_GOODS_SOLD', 'Cost of ink used in jobs'),
('5103', 'Chemicals Cost', 'COST_OF_GOODS_SOLD', 'Plates, solutions, etc.'),
('5104', 'Direct Labor', 'COST_OF_GOODS_SOLD', 'Machine operator wages'),
('5105', 'Outsourcing Cost', 'COST_OF_GOODS_SOLD', 'External services for jobs'),

-- Expenses
('6101', 'Rent Expense', 'EXPENSE', 'Office and production space rent'),
('6102', 'Electricity Expense', 'EXPENSE', 'Power consumption'),
('6103', 'Staff Salaries', 'EXPENSE', 'Admin and support staff salaries'),
('6104', 'Machine Maintenance', 'EXPENSE', 'Equipment servicing and repairs'),
('6105', 'Office Supplies', 'EXPENSE', 'Stationery and office materials'),
('6106', 'Telephone & Internet', 'EXPENSE', 'Communication expenses'),
('6107', 'Delivery Charges', 'EXPENSE', 'Transportation and delivery'),
('6108', 'Professional Fees', 'EXPENSE', 'CA, legal, consulting fees'),
('6109', 'Insurance Expense', 'EXPENSE', 'Equipment and business insurance'),
('6110', 'Depreciation Expense', 'EXPENSE', 'Depreciation on fixed assets'),
('6111', 'Interest Expense', 'EXPENSE', 'Interest on loans'),
('6112', 'Marketing & Advertising', 'EXPENSE', 'Promotional activities'),
('6113', 'Travel Expenses', 'EXPENSE', 'Business travel costs'),
('6114', 'Bank Charges', 'EXPENSE', 'Banking and transaction fees'),
('6115', 'Other Expenses', 'EXPENSE', 'Miscellaneous operating expenses')

ON CONFLICT (account_code) DO NOTHING; 