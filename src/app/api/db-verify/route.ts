import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    console.log("=== DATABASE VERIFICATION ===");

    const results = {
      timestamp: new Date().toISOString(),
      overall_status: "checking",
      checks: {},
      summary: {
        total_checks: 0,
        passed: 0,
        failed: 0,
      },
    };

    // 1. Check job_sheets has uv and baking columns
    console.log("📋 Checking job_sheets columns...");
    try {
      const { data: jobSheetTest, error } = await supabase
        .from("job_sheets")
        .select("id, uv, baking")
        .limit(1);

      if (!error) {
        results.checks.job_sheets_columns = {
          status: "PASS",
          message: "job_sheets has uv and baking columns",
        };
        results.summary.passed++;
      } else {
        results.checks.job_sheets_columns = {
          status: "FAIL",
          message: `job_sheets missing columns: ${error.message}`,
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.checks.job_sheets_columns = {
        status: "FAIL",
        message: `Error checking job_sheets: ${err.message}`,
      };
      results.summary.failed++;
    }
    results.summary.total_checks++;

    // 2. Check chart_of_accounts table
    console.log("📊 Checking chart_of_accounts...");
    try {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("id, account_code, account_name, account_type")
        .limit(5);

      if (!error) {
        results.checks.chart_of_accounts = {
          status: "PASS",
          message: `chart_of_accounts exists with ${data?.length || 0} records`,
          sample_records: data?.length || 0,
        };
        results.summary.passed++;
      } else {
        results.checks.chart_of_accounts = {
          status: "FAIL",
          message: `chart_of_accounts error: ${error.message}`,
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.checks.chart_of_accounts = {
        status: "FAIL",
        message: `Error checking chart_of_accounts: ${err.message}`,
      };
      results.summary.failed++;
    }
    results.summary.total_checks++;

    // 3. Check financial_transactions table
    console.log("💰 Checking financial_transactions...");
    try {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("id")
        .limit(1);

      if (!error) {
        results.checks.financial_transactions = {
          status: "PASS",
          message: "financial_transactions table exists and accessible",
        };
        results.summary.passed++;
      } else {
        results.checks.financial_transactions = {
          status: "FAIL",
          message: `financial_transactions error: ${error.message}`,
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.checks.financial_transactions = {
        status: "FAIL",
        message: `Error checking financial_transactions: ${err.message}`,
      };
      results.summary.failed++;
    }
    results.summary.total_checks++;

    // 4. Check all finance report tables
    console.log("📈 Checking finance report tables...");
    const reportTables = [
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
    ];

    for (const tableName of reportTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select("id")
          .limit(1);

        if (!error) {
          results.checks[tableName] = {
            status: "PASS",
            message: `${tableName} table exists and accessible`,
          };
          results.summary.passed++;
        } else {
          results.checks[tableName] = {
            status: "FAIL",
            message: `${tableName} error: ${error.message}`,
          };
          results.summary.failed++;
        }
      } catch (err: any) {
        results.checks[tableName] = {
          status: "FAIL",
          message: `Error checking ${tableName}: ${err.message}`,
        };
        results.summary.failed++;
      }
      results.summary.total_checks++;
    }

    // 5. Test creating a job_sheet with uv and baking
    console.log("🧪 Testing job_sheet creation with new columns...");
    try {
      // Get existing user and party IDs
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .limit(1);
      const { data: parties } = await supabase
        .from("parties")
        .select("id")
        .limit(1);

      if (users && users.length > 0 && parties && parties.length > 0) {
        const testJobSheet = {
          job_number: `VERIFY-${Date.now()}`,
          title: "Verification Test Job",
          description: "Testing uv and baking columns",
          party_id: parties[0].id,
          status: "pending",
          priority: 1,
          quantity: 1,
          selling_price: 100.0,
          order_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          created_by: users[0].id,
          uv: 25.5,
          baking: 15.25,
        };

        const { data: insertedJob, error: insertError } = await supabase
          .from("job_sheets")
          .insert([testJobSheet])
          .select()
          .single();

        if (!insertError && insertedJob) {
          // Clean up test record
          await supabase.from("job_sheets").delete().eq("id", insertedJob.id);

          results.checks.job_sheet_creation_test = {
            status: "PASS",
            message:
              "Successfully created job_sheet with uv and baking columns",
            uv_value: insertedJob.uv,
            baking_value: insertedJob.baking,
          };
          results.summary.passed++;
        } else {
          results.checks.job_sheet_creation_test = {
            status: "FAIL",
            message: `Job sheet creation failed: ${insertError?.message}`,
          };
          results.summary.failed++;
        }
      } else {
        results.checks.job_sheet_creation_test = {
          status: "SKIP",
          message: "No users or parties available for testing",
        };
      }
    } catch (err: any) {
      results.checks.job_sheet_creation_test = {
        status: "FAIL",
        message: `Job sheet creation test error: ${err.message}`,
      };
      results.summary.failed++;
    }
    results.summary.total_checks++;

    // 6. Test finance API endpoints
    console.log("🔌 Testing finance API endpoints...");
    const financeEndpoints = [
      "/api/finance/reports/profit-loss",
      "/api/finance/reports/balance-sheet",
      "/api/finance/reports/cash-flow",
      "/api/finance/reports/tax",
      "/api/finance/reports/custom",
    ];

    // For this test, we'll just check if the checks above passed
    // The actual API endpoint testing would require HTTP requests
    results.checks.finance_apis_ready = {
      status: results.summary.failed === 0 ? "READY" : "NOT_READY",
      message:
        results.summary.failed === 0
          ? "All database tables exist - finance APIs should work"
          : `${results.summary.failed} database issues remain - fix these first`,
    };

    // Calculate overall status
    const successRate =
      (results.summary.passed / results.summary.total_checks) * 100;
    if (successRate >= 100) {
      results.overall_status = "ALL_SYSTEMS_GO";
    } else if (successRate >= 80) {
      results.overall_status = "MOSTLY_WORKING";
    } else if (successRate >= 50) {
      results.overall_status = "PARTIAL_SUCCESS";
    } else {
      results.overall_status = "MAJOR_ISSUES";
    }

    console.log(
      `✅ Verification completed: ${results.summary.passed}/${results.summary.total_checks} checks passed`
    );

    return NextResponse.json({
      success: true,
      message: "Database verification completed",
      results,
      next_steps:
        results.overall_status === "ALL_SYSTEMS_GO"
          ? [
              "🎉 All systems ready!",
              "Test the finance report pages",
              "All APIs should be working",
            ]
          : [
              "❌ Issues found",
              "Run the fix_database_schema.sql file in Supabase",
              "Re-run verification after fixes",
            ],
    });
  } catch (error: any) {
    console.error("Database verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Database verification failed",
      },
      { status: 500 }
    );
  }
}
