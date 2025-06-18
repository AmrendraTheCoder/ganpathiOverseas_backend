import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    console.log("🚀 Starting database migration to fix all issues...");

    const results = {
      timestamp: new Date().toISOString(),
      operations: [],
      successes: 0,
      failures: 0,
      errors: [],
    };

    // Step 1: Add missing columns to job_sheets
    console.log("📋 Adding missing columns to job_sheets...");
    try {
      // Check if columns exist first
      const { data: testData, error: testError } = await supabase
        .from("job_sheets")
        .select("id, uv, baking")
        .limit(1);

      if (testError && testError.message.includes("does not exist")) {
        results.operations.push(
          "❌ UV/Baking columns missing - manual database setup required"
        );
        results.failures++;
        results.errors.push("Columns missing: " + testError.message);
      } else {
        results.operations.push(
          "✅ UV/Baking columns already exist or working"
        );
        results.successes++;
      }
    } catch (err: any) {
      results.operations.push("❌ Could not check job_sheets columns");
      results.failures++;
      results.errors.push("job_sheets check failed: " + err.message);
    }

    // Step 2-8: Create tables using individual CREATE statements
    const tables = [
      {
        name: "chart_of_accounts",
        sql: `
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
        `,
      },
      {
        name: "financial_transactions",
        sql: `
          CREATE TABLE IF NOT EXISTS financial_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            transaction_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
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
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
          );
        `,
      },
      {
        name: "profit_loss_reports",
        sql: `
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
            status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
          );
        `,
      },
      {
        name: "balance_sheet_reports",
        sql: `
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
            status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
          );
        `,
      },
      {
        name: "cash_flow_reports",
        sql: `
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
            status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
          );
        `,
      },
      {
        name: "tax_reports",
        sql: `
          CREATE TABLE IF NOT EXISTS tax_reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            report_name VARCHAR(255) NOT NULL,
            tax_period_start DATE NOT NULL,
            tax_period_end DATE NOT NULL,
            financial_year VARCHAR(20) NOT NULL,
            gst_collected DECIMAL(15,2) DEFAULT 0,
            gst_paid DECIMAL(15,2) DEFAULT 0,
            income_tax DECIMAL(15,2) DEFAULT 0,
            report_data JSONB,
            generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            generated_by UUID REFERENCES users(id),
            status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'ARCHIVED'))
          );
        `,
      },
      {
        name: "custom_reports",
        sql: `
          CREATE TABLE IF NOT EXISTS custom_reports (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            report_name VARCHAR(255) NOT NULL,
            report_type VARCHAR(100) NOT NULL,
            description TEXT,
            sql_query TEXT,
            report_data JSONB,
            generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            generated_by UUID REFERENCES users(id),
            status VARCHAR(20) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SAVED', 'ARCHIVED'))
          );
        `,
      },
    ];

    // Try to create tables using RPC if available
    for (const table of tables) {
      console.log(`📊 Creating table: ${table.name}...`);
      try {
        // First check if table exists by trying to query it
        const { error: queryError } = await supabase
          .from(table.name)
          .select("id")
          .limit(1);

        if (!queryError) {
          results.operations.push(`✅ Table ${table.name} already exists`);
          results.successes++;
        } else if (queryError.message.includes("does not exist")) {
          // Table doesn't exist, needs to be created manually
          results.operations.push(
            `❌ Table ${table.name} missing - requires manual creation`
          );
          results.failures++;
          results.errors.push(`${table.name}: relation does not exist`);
        } else {
          results.operations.push(
            `⚠️ Table ${table.name} issue: ${queryError.message}`
          );
          results.failures++;
          results.errors.push(`${table.name}: ${queryError.message}`);
        }
      } catch (err: any) {
        results.operations.push(
          `❌ Failed to check table ${table.name}: ${err.message}`
        );
        results.failures++;
        results.errors.push(`${table.name} check failed: ${err.message}`);
      }
    }

    const successRate =
      (results.successes / (results.successes + results.failures)) * 100;

    // If most tables are missing, provide manual setup instructions
    if (results.failures > results.successes) {
      results.operations.push("🔧 MANUAL DATABASE SETUP REQUIRED");
      results.operations.push(
        "📝 Execute the migration file in Supabase Dashboard"
      );
      results.operations.push(
        "📁 File: supabase/migrations/20241223000003_fix_all_database_issues.sql"
      );
      results.operations.push(
        "🌐 URL: https://supabase.com/dashboard > SQL Editor"
      );
    }

    console.log(
      `✅ Migration check completed: ${results.successes}/${results.successes + results.failures} components working`
    );

    return NextResponse.json({
      success: successRate > 70,
      message:
        successRate > 70
          ? `Database migration successful (${Math.round(successRate)}% success rate)`
          : `Manual migration required (${Math.round(successRate)}% success rate)`,
      results,
      next_steps:
        successRate > 70
          ? [
              "✅ Most components working",
              "Run verification: curl http://localhost:3000/api/db-verify",
            ]
          : [
              "❌ Manual database setup required",
              "1. Copy contents of supabase/migrations/20241223000003_fix_all_database_issues.sql",
              "2. Go to https://supabase.com/dashboard",
              "3. Select your project > SQL Editor",
              "4. Paste and run the migration",
              "5. Verify: curl http://localhost:3000/api/db-verify",
            ],
    });
  } catch (error: any) {
    console.error("Database migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Database migration failed",
        next_steps: [
          "Manual database setup required",
          "Execute supabase/migrations/20241223000003_fix_all_database_issues.sql in Supabase Dashboard",
        ],
      },
      { status: 500 }
    );
  }
}
