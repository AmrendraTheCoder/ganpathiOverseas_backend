import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    console.log("=== COMPREHENSIVE DATABASE ANALYSIS ===");

    const results = {
      timestamp: new Date().toISOString(),
      database_info: {},
      existing_tables: {},
      table_columns: {},
      constraints: {},
      relationships: {},
      missing_tables: [],
      issues: [],
      recommendations: [],
    };

    // 1. Get all existing tables by testing direct access
    console.log("📊 Analyzing existing tables...");
    const knownTables = [
      "job_sheets",
      "users",
      "parties",
      "paper_types",
      "party_transactions",
      "chart_of_accounts",
      "financial_transactions",
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
    ];

    results.existing_tables = [];

    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (!error) {
          results.existing_tables.push(tableName);
          console.log(`✅ Table '${tableName}' exists and accessible`);

          // Store sample data structure if available
          if (data && data.length > 0) {
            results.table_columns[tableName + "_sample_keys"] = Object.keys(
              data[0]
            );
          }
        } else {
          console.log(`❌ Table '${tableName}': ${error.message}`);
        }
      } catch (err: any) {
        console.log(`❌ Table '${tableName}': ${err.message}`);
      }
    }

    console.log(
      `Found ${results.existing_tables.length} accessible tables:`,
      results.existing_tables
    );

    // 2. Analyze each table's structure in detail
    console.log("🔍 Analyzing table structures...");
    for (const tableName of results.existing_tables) {
      try {
        // Get sample data to understand the structure
        const { data: sampleData, error: sampleError } = await supabase
          .from(tableName)
          .select("*")
          .limit(1);

        if (sampleData && !sampleError && sampleData.length > 0) {
          const columnNames = Object.keys(sampleData[0]);
          results.table_columns[tableName] = columnNames;
          console.log(
            `📋 Table '${tableName}' has ${columnNames.length} columns:`,
            columnNames.slice(0, 5)
          );
        } else if (sampleData && sampleData.length === 0) {
          // Table exists but is empty - try to get column info differently
          results.table_columns[tableName] = "empty_table";
          console.log(`📋 Table '${tableName}' exists but is empty`);
        }
      } catch (err: any) {
        results.issues.push(
          `Error analyzing table ${tableName}: ${err.message}`
        );
      }
    }

    // 3. Check specific finance-related tables
    console.log("💰 Checking finance tables...");
    const requiredFinanceTables = [
      "chart_of_accounts",
      "financial_transactions",
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
    ];

    for (const table of requiredFinanceTables) {
      if (!results.existing_tables.includes(table)) {
        results.missing_tables.push(table);
      }
    }

    // 4. Check job_sheets table specifically
    console.log("📋 Analyzing job_sheets table...");
    if (results.existing_tables.includes("job_sheets")) {
      try {
        const columnNames = results.table_columns["job_sheets"];
        if (Array.isArray(columnNames)) {
          results.database_info.job_sheets = {
            exists: true,
            columns: columnNames,
            has_uv: columnNames.includes("uv"),
            has_baking: columnNames.includes("baking"),
            total_columns: columnNames.length,
          };

          // Check if required columns are missing
          const expectedColumns = ["uv", "baking"];
          const missingColumns = expectedColumns.filter(
            (col) => !columnNames.includes(col)
          );
          if (missingColumns.length > 0) {
            results.issues.push(
              `job_sheets missing columns: ${missingColumns.join(", ")}`
            );
            results.recommendations.push(
              `Add missing columns to job_sheets: ${missingColumns.join(", ")}`
            );
          } else {
            results.recommendations.push("job_sheets has all required columns");
          }
        } else {
          results.database_info.job_sheets = {
            exists: true,
            columns: "empty_or_unknown",
            has_uv: false,
            has_baking: false,
          };
        }
      } catch (err: any) {
        results.issues.push(`Error analyzing job_sheets: ${err.message}`);
      }
    } else {
      results.issues.push("job_sheets table does not exist");
    }

    // 5. Check users and parties tables for foreign key requirements
    console.log("👥 Checking users and parties tables...");
    for (const table of ["users", "parties"]) {
      if (results.existing_tables.includes(table)) {
        try {
          const { data: sampleRecord } = await supabase
            .from(table)
            .select("id")
            .limit(1);

          results.database_info[table] = {
            exists: true,
            has_records: sampleRecord && sampleRecord.length > 0,
          };
        } catch (err: any) {
          results.database_info[table] = {
            exists: true,
            has_records: false,
            error: err.message,
          };
        }
      } else {
        results.database_info[table] = { exists: false };
        results.issues.push(`${table} table does not exist`);
      }
    }

    // 6. Check for ENUM types
    console.log("🏷️ Checking ENUM types...");
    try {
      const { data: enums, error: enumsError } = await supabase
        .from("information_schema.types")
        .select("typname")
        .eq("typtype", "e");

      if (enums && !enumsError) {
        results.database_info.enums = enums.map((e) => e.typname);

        const requiredEnums = ["account_type"];
        const missingEnums = requiredEnums.filter(
          (e) => !results.database_info.enums.includes(e)
        );
        if (missingEnums.length > 0) {
          results.issues.push(`Missing ENUM types: ${missingEnums.join(", ")}`);
          results.recommendations.push(
            `Create ENUM types: ${missingEnums.join(", ")}`
          );
        }
      }
    } catch (err: any) {
      results.issues.push(`Error checking ENUM types: ${err.message}`);
    }

    // 7. Check RLS policies
    console.log("🔒 Checking RLS policies...");
    try {
      const { data: policies, error: policiesError } = await supabase
        .from("information_schema.policies")
        .select("tablename, policyname")
        .eq("schemaname", "public");

      if (policies && !policiesError) {
        results.database_info.rls_policies = policies;
      }
    } catch (err: any) {
      results.issues.push(`Error checking RLS policies: ${err.message}`);
    }

    // 8. Generate recommendations
    console.log("💡 Generating recommendations...");

    if (results.missing_tables.length > 0) {
      results.recommendations.push(
        `Create missing finance tables: ${results.missing_tables.join(", ")}`
      );
    }

    if (
      !results.database_info.enums ||
      !results.database_info.enums.includes("account_type")
    ) {
      results.recommendations.push(
        "Create account_type ENUM with values: ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE, COST_OF_GOODS_SOLD"
      );
    }

    // 9. Check if we can create an exec_sql function
    console.log("⚙️ Testing function creation capabilities...");
    try {
      const { data, error } = await supabase.rpc("version");
      if (!error) {
        results.database_info.can_call_functions = true;
        results.recommendations.push(
          "Database supports function calls - can potentially create exec_sql function"
        );
      }
    } catch (err: any) {
      results.database_info.can_call_functions = false;
      results.issues.push("Cannot call database functions via RPC");
    }

    console.log("✅ Database analysis completed");

    return NextResponse.json({
      success: true,
      message: "Comprehensive database analysis completed",
      analysis: results,
    });
  } catch (error: any) {
    console.error("Database analysis error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Database analysis failed",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = await createClient();

    // Run the migration SQL
    const migrationSQL = `
      -- Check if table exists and drop if it has wrong schema
      DO $$
      BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'party_transactions') THEN
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'party_transactions' AND column_name = 'type'
              ) THEN
                  DROP TABLE IF EXISTS public.party_transactions CASCADE;
              END IF;
          END IF;
      END $$;

      -- Create the party_transactions table with correct schema
      CREATE TABLE IF NOT EXISTS public.party_transactions (
          id SERIAL PRIMARY KEY,
          party_id INTEGER REFERENCES public.parties(id) ON DELETE CASCADE,
          type TEXT NOT NULL CHECK (type IN ('payment', 'order', 'adjustment')),
          amount DECIMAL(12,2) NOT NULL,
          description TEXT,
          balance_after DECIMAL(12,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_party_transactions_party_id ON public.party_transactions(party_id);
      CREATE INDEX IF NOT EXISTS idx_party_transactions_created_at ON public.party_transactions(created_at);

      -- Enable RLS and create policy
      ALTER TABLE public.party_transactions ENABLE ROW LEVEL SECURITY;
      
      -- Drop existing policy if it exists
      DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON public.party_transactions;
      
      -- Create policy
      CREATE POLICY "Allow all operations for authenticated users" ON public.party_transactions
          FOR ALL USING (true);
    `;

    // Execute migration
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL });

    if (error) {
      console.error("Migration error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      message: "Migration completed successfully",
    });
  } catch (error: any) {
    console.error("Migration execution error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
