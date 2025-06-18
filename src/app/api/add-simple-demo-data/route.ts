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

    console.log("🎨 Adding simple demo financial transactions...");

    // Step 1: Get chart of accounts
    const { data: accounts } = await supabase
      .from("chart_of_accounts")
      .select("id, account_code");

    const accountMap =
      accounts?.reduce((acc: any, account) => {
        acc[account.account_code] = account.id;
        return acc;
      }, {}) || {};

    // Step 2: Get user ID
    const { data: users } = await supabase.from("users").select("id").limit(1);

    const userId = users?.[0]?.id;

    if (!userId) {
      throw new Error("No users found - cannot create demo transactions");
    }

    // Step 3: Get existing parties (if any)
    const { data: existingParties } = await supabase
      .from("parties")
      .select("id, name, email")
      .limit(5);

    console.log(`Found ${existingParties?.length || 0} existing parties`);

    // Step 4: Create demo financial transactions with unique numbers
    const currentTime = Date.now();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const demoTransactions = [
      // Sample Revenue Transactions
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime + 100).slice(-3)}-001`,
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
        transaction_number: `TXN-${dateStr}-${String(currentTime + 100).slice(-3)}-002`,
        transaction_date: "2024-12-01",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 85000,
        description: "Revenue - Business Cards Printing",
        status: "APPROVED",
        party_id: existingParties?.[0]?.id || null,
        created_by: userId,
      },
      // Payment Receipt
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime + 100).slice(-3)}-003`,
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
        transaction_date: "2024-12-02",
        reference_type: "PAYMENT",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 0,
        credit_amount: 85000,
        description: "Payment received for business cards",
        status: "APPROVED",
        party_id: existingParties?.[0]?.id || null,
        created_by: userId,
      },
      // More Revenue
      {
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
        transaction_date: "2024-12-03",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 120000,
        description: "Revenue - Brochure Printing",
        status: "APPROVED",
        party_id: existingParties?.[1]?.id || null,
        created_by: userId,
      },
      // Expense Transactions
      {
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
        transaction_date: "2024-12-04",
        reference_type: "INVOICE",
        account_id: accountMap["2000"], // Accounts Payable
        debit_amount: 0,
        credit_amount: 45000,
        description: "Paper purchase for printing jobs",
        status: "APPROVED",
        party_id: existingParties?.[2]?.id || null,
        created_by: userId,
      },
      // Operating Expenses
      {
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
        transaction_date: "2024-12-01",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["1001"], // Bank Account
        debit_amount: 0,
        credit_amount: 125000,
        description: "December 2024 - Staff Salary Payment",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-05",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["6001"], // Electricity
        debit_amount: 15000,
        credit_amount: 0,
        description: "December 2024 - Electricity Bill",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-05",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["1001"], // Bank Account
        debit_amount: 0,
        credit_amount: 15000,
        description: "December 2024 - Electricity Payment",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      // More diverse transactions
      {
        transaction_date: "2024-12-06",
        reference_type: "JOB_SHEET",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 180000,
        credit_amount: 0,
        description: "Invoice #INV-003 - Magazine Printing",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-06",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 180000,
        description: "Revenue - Magazine Printing",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-08",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["6300"], // Marketing Expenses
        debit_amount: 25000,
        credit_amount: 0,
        description: "December 2024 - Digital Marketing Campaign",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-08",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["1000"], // Cash
        debit_amount: 0,
        credit_amount: 25000,
        description: "December 2024 - Marketing Campaign Payment",
        status: "APPROVED",
        party_id: null,
        created_by: userId,
      },
    ].filter((t) => t.account_id); // Only include transactions with valid account IDs

    // Insert financial transactions
    const { data: insertedTransactions, error: transactionsError } =
      await supabase
        .from("financial_transactions")
        .insert(demoTransactions)
        .select();

    if (transactionsError) {
      console.error("Error inserting transactions:", transactionsError);
      throw transactionsError;
    }

    console.log(
      `✅ Inserted ${insertedTransactions?.length || 0} demo transactions`
    );

    // Step 5: Update job sheets with UV and baking data
    const { data: existingJobSheets } = await supabase
      .from("job_sheets")
      .select("id")
      .limit(10);

    if (existingJobSheets && existingJobSheets.length > 0) {
      for (const jobSheet of existingJobSheets) {
        await supabase
          .from("job_sheets")
          .update({
            uv:
              Math.random() > 0.5
                ? Math.round(Math.random() * 15 * 100) / 100
                : 0,
            baking:
              Math.random() > 0.6
                ? Math.round(Math.random() * 10 * 100) / 100
                : 0,
          })
          .eq("id", jobSheet.id);
      }
      console.log(
        `✅ Updated ${existingJobSheets.length} job sheets with UV/baking data`
      );
    }

    const summary = {
      transactions_added: insertedTransactions?.length || 0,
      job_sheets_updated: existingJobSheets?.length || 0,
      accounts_available: accounts?.length || 0,
      existing_parties: existingParties?.length || 0,
    };

    return NextResponse.json({
      success: true,
      message: "🎉 Simple demo data added successfully!",
      summary,
      details: {
        revenue_transactions:
          insertedTransactions?.filter(
            (t) => t.reference_type === "JOB_SHEET" && t.credit_amount > 0
          ).length || 0,
        expense_transactions:
          insertedTransactions?.filter(
            (t) => t.reference_type === "ADJUSTMENT" && t.debit_amount > 0
          ).length || 0,
        payment_transactions:
          insertedTransactions?.filter((t) => t.reference_type === "PAYMENT")
            .length || 0,
      },
      next_steps: [
        "✅ Financial transactions added",
        "🔄 Refresh finance dashboard to see data",
        "📊 Check /api/finance/transactions for new records",
        "💰 View finance reports for updated numbers",
      ],
    });
  } catch (error: any) {
    console.error("❌ Simple demo data creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to add simple demo data",
        debug: {
          error_details: error,
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Simple Demo Data API",
    description:
      "POST to add financial transactions without modifying parties table",
    features: [
      "Revenue transactions (job sheets)",
      "Expense transactions (rent, salaries, utilities)",
      "Payment transactions",
      "Updates existing job sheets with UV/baking data",
    ],
  });
}
