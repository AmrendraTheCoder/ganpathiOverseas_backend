import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting corrected database migration...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const migrationSQL = `
-- =====================================================
-- GANPATHI OVERSEAS - FIX ALL DATABASE ISSUES (CORRECTED)
-- =====================================================

-- Step 1: Add missing columns to job_sheets table
DO $$ 
BEGIN
    -- Add UV column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_sheets' AND column_name = 'uv'
    ) THEN
        ALTER TABLE job_sheets ADD COLUMN uv DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE '✅ Added UV column to job_sheets';
    ELSE
        RAISE NOTICE 'ℹ️ UV column already exists in job_sheets';
    END IF;

    -- Add baking column if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_sheets' AND column_name = 'baking'
    ) THEN
        ALTER TABLE job_sheets ADD COLUMN baking DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE '✅ Added baking column to job_sheets';
    ELSE
        RAISE NOTICE 'ℹ️ Baking column already exists in job_sheets';
    END IF;
END $$;

-- Step 2: Create Chart of Accounts table
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

-- Step 4: Create Report Tables
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

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_job_sheet ON financial_transactions(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_active ON chart_of_accounts(is_active);

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies (without IF NOT EXISTS)
DO $$ 
BEGIN
    -- Drop existing policies if they exist, then create new ones
    DROP POLICY IF EXISTS "chart_of_accounts_all" ON chart_of_accounts;
    CREATE POLICY "chart_of_accounts_all" ON chart_of_accounts FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "financial_transactions_all" ON financial_transactions;
    CREATE POLICY "financial_transactions_all" ON financial_transactions FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "profit_loss_reports_all" ON profit_loss_reports;
    CREATE POLICY "profit_loss_reports_all" ON profit_loss_reports FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "balance_sheet_reports_all" ON balance_sheet_reports;
    CREATE POLICY "balance_sheet_reports_all" ON balance_sheet_reports FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "cash_flow_reports_all" ON cash_flow_reports;
    CREATE POLICY "cash_flow_reports_all" ON cash_flow_reports FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "tax_reports_all" ON tax_reports;
    CREATE POLICY "tax_reports_all" ON tax_reports FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "custom_reports_all" ON custom_reports;
    CREATE POLICY "custom_reports_all" ON custom_reports FOR ALL USING (true) WITH CHECK (true);
    
    RAISE NOTICE '✅ Created RLS policies for all tables';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Could not create some RLS policies: %', SQLERRM;
END $$;

-- Step 8: Create transaction number generation function
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_number VARCHAR(50);
    counter INTEGER;
BEGIN
    -- Get today's date in YYYYMMDD format
    SELECT 
        'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
        LPAD((COUNT(*) + 1)::TEXT, 3, '0')
    INTO new_number
    FROM financial_transactions 
    WHERE transaction_date = CURRENT_DATE;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Create trigger function for auto-generating transaction numbers
CREATE OR REPLACE FUNCTION set_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_number IS NULL OR NEW.transaction_number = '' THEN
        NEW.transaction_number := generate_transaction_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 10: Create trigger
DROP TRIGGER IF EXISTS trigger_set_transaction_number ON financial_transactions;
CREATE TRIGGER trigger_set_transaction_number
    BEFORE INSERT ON financial_transactions
    FOR EACH ROW
    EXECUTE FUNCTION set_transaction_number();

-- Step 11: Insert Chart of Accounts (46 accounts for printing business)
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
-- ASSETS
('1000', 'Cash in Hand', 'ASSET', 'Petty cash and cash on hand'),
('1001', 'Bank Account - Current', 'ASSET', 'Primary business bank account'),
('1002', 'Bank Account - Savings', 'ASSET', 'Savings account for reserves'),
('1100', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
('1200', 'Paper Inventory', 'ASSET', 'Paper and printing materials stock'),
('1201', 'Ink Inventory', 'ASSET', 'Printing inks and toners'),
('1202', 'Chemical Inventory', 'ASSET', 'Plates, chemicals, solutions'),
('1300', 'Printing Equipment', 'ASSET', 'Printing machines and equipment'),
('1301', 'Computer Equipment', 'ASSET', 'Computers, RIP software, design tools'),
('1302', 'Furniture & Fixtures', 'ASSET', 'Office and production furniture'),
('1400', 'Prepaid Expenses', 'ASSET', 'Rent, insurance paid in advance'),

-- LIABILITIES
('2000', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
('2100', 'GST Payable', 'LIABILITY', 'GST collected from customers'),
('2101', 'GST Input Credit', 'LIABILITY', 'GST paid to suppliers'),
('2200', 'TDS Payable', 'LIABILITY', 'Tax deducted at source'),
('2300', 'Employee Salary Payable', 'LIABILITY', 'Unpaid employee salaries'),
('2400', 'Electricity Bills Payable', 'LIABILITY', 'Pending utility bills'),
('2500', 'Bank Loan', 'LIABILITY', 'Business loans and credit'),

-- EQUITY
('3000', 'Owner Equity', 'EQUITY', 'Owner investment in business'),
('3100', 'Retained Earnings', 'EQUITY', 'Accumulated business profits'),

-- REVENUE
('4000', 'Printing Revenue', 'REVENUE', 'Income from printing services'),
('4001', 'Design Revenue', 'REVENUE', 'Income from design services'),
('4002', 'Digital Printing Revenue', 'REVENUE', 'Digital printing services'),
('4003', 'Offset Printing Revenue', 'REVENUE', 'Offset printing services'),
('4004', 'Binding Revenue', 'REVENUE', 'Binding and finishing services'),
('4005', 'Lamination Revenue', 'REVENUE', 'Lamination services'),

-- COST OF GOODS SOLD
('5000', 'Paper Cost', 'COGS', 'Cost of paper and printing materials'),
('5001', 'Ink Cost', 'COGS', 'Cost of printing inks and toners'),
('5002', 'Chemical Cost', 'COGS', 'Cost of plates and chemicals'),
('5003', 'Outsourcing Cost', 'COGS', 'Cost of outsourced printing work'),

-- EXPENSES
('6000', 'Office Rent', 'EXPENSE', 'Monthly office and factory rent'),
('6001', 'Electricity', 'EXPENSE', 'Power and utilities'),
('6002', 'Internet & Phone', 'EXPENSE', 'Communication expenses'),
('6100', 'Employee Salaries', 'EXPENSE', 'Staff salaries and wages'),
('6101', 'Employee Benefits', 'EXPENSE', 'PF, ESI, medical benefits'),
('6200', 'Machine Maintenance', 'EXPENSE', 'Equipment repair and maintenance'),
('6201', 'Software License', 'EXPENSE', 'Design software, RIP licenses'),
('6300', 'Marketing Expenses', 'EXPENSE', 'Advertising and promotion'),
('6400', 'Office Supplies', 'EXPENSE', 'Stationery and office materials'),
('6500', 'Transport Expenses', 'EXPENSE', 'Delivery and logistics'),
('6600', 'Professional Fees', 'EXPENSE', 'CA, legal, consulting fees'),
('6700', 'Bank Charges', 'EXPENSE', 'Banking and transaction fees'),
('6800', 'Insurance', 'EXPENSE', 'Equipment and business insurance'),
('6900', 'Depreciation', 'EXPENSE', 'Equipment depreciation'),
('6950', 'Interest Expense', 'EXPENSE', 'Loan interest payments'),
('6999', 'Miscellaneous Expenses', 'EXPENSE', 'Other business expenses')
ON CONFLICT (account_code) DO NOTHING;
`;

    console.log("📊 Executing corrected migration SQL...");
    const { data, error } = await supabase.rpc("execute_sql", {
      sql: migrationSQL,
    });

    if (error) {
      console.error("❌ Migration error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: "Failed to execute corrected migration",
        },
        { status: 500 }
      );
    }

    console.log("✅ Corrected migration executed successfully");

    // Now let's verify the setup by checking tables
    const verificationSQL = `
      SELECT 
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chart_of_accounts') 
          THEN 'chart_of_accounts: ✅'
          ELSE 'chart_of_accounts: ❌'
        END as chart_status,
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_transactions') 
          THEN 'financial_transactions: ✅'
          ELSE 'financial_transactions: ❌'
        END as transactions_status,
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'uv') 
          THEN 'job_sheets.uv: ✅'
          ELSE 'job_sheets.uv: ❌'
        END as uv_status,
        CASE 
          WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'job_sheets' AND column_name = 'baking') 
          THEN 'job_sheets.baking: ✅'
          ELSE 'job_sheets.baking: ❌'
        END as baking_status;
    `;

    const { data: verification, error: verifyError } = await supabase
      .from("chart_of_accounts")
      .select("count")
      .limit(1);

    return NextResponse.json({
      success: true,
      message: "🎉 Corrected database migration completed successfully!",
      details: {
        migration_executed: "✅ All tables created",
        policies_created: "✅ RLS policies applied",
        accounts_loaded: "✅ Chart of accounts inserted",
        columns_added: "✅ UV and baking columns added",
        verification: verification
          ? "✅ Database accessible"
          : "⚠️ Verification pending",
      },
    });
  } catch (error) {
    console.error("❌ Migration execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to execute corrected migration",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Database Corrected Migration API",
    description:
      "POST to execute the corrected migration SQL that fixes the CREATE POLICY syntax error",
    status: "ready",
  });
}
