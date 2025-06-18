const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

async function setupFinanceReports() {
  try {
    // Create Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log("🚀 Starting finance reports schema setup...");

    // Read the SQL file
    const sqlFilePath = path.join(__dirname, "sql/finance-reports-schema.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

    // Define the schema creation steps
    const steps = [
      // Step 1: Create ENUM types
      {
        name: "Create ENUM types",
        sql: `
          CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
          
          DO $$ BEGIN
            CREATE TYPE account_type AS ENUM (
                'ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE', 'COST_OF_GOODS_SOLD'
            );
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
          
          DO $$ BEGIN
            CREATE TYPE report_status AS ENUM ('DRAFT', 'FINALIZED', 'ARCHIVED');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
          
          DO $$ BEGIN
            CREATE TYPE period_type AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'CUSTOM');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
          
          DO $$ BEGIN
            CREATE TYPE cash_flow_category AS ENUM ('OPERATING', 'INVESTING', 'FINANCING');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
          
          DO $$ BEGIN
            CREATE TYPE tax_type AS ENUM ('GST', 'INCOME_TAX', 'TDS', 'PROFESSIONAL_TAX', 'OTHER');
          EXCEPTION
            WHEN duplicate_object THEN null;
          END $$;
        `,
      },

      // Step 2: Create chart_of_accounts table
      {
        name: "Create chart_of_accounts table",
        sql: `
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
          
          CREATE INDEX IF NOT EXISTS idx_chart_accounts_type ON chart_of_accounts(account_type);
          CREATE INDEX IF NOT EXISTS idx_chart_accounts_active ON chart_of_accounts(is_active);
        `,
      },

      // Step 3: Create profit_loss_reports table
      {
        name: "Create profit_loss_reports table",
        sql: `
          CREATE TABLE IF NOT EXISTS profit_loss_reports (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_name VARCHAR(200) NOT NULL,
              period_start DATE NOT NULL,
              period_end DATE NOT NULL,
              period_type period_type NOT NULL,
              total_revenue DECIMAL(15,2) DEFAULT 0,
              cost_of_goods_sold DECIMAL(15,2) DEFAULT 0,
              gross_profit DECIMAL(15,2) DEFAULT 0,
              total_expenses DECIMAL(15,2) DEFAULT 0,
              operating_income DECIMAL(15,2) DEFAULT 0,
              other_income DECIMAL(15,2) DEFAULT 0,
              other_expenses DECIMAL(15,2) DEFAULT 0,
              net_income DECIMAL(15,2) DEFAULT 0,
              gross_profit_margin DECIMAL(5,2) DEFAULT 0,
              net_profit_margin DECIMAL(5,2) DEFAULT 0,
              status report_status DEFAULT 'DRAFT',
              notes TEXT,
              generated_by UUID REFERENCES users(id),
              generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              finalized_at TIMESTAMP WITH TIME ZONE,
              finalized_by UUID REFERENCES users(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_pl_reports_period ON profit_loss_reports(period_start, period_end);
          CREATE INDEX IF NOT EXISTS idx_pl_reports_status ON profit_loss_reports(status);
          CREATE INDEX IF NOT EXISTS idx_pl_reports_generated_by ON profit_loss_reports(generated_by);
        `,
      },

      // Step 4: Create profit_loss_line_items table
      {
        name: "Create profit_loss_line_items table",
        sql: `
          CREATE TABLE IF NOT EXISTS profit_loss_line_items (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_id UUID REFERENCES profit_loss_reports(id) ON DELETE CASCADE,
              account_id UUID REFERENCES chart_of_accounts(id),
              category VARCHAR(50) NOT NULL,
              line_description VARCHAR(300) NOT NULL,
              amount DECIMAL(15,2) NOT NULL DEFAULT 0,
              percentage_of_revenue DECIMAL(5,2) DEFAULT 0,
              sort_order INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },

      // Step 5: Create balance_sheet_reports table
      {
        name: "Create balance_sheet_reports table",
        sql: `
          CREATE TABLE IF NOT EXISTS balance_sheet_reports (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_name VARCHAR(200) NOT NULL,
              as_of_date DATE NOT NULL,
              current_assets DECIMAL(15,2) DEFAULT 0,
              fixed_assets DECIMAL(15,2) DEFAULT 0,
              other_assets DECIMAL(15,2) DEFAULT 0,
              total_assets DECIMAL(15,2) DEFAULT 0,
              current_liabilities DECIMAL(15,2) DEFAULT 0,
              long_term_liabilities DECIMAL(15,2) DEFAULT 0,
              total_liabilities DECIMAL(15,2) DEFAULT 0,
              owner_equity DECIMAL(15,2) DEFAULT 0,
              retained_earnings DECIMAL(15,2) DEFAULT 0,
              total_equity DECIMAL(15,2) DEFAULT 0,
              balance_difference DECIMAL(15,2) DEFAULT 0,
              is_balanced BOOLEAN DEFAULT false,
              status report_status DEFAULT 'DRAFT',
              notes TEXT,
              generated_by UUID REFERENCES users(id),
              generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              finalized_at TIMESTAMP WITH TIME ZONE,
              finalized_by UUID REFERENCES users(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_bs_reports_date ON balance_sheet_reports(as_of_date);
          CREATE INDEX IF NOT EXISTS idx_bs_reports_status ON balance_sheet_reports(status);
        `,
      },

      // Step 6: Create balance_sheet_line_items table
      {
        name: "Create balance_sheet_line_items table",
        sql: `
          CREATE TABLE IF NOT EXISTS balance_sheet_line_items (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_id UUID REFERENCES balance_sheet_reports(id) ON DELETE CASCADE,
              account_id UUID REFERENCES chart_of_accounts(id),
              category VARCHAR(50) NOT NULL,
              line_description VARCHAR(300) NOT NULL,
              amount DECIMAL(15,2) NOT NULL DEFAULT 0,
              sort_order INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },

      // Step 7: Create cash_flow_reports table
      {
        name: "Create cash_flow_reports table",
        sql: `
          CREATE TABLE IF NOT EXISTS cash_flow_reports (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_name VARCHAR(200) NOT NULL,
              period_start DATE NOT NULL,
              period_end DATE NOT NULL,
              period_type period_type NOT NULL,
              operating_cash_flow DECIMAL(15,2) DEFAULT 0,
              investing_cash_flow DECIMAL(15,2) DEFAULT 0,
              financing_cash_flow DECIMAL(15,2) DEFAULT 0,
              net_cash_flow DECIMAL(15,2) DEFAULT 0,
              beginning_cash_balance DECIMAL(15,2) DEFAULT 0,
              ending_cash_balance DECIMAL(15,2) DEFAULT 0,
              status report_status DEFAULT 'DRAFT',
              notes TEXT,
              generated_by UUID REFERENCES users(id),
              generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              finalized_at TIMESTAMP WITH TIME ZONE,
              finalized_by UUID REFERENCES users(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_cf_reports_period ON cash_flow_reports(period_start, period_end);
          CREATE INDEX IF NOT EXISTS idx_cf_reports_status ON cash_flow_reports(status);
        `,
      },

      // Step 8: Create cash_flow_line_items table
      {
        name: "Create cash_flow_line_items table",
        sql: `
          CREATE TABLE IF NOT EXISTS cash_flow_line_items (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_id UUID REFERENCES cash_flow_reports(id) ON DELETE CASCADE,
              category cash_flow_category NOT NULL,
              line_description VARCHAR(300) NOT NULL,
              amount DECIMAL(15,2) NOT NULL DEFAULT 0,
              sort_order INTEGER DEFAULT 0,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },

      // Step 9: Create tax_reports table
      {
        name: "Create tax_reports table",
        sql: `
          CREATE TABLE IF NOT EXISTS tax_reports (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_name VARCHAR(200) NOT NULL,
              tax_type tax_type NOT NULL,
              period_start DATE NOT NULL,
              period_end DATE NOT NULL,
              taxable_income DECIMAL(15,2) DEFAULT 0,
              tax_rate DECIMAL(5,2) DEFAULT 0,
              tax_amount DECIMAL(15,2) DEFAULT 0,
              tax_paid DECIMAL(15,2) DEFAULT 0,
              tax_due DECIMAL(15,2) DEFAULT 0,
              due_date DATE,
              filing_date DATE,
              filing_status VARCHAR(50) DEFAULT 'PENDING',
              status report_status DEFAULT 'DRAFT',
              notes TEXT,
              generated_by UUID REFERENCES users(id),
              generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              finalized_at TIMESTAMP WITH TIME ZONE,
              finalized_by UUID REFERENCES users(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_tax_reports_type ON tax_reports(tax_type);
          CREATE INDEX IF NOT EXISTS idx_tax_reports_due_date ON tax_reports(due_date);
          CREATE INDEX IF NOT EXISTS idx_tax_reports_filing_status ON tax_reports(filing_status);
        `,
      },

      // Step 10: Create custom_reports table
      {
        name: "Create custom_reports table",
        sql: `
          CREATE TABLE IF NOT EXISTS custom_reports (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_name VARCHAR(200) NOT NULL,
              description TEXT,
              sql_query TEXT NOT NULL,
              is_public BOOLEAN DEFAULT false,
              parameters JSONB,
              last_executed_at TIMESTAMP WITH TIME ZONE,
              execution_count INTEGER DEFAULT 0,
              avg_execution_time_ms INTEGER DEFAULT 0,
              is_scheduled BOOLEAN DEFAULT false,
              schedule_expression VARCHAR(100),
              next_run_at TIMESTAMP WITH TIME ZONE,
              created_by UUID REFERENCES users(id),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          CREATE INDEX IF NOT EXISTS idx_custom_reports_public ON custom_reports(is_public);
          CREATE INDEX IF NOT EXISTS idx_custom_reports_scheduled ON custom_reports(is_scheduled);
        `,
      },

      // Step 11: Create custom_report_executions table
      {
        name: "Create custom_report_executions table",
        sql: `
          CREATE TABLE IF NOT EXISTS custom_report_executions (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
              executed_by UUID REFERENCES users(id),
              execution_time_ms INTEGER,
              row_count INTEGER,
              status VARCHAR(20) DEFAULT 'SUCCESS',
              error_message TEXT,
              result_data JSONB,
              executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },

      // Step 12: Create financial_transactions table
      {
        name: "Create financial_transactions table",
        sql: `
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
          
          CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
          CREATE INDEX IF NOT EXISTS idx_financial_transactions_account ON financial_transactions(account_id);
          CREATE INDEX IF NOT EXISTS idx_financial_transactions_party ON financial_transactions(party_id);
        `,
      },
    ];

    console.log(`📝 Found ${steps.length} setup steps to execute`);

    // Execute each step
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      try {
        console.log(`⚡ ${step.name} (${i + 1}/${steps.length})...`);

        // For Supabase, we need to use sql directly
        const { data, error } = await supabase.rpc("exec_sql", {
          sql: step.sql,
        });

        if (error) {
          console.error(`❌ Error in ${step.name}:`, error.message);
          console.error("SQL:", step.sql.substring(0, 200) + "...");
          errorCount++;
        } else {
          console.log(`✅ ${step.name} completed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Exception in ${step.name}:`, err.message);
        console.error("SQL:", step.sql.substring(0, 200) + "...");
        errorCount++;
      }
    }

    console.log("\n📊 Finance Reports Setup Summary:");
    console.log(`✅ Successful steps: ${successCount}`);
    console.log(`❌ Failed steps: ${errorCount}`);

    // Test if key tables exist
    console.log("\n🔍 Testing finance table creation...");

    const tables = [
      "chart_of_accounts",
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
      "financial_transactions",
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("count")
          .limit(1);

        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }

    // Insert sample chart of accounts data
    console.log("\n📊 Inserting sample chart of accounts data...");

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
        account_code: "1104",
        account_name: "Accounts Receivable",
        account_type: "ASSET",
        description: "Money owed by customers",
      },
      {
        account_code: "2101",
        account_name: "Accounts Payable",
        account_type: "LIABILITY",
        description: "Money owed to suppliers",
      },
      {
        account_code: "2102",
        account_name: "GST Payable",
        account_type: "LIABILITY",
        description: "GST collected from customers",
      },
      {
        account_code: "3101",
        account_name: "Owner Capital",
        account_type: "EQUITY",
        description: "Initial and additional capital",
      },
      {
        account_code: "4101",
        account_name: "Printing Services Revenue",
        account_type: "REVENUE",
        description: "Revenue from printing jobs",
      },
      {
        account_code: "5101",
        account_name: "Paper Cost",
        account_type: "COST_OF_GOODS_SOLD",
        description: "Cost of paper used in jobs",
      },
      {
        account_code: "6101",
        account_name: "Rent Expense",
        account_type: "EXPENSE",
        description: "Office and production space rent",
      },
      {
        account_code: "6103",
        account_name: "Staff Salaries",
        account_type: "EXPENSE",
        description: "Admin and support staff salaries",
      },
    ];

    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .upsert(sampleAccounts, { onConflict: "account_code" });

      if (error) {
        console.error(`❌ Error inserting sample accounts:`, error.message);
      } else {
        console.log(`✅ Sample chart of accounts data inserted successfully`);
      }
    } catch (err) {
      console.error(`❌ Exception inserting sample accounts:`, err.message);
    }

    console.log("\n🎉 Finance Reports schema setup completed!");
  } catch (error) {
    console.error("💥 Finance Reports setup failed:", error.message);
    process.exit(1);
  }
}

setupFinanceReports();
