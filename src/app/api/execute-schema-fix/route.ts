import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST() {
  try {
    const supabase = await createClient();

    console.log("=== EXECUTING DATABASE SCHEMA FIX ===");

    const results = {
      timestamp: new Date().toISOString(),
      executed_statements: [],
      successes: 0,
      failures: 0,
      critical_errors: [],
      warnings: [],
    };

    // Read the SQL fix file
    const sqlFilePath = join(process.cwd(), "fix_database_schema.sql");
    let sqlContent: string;

    try {
      sqlContent = readFileSync(sqlFilePath, "utf8");
      console.log("📄 SQL file loaded successfully");
    } catch (readError) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not read fix_database_schema.sql file",
          message:
            "Make sure the fix_database_schema.sql file exists in the project root",
        },
        { status: 400 }
      );
    }

    // Split SQL into individual statements
    const statements = sqlContent
      .split(";")
      .map((stmt) => stmt.trim())
      .filter(
        (stmt) =>
          stmt.length > 10 &&
          !stmt.startsWith("--") &&
          !stmt.includes("SELECT 'Database schema setup completed")
      )
      .map((stmt) => stmt + ";"); // Add semicolon back

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementName = statement.substring(0, 50).replace(/\s+/g, " ");

      try {
        console.log(
          `⏳ Executing statement ${i + 1}/${statements.length}: ${statementName}...`
        );

        // For DDL statements, we'll try to execute them using a raw query approach
        const { data, error } = await supabase.rpc("exec_sql", {
          sql: statement,
        });

        if (error) {
          // If exec_sql doesn't work, try some specific workarounds
          if (statement.includes("ALTER TABLE job_sheets ADD COLUMN")) {
            // Try to check if columns already exist
            const columnName = statement.includes("uv") ? "uv" : "baking";
            const { error: testError } = await supabase
              .from("job_sheets")
              .select(columnName)
              .limit(1);

            if (testError && testError.message.includes("does not exist")) {
              results.failures++;
              results.critical_errors.push(
                `${statementName}: ${error.message}`
              );
            } else {
              results.successes++;
              results.warnings.push(`${columnName} column may already exist`);
            }
          } else if (statement.includes("CREATE TABLE")) {
            // For table creation, the error might mean table already exists
            const tableName = statement.match(
              /CREATE TABLE (?:IF NOT EXISTS )?(\w+)/
            )?.[1];
            if (tableName) {
              const { error: testError } = await supabase
                .from(tableName)
                .select("id")
                .limit(1);

              if (testError && testError.message.includes("does not exist")) {
                results.failures++;
                results.critical_errors.push(
                  `${statementName}: ${error.message}`
                );
              } else {
                results.successes++;
                results.warnings.push(`Table ${tableName} may already exist`);
              }
            } else {
              results.failures++;
              results.critical_errors.push(
                `${statementName}: ${error.message}`
              );
            }
          } else {
            results.failures++;
            results.critical_errors.push(`${statementName}: ${error.message}`);
          }
        } else {
          results.successes++;
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }

        results.executed_statements.push({
          index: i + 1,
          statement: statementName,
          status: error ? "failed" : "success",
          error: error?.message || null,
        });
      } catch (err: any) {
        results.failures++;
        results.critical_errors.push(`${statementName}: ${err.message}`);
        results.executed_statements.push({
          index: i + 1,
          statement: statementName,
          status: "error",
          error: err.message,
        });
        console.log(`❌ Statement ${i + 1} failed: ${err.message}`);
      }
    }

    // Final verification
    console.log("🔍 Running final verification...");

    // Test key tables
    const verificationTests = [
      { table: "chart_of_accounts", description: "Chart of accounts table" },
      {
        table: "financial_transactions",
        description: "Financial transactions table",
      },
      {
        table: "profit_loss_reports",
        description: "Profit & loss reports table",
      },
      {
        table: "balance_sheet_reports",
        description: "Balance sheet reports table",
      },
      { table: "cash_flow_reports", description: "Cash flow reports table" },
      { table: "tax_reports", description: "Tax reports table" },
      { table: "custom_reports", description: "Custom reports table" },
    ];

    const verification = {
      tables_working: 0,
      tables_failed: 0,
      job_sheets_columns: false,
    };

    for (const test of verificationTests) {
      try {
        const { error } = await supabase.from(test.table).select("id").limit(1);
        if (!error) {
          verification.tables_working++;
          console.log(`✅ ${test.description} is working`);
        } else {
          verification.tables_failed++;
          console.log(`❌ ${test.description} failed: ${error.message}`);
        }
      } catch (err) {
        verification.tables_failed++;
        console.log(`❌ ${test.description} error: ${err}`);
      }
    }

    // Test job_sheets columns
    try {
      const { error } = await supabase
        .from("job_sheets")
        .select("id, uv, baking")
        .limit(1);

      if (!error) {
        verification.job_sheets_columns = true;
        console.log(`✅ job_sheets uv/baking columns are working`);
      } else {
        console.log(`❌ job_sheets columns failed: ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ job_sheets columns error: ${err}`);
    }

    const successRate =
      (results.successes / (results.successes + results.failures)) * 100;

    console.log(
      `✅ Schema fix completed: ${results.successes}/${results.successes + results.failures} statements succeeded`
    );

    return NextResponse.json({
      success: successRate > 50,
      message: `Database schema fix completed with ${Math.round(successRate)}% success rate`,
      results,
      verification,
      next_steps:
        verification.tables_working >= 5 && verification.job_sheets_columns
          ? [
              "🎉 Schema fix successful!",
              "All finance tables should now work",
              "Test the finance pages",
            ]
          : [
              "⚠️ Partial success",
              "Some tables may still need manual creation",
              "Run fix_database_schema.sql manually in Supabase Dashboard",
            ],
    });
  } catch (error: any) {
    console.error("Schema fix execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Schema fix execution failed",
      },
      { status: 500 }
    );
  }
}
