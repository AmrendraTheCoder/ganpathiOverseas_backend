import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const partyId = searchParams.get("partyId");

    const offset = (page - 1) * limit;

    console.log("🔍 Fetching financial transactions with params:", {
      page,
      limit,
      startDate,
      endDate,
      status,
      partyId,
    });

    // Build query
    let query = supabase
      .from("financial_transactions")
      .select(
        `
        *,
        parties:party_id (
          id,
          name,
          contact_person,
          email,
          phone
        ),
        chart_of_accounts:account_id (
          id,
          account_code,
          account_name,
          account_type
        ),
        users:created_by (
          id,
          email
        )
      `
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    // Apply filters
    if (startDate) {
      query = query.gte("transaction_date", startDate);
    }
    if (endDate) {
      query = query.lte("transaction_date", endDate);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (partyId) {
      query = query.eq("party_id", partyId);
    }

    // Get paginated results
    const {
      data: transactions,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("❌ Error fetching transactions:", error);

      // Check if table doesn't exist
      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        return NextResponse.json({
          success: false,
          error: "TABLES_MISSING",
          message: "Financial tables not found. Database setup required.",
          transactions: [],
          total: 0,
          page,
          totalPages: 0,
          hasMore: false,
          setup_required: true,
          setup_url: "/database-setup",
        });
      }

      // Check for foreign key relationship issues
      if (error.code === "PGRST200" || error.message.includes("relationship")) {
        return NextResponse.json({
          success: false,
          error: "RELATIONSHIP_ERROR",
          message:
            "Database relationships not properly configured. Please run database setup.",
          transactions: [],
          total: 0,
          page,
          totalPages: 0,
          hasMore: false,
          setup_required: true,
          setup_url: "/database-setup",
          technical_details: error,
        });
      }

      throw error;
    }

    // Calculate summary statistics
    const { data: summaryData } = await supabase
      .from("financial_transactions")
      .select("debit_amount, credit_amount, status")
      .gte("transaction_date", startDate || "1900-01-01")
      .lte("transaction_date", endDate || "2100-12-31");

    const summary = {
      total_debits:
        summaryData?.reduce((sum, t) => sum + (t.debit_amount || 0), 0) || 0,
      total_credits:
        summaryData?.reduce((sum, t) => sum + (t.credit_amount || 0), 0) || 0,
      total_transactions: summaryData?.length || 0,
      pending_transactions:
        summaryData?.filter((t) => t.status === "PENDING").length || 0,
      approved_transactions:
        summaryData?.filter((t) => t.status === "APPROVED").length || 0,
    };

    const totalPages = Math.ceil((count || 0) / limit);

    console.log(
      `✅ Retrieved ${transactions?.length || 0} transactions (page ${page}/${totalPages})`
    );

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      total: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages,
      summary,
      filters: {
        startDate,
        endDate,
        status,
        partyId,
      },
    });
  } catch (error: any) {
    console.error("❌ Finance transactions API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to fetch financial transactions",
        transactions: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false,
        setup_required: true,
        setup_url: "/database-setup",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    const body = await request.json();
    console.log("💰 Creating new financial transaction:", body);

    // Validate required fields
    const {
      transaction_date,
      reference_type,
      account_id,
      debit_amount = 0,
      credit_amount = 0,
      description,
      party_id,
      job_sheet_id,
      status = "PENDING",
    } = body;

    if (!transaction_date || !reference_type || !account_id || !description) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message:
            "Missing required fields: transaction_date, reference_type, account_id, description",
        },
        { status: 400 }
      );
    }

    // Validate double-entry constraint
    if (
      (debit_amount > 0 && credit_amount > 0) ||
      (debit_amount === 0 && credit_amount === 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "VALIDATION_ERROR",
          message:
            "Transaction must have either debit_amount OR credit_amount (not both or neither)",
        },
        { status: 400 }
      );
    }

    // Get current user (you may need to implement user authentication)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const transactionData = {
      transaction_date,
      reference_type,
      account_id,
      debit_amount: parseFloat(debit_amount) || 0,
      credit_amount: parseFloat(credit_amount) || 0,
      description,
      status,
      party_id: party_id || null,
      job_sheet_id: job_sheet_id || null,
      created_by: user?.id || null,
      // transaction_number will be auto-generated by trigger
    };

    const { data: newTransaction, error } = await supabase
      .from("financial_transactions")
      .insert([transactionData])
      .select(
        `
        *,
        parties:party_id (
          id,
          name,
          contact_person
        ),
        chart_of_accounts:account_id (
          id,
          account_code,
          account_name,
          account_type
        )
      `
      )
      .single();

    if (error) {
      console.error("❌ Error creating transaction:", error);

      if (
        error.message.includes("relation") &&
        error.message.includes("does not exist")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "TABLES_MISSING",
            message: "Financial tables not found. Database setup required.",
            setup_required: true,
            setup_url: "/database-setup",
          },
          { status: 500 }
        );
      }

      throw error;
    }

    console.log(
      "✅ Created financial transaction:",
      newTransaction.transaction_number
    );

    return NextResponse.json({
      success: true,
      message: "Financial transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error: any) {
    console.error("❌ Create transaction error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to create financial transaction",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, notes, approved_by } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === "APPROVED") {
        updateData.approved_by = user.id;
        updateData.approved_at = new Date().toISOString();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data: transaction, error } = await supabase
      .from("financial_transactions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating transaction:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error in PUT /api/finance/transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
