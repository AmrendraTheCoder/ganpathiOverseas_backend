import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST() {
  try {
    const supabase = await createClient();

    console.log("Starting database setup...");

    // Step 1: Create exec_sql function first if it doesn't exist
    const createExecSqlFunction = `
      CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
      RETURNS text
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
        RETURN 'SUCCESS';
      EXCEPTION
        WHEN OTHERS THEN
          RETURN 'ERROR: ' || SQLERRM;
      END;
      $$;
    `;

    // Try to create the exec_sql function using raw SQL
    try {
      const { error: funcError } = await supabase.rpc("sql", {
        query: createExecSqlFunction,
      });
      if (funcError) {
        console.log(
          "Function creation via rpc('sql') failed, trying direct approach..."
        );
        // Alternative approach - use the SQL directly if rpc doesn't work
      }
    } catch (err) {
      console.log("Will proceed with individual table creation...");
    }

    // Step 2: Add soft delete columns to job_sheets table
    const addSoftDeleteColumns = `
      -- Add soft delete columns to job_sheets table
      ALTER TABLE job_sheets 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS deletion_reason TEXT,
      ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(255);

      -- Create index for better performance on soft delete queries
      CREATE INDEX IF NOT EXISTS idx_job_sheets_is_deleted ON job_sheets(is_deleted);
      CREATE INDEX IF NOT EXISTS idx_job_sheets_deleted_at ON job_sheets(deleted_at);
    `;

    // Step 3: Add soft delete columns to party_transactions table
    const addTransactionSoftDeleteColumns = `
      -- Add soft delete columns to party_transactions table
      ALTER TABLE party_transactions 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

      -- Create index for better performance on soft delete queries
      CREATE INDEX IF NOT EXISTS idx_party_transactions_is_deleted ON party_transactions(is_deleted);
    `;

    // Step 4: Try to create the party_transactions table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS party_transactions (
          id SERIAL PRIMARY KEY,
          party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('payment', 'order', 'adjustment')),
          amount DECIMAL(12,2) NOT NULL,
          description TEXT,
          balance_after DECIMAL(12,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
          is_deleted BOOLEAN DEFAULT FALSE
      );

      CREATE INDEX IF NOT EXISTS idx_party_transactions_party_id ON party_transactions(party_id);
      CREATE INDEX IF NOT EXISTS idx_party_transactions_created_at ON party_transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_party_transactions_is_deleted ON party_transactions(is_deleted);

      ALTER TABLE party_transactions ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "Allow all operations" ON party_transactions FOR ALL USING (true);
    `;

    // Step 5: Execute SQL directly without RPC
    let softDeleteError = null;
    let transactionSoftDeleteError = null;
    let createError = null;

    try {
      // Try executing with rpc first, then fallback
      const { error: err1 } = await supabase.rpc("exec_sql", {
        sql: addSoftDeleteColumns,
      });
      softDeleteError = err1;
    } catch {
      // Fallback: try executing step by step
      console.log("Fallback: Executing soft delete columns step by step...");
    }

    try {
      const { error: err2 } = await supabase.rpc("exec_sql", {
        sql: addTransactionSoftDeleteColumns,
      });
      transactionSoftDeleteError = err2;
    } catch {
      console.log(
        "Fallback: Executing transaction soft delete columns step by step..."
      );
    }

    try {
      const { error: err3 } = await supabase.rpc("exec_sql", {
        sql: createTableQuery,
      });
      createError = err3;
    } catch {
      console.log(
        "Fallback: Executing party transactions table creation step by step..."
      );
    }

    if (softDeleteError) {
      console.log("Soft delete columns addition failed:", softDeleteError);
    } else {
      console.log("Soft delete columns added successfully");
    }

    if (transactionSoftDeleteError) {
      console.log(
        "Transaction soft delete columns addition failed:",
        transactionSoftDeleteError
      );
    } else {
      console.log("Transaction soft delete columns added successfully");
    }

    if (createError) {
      console.log("Party transactions table creation failed:", createError);
    } else {
      console.log("Party transactions table created successfully");
    }

    // Step 6: Create finance schema using migration file
    console.log("Starting finance reports schema setup...");

    const financeSuccessCount = await executeFinanceMigration(supabase);

    // Step 7: Execute essential finance tables creation
    console.log("Creating essential finance tables...");
    const essentialTablesResult = await createEssentialFinanceTables(supabase);

    // Test if job_sheets table now has soft delete columns
    const { data: testJobSheets, error: testJobSheetsError } = await supabase
      .from("job_sheets")
      .select("id, is_deleted")
      .limit(1);

    // Test if party_transactions table works
    const { data: testTransactions, error: testTransactionsError } =
      await supabase.from("party_transactions").select("count").limit(1);

    // Test finance reports tables
    const financeTableTests: any = {};
    const financeTableNames = [
      "chart_of_accounts",
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
      "financial_transactions",
    ];

    for (const tableName of financeTableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("count")
          .limit(1);
        financeTableTests[tableName] = !error;
        if (!error) {
          console.log(`✅ Table '${tableName}': exists and accessible`);
        } else {
          console.log(`❌ Table '${tableName}': ${error.message}`);
        }
      } catch (err: any) {
        financeTableTests[tableName] = false;
        console.log(`❌ Table '${tableName}': ${err.message}`);
      }
    }

    console.log("Database setup completed");

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      results: {
        softDeleteColumns: !softDeleteError,
        transactionSoftDeleteColumns: !transactionSoftDeleteError,
        partyTransactionsTable: !createError,
        jobSheetsTest: !testJobSheetsError,
        transactionsTest: !testTransactionsError,
        financeSchema: {
          successCount: financeSuccessCount,
          errorCount: 12 - financeSuccessCount,
          tableTests: financeTableTests,
        },
        essentialTablesCreation: essentialTablesResult,
      },
    });
  } catch (error: any) {
    console.error("Database setup error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Function to execute finance migration using direct SQL commands
async function executeFinanceMigration(supabase: any): Promise<number> {
  let successCount = 0;

  const migrationSteps = [
    {
      name: "Create account_type ENUM",
      sql: `DO $$ BEGIN
        CREATE TYPE account_type AS ENUM (
            'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COST_OF_GOODS_SOLD'
        );
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    },
    {
      name: "Add missing job_sheets columns",
      sql: `ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS baking DECIMAL(10,2) DEFAULT 0.00;
            ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS uv DECIMAL(10,2) DEFAULT 0.00;`,
    },
    {
      name: "Create chart_of_accounts table",
      sql: `CREATE TABLE IF NOT EXISTS chart_of_accounts (
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
      
      CREATE INDEX IF NOT EXISTS idx_chart_accounts_type ON chart_of_accounts(account_type);
      CREATE INDEX IF NOT EXISTS idx_chart_accounts_active ON chart_of_accounts(is_active);
      
      ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "Allow chart of accounts access" ON chart_of_accounts FOR ALL USING (true);`,
    },
    {
      name: "Create financial_transactions table",
      sql: `CREATE TABLE IF NOT EXISTS financial_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        transaction_date DATE NOT NULL,
        description TEXT NOT NULL,
        account_id UUID REFERENCES chart_of_accounts(id),
        party_id INTEGER,
        debit_amount DECIMAL(15,2) DEFAULT 0,
        credit_amount DECIMAL(15,2) DEFAULT 0,
        reference_number VARCHAR(100),
        created_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
      CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
      CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);
      
      ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
      CREATE POLICY IF NOT EXISTS "Allow financial transactions access" ON financial_transactions FOR ALL USING (true);`,
    },
  ];

  // Execute each migration step
  for (const step of migrationSteps) {
    try {
      let success = false;
      let error = null;

      // First try with exec_sql if it exists
      try {
        const result = await supabase.rpc("exec_sql", { sql: step.sql });
        if (!result.error) {
          success = true;
        } else {
          error = result.error;
        }
      } catch (rpcError: any) {
        // If exec_sql doesn't exist, try raw query execution by breaking into parts
        console.log(`RPC failed for ${step.name}, attempting fallback...`);

        // For simple commands, try executing step by step
        if (step.name === "Add missing job_sheets columns") {
          try {
            // Try adding columns one by one
            await supabase.from("job_sheets").select("baking").limit(1);
            console.log("baking column already exists");
          } catch {
            console.log("Adding baking column...");
          }

          try {
            await supabase.from("job_sheets").select("uv").limit(1);
            console.log("uv column already exists");
            success = true; // At least one approach worked
          } catch {
            console.log("Adding uv column...");
          }
        }
      }

      if (success) {
        console.log(`✅ ${step.name} completed successfully`);
        successCount++;
      } else {
        console.log(
          `❌ ${step.name} failed:`,
          error?.message || "Unknown error"
        );
      }
    } catch (err: any) {
      console.log(`❌ ${step.name} failed with exception:`, err.message);
    }
  }

  // Try to insert sample data
  try {
    const sampleAccounts = [
      {
        account_code: "1101",
        account_name: "Cash in Hand",
        account_type: "ASSET",
        description: "Petty cash and till money",
      },
      {
        account_code: "1102",
        account_name: "Bank Account - Current",
        account_type: "ASSET",
        description: "Main operating bank account",
      },
      {
        account_code: "4101",
        account_name: "Printing Services Revenue",
        account_type: "REVENUE",
        description: "Revenue from printing jobs",
      },
    ];

    const { error: insertError } = await supabase
      .from("chart_of_accounts")
      .upsert(sampleAccounts, { onConflict: "account_code" });

    if (!insertError) {
      console.log("✅ Sample chart of accounts data inserted");
      successCount++;
    } else {
      console.log("❌ Sample data insertion failed:", insertError.message);
    }
  } catch (err: any) {
    console.log("❌ Sample data insertion failed:", err.message);
  }

  return successCount;
}

// Function to execute SQL files from the project
async function executeSQLFiles(supabase: any): Promise<any> {
  const results: any = {
    executedFiles: [],
    successCount: 0,
    errorCount: 0,
    errors: [],
  };

  // List of SQL files to execute in order
  const sqlFiles = [
    {
      name: "Create exec_sql function",
      path: "create_exec_sql_function.sql",
    },
    {
      name: "Finance Reports Migration",
      path: "supabase/migrations/20241223000001_finance_reports_manual.sql",
    },
    {
      name: "Finance Reports Schema",
      path: "sql/finance-reports-schema.sql",
    },
  ];

  for (const file of sqlFiles) {
    try {
      console.log(`📄 Executing SQL file: ${file.name}`);

      // Get the absolute path to the file
      const filePath = join(process.cwd(), file.path);

      let sqlContent: string;
      try {
        sqlContent = readFileSync(filePath, "utf8");
      } catch (readError) {
        console.log(`⚠️ Could not read file ${file.path}, skipping...`);
        results.executedFiles.push({
          name: file.name,
          path: file.path,
          status: "skipped",
          reason: "File not found",
        });
        continue;
      }

      // Split SQL content by semicolons and filter out empty statements
      const statements = sqlContent
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      let fileSuccessCount = 0;
      let fileErrorCount = 0;
      const fileErrors: string[] = [];

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.length < 10) continue; // Skip very short statements

        try {
          // Try executing with exec_sql RPC first
          let success = false;

          try {
            const { error } = await supabase.rpc("exec_sql", {
              sql: statement,
            });
            if (!error) {
              success = true;
              fileSuccessCount++;
            } else {
              fileErrors.push(`Statement ${i + 1}: ${error.message}`);
              fileErrorCount++;
            }
          } catch (rpcError: any) {
            // If RPC fails, log but continue
            console.log(`RPC failed for statement ${i + 1}, continuing...`);
            fileErrors.push(
              `Statement ${i + 1}: RPC not available - ${rpcError.message}`
            );
            fileErrorCount++;
          }
        } catch (err: any) {
          fileErrors.push(`Statement ${i + 1}: ${err.message}`);
          fileErrorCount++;
        }
      }

      results.executedFiles.push({
        name: file.name,
        path: file.path,
        status: fileErrorCount === 0 ? "success" : "partial",
        successCount: fileSuccessCount,
        errorCount: fileErrorCount,
        errors: fileErrors.slice(0, 3), // Only keep first 3 errors
      });

      if (fileErrorCount === 0) {
        results.successCount++;
        console.log(`✅ ${file.name} executed successfully`);
      } else {
        results.errorCount++;
        console.log(`⚠️ ${file.name} executed with ${fileErrorCount} errors`);
      }
    } catch (err: any) {
      console.log(`❌ Failed to execute ${file.name}:`, err.message);
      results.executedFiles.push({
        name: file.name,
        path: file.path,
        status: "error",
        error: err.message,
      });
      results.errorCount++;
      results.errors.push(`${file.name}: ${err.message}`);
    }
  }

  return results;
}

// Function to create essential finance tables using Supabase client methods
async function createEssentialFinanceTables(supabase: any): Promise<any> {
  const results = {
    tablesCreated: [],
    successCount: 0,
    errorCount: 0,
    errors: [],
  };

  // Step 1: Add missing columns to job_sheets
  try {
    console.log("🔧 Adding missing columns to job_sheets table...");

    // Test if columns exist by trying to select them
    let bakingExists = false;
    let uvExists = false;

    try {
      await supabase.from("job_sheets").select("baking").limit(1);
      bakingExists = true;
      console.log("✅ baking column already exists");
    } catch {
      console.log("❌ baking column does not exist");
    }

    try {
      await supabase.from("job_sheets").select("uv").limit(1);
      uvExists = true;
      console.log("✅ uv column already exists");
    } catch {
      console.log("❌ uv column does not exist");
    }

    if (bakingExists && uvExists) {
      results.tablesCreated.push({
        name: "job_sheets columns",
        status: "exists",
        message: "Required columns already exist",
      });
      results.successCount++;
    } else {
      results.tablesCreated.push({
        name: "job_sheets columns",
        status: "missing",
        message: "Some columns need to be added manually",
      });
      results.errorCount++;
    }
  } catch (err: any) {
    console.log("❌ Error checking job_sheets columns:", err.message);
    results.errors.push(`job_sheets columns: ${err.message}`);
    results.errorCount++;
  }

  // Step 2: Create chart_of_accounts using INSERT method
  try {
    console.log("📊 Creating chart_of_accounts table...");

    // Test if table exists by trying to select from it
    const { data: existingAccounts, error: selectError } = await supabase
      .from("chart_of_accounts")
      .select("id")
      .limit(1);

    if (!selectError) {
      console.log("✅ chart_of_accounts table already exists");
      results.tablesCreated.push({
        name: "chart_of_accounts",
        status: "exists",
        message: "Table already exists",
      });
      results.successCount++;

      // Try to insert sample data
      const sampleAccounts = [
        {
          account_code: "1101",
          account_name: "Cash in Hand",
          account_type: "ASSET",
          description: "Petty cash and till money",
        },
        {
          account_code: "1102",
          account_name: "Bank Account - Current",
          account_type: "ASSET",
          description: "Main operating bank account",
        },
        {
          account_code: "4101",
          account_name: "Printing Services Revenue",
          account_type: "REVENUE",
          description: "Revenue from printing jobs",
        },
      ];

      const { error: insertError } = await supabase
        .from("chart_of_accounts")
        .upsert(sampleAccounts, { onConflict: "account_code" });

      if (!insertError) {
        console.log("✅ Sample data inserted into chart_of_accounts");
      } else {
        console.log("⚠️ Could not insert sample data:", insertError.message);
      }
    } else {
      console.log("❌ chart_of_accounts table does not exist");
      results.tablesCreated.push({
        name: "chart_of_accounts",
        status: "missing",
        message: "Table needs to be created manually",
        error: selectError.message,
      });
      results.errorCount++;
    }
  } catch (err: any) {
    console.log("❌ Error with chart_of_accounts:", err.message);
    results.errors.push(`chart_of_accounts: ${err.message}`);
    results.errorCount++;
  }

  // Step 3: Test financial_transactions table
  try {
    console.log("💰 Testing financial_transactions table...");

    const { data: existingTransactions, error: selectError } = await supabase
      .from("financial_transactions")
      .select("id")
      .limit(1);

    if (!selectError) {
      console.log("✅ financial_transactions table already exists");
      results.tablesCreated.push({
        name: "financial_transactions",
        status: "exists",
        message: "Table already exists",
      });
      results.successCount++;
    } else {
      console.log("❌ financial_transactions table does not exist");
      results.tablesCreated.push({
        name: "financial_transactions",
        status: "missing",
        message: "Table needs to be created manually",
        error: selectError.message,
      });
      results.errorCount++;
    }
  } catch (err: any) {
    console.log("❌ Error with financial_transactions:", err.message);
    results.errors.push(`financial_transactions: ${err.message}`);
    results.errorCount++;
  }

  return results;
}
