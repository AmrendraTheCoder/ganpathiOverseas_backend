import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    console.log("🧪 Running complete setup verification tests...");

    const results = {
      timestamp: new Date().toISOString(),
      overall_status: "checking",
      tests: {},
      summary: {
        total_tests: 0,
        passed: 0,
        failed: 0,
      },
      demo_data_counts: {},
      recommendations: [],
    };

    // Test 1: Check job_sheets has UV and baking columns
    console.log("📋 Test 1: job_sheets columns...");
    try {
      const { data: jobSheetTest, error } = await supabase
        .from("job_sheets")
        .select("id, uv, baking")
        .limit(1);

      if (!error) {
        results.tests.job_sheets_columns = {
          status: "PASS",
          message: "job_sheets has uv and baking columns",
          sample_data: jobSheetTest?.[0] || null,
        };
        results.summary.passed++;
      } else {
        results.tests.job_sheets_columns = {
          status: "FAIL",
          message: `job_sheets missing columns: ${error.message}`,
          error: error,
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.tests.job_sheets_columns = {
        status: "FAIL",
        message: `Error testing job_sheets: ${err.message}`,
        error: err,
      };
      results.summary.failed++;
    }
    results.summary.total_tests++;

    // Test 2: Check chart_of_accounts table and data
    console.log("📊 Test 2: chart_of_accounts...");
    try {
      const { data: accounts, error } = await supabase
        .from("chart_of_accounts")
        .select("id, account_code, account_name, account_type")
        .limit(5);

      if (!error && accounts && accounts.length > 0) {
        results.tests.chart_of_accounts = {
          status: "PASS",
          message: `chart_of_accounts working with ${accounts.length} sample records`,
          sample_accounts: accounts,
        };
        results.summary.passed++;

        // Get total count
        const { count } = await supabase
          .from("chart_of_accounts")
          .select("*", { count: "exact", head: true });
        results.demo_data_counts.chart_of_accounts = count || 0;
      } else {
        results.tests.chart_of_accounts = {
          status: "FAIL",
          message: error
            ? `chart_of_accounts error: ${error.message}`
            : "No accounts found",
          error: error,
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.tests.chart_of_accounts = {
        status: "FAIL",
        message: `Error testing chart_of_accounts: ${err.message}`,
        error: err,
      };
      results.summary.failed++;
    }
    results.summary.total_tests++;

    // Test 3: Check financial_transactions table and relationships
    console.log("💰 Test 3: financial_transactions with relationships...");
    try {
      const { data: transactions, error } = await supabase
        .from("financial_transactions")
        .select(
          `
          *,
          parties:party_id (
            id,
            name
          ),
          chart_of_accounts:account_id (
            id,
            account_code,
            account_name
          )
        `
        )
        .limit(3);

      if (!error) {
        results.tests.financial_transactions = {
          status: "PASS",
          message: `financial_transactions working with relationships`,
          sample_transactions: transactions || [],
        };
        results.summary.passed++;

        // Get total count
        const { count } = await supabase
          .from("financial_transactions")
          .select("*", { count: "exact", head: true });
        results.demo_data_counts.financial_transactions = count || 0;
      } else {
        results.tests.financial_transactions = {
          status: "FAIL",
          message: `financial_transactions error: ${error.message}`,
          error: error,
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.tests.financial_transactions = {
        status: "FAIL",
        message: `Error testing financial_transactions: ${err.message}`,
        error: err,
      };
      results.summary.failed++;
    }
    results.summary.total_tests++;

    // Test 4: Check report tables
    console.log("📈 Test 4: report tables...");
    const reportTables = [
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
      "custom_reports",
    ];

    let reportTablesWorking = 0;
    for (const table of reportTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("id")
          .limit(1);

        if (!error) {
          reportTablesWorking++;

          // Get count for this table
          const { count } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          results.demo_data_counts[table] = count || 0;
        }
      } catch (err) {
        // Table doesn't exist or has issues
      }
    }

    if (reportTablesWorking === reportTables.length) {
      results.tests.report_tables = {
        status: "PASS",
        message: `All ${reportTables.length} report tables working`,
        working_tables: reportTablesWorking,
      };
      results.summary.passed++;
    } else {
      results.tests.report_tables = {
        status: "FAIL",
        message: `Only ${reportTablesWorking}/${reportTables.length} report tables working`,
        working_tables: reportTablesWorking,
      };
      results.summary.failed++;
    }
    results.summary.total_tests++;

    // Test 5: Check foreign key relationships work
    console.log("🔗 Test 5: foreign key relationships...");
    try {
      // Test creating a transaction with relationships
      const { data: testAccount } = await supabase
        .from("chart_of_accounts")
        .select("id")
        .limit(1)
        .single();

      if (testAccount) {
        const testTransaction = {
          transaction_date: new Date().toISOString().split("T")[0],
          reference_type: "ADJUSTMENT",
          account_id: testAccount.id,
          debit_amount: 1.0,
          credit_amount: 0,
          description: "Test transaction for relationship verification",
          status: "PENDING",
        };

        const { data: createdTransaction, error } = await supabase
          .from("financial_transactions")
          .insert([testTransaction])
          .select()
          .single();

        if (!error && createdTransaction) {
          // Clean up test transaction
          await supabase
            .from("financial_transactions")
            .delete()
            .eq("id", createdTransaction.id);

          results.tests.foreign_key_relationships = {
            status: "PASS",
            message: "Foreign key relationships working correctly",
            test_transaction_created: true,
          };
          results.summary.passed++;
        } else {
          results.tests.foreign_key_relationships = {
            status: "FAIL",
            message: `Foreign key test failed: ${error?.message}`,
            error: error,
          };
          results.summary.failed++;
        }
      } else {
        results.tests.foreign_key_relationships = {
          status: "FAIL",
          message: "No chart of accounts data found for relationship test",
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.tests.foreign_key_relationships = {
        status: "FAIL",
        message: `Relationship test error: ${err.message}`,
        error: err,
      };
      results.summary.failed++;
    }
    results.summary.total_tests++;

    // Test 6: Check transaction auto-numbering
    console.log("🔢 Test 6: transaction auto-numbering...");
    try {
      const { data: recentTransaction } = await supabase
        .from("financial_transactions")
        .select("transaction_number")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (recentTransaction && recentTransaction.transaction_number) {
        const pattern = /^TXN-\d{8}-\d{3}$/;
        const isValidFormat = pattern.test(
          recentTransaction.transaction_number
        );

        if (isValidFormat) {
          results.tests.auto_numbering = {
            status: "PASS",
            message: "Transaction auto-numbering working",
            sample_number: recentTransaction.transaction_number,
          };
          results.summary.passed++;
        } else {
          results.tests.auto_numbering = {
            status: "FAIL",
            message: "Transaction numbering format incorrect",
            sample_number: recentTransaction.transaction_number,
          };
          results.summary.failed++;
        }
      } else {
        results.tests.auto_numbering = {
          status: "FAIL",
          message: "No transactions found or numbering not working",
        };
        results.summary.failed++;
      }
    } catch (err: any) {
      results.tests.auto_numbering = {
        status: "FAIL",
        message: `Auto-numbering test error: ${err.message}`,
        error: err,
      };
      results.summary.failed++;
    }
    results.summary.total_tests++;

    // Calculate overall status
    const successRate =
      (results.summary.passed / results.summary.total_tests) * 100;
    if (successRate >= 100) {
      results.overall_status = "ALL_SYSTEMS_GO";
      results.recommendations = [
        "🎉 Perfect! All systems are working correctly",
        "✅ Database setup is complete",
        "✅ All relationships are configured properly",
        "✅ Demo data is loaded and accessible",
        "🚀 Your ERP system is ready for production use!",
      ];
    } else if (successRate >= 80) {
      results.overall_status = "MOSTLY_WORKING";
      results.recommendations = [
        "✅ Most systems are working",
        "⚠️ Some minor issues detected",
        "🔧 Check failed tests and address issues",
      ];
    } else if (successRate >= 50) {
      results.overall_status = "PARTIAL_SUCCESS";
      results.recommendations = [
        "⚠️ Partial setup completed",
        "🔧 Several issues need attention",
        "📝 Run the complete database setup script again",
      ];
    } else {
      results.overall_status = "MAJOR_ISSUES";
      results.recommendations = [
        "❌ Setup not complete",
        "🔧 Run the COMPLETE_DATABASE_SETUP_WITH_DEMO_DATA.sql script",
        "📝 Visit /setup-database-now for instructions",
      ];
    }

    console.log(
      `✅ Complete setup verification: ${results.summary.passed}/${results.summary.total_tests} tests passed (${Math.round(successRate)}%)`
    );

    return NextResponse.json({
      success: true,
      message: "Complete setup verification completed",
      results,
      next_steps: results.recommendations,
    });
  } catch (error: any) {
    console.error("Complete setup verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Complete setup verification failed",
        results: {
          overall_status: "ERROR",
          summary: { total_tests: 0, passed: 0, failed: 1 },
        },
      },
      { status: 500 }
    );
  }
}
