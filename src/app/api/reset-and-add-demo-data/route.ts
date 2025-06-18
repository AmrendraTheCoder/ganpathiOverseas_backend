import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
      }
    );

    console.log("🔄 Resetting and adding fresh demo data...");

    // Step 1: Clear existing financial transactions
    const { error: clearError } = await supabase
      .from("financial_transactions")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (clearError) {
      console.warn("Could not clear existing transactions:", clearError);
      // Continue anyway
    } else {
      console.log("✅ Cleared existing financial transactions");
    }

    // Step 2: Get chart of accounts
    const { data: accounts } = await supabase
      .from("chart_of_accounts")
      .select("id, account_code, account_name");

    if (!accounts || accounts.length === 0) {
      throw new Error("No chart of accounts found - run database setup first");
    }

    const accountMap = accounts.reduce((acc: any, account) => {
      acc[account.account_code] = account.id;
      return acc;
    }, {});

    console.log(`📊 Found ${accounts.length} chart of accounts`);

    // Step 3: Get user ID
    const { data: users } = await supabase.from("users").select("id").limit(1);

    const userId = users?.[0]?.id;

    if (!userId) {
      throw new Error("No users found - cannot create demo transactions");
    }

    // Step 4: Get existing parties
    const { data: existingParties } = await supabase
      .from("parties")
      .select("id, name, email")
      .limit(5);

    console.log(`👥 Found ${existingParties?.length || 0} existing parties`);

    // Step 5: Create fresh demo financial transactions with proper numbering
    const baseDate = new Date("2024-12-01");
    const demoTransactions = [];

    // Transaction 1: Revenue - Business Cards
    demoTransactions.push(
      {
        transaction_number: "TXN-20241201-001",
        transaction_date: "2024-12-01",
        reference_type: "JOB_SHEET",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 85000,
        credit_amount: 0,
        description: "Invoice #INV-001 - Business Cards Printing",
        status: "APPROVED",
        party_id: existingParties?.[0]?.id || null,
        created_by: userId,
      },
      {
        transaction_number: "TXN-20241201-002",
        transaction_date: "2024-12-01",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 85000,
        description: "Revenue - Business Cards Printing",
        status: "APPROVED",
        party_id: existingParties?.[0]?.id || null,
        created_by: userId,
      }
    );

    // Transaction 2: Payment Receipt
    demoTransactions.push(
      {
        transaction_number: "TXN-20241202-001",
        transaction_date: "2024-12-02",
        reference_type: "PAYMENT",
        account_id: accountMap["1001"], // Bank Account
        debit_amount: 85000,
        credit_amount: 0,
        description: "Payment received for business cards",
        status: "APPROVED",
        party_id: existingParties?.[0]?.id || null,
        created_by: userId,
      },
      {
        transaction_number: "TXN-20241202-002",
        transaction_date: "2024-12-02",
        reference_type: "PAYMENT",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 0,
        credit_amount: 85000,
        description: "Payment received for business cards",
        status: "APPROVED",
        party_id: existingParties?.[0]?.id || null,
        created_by: userId,
      }
    );

    // Transaction 3: Brochure Revenue
    demoTransactions.push(
      {
        transaction_number: "TXN-20241203-001",
        transaction_date: "2024-12-03",
        reference_type: "JOB_SHEET",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 120000,
        credit_amount: 0,
        description: "Invoice #INV-002 - Brochure Printing",
        status: "APPROVED",
        party_id: existingParties?.[1]?.id || null,
        created_by: userId,
      },
      {
        transaction_number: "TXN-20241203-002",
        transaction_date: "2024-12-03",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 120000,
        description: "Revenue - Brochure Printing",
        status: "APPROVED",
        party_id: existingParties?.[1]?.id || null,
        created_by: userId,
      }
    );

    // Transaction 4: Operating Expenses
    demoTransactions.push(
      {
        transaction_number: "TXN-20241201-003",
        transaction_date: "2024-12-01",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["6000"], // Office Rent
        debit_amount: 50000,
        credit_amount: 0,
        description: "December 2024 - Office Rent",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_number: "TXN-20241201-004",
        transaction_date: "2024-12-01",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["1001"], // Bank Account
        debit_amount: 0,
        credit_amount: 50000,
        description: "December 2024 - Office Rent Payment",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_number: "TXN-20241201-005",
        transaction_date: "2024-12-01",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["6100"], // Employee Salaries
        debit_amount: 125000,
        credit_amount: 0,
        description: "December 2024 - Staff Salaries",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_number: "TXN-20241201-006",
        transaction_date: "2024-12-01",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["1001"], // Bank Account
        debit_amount: 0,
        credit_amount: 125000,
        description: "December 2024 - Staff Salary Payment",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      }
    );

    // Transaction 5: Supply Purchase
    demoTransactions.push(
      {
        transaction_number: "TXN-20241204-001",
        transaction_date: "2024-12-04",
        reference_type: "INVOICE",
        account_id: accountMap["5000"], // Paper Cost
        debit_amount: 45000,
        credit_amount: 0,
        description: "Paper purchase for printing jobs",
        status: "APPROVED",
        party_id: existingParties?.[2]?.id || null,
        created_by: userId,
      },
      {
        transaction_number: "TXN-20241204-002",
        transaction_date: "2024-12-04",
        reference_type: "INVOICE",
        account_id: accountMap["2000"], // Accounts Payable
        debit_amount: 0,
        credit_amount: 45000,
        description: "Paper purchase for printing jobs",
        status: "APPROVED",
        party_id: existingParties?.[2]?.id || null,
        created_by: userId,
      }
    );

    // Filter out transactions with missing account IDs
    const validTransactions = demoTransactions.filter((t) => t.account_id);

    console.log(
      `💰 Preparing to insert ${validTransactions.length} transactions`
    );

    // Insert financial transactions
    const { data: insertedTransactions, error: transactionsError } =
      await supabase
        .from("financial_transactions")
        .insert(validTransactions)
        .select();

    if (transactionsError) {
      console.error("Error inserting transactions:", transactionsError);
      throw transactionsError;
    }

    console.log(
      `✅ Inserted ${insertedTransactions?.length || 0} demo transactions`
    );

    const summary = {
      transactions_cleared: "All previous transactions cleared",
      transactions_added: insertedTransactions?.length || 0,
      accounts_available: accounts?.length || 0,
      existing_parties: existingParties?.length || 0,
      revenue_amount: validTransactions
        .filter((t) => t.account_id === accountMap["4000"])
        .reduce((sum, t) => sum + t.credit_amount, 0),
      expenses_amount: validTransactions
        .filter(
          (t) =>
            t.debit_amount > 0 &&
            t.account_id !== accountMap["1100"] &&
            t.account_id !== accountMap["1001"]
        )
        .reduce((sum, t) => sum + t.debit_amount, 0),
    };

    return NextResponse.json({
      success: true,
      message: "🎉 Fresh demo data added successfully!",
      summary,
      sample_transactions:
        insertedTransactions?.slice(0, 3).map((t) => ({
          date: t.transaction_date,
          description: t.description,
          amount: t.debit_amount || t.credit_amount,
        })) || [],
      next_steps: [
        "✅ All old transactions cleared",
        "✅ Fresh financial transactions added",
        "🔄 Refresh finance dashboard to see data",
        "📊 Check /api/finance/transactions for new records",
      ],
    });
  } catch (error: any) {
    console.error("❌ Reset and demo data creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to reset and add demo data",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Reset and Demo Data API",
    description: "POST to clear existing transactions and add fresh demo data",
    warning: "This will DELETE all existing financial transactions",
  });
}
