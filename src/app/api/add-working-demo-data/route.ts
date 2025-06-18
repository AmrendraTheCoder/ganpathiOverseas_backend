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

    console.log("🎨 Adding working demo data with correct schema...");

    // Step 1: Add demo parties (using actual schema - no balance column)
    const demoParties = [
      {
        name: "Tech Solutions India",
        phone: "+91 98765 43210",
        email: "rahul@techsolutions.in",
        address: "123 Business District, Mumbai",
      },
      {
        name: "Digital Print House",
        phone: "+91 98765 43211",
        email: "meera@digitalprint.com",
        address: "456 Industrial Area, Delhi",
      },
      {
        name: "Educational Publishers",
        phone: "+91 98765 43212",
        email: "anil@edubooks.com",
        address: "789 Print Street, Bangalore",
      },
      {
        name: "Paper Supply Co",
        phone: "+91 98765 43213",
        email: "suresh@papersupply.com",
        address: "321 Book Market, Chennai",
      },
      {
        name: "Creative Designs Studio",
        phone: "+91 98765 43215",
        email: "arjun@creativedesigns.in",
        address: "654 Creative Lane, Pune",
      },
    ];

    // Insert parties
    const { data: insertedParties, error: partiesError } = await supabase
      .from("parties")
      .upsert(demoParties, { onConflict: "email" })
      .select();

    if (partiesError) {
      console.error("Error inserting parties:", partiesError);
      throw partiesError;
    }

    console.log(`✅ Inserted ${insertedParties?.length || 0} demo parties`);

    // Step 2: Get chart of accounts
    const { data: accounts } = await supabase
      .from("chart_of_accounts")
      .select("id, account_code");

    const accountMap =
      accounts?.reduce((acc: any, account) => {
        acc[account.account_code] = account.id;
        return acc;
      }, {}) || {};

    // Step 3: Get user ID
    const { data: users } = await supabase.from("users").select("id").limit(1);

    const userId = users?.[0]?.id;

    if (!userId) {
      throw new Error("No users found - cannot create demo transactions");
    }

    // Step 4: Create demo financial transactions
    const techSolutionsParty = insertedParties?.find(
      (p) => p.email === "rahul@techsolutions.in"
    );
    const digitalPrintParty = insertedParties?.find(
      (p) => p.email === "meera@digitalprint.com"
    );
    const paperSupplyParty = insertedParties?.find(
      (p) => p.email === "suresh@papersupply.com"
    );

    const demoTransactions = [
      // Revenue transactions - Tech Solutions
      {
        transaction_date: "2024-12-01",
        reference_type: "JOB_SHEET",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 85000,
        credit_amount: 0,
        description: "Invoice #INV-001 - Business Cards - Tech Solutions India",
        status: "APPROVED",
        party_id: techSolutionsParty?.id,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-01",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 85000,
        description: "Revenue - Business Cards - Tech Solutions India",
        status: "APPROVED",
        party_id: techSolutionsParty?.id,
        created_by: userId,
      },
      // Payment receipt
      {
        transaction_date: "2024-12-02",
        reference_type: "PAYMENT",
        account_id: accountMap["1001"], // Bank Account
        debit_amount: 85000,
        credit_amount: 0,
        description: "Payment received - Tech Solutions India",
        status: "APPROVED",
        party_id: techSolutionsParty?.id,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-02",
        reference_type: "PAYMENT",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 0,
        credit_amount: 85000,
        description: "Payment received - Tech Solutions India",
        status: "APPROVED",
        party_id: techSolutionsParty?.id,
        created_by: userId,
      },
      // Revenue transactions - Digital Print House
      {
        transaction_date: "2024-12-03",
        reference_type: "JOB_SHEET",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 120000,
        credit_amount: 0,
        description: "Invoice #INV-002 - Brochures - Digital Print House",
        status: "APPROVED",
        party_id: digitalPrintParty?.id,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-03",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 120000,
        description: "Revenue - Brochures - Digital Print House",
        status: "APPROVED",
        party_id: digitalPrintParty?.id,
        created_by: userId,
      },
      // Expense transactions
      {
        transaction_date: "2024-12-04",
        reference_type: "INVOICE",
        account_id: accountMap["5000"], // Paper Cost
        debit_amount: 45000,
        credit_amount: 0,
        description: "Paper purchase - Paper Supply Co",
        status: "APPROVED",
        party_id: paperSupplyParty?.id,
        created_by: userId,
      },
      {
        transaction_date: "2024-12-04",
        reference_type: "INVOICE",
        account_id: accountMap["2000"], // Accounts Payable
        debit_amount: 0,
        credit_amount: 45000,
        description: "Paper purchase - Paper Supply Co",
        status: "APPROVED",
        party_id: paperSupplyParty?.id,
        created_by: userId,
      },
      // Operating expenses
      {
        transaction_date: "2024-12-01",
        reference_type: "ADJUSTMENT",
        account_id: accountMap["6000"], // Office Rent
        debit_amount: 50000,
        credit_amount: 0,
        description: "December office rent",
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
        description: "December office rent payment",
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
        description: "December staff salaries",
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
        description: "December staff salary payment",
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

    // Step 5: Add demo job sheets
    const demoJobSheets = [
      {
        customer_name: "Tech Solutions India",
        email: "rahul@techsolutions.in",
        phone: "+91 98765 43210",
        paper_type: "Art Paper 300gsm",
        paper_size: "A4",
        quantity: 5000,
        colors: 4,
        uv: 8.5,
        baking: 0.0,
        lamination: "Matt",
        binding: "Perfect Binding",
        total_amount: 85000,
        status: "completed",
        delivery_date: "2024-12-02",
      },
      {
        customer_name: "Digital Print House",
        email: "meera@digitalprint.com",
        phone: "+91 98765 43211",
        paper_type: "Coated Paper 250gsm",
        paper_size: "A5",
        quantity: 10000,
        colors: 4,
        uv: 12.75,
        baking: 6.25,
        lamination: "Gloss",
        binding: "Saddle Stitch",
        total_amount: 120000,
        status: "completed",
        delivery_date: "2024-12-06",
      },
      {
        customer_name: "Educational Publishers",
        email: "anil@edubooks.com",
        phone: "+91 98765 43212",
        paper_type: "Book Paper 80gsm",
        paper_size: "A4",
        quantity: 25000,
        colors: 2,
        uv: 0.0,
        baking: 0.0,
        lamination: "None",
        binding: "Perfect Binding",
        total_amount: 250000,
        status: "in_progress",
        delivery_date: "2024-12-15",
      },
    ];

    // Insert job sheets
    const { data: insertedJobSheets, error: jobSheetsError } = await supabase
      .from("job_sheets")
      .insert(demoJobSheets)
      .select();

    if (jobSheetsError) {
      console.error("Error inserting job sheets:", jobSheetsError);
      // Don't throw - job sheets might have unique constraints
    }

    console.log(
      `✅ Inserted ${insertedJobSheets?.length || 0} demo job sheets`
    );

    const summary = {
      parties_added: insertedParties?.length || 0,
      transactions_added: insertedTransactions?.length || 0,
      job_sheets_added: insertedJobSheets?.length || 0,
      accounts_available: accounts?.length || 0,
    };

    return NextResponse.json({
      success: true,
      message: "🎉 Working demo data added successfully!",
      summary,
      next_steps: [
        "✅ Demo data loaded with correct schema",
        "🔄 Refresh finance dashboard to see transaction data",
        "📊 Check finance transactions page for new records",
        "👥 View parties page for customer data",
      ],
    });
  } catch (error: any) {
    console.error("❌ Demo data creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to add working demo data",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Working Demo Data API",
    description: "POST to add demo data using correct schema",
    note: "Uses actual parties table structure without party_type column",
  });
}
