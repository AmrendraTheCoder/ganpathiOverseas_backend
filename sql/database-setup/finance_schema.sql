-- =============================================
-- Finance Database Schema for Ganpathi Overseas ERP
-- =============================================
-- Complete finance management system schema

-- 1. ACCOUNTS TABLE (Chart of Accounts)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    parent_account_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. FINANCIAL TRANSACTIONS TABLE (Enhanced)
DROP TABLE IF EXISTS financial_transactions CASCADE;
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference_type VARCHAR(50) CHECK (reference_type IN ('JOB_SHEET', 'INVOICE', 'PAYMENT', 'EXPENSE', 'ADJUSTMENT', 'TRANSFER')),
    reference_id UUID,
    party_id UUID REFERENCES parties(id),
    description TEXT NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TRANSACTION ENTRIES TABLE (Double Entry Bookkeeping)
CREATE TABLE IF NOT EXISTS transaction_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES financial_transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 4. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    party_id UUID NOT NULL REFERENCES parties(id),
    job_sheet_id UUID REFERENCES job_sheets(id),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')),
    terms TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 5. INVOICE ITEMS TABLE
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    party_id UUID NOT NULL REFERENCES parties(id),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH' CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'CREDIT_CARD', 'UPI', 'OTHER')),
    reference_number VARCHAR(100),
    bank_account VARCHAR(100),
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 7. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_number VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    vendor_name VARCHAR(255),
    vendor_id UUID REFERENCES parties(id),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'CASH',
    receipt_number VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'REJECTED')),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 8. BUDGET TABLE
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    budget_period VARCHAR(20) DEFAULT 'MONTHLY' CHECK (budget_period IN ('MONTHLY', 'QUARTERLY', 'YEARLY')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budgeted_amount DECIMAL(15,2) NOT NULL,
    spent_amount DECIMAL(15,2) DEFAULT 0,
    remaining_amount DECIMAL(15,2) GENERATED ALWAYS AS (budgeted_amount - spent_amount) STORED,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'EXCEEDED')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 9. FINANCIAL REPORTS CACHE TABLE
CREATE TABLE IF NOT EXISTS financial_reports_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(100) NOT NULL,
    report_period VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    report_data JSONB NOT NULL,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(reference_type);
CREATE INDEX IF NOT EXISTS idx_transaction_entries_account ON transaction_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_party ON payments(party_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- INSERT DEFAULT CHART OF ACCOUNTS
INSERT INTO accounts (account_code, account_name, account_type, description) VALUES
-- ASSETS
('1000', 'Current Assets', 'ASSET', 'Current Assets'),
('1100', 'Cash in Hand', 'ASSET', 'Cash available in office'),
('1110', 'Bank Account - Current', 'ASSET', 'Current bank account'),
('1120', 'Bank Account - Savings', 'ASSET', 'Savings bank account'),
('1200', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
('1300', 'Inventory', 'ASSET', 'Raw materials and finished goods'),
('1400', 'Prepaid Expenses', 'ASSET', 'Advance payments'),

-- LIABILITIES
('2000', 'Current Liabilities', 'LIABILITY', 'Current Liabilities'),
('2100', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
('2200', 'Accrued Expenses', 'LIABILITY', 'Expenses incurred but not paid'),
('2300', 'Tax Payable', 'LIABILITY', 'Taxes owed to government'),

-- EQUITY
('3000', 'Owner Equity', 'EQUITY', 'Owner capital and retained earnings'),
('3100', 'Capital', 'EQUITY', 'Initial capital investment'),
('3200', 'Retained Earnings', 'EQUITY', 'Accumulated profits'),

-- REVENUE
('4000', 'Revenue', 'REVENUE', 'Business Income'),
('4100', 'Sales Revenue', 'REVENUE', 'Revenue from job orders'),
('4200', 'Service Revenue', 'REVENUE', 'Revenue from services'),
('4300', 'Other Revenue', 'REVENUE', 'Miscellaneous income'),

-- EXPENSES
('5000', 'Operating Expenses', 'EXPENSE', 'Business operating costs'),
('5100', 'Raw Material Cost', 'EXPENSE', 'Cost of materials'),
('5200', 'Labor Cost', 'EXPENSE', 'Employee wages and salaries'),
('5300', 'Utilities', 'EXPENSE', 'Electricity, water, etc.'),
('5400', 'Rent', 'EXPENSE', 'Office and factory rent'),
('5500', 'Equipment Maintenance', 'EXPENSE', 'Machine maintenance costs'),
('5600', 'Marketing Expenses', 'EXPENSE', 'Advertising and promotion'),
('5700', 'Administrative Expenses', 'EXPENSE', 'Office administration costs'),
('5800', 'Professional Fees', 'EXPENSE', 'Legal, accounting fees'),
('5900', 'Other Expenses', 'EXPENSE', 'Miscellaneous expenses')
ON CONFLICT (account_code) DO NOTHING;

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_reports_cache ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Finance users can access all financial data
CREATE POLICY "Finance access to accounts" ON accounts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to financial_transactions" ON financial_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to transaction_entries" ON transaction_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to invoices" ON invoices
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to invoice_items" ON invoice_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to payments" ON payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to expenses" ON expenses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to budgets" ON budgets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    );

CREATE POLICY "Finance access to financial_reports_cache" ON financial_reports_cache
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'finance')
        )
    ); 