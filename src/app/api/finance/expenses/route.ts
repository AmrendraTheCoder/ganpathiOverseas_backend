import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const vendorId = searchParams.get("vendorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("expenses")
      .select(
        `
        *,
        parties!vendor_id(name, email, phone),
        users!created_by(email, full_name),
        users!approved_by(email, full_name)
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (vendorId) {
      query = query.eq("vendor_id", vendorId);
    }

    if (startDate) {
      query = query.gte("expense_date", startDate);
    }

    if (endDate) {
      query = query.lte("expense_date", endDate);
    }

    // Get paginated results
    const { data: expenses, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching expenses:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count for pagination
    const { count } = await supabase
      .from("expenses")
      .select("*", { count: "exact", head: true });

    // Get summary statistics
    const { data: stats } = await supabase
      .from("expenses")
      .select("total_amount, status, category");

    const summary = {
      totalExpenses: count || 0,
      totalAmount: stats?.reduce((sum, exp) => sum + exp.total_amount, 0) || 0,
      pending: stats?.filter((exp) => exp.status === "PENDING").length || 0,
      approved: stats?.filter((exp) => exp.status === "APPROVED").length || 0,
      paid: stats?.filter((exp) => exp.status === "PAID").length || 0,
      rejected: stats?.filter((exp) => exp.status === "REJECTED").length || 0,
      byCategory:
        stats?.reduce((acc: any, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.total_amount;
          return acc;
        }, {}) || {},
    };

    return NextResponse.json({
      expenses: expenses || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Error in GET /api/finance/expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user has finance role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "finance"].includes(userData.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      category,
      subcategory,
      vendor_name,
      vendor_id,
      expense_date,
      amount,
      tax_amount = 0,
      payment_method = "CASH",
      receipt_number,
      description,
    } = body;

    // Validate required fields
    if (!category || !description || !amount) {
      return NextResponse.json(
        { error: "Category, description, and amount are required" },
        { status: 400 }
      );
    }

    const total_amount = amount + tax_amount;

    // Generate expense number
    const { data: lastExpense } = await supabase
      .from("expenses")
      .select("expense_number")
      .order("created_at", { ascending: false })
      .limit(1);

    let expenseNumber = "EXP-2024-001";
    if (lastExpense && lastExpense.length > 0) {
      const lastNumber = parseInt(lastExpense[0].expense_number.split("-")[2]);
      expenseNumber = `EXP-2024-${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Create expense
    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        expense_number: expenseNumber,
        category,
        subcategory,
        vendor_name,
        vendor_id,
        expense_date: expense_date || new Date().toISOString().split("T")[0],
        amount,
        tax_amount,
        total_amount,
        payment_method,
        receipt_number,
        description,
        created_by: user.id,
        status: "PENDING",
      })
      .select()
      .single();

    if (expenseError) {
      console.error("Error creating expense:", expenseError);
      return NextResponse.json(
        { error: expenseError.message },
        { status: 500 }
      );
    }

    // Create corresponding financial transaction
    const { error: transactionError } = await supabase
      .from("financial_transactions")
      .insert({
        transaction_number: `TXN-${expenseNumber}`,
        reference_type: "EXPENSE",
        reference_id: expense.id,
        party_id: vendor_id,
        description: `Expense: ${description}`,
        total_amount: -total_amount, // Negative for expense
        created_by: user.id,
        status: "PENDING",
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
    }

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/finance/expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Expense ID is required" },
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

    const { data: expense, error } = await supabase
      .from("expenses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating expense:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update corresponding financial transaction status
    if (status) {
      await supabase
        .from("financial_transactions")
        .update({ status })
        .eq("reference_id", id)
        .eq("reference_type", "EXPENSE");
    }

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("Error in PUT /api/finance/expenses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
