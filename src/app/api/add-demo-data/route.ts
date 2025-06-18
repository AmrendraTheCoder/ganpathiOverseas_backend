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

    console.log("🎨 Adding comprehensive demo data...");

    // Step 1: Add demo parties (fixed - no party_type column)
    const demoParties = [
      {
        name: "Tech Solutions India",
        contact_person: "Rahul Sharma",
        email: "rahul@techsolutions.in",
        phone: "+91 98765 43210",
        credit_limit: 500000,
        address: "Tech Park, Bangalore",
      },
      {
        name: "Digital Print House",
        contact_person: "Meera Patel",
        email: "meera@digitalprint.com",
        phone: "+91 98765 43211",
        credit_limit: 300000,
        address: "MG Road, Mumbai",
      },
      {
        name: "Educational Publishers",
        contact_person: "Dr. Anil Kumar",
        email: "anil@edubooks.com",
        phone: "+91 98765 43212",
        credit_limit: 750000,
        address: "Knowledge City, Pune",
      },
      {
        name: "Paper Supply Co",
        contact_person: "Suresh Gupta",
        email: "suresh@papersupply.com",
        phone: "+91 98765 43213",
        credit_limit: 200000,
        address: "Industrial Area, Delhi",
      },
      {
        name: "Ink Solutions Ltd",
        contact_person: "Priya Singh",
        email: "priya@inksol.com",
        phone: "+91 98765 43214",
        credit_limit: 150000,
        address: "Chemical Complex, Chennai",
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

    // Step 2: Get account IDs for transactions
    const { data: accounts } = await supabase
      .from("chart_of_accounts")
      .select("id, account_code");

    const accountMap =
      accounts?.reduce((acc: any, account) => {
        acc[account.account_code] = account.id;
        return acc;
      }, {}) || {};

    // Step 3: Get user ID for transactions
    const { data: users } = await supabase.from("users").select("id").limit(1);

    const userId = users?.[0]?.id;

    if (!userId) {
      throw new Error("No users found - cannot create demo transactions");
    }

    // Step 4: Create demo financial transactions with unique numbers
    const currentTime = Date.now();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    const demoTransactions = [
      // Revenue transactions
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime).slice(-3)}-001`,
        transaction_date: "2024-12-01",
        reference_type: "JOB_SHEET",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 85000,
        credit_amount: 0,
        description:
          "Invoice - Business Cards & Letterheads - Tech Solutions India",
        status: "APPROVED",
        party_id: insertedParties?.find(
          (p) => p.email === "rahul@techsolutions.in"
        )?.id,
        created_by: userId,
      },
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime).slice(-3)}-002`,
        transaction_date: "2024-12-01",
        reference_type: "JOB_SHEET",
        account_id: accountMap["4000"], // Printing Revenue
        debit_amount: 0,
        credit_amount: 85000,
        description:
          "Revenue - Business Cards & Letterheads - Tech Solutions India",
        status: "APPROVED",
        party_id: insertedParties?.find(
          (p) => p.email === "rahul@techsolutions.in"
        )?.id,
        created_by: userId,
      },
      // Payment receipts
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime).slice(-3)}-003`,
        transaction_date: "2024-12-02",
        reference_type: "PAYMENT",
        account_id: accountMap["1001"], // Bank Account
        debit_amount: 85000,
        credit_amount: 0,
        description: "Payment received - Tech Solutions India",
        status: "APPROVED",
        party_id: insertedParties?.find(
          (p) => p.email === "rahul@techsolutions.in"
        )?.id,
        created_by: userId,
      },
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime).slice(-3)}-004`,
        transaction_date: "2024-12-02",
        reference_type: "PAYMENT",
        account_id: accountMap["1100"], // Accounts Receivable
        debit_amount: 0,
        credit_amount: 85000,
        description: "Payment received - Tech Solutions India",
        status: "APPROVED",
        party_id: insertedParties?.find(
          (p) => p.email === "rahul@techsolutions.in"
        )?.id,
        created_by: userId,
      },
      // Expense transactions
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime).slice(-3)}-005`,
        transaction_date: "2024-12-03",
        reference_type: "INVOICE",
        account_id: accountMap["5000"], // Paper Cost
        debit_amount: 45000,
        credit_amount: 0,
        description: "Paper purchase - Paper Supply Co",
        status: "APPROVED",
        party_id: insertedParties?.find(
          (p) => p.email === "suresh@papersupply.com"
        )?.id,
        created_by: userId,
      },
      {
        transaction_number: `TXN-${dateStr}-${String(currentTime).slice(-3)}-006`,
        transaction_date: "2024-12-03",
        reference_type: "INVOICE",
        account_id: accountMap["2000"], // Accounts Payable
        debit_amount: 0,
        credit_amount: 45000,
        description: "Paper purchase - Paper Supply Co",
        status: "APPROVED",
        party_id: insertedParties?.find(
          (p) => p.email === "suresh@papersupply.com"
        )?.id,
        created_by: userId,
      },
    ];

    // Insert transactions
    const { data: insertedTransactions, error: transactionsError } =
      await supabase
        .from("financial_transactions")
        .upsert(demoTransactions, { onConflict: "transaction_number" })
        .select();

    if (transactionsError) {
      console.error("Error inserting transactions:", transactionsError);
      throw transactionsError;
    }

    console.log(
      `✅ Inserted ${insertedTransactions?.length || 0} demo transactions`
    );

    // Step 5: Add sample job sheets
    const demoJobSheets = [
      {
        customer_name: "Tech Solutions India",
        job_description: "Business Cards with UV Coating",
        paper_type: "Art Card 300 GSM",
        quantity: 1000,
        rate: 2.5,
        amount: 2500.0,
        uv: 500.0,
        baking: 150.0,
        status: "completed",
        party_id: insertedParties?.find(
          (p) => p.email === "rahul@techsolutions.in"
        )?.id,
      },
      {
        customer_name: "Digital Print House",
        job_description: "Brochure Printing",
        paper_type: "Matt Paper 150 GSM",
        quantity: 5000,
        rate: 1.8,
        amount: 9000.0,
        uv: 800.0,
        baking: 200.0,
        status: "in_progress",
        party_id: insertedParties?.find(
          (p) => p.email === "meera@digitalprint.com"
        )?.id,
      },
    ];

    const { data: insertedJobSheets, error: jobSheetsError } = await supabase
      .from("job_sheets")
      .upsert(demoJobSheets, { onConflict: "id" })
      .select();

    if (jobSheetsError) {
      console.error("Error inserting job sheets:", jobSheetsError);
      throw jobSheetsError;
    }

    console.log(
      `✅ Inserted ${insertedJobSheets?.length || 0} demo job sheets`
    );

    return NextResponse.json({
      success: true,
      message: "Demo data added successfully!",
      data: {
        parties: insertedParties?.length || 0,
        transactions: insertedTransactions?.length || 0,
        jobSheets: insertedJobSheets?.length || 0,
      },
    });
  } catch (error: any) {
    console.error("❌ Demo data creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create demo data",
        details: error,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Add Demo Data API",
    description:
      "Adds comprehensive demo data including parties, transactions, and job sheets",
    endpoints: {
      POST: "Add demo data",
    },
    note: "Uses actual parties table structure without party_type column and unique transaction numbers",
  });
}
