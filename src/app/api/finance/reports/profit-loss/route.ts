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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const period_type = searchParams.get("period_type");
    const start_date = searchParams.get("start_date");
    const end_date = searchParams.get("end_date");
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    // Build query for profit & loss reports
    let query = supabase
      .from("profit_loss_reports")
      .select("*")
      .order("generated_at", { ascending: false });

    // Apply filters
    if (period_type) {
      query = query.eq("period_type", period_type);
    }

    if (start_date) {
      query = query.gte("period_start", start_date);
    }

    if (end_date) {
      query = query.lte("period_end", end_date);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Get paginated results
    const { data: reports, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching P&L reports:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count
    const { count } = await supabase
      .from("profit_loss_reports")
      .select("*", { count: "exact", head: true });

    // Get summary statistics
    const { data: stats } = await supabase
      .from("profit_loss_reports")
      .select("total_revenue, net_income, status, period_type");

    const summary = {
      total_reports: count || 0,
      avg_revenue:
        stats?.reduce((sum, r) => sum + (r.total_revenue || 0), 0) /
          (stats?.length || 1) || 0,
      avg_net_income:
        stats?.reduce((sum, r) => sum + (r.net_income || 0), 0) /
          (stats?.length || 1) || 0,
      draft_reports: stats?.filter((r) => r.status === "DRAFT").length || 0,
      finalized_reports:
        stats?.filter((r) => r.status === "FINALIZED").length || 0,
      by_period: {
        monthly: stats?.filter((r) => r.period_type === "MONTHLY").length || 0,
        quarterly:
          stats?.filter((r) => r.period_type === "QUARTERLY").length || 0,
        yearly: stats?.filter((r) => r.period_type === "YEARLY").length || 0,
      },
    };

    return NextResponse.json({
      reports: reports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Error in GET /api/finance/reports/profit-loss:", error);
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

    // Check user permissions
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
      report_name,
      period_start,
      period_end,
      period_type,
      line_items,
      generate_from_transactions = false,
    } = body;

    // Validate required fields
    if (!report_name || !period_start || !period_end || !period_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let reportData = {
      report_name,
      period_start,
      period_end,
      period_type,
      generated_by: user.id,
      status: "DRAFT",
    };

    if (generate_from_transactions) {
      // Generate P&L from actual transaction data
      const plData = await generatePLFromTransactions(
        supabase,
        period_start,
        period_end
      );
      reportData = { ...reportData, ...plData };
    }

    // Create the report
    const { data: report, error: reportError } = await supabase
      .from("profit_loss_reports")
      .insert([reportData])
      .select()
      .single();

    if (reportError) {
      console.error("Error creating P&L report:", reportError);
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    // Create line items if provided
    if (line_items && line_items.length > 0) {
      const lineItemsData = line_items.map((item: any) => ({
        report_id: report.id,
        account_id: item.account_id,
        category: item.category,
        line_description: item.line_description,
        amount: item.amount,
        percentage_of_revenue: item.percentage_of_revenue,
        sort_order: item.sort_order || 0,
      }));

      const { error: lineItemsError } = await supabase
        .from("profit_loss_line_items")
        .insert(lineItemsData);

      if (lineItemsError) {
        console.error("Error creating line items:", lineItemsError);
        // Don't fail the entire operation, just log the error
      }
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/finance/reports/profit-loss:", error);
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
    const { id, status, notes, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const { data: report, error } = await supabase
      .from("profit_loss_reports")
      .update({
        ...updateData,
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating P&L report:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error in PUT /api/finance/reports/profit-loss:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate P&L from transaction data
async function generatePLFromTransactions(
  supabase: any,
  periodStart: string,
  periodEnd: string
) {
  try {
    // Get revenue data
    const { data: revenueData } = await supabase
      .from("financial_transactions")
      .select(
        `
        total_amount,
        transaction_entries(
          debit_amount,
          credit_amount,
          accounts(account_type)
        )
      `
      )
      .gte("transaction_date", periodStart)
      .lte("transaction_date", periodEnd)
      .eq("status", "APPROVED");

    // Calculate totals from transaction data
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalCOGS = 0;

    revenueData?.forEach((transaction: any) => {
      transaction.transaction_entries?.forEach((entry: any) => {
        if (entry.accounts?.account_type === "REVENUE") {
          totalRevenue += entry.credit_amount || 0;
        } else if (entry.accounts?.account_type === "EXPENSE") {
          totalExpenses += entry.debit_amount || 0;
        } else if (entry.accounts?.account_type === "COST_OF_GOODS_SOLD") {
          totalCOGS += entry.debit_amount || 0;
        }
      });
    });

    const grossProfit = totalRevenue - totalCOGS;
    const operatingIncome = grossProfit - totalExpenses;
    const netIncome = operatingIncome; // Simplified for now

    return {
      total_revenue: totalRevenue,
      total_cogs: totalCOGS,
      gross_profit: grossProfit,
      total_operating_expenses: totalExpenses,
      operating_income: operatingIncome,
      net_income: netIncome,
    };
  } catch (error) {
    console.error("Error generating P&L from transactions:", error);
    return {};
  }
}
