"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface DatabaseStatus {
  status: string;
  finance_tables_count: number;
  job_sheets_columns: boolean;
  issues: string[];
}

export default function FixDatabaseNowPage() {
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [fixScript, setFixScript] = useState<string>("");

  useEffect(() => {
    fetchDatabaseStatus();
    fetchFixScript();
  }, []);

  const fetchDatabaseStatus = async () => {
    try {
      const response = await fetch("/api/db-verify");
      const status = await response.json();
      setDatabaseStatus(status);
    } catch (error) {
      console.error("Failed to fetch database status:", error);
      toast.error("Failed to check database status");
    } finally {
      setLoading(false);
    }
  };

  const fetchFixScript = async () => {
    try {
      // Read the fix script content
      const script = `-- GANPATHI OVERSEAS - COMPLETE DATABASE FIX
-- Execute this in Supabase Dashboard > SQL Editor

-- Step 1: Add missing columns to job_sheets
ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS uv DECIMAL(10,2);
ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS baking DECIMAL(10,2);

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
    reference_type VARCHAR(50) NOT NULL,
    reference_id UUID,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    status VARCHAR(20) DEFAULT 'PENDING',
    party_id UUID REFERENCES parties(id),
    job_sheet_id UUID REFERENCES job_sheets(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Step 4: Create report tables
CREATE TABLE IF NOT EXISTS profit_loss_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_expenses DECIMAL(15,2) DEFAULT 0,
    net_profit DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS balance_sheet_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    as_of_date DATE NOT NULL,
    total_assets DECIMAL(15,2) DEFAULT 0,
    total_liabilities DECIMAL(15,2) DEFAULT 0,
    total_equity DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS cash_flow_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    operating_cash_flow DECIMAL(15,2) DEFAULT 0,
    investing_cash_flow DECIMAL(15,2) DEFAULT 0,
    financing_cash_flow DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS tax_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    tax_period_start DATE NOT NULL,
    tax_period_end DATE NOT NULL,
    gst_collected DECIMAL(15,2) DEFAULT 0,
    gst_paid DECIMAL(15,2) DEFAULT 0,
    income_tax DECIMAL(15,2) DEFAULT 0,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(100) NOT NULL,
    description TEXT,
    sql_query TEXT,
    report_data JSONB,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    generated_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'DRAFT'
);

-- Step 5: Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profit_loss_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE balance_sheet_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
CREATE POLICY "chart_of_accounts_policy" ON chart_of_accounts FOR ALL USING (true);
CREATE POLICY "financial_transactions_policy" ON financial_transactions FOR ALL USING (true);
CREATE POLICY "profit_loss_reports_policy" ON profit_loss_reports FOR ALL USING (true);
CREATE POLICY "balance_sheet_reports_policy" ON balance_sheet_reports FOR ALL USING (true);
CREATE POLICY "cash_flow_reports_policy" ON cash_flow_reports FOR ALL USING (true);
CREATE POLICY "tax_reports_policy" ON tax_reports FOR ALL USING (true);
CREATE POLICY "custom_reports_policy" ON custom_reports FOR ALL USING (true);

-- Step 7: Insert sample chart of accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
('1000', 'Cash in Hand', 'ASSET', 'Petty cash and cash on hand'),
('1001', 'Bank Account', 'ASSET', 'Primary business bank account'),
('1100', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
('1200', 'Paper Inventory', 'ASSET', 'Paper and printing materials'),
('1300', 'Printing Equipment', 'ASSET', 'Machinery and equipment'),
('2000', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
('2100', 'GST Payable', 'LIABILITY', 'GST collected from customers'),
('3000', 'Owner Equity', 'EQUITY', 'Owner investment in business'),
('4000', 'Printing Revenue', 'REVENUE', 'Income from printing services'),
('4001', 'Design Revenue', 'REVENUE', 'Income from design services'),
('5000', 'Paper Cost', 'COGS', 'Cost of paper and materials'),
('5001', 'Ink Cost', 'COGS', 'Cost of printing inks'),
('6000', 'Office Rent', 'EXPENSE', 'Monthly office rent'),
('6001', 'Utilities', 'EXPENSE', 'Electricity and utilities'),
('6100', 'Salaries', 'EXPENSE', 'Employee salaries'),
('6200', 'Maintenance', 'EXPENSE', 'Equipment maintenance')
ON CONFLICT (account_code) DO NOTHING;

-- Success message
SELECT 'Database fix completed successfully! All tables and columns created.' as result;`;

      setFixScript(script);
    } catch (error) {
      console.error("Failed to fetch fix script:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fixScript);
      toast.success("SQL script copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const openSupabase = () => {
    window.open("https://supabase.com/dashboard", "_blank");
  };

  const refreshStatus = () => {
    setLoading(true);
    fetchDatabaseStatus();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading database status...</div>
      </div>
    );
  }

  const isFixed = databaseStatus?.status === "ALL_SYSTEMS_GO";

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🔧 Fix Database Issues
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Resolve missing finance tables and job sheet columns
          </p>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isFixed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Current Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>Finance Tables:</span>
                <Badge
                  variant={
                    databaseStatus?.finance_tables_count === 7
                      ? "default"
                      : "destructive"
                  }
                >
                  {databaseStatus?.finance_tables_count || 0}/7 Working
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Job Sheet Columns:</span>
                <Badge
                  variant={
                    databaseStatus?.job_sheets_columns
                      ? "default"
                      : "destructive"
                  }
                >
                  {databaseStatus?.job_sheets_columns
                    ? "✅ Working"
                    : "❌ Missing"}
                </Badge>
              </div>
            </div>

            {!isFixed && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-medium mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Issues Detected
                </div>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  {databaseStatus?.issues?.map((issue, index) => (
                    <li key={index}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {!isFixed && (
          <>
            {/* Fix Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>🚀 Quick Fix Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to fix your database in 2 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <div className="font-medium">
                        Copy the SQL script below
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Click the copy button to copy the complete fix script
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Open Supabase Dashboard</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Go to your project's SQL Editor
                      </div>
                      <Button
                        onClick={openSupabase}
                        variant="outline"
                        size="sm"
                        className="mt-2"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Supabase
                      </Button>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Paste & Execute</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Paste the script in SQL Editor and click RUN
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                    <div>
                      <div className="font-medium">Refresh and verify</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Come back here and click refresh to confirm fix
                      </div>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* SQL Script */}
            <Card>
              <CardHeader>
                <CardTitle>📝 Database Fix Script</CardTitle>
                <CardDescription>
                  Copy this SQL script and execute it in Supabase Dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                    <code>{fixScript}</code>
                  </pre>
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Script
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isFixed && (
          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                  🎉 Database Fixed Successfully!
                </h2>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  All database issues have been resolved. Your ERP system is now
                  fully operational.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-600">7</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Finance Tables
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-2xl text-green-600">2</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      New Columns
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="text-center">
          <Button onClick={refreshStatus} variant="outline">
            🔄 Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}
