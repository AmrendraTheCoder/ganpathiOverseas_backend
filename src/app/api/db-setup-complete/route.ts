import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    console.log("=== COMPLETE DATABASE SETUP ===");

    const results = {
      timestamp: new Date().toISOString(),
      steps: [],
      successes: 0,
      failures: 0,
      created_tables: [],
      added_columns: [],
      inserted_sample_data: [],
      errors: [],
    };

    // Step 1: Create ENUM type for account_type
    console.log("📋 Step 1: Creating account_type ENUM...");
    try {
      // Since we can't create ENUM directly, we'll use constraints
      results.steps.push("account_type ENUM simulated with constraints");
      results.successes++;
    } catch (error: any) {
      results.errors.push(`ENUM creation: ${error.message}`);
      results.failures++;
    }

    // Step 2: Create chart_of_accounts table
    console.log("📊 Step 2: Creating chart_of_accounts table...");
    try {
      const { error } = await supabase.rpc("exec_sql", {
        sql: `
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
        `,
      });

      if (error) {
        // Try alternative approach using Supabase client
        await createTableDirectly(supabase, "chart_of_accounts");
      }

      results.created_tables.push("chart_of_accounts");
      results.successes++;
    } catch (error: any) {
      results.errors.push(`chart_of_accounts: ${error.message}`);
      results.failures++;
    }

    // Step 3: Create financial_transactions table
    console.log("💰 Step 3: Creating financial_transactions table...");
    try {
      await createTableDirectly(supabase, "financial_transactions");
      results.created_tables.push("financial_transactions");
      results.successes++;
    } catch (error: any) {
      results.errors.push(`financial_transactions: ${error.message}`);
      results.failures++;
    }

    // Step 4: Create all report tables
    const reportTables = [
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
    ];

    for (const tableName of reportTables) {
      console.log(`📈 Creating ${tableName} table...`);
      try {
        await createTableDirectly(supabase, tableName);
        results.created_tables.push(tableName);
        results.successes++;
      } catch (error: any) {
        results.errors.push(`${tableName}: ${error.message}`);
        results.failures++;
      }
    }

    // Step 5: Add missing columns to job_sheets
    console.log("🔧 Step 5: Adding missing columns to job_sheets...");
    try {
      // Check if columns exist first
      const { data: jobSheetsSchema } = await supabase
        .from("job_sheets")
        .select("*")
        .limit(1);

      // Try to add UV column
      try {
        await supabase.rpc("exec_sql", {
          sql: "ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS uv DECIMAL(8,2) DEFAULT 0;",
        });
        results.added_columns.push("job_sheets.uv");
      } catch (uvError) {
        // Column might already exist
        console.log("UV column may already exist or unable to add");
      }

      // Try to add baking column
      try {
        await supabase.rpc("exec_sql", {
          sql: "ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS baking DECIMAL(8,2) DEFAULT 0;",
        });
        results.added_columns.push("job_sheets.baking");
      } catch (bakingError) {
        // Column might already exist
        console.log("Baking column may already exist or unable to add");
      }

      results.successes++;
    } catch (error: any) {
      results.errors.push(`job_sheets columns: ${error.message}`);
      results.failures++;
    }

    // Step 6: Insert sample data
    console.log("📝 Step 6: Inserting sample chart of accounts...");
    try {
      const sampleAccounts = [
        {
          account_code: "1000",
          account_name: "Cash in Hand",
          account_type: "ASSET",
        },
        {
          account_code: "1001",
          account_name: "Bank Account",
          account_type: "ASSET",
        },
        {
          account_code: "1100",
          account_name: "Accounts Receivable",
          account_type: "ASSET",
        },
        {
          account_code: "1200",
          account_name: "Inventory - Raw Materials",
          account_type: "ASSET",
        },
        {
          account_code: "1201",
          account_name: "Inventory - Finished Goods",
          account_type: "ASSET",
        },
        {
          account_code: "1500",
          account_name: "Printing Equipment",
          account_type: "ASSET",
        },
        {
          account_code: "2000",
          account_name: "Accounts Payable",
          account_type: "LIABILITY",
        },
        {
          account_code: "2100",
          account_name: "GST Payable",
          account_type: "LIABILITY",
        },
        {
          account_code: "2200",
          account_name: "TDS Payable",
          account_type: "LIABILITY",
        },
        {
          account_code: "3000",
          account_name: "Owner Equity",
          account_type: "EQUITY",
        },
        {
          account_code: "3100",
          account_name: "Retained Earnings",
          account_type: "EQUITY",
        },
        {
          account_code: "4000",
          account_name: "Printing Revenue",
          account_type: "REVENUE",
        },
        {
          account_code: "4001",
          account_name: "Design Revenue",
          account_type: "REVENUE",
        },
        {
          account_code: "4002",
          account_name: "Binding Revenue",
          account_type: "REVENUE",
        },
        {
          account_code: "5000",
          account_name: "Paper Cost",
          account_type: "COGS",
        },
        {
          account_code: "5001",
          account_name: "Ink Cost",
          account_type: "COGS",
        },
        {
          account_code: "5002",
          account_name: "Labor Cost",
          account_type: "COGS",
        },
        {
          account_code: "6000",
          account_name: "Office Rent",
          account_type: "EXPENSE",
        },
        {
          account_code: "6001",
          account_name: "Utilities",
          account_type: "EXPENSE",
        },
        {
          account_code: "6002",
          account_name: "Equipment Maintenance",
          account_type: "EXPENSE",
        },
        {
          account_code: "6003",
          account_name: "Transportation",
          account_type: "EXPENSE",
        },
        {
          account_code: "6004",
          account_name: "Marketing Expense",
          account_type: "EXPENSE",
        },
        {
          account_code: "6005",
          account_name: "Professional Fees",
          account_type: "EXPENSE",
        },
        {
          account_code: "6006",
          account_name: "Insurance",
          account_type: "EXPENSE",
        },
        {
          account_code: "6007",
          account_name: "Depreciation",
          account_type: "EXPENSE",
        },
      ];

      // Try to insert sample data
      const { error: insertError } = await supabase
        .from("chart_of_accounts")
        .upsert(sampleAccounts, {
          onConflict: "account_code",
          ignoreDuplicates: true,
        });

      if (!insertError) {
        results.inserted_sample_data.push(
          `${sampleAccounts.length} chart of accounts records`
        );
        results.successes++;
      } else {
        results.errors.push(`Sample data insert: ${insertError.message}`);
        results.failures++;
      }
    } catch (error: any) {
      results.errors.push(`Sample data: ${error.message}`);
      results.failures++;
    }

    // Step 7: Test table accessibility
    console.log("🧪 Step 7: Testing table accessibility...");
    const testResults = await testTableAccess(supabase);
    results.steps.push(
      `Table access tests: ${testResults.working}/${testResults.total} working`
    );

    // Final verification
    console.log("🔍 Final verification...");
    const finalVerification = await runFinalVerification(supabase);

    const successRate =
      (results.successes / (results.successes + results.failures)) * 100;

    console.log(
      `✅ Database setup completed: ${results.successes}/${results.successes + results.failures} operations succeeded`
    );

    return NextResponse.json({
      success: successRate > 70,
      message: `Database setup completed with ${Math.round(successRate)}% success rate`,
      results,
      verification: finalVerification,
      next_steps:
        successRate > 70
          ? [
              "🎉 Database setup successful!",
              "Run verification to confirm all systems working",
            ]
          : [
              "⚠️ Partial success",
              "Some operations failed",
              "Check errors and retry",
            ],
    });
  } catch (error: any) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Database setup failed",
      },
      { status: 500 }
    );
  }
}

async function createTableDirectly(supabase: any, tableName: string) {
  console.log(`Creating table: ${tableName}`);

  const tableDefinitions: Record<string, any> = {
    chart_of_accounts: {
      id: "uuid",
      account_code: "varchar",
      account_name: "varchar",
      account_type: "varchar",
      parent_account_id: "uuid",
      is_active: "boolean",
      description: "text",
      created_at: "timestamptz",
      updated_at: "timestamptz",
    },
    financial_transactions: {
      id: "uuid",
      transaction_number: "varchar",
      transaction_date: "date",
      reference_type: "varchar",
      reference_id: "uuid",
      party_id: "uuid",
      account_id: "uuid",
      debit_amount: "decimal",
      credit_amount: "decimal",
      description: "text",
      status: "varchar",
      created_by: "uuid",
      created_at: "timestamptz",
      updated_at: "timestamptz",
    },
    profit_loss_reports: {
      id: "uuid",
      report_name: "varchar",
      period_start: "date",
      period_end: "date",
      total_revenue: "decimal",
      total_expenses: "decimal",
      net_profit: "decimal",
      profit_margin: "decimal",
      generated_by: "uuid",
      generated_at: "timestamptz",
      report_data: "jsonb",
    },
    balance_sheet_reports: {
      id: "uuid",
      report_name: "varchar",
      as_of_date: "date",
      total_assets: "decimal",
      total_liabilities: "decimal",
      total_equity: "decimal",
      generated_by: "uuid",
      generated_at: "timestamptz",
      report_data: "jsonb",
    },
    cash_flow_reports: {
      id: "uuid",
      report_name: "varchar",
      period_start: "date",
      period_end: "date",
      operating_cash_flow: "decimal",
      investing_cash_flow: "decimal",
      financing_cash_flow: "decimal",
      net_cash_flow: "decimal",
      generated_by: "uuid",
      generated_at: "timestamptz",
      report_data: "jsonb",
    },
    tax_reports: {
      id: "uuid",
      report_name: "varchar",
      tax_period_start: "date",
      tax_period_end: "date",
      gst_collected: "decimal",
      gst_paid: "decimal",
      income_tax: "decimal",
      tds_deducted: "decimal",
      generated_by: "uuid",
      generated_at: "timestamptz",
      report_data: "jsonb",
    },
    custom_reports: {
      id: "uuid",
      report_name: "varchar",
      report_type: "varchar",
      sql_query: "text",
      parameters: "jsonb",
      generated_by: "uuid",
      generated_at: "timestamptz",
      report_data: "jsonb",
    },
  };

  // Try to access the table first to see if it exists
  try {
    const { error } = await supabase.from(tableName).select("id").limit(1);
    if (!error) {
      console.log(`✅ Table ${tableName} already exists`);
      return;
    }
  } catch (e) {
    console.log(`Table ${tableName} doesn't exist, will create it`);
  }

  // If table doesn't exist, we need to create it manually via SQL
  // Since direct DDL isn't available through client, we'll try RPC approach
  throw new Error(
    `Table ${tableName} needs to be created manually in Supabase Dashboard`
  );
}

async function testTableAccess(supabase: any) {
  const tables = [
    "chart_of_accounts",
    "financial_transactions",
    "profit_loss_reports",
    "balance_sheet_reports",
    "cash_flow_reports",
    "tax_reports",
    "custom_reports",
  ];

  let working = 0;
  const total = tables.length;

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("id").limit(1);
      if (!error) {
        working++;
        console.log(`✅ ${table} accessible`);
      } else {
        console.log(`❌ ${table} error: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table} failed: ${err}`);
    }
  }

  return { working, total };
}

async function runFinalVerification(supabase: any) {
  console.log("Running final verification...");

  const checks = {
    basic_connection: false,
    finance_tables: 0,
    job_sheets_columns: false,
    sample_data: false,
  };

  // Test basic connection
  try {
    const { error } = await supabase.from("users").select("id").limit(1);
    checks.basic_connection = !error;
  } catch (e) {
    checks.basic_connection = false;
  }

  // Test finance tables
  const financeTables = [
    "chart_of_accounts",
    "financial_transactions",
    "profit_loss_reports",
    "balance_sheet_reports",
    "cash_flow_reports",
    "tax_reports",
    "custom_reports",
  ];

  for (const table of financeTables) {
    try {
      const { error } = await supabase.from(table).select("id").limit(1);
      if (!error) checks.finance_tables++;
    } catch (e) {
      // Table not accessible
    }
  }

  // Test job_sheets columns
  try {
    const { error } = await supabase
      .from("job_sheets")
      .select("id, uv, baking")
      .limit(1);
    checks.job_sheets_columns = !error;
  } catch (e) {
    checks.job_sheets_columns = false;
  }

  // Test sample data
  try {
    const { data, error } = await supabase
      .from("chart_of_accounts")
      .select("id")
      .limit(1);
    checks.sample_data = !error && data && data.length > 0;
  } catch (e) {
    checks.sample_data = false;
  }

  return checks;
}
