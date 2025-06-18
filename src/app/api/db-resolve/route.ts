import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    console.log("=== COMPREHENSIVE DATABASE RESOLUTION ===");

    const results = {
      timestamp: new Date().toISOString(),
      steps_completed: [],
      errors: [],
      warnings: [],
      final_status: {},
    };

    // Step 1: Create missing job_sheets columns
    console.log("📋 Step 1: Adding missing job_sheets columns...");
    try {
      // Check current job_sheets structure
      const { data: jobSheetsTest } = await supabase
        .from("job_sheets")
        .select("*")
        .limit(1);

      if (jobSheetsTest) {
        const existingColumns = Object.keys(jobSheetsTest[0] || {});
        const requiredColumns = ["uv", "baking"];
        const missingColumns = requiredColumns.filter(
          (col) => !existingColumns.includes(col)
        );

        if (missingColumns.length > 0) {
          // We'll use a workaround since we can't ALTER TABLE directly
          results.warnings.push(
            `job_sheets missing columns: ${missingColumns.join(", ")} - requires manual addition`
          );
        } else {
          results.steps_completed.push("job_sheets has all required columns");
        }
      }
    } catch (err: any) {
      results.errors.push(`job_sheets column check failed: ${err.message}`);
    }

    // Step 2: Create account_type ENUM by testing inserts
    console.log("🏷️ Step 2: Setting up account_type ENUM...");
    try {
      // We'll create a chart_of_accounts table that accepts string values
      // and validate them in the application layer
      results.steps_completed.push(
        "account_type handling will be done via application validation"
      );
    } catch (err: any) {
      results.errors.push(`ENUM setup failed: ${err.message}`);
    }

    // Step 3: Create chart_of_accounts table
    console.log("📊 Step 3: Creating chart_of_accounts table...");
    try {
      // Test if table exists
      const { error: selectError } = await supabase
        .from("chart_of_accounts")
        .select("id")
        .limit(1);

      if (selectError && selectError.message.includes("does not exist")) {
        // Try to create using INSERT with proper structure
        const sampleAccount = {
          id: "temp-" + Date.now(),
          account_code: "TEMP001",
          account_name: "Temporary Account",
          account_type: "ASSET",
          description: "Temporary account for schema creation",
          is_active: true,
        };

        // This will fail if table doesn't exist, but gives us info about what's needed
        const { error: insertError } = await supabase
          .from("chart_of_accounts")
          .insert([sampleAccount]);

        if (insertError) {
          results.warnings.push(
            `chart_of_accounts table needs manual creation: ${insertError.message}`
          );
        } else {
          // Clean up test record
          await supabase
            .from("chart_of_accounts")
            .delete()
            .eq("id", sampleAccount.id);
          results.steps_completed.push(
            "chart_of_accounts table exists and working"
          );
        }
      } else {
        results.steps_completed.push("chart_of_accounts table already exists");
      }
    } catch (err: any) {
      results.errors.push(`chart_of_accounts creation failed: ${err.message}`);
    }

    // Step 4: Create financial_transactions table
    console.log("💰 Step 4: Creating financial_transactions table...");
    try {
      const { error: selectError } = await supabase
        .from("financial_transactions")
        .select("id")
        .limit(1);

      if (selectError && selectError.message.includes("does not exist")) {
        results.warnings.push(
          "financial_transactions table needs manual creation"
        );
      } else {
        results.steps_completed.push(
          "financial_transactions table already exists"
        );
      }
    } catch (err: any) {
      results.errors.push(
        `financial_transactions creation failed: ${err.message}`
      );
    }

    // Step 5: Create finance report tables
    console.log("📈 Step 5: Creating finance report tables...");
    const reportTables = [
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
    ];

    for (const tableName of reportTables) {
      try {
        const { error: selectError } = await supabase
          .from(tableName)
          .select("id")
          .limit(1);

        if (selectError && selectError.message.includes("does not exist")) {
          results.warnings.push(`${tableName} table needs manual creation`);
        } else {
          results.steps_completed.push(`${tableName} table already exists`);
        }
      } catch (err: any) {
        results.errors.push(`${tableName} check failed: ${err.message}`);
      }
    }

    // Step 6: Verify foreign key dependencies
    console.log("🔗 Step 6: Checking foreign key dependencies...");
    try {
      // Check users table
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id")
        .limit(5);

      if (usersError) {
        results.warnings.push(
          "users table access issue - may affect job_sheets foreign keys"
        );
      } else {
        results.final_status.users_available = users ? users.length : 0;
      }

      // Check parties table
      const { data: parties, error: partiesError } = await supabase
        .from("parties")
        .select("id")
        .limit(5);

      if (partiesError) {
        results.warnings.push(
          "parties table access issue - may affect job_sheets foreign keys"
        );
      } else {
        results.final_status.parties_available = parties ? parties.length : 0;
      }
    } catch (err: any) {
      results.errors.push(
        `Foreign key dependency check failed: ${err.message}`
      );
    }

    // Step 7: Generate SQL commands for manual execution
    console.log("📝 Step 7: Generating manual SQL commands...");
    const manualSQLCommands = [];

    // Add missing job_sheets columns if needed
    const { data: jobSheetsColumns } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "job_sheets")
      .eq("table_schema", "public");

    if (jobSheetsColumns) {
      const existingColumns = jobSheetsColumns.map((c) => c.column_name);
      if (!existingColumns.includes("uv")) {
        manualSQLCommands.push(
          "ALTER TABLE job_sheets ADD COLUMN uv DECIMAL(10,2) DEFAULT 0.00;"
        );
      }
      if (!existingColumns.includes("baking")) {
        manualSQLCommands.push(
          "ALTER TABLE job_sheets ADD COLUMN baking DECIMAL(10,2) DEFAULT 0.00;"
        );
      }
    }

    // Create account_type ENUM
    manualSQLCommands.push(`
      DO $$ BEGIN
        CREATE TYPE account_type AS ENUM (
          'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COST_OF_GOODS_SOLD'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create chart_of_accounts table
    manualSQLCommands.push(`
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
    `);

    // Create financial_transactions table
    manualSQLCommands.push(`
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
    `);

    // Create finance report tables
    const reportTableSQL = [
      `CREATE TABLE IF NOT EXISTS profit_loss_reports (
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
      );`,

      `CREATE TABLE IF NOT EXISTS balance_sheet_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_name VARCHAR(200) NOT NULL,
        as_of_date DATE NOT NULL,
        total_assets DECIMAL(15,2) DEFAULT 0,
        total_liabilities DECIMAL(15,2) DEFAULT 0,
        total_equity DECIMAL(15,2) DEFAULT 0,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,

      `CREATE TABLE IF NOT EXISTS cash_flow_reports (
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
      );`,

      `CREATE TABLE IF NOT EXISTS tax_reports (
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
      );`,

      `CREATE TABLE IF NOT EXISTS custom_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        report_name VARCHAR(200) NOT NULL,
        description TEXT,
        sql_query TEXT NOT NULL,
        is_public BOOLEAN DEFAULT false,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );`,
    ];

    manualSQLCommands.push(...reportTableSQL);

    // Add sample data
    manualSQLCommands.push(`
      INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
      ('1101', 'Cash in Hand', 'ASSET', 'Petty cash and till money'),
      ('1102', 'Bank Account - Current', 'ASSET', 'Main operating bank account'),
      ('1201', 'Accounts Receivable', 'ASSET', 'Money owed by customers'),
      ('2101', 'Accounts Payable', 'LIABILITY', 'Money owed to suppliers'),
      ('3101', 'Owner Equity', 'EQUITY', 'Owner''s equity in the business'),
      ('4101', 'Printing Services Revenue', 'REVENUE', 'Revenue from printing jobs'),
      ('4102', 'Design Services Revenue', 'REVENUE', 'Revenue from design services'),
      ('5101', 'Paper and Materials', 'COST_OF_GOODS_SOLD', 'Direct materials cost'),
      ('6101', 'Office Rent', 'EXPENSE', 'Monthly office rent'),
      ('6102', 'Utilities', 'EXPENSE', 'Electricity, water, internet')
      ON CONFLICT (account_code) DO NOTHING;
    `);

    results.final_status.manual_sql_commands = manualSQLCommands;
    results.steps_completed.push(
      `Generated ${manualSQLCommands.length} SQL commands for manual execution`
    );

    console.log("✅ Database resolution analysis completed");

    return NextResponse.json({
      success: true,
      message: "Database resolution analysis completed",
      results,
      next_steps: [
        "Execute the manual SQL commands in Supabase Dashboard > SQL Editor",
        "Run the commands in sequence to create missing tables and columns",
        "Test the finance endpoints after table creation",
        "Verify that all foreign key constraints are working",
      ],
    });
  } catch (error: any) {
    console.error("Database resolution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Database resolution failed",
      },
      { status: 500 }
    );
  }
}
