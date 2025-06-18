-- =====================================================
-- FIX FINANCE REPORT RELATIONSHIPS - MISSING TABLES
-- =====================================================
-- This migration creates the missing line items tables and paper_types
-- that are causing PGRST200 foreign key relationship errors

-- =====================================================
-- CREATE MISSING FINANCE LINE ITEMS TABLES
-- =====================================================

-- 1. Create profit_loss_line_items table
CREATE TABLE IF NOT EXISTS profit_loss_line_items (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES profit_loss_reports(id) ON DELETE CASCADE,
    account_id BIGINT REFERENCES chart_of_accounts(id),
    category VARCHAR(50) NOT NULL, -- 'REVENUE', 'COGS', 'OPERATING_EXPENSES', 'OTHER'
    line_description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    percentage_of_revenue DECIMAL(5,2),
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create cash_flow_line_items table  
CREATE TABLE IF NOT EXISTS cash_flow_line_items (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES cash_flow_reports(id) ON DELETE CASCADE,
    account_id BIGINT REFERENCES chart_of_accounts(id),
    section VARCHAR(50) NOT NULL, -- 'OPERATING', 'INVESTING', 'FINANCING'
    category VARCHAR(100) NOT NULL, -- 'Net Income', 'Depreciation', etc.
    line_description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_subtotal BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create balance_sheet_line_items table
CREATE TABLE IF NOT EXISTS balance_sheet_line_items (
    id BIGSERIAL PRIMARY KEY,
    report_id BIGINT NOT NULL REFERENCES balance_sheet_reports(id) ON DELETE CASCADE,
    account_id BIGINT REFERENCES chart_of_accounts(id),
    section VARCHAR(50) NOT NULL, -- 'ASSETS', 'LIABILITIES', 'EQUITY'
    category VARCHAR(100) NOT NULL, -- 'Current Assets', 'Fixed Assets', etc.
    line_description VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_subtotal BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE MISSING PAPER_TYPES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS paper_types (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    gsm INTEGER, -- grams per square meter
    size VARCHAR(50), -- 'A4', 'A3', 'Letter', etc.
    color VARCHAR(50) DEFAULT 'White',
    finish VARCHAR(50), -- 'Glossy', 'Matte', 'Smooth', etc.
    cost_per_sheet DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    supplier VARCHAR(100),
    supplier_code VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for profit_loss_line_items
CREATE INDEX IF NOT EXISTS idx_profit_loss_line_items_report_id ON profit_loss_line_items(report_id);
CREATE INDEX IF NOT EXISTS idx_profit_loss_line_items_account_id ON profit_loss_line_items(account_id);
CREATE INDEX IF NOT EXISTS idx_profit_loss_line_items_category ON profit_loss_line_items(category);

-- Indexes for cash_flow_line_items
CREATE INDEX IF NOT EXISTS idx_cash_flow_line_items_report_id ON cash_flow_line_items(report_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_line_items_account_id ON cash_flow_line_items(account_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_line_items_section ON cash_flow_line_items(section);

-- Indexes for balance_sheet_line_items
CREATE INDEX IF NOT EXISTS idx_balance_sheet_line_items_report_id ON balance_sheet_line_items(report_id);
CREATE INDEX IF NOT EXISTS idx_balance_sheet_line_items_account_id ON balance_sheet_line_items(account_id);
CREATE INDEX IF NOT EXISTS idx_balance_sheet_line_items_section ON balance_sheet_line_items(section);

-- Indexes for paper_types
CREATE INDEX IF NOT EXISTS idx_paper_types_name ON paper_types(name);
CREATE INDEX IF NOT EXISTS idx_paper_types_active ON paper_types(is_active);

-- =====================================================
-- CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE profit_loss_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_types ENABLE ROW LEVEL SECURITY;

-- Policies for profit_loss_line_items
CREATE POLICY "profit_loss_line_items_select" ON profit_loss_line_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "profit_loss_line_items_insert" ON profit_loss_line_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profit_loss_line_items_update" ON profit_loss_line_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "profit_loss_line_items_delete" ON profit_loss_line_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for cash_flow_line_items
CREATE POLICY "cash_flow_line_items_select" ON cash_flow_line_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "cash_flow_line_items_insert" ON cash_flow_line_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "cash_flow_line_items_update" ON cash_flow_line_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "cash_flow_line_items_delete" ON cash_flow_line_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for balance_sheet_line_items
CREATE POLICY "balance_sheet_line_items_select" ON balance_sheet_line_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "balance_sheet_line_items_insert" ON balance_sheet_line_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "balance_sheet_line_items_update" ON balance_sheet_line_items
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "balance_sheet_line_items_delete" ON balance_sheet_line_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for paper_types
CREATE POLICY "paper_types_select" ON paper_types
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "paper_types_insert" ON paper_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "paper_types_update" ON paper_types
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "paper_types_delete" ON paper_types
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- INSERT SAMPLE PAPER TYPES DATA
-- =====================================================

INSERT INTO paper_types (name, description, gsm, size, color, finish, cost_per_sheet, stock_quantity, minimum_stock, supplier) VALUES
('Premium Card Stock', 'High-quality card stock for business cards and invitations', 350, 'A4', 'White', 'Smooth', 12.50, 5000, 500, 'Paper Pro Ltd'),
('Coated Art Paper', 'Glossy coated paper for brochures and magazines', 200, 'A4', 'White', 'Glossy', 8.75, 8000, 800, 'Quality Papers Inc'),
('Matt Finish Paper', 'Professional matte finish for reports and presentations', 150, 'A4', 'Off-White', 'Matte', 6.25, 10000, 1000, 'Eco Print Supplies'),
('Synthetic Paper', 'Waterproof synthetic material for outdoor signage', 250, 'A4', 'White', 'Waterproof', 15.00, 2000, 200, 'Synthetic Solutions'),
('Uncoated Paper', 'Standard office paper for everyday printing', 120, 'A4', 'Natural White', 'Uncoated', 4.50, 15000, 1500, 'Basic Papers Co'),
('Photo Paper Glossy', 'High-resolution photo printing paper', 260, 'A4', 'White', 'High Gloss', 18.00, 1000, 100, 'Photo Supplies Ltd'),
('Recycled Paper', 'Environmentally friendly recycled paper', 100, 'A4', 'Cream', 'Natural', 5.25, 12000, 1200, 'Green Paper Co'),
('Textured Linen', 'Premium textured paper for certificates', 200, 'A4', 'Ivory', 'Linen Texture', 14.00, 3000, 300, 'Premium Papers Inc')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ADD SAMPLE LINE ITEMS FOR EXISTING REPORTS
-- =====================================================

-- Add sample profit & loss line items if reports exist
DO $$
DECLARE
    report_record RECORD;
BEGIN
    -- For each existing profit_loss_report, add sample line items
    FOR report_record IN SELECT id FROM profit_loss_reports LIMIT 5
    LOOP
        INSERT INTO profit_loss_line_items (report_id, category, line_description, amount, sort_order) VALUES
        (report_record.id, 'REVENUE', 'Printing Services Revenue', 250000.00, 1),
        (report_record.id, 'REVENUE', 'Design Services Revenue', 75000.00, 2),
        (report_record.id, 'COGS', 'Paper and Materials', -80000.00, 3),
        (report_record.id, 'COGS', 'Ink and Consumables', -35000.00, 4),
        (report_record.id, 'OPERATING_EXPENSES', 'Staff Salaries', -90000.00, 5),
        (report_record.id, 'OPERATING_EXPENSES', 'Machine Maintenance', -15000.00, 6),
        (report_record.id, 'OPERATING_EXPENSES', 'Utilities', -12000.00, 7);
    END LOOP;
END $$;

-- Add sample cash flow line items if reports exist
DO $$
DECLARE
    report_record RECORD;
BEGIN
    FOR report_record IN SELECT id FROM cash_flow_reports LIMIT 5
    LOOP
        INSERT INTO cash_flow_line_items (report_id, section, category, line_description, amount, sort_order) VALUES
        (report_record.id, 'OPERATING', 'Net Income', 'Net Income from Operations', 93000.00, 1),
        (report_record.id, 'OPERATING', 'Depreciation', 'Depreciation of Equipment', 8000.00, 2),
        (report_record.id, 'OPERATING', 'Accounts Receivable', 'Change in Accounts Receivable', -15000.00, 3),
        (report_record.id, 'OPERATING', 'Inventory', 'Change in Inventory', -5000.00, 4),
        (report_record.id, 'INVESTING', 'Equipment Purchase', 'New Printing Equipment', -45000.00, 5),
        (report_record.id, 'FINANCING', 'Loan Payment', 'Equipment Loan Payment', -12000.00, 6);
    END LOOP;
END $$;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT 'Finance relationship tables created successfully!' as result; 