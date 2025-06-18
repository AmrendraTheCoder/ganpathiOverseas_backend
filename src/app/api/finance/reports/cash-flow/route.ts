import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
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

    let query = supabase
      .from("cash_flow_reports")
      .select("*")
      .order("generated_at", { ascending: false });

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

    const { data: reports, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching cash flow reports:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count } = await supabase
      .from("cash_flow_reports")
      .select("*", { count: "exact", head: true });

    const { data: stats } = await supabase
      .from("cash_flow_reports")
      .select(
        "net_cash_from_operations, net_cash_from_investing, net_cash_from_financing, net_change_in_cash, status, period_type"
      );

    const summary = {
      total_reports: count || 0,
      avg_operating_cash:
        stats?.reduce((sum, r) => sum + (r.net_cash_from_operations || 0), 0) /
          (stats?.length || 1) || 0,
      avg_investing_cash:
        stats?.reduce((sum, r) => sum + (r.net_cash_from_investing || 0), 0) /
          (stats?.length || 1) || 0,
      avg_financing_cash:
        stats?.reduce((sum, r) => sum + (r.net_cash_from_financing || 0), 0) /
          (stats?.length || 1) || 0,
      avg_net_change:
        stats?.reduce((sum, r) => sum + (r.net_change_in_cash || 0), 0) /
          (stats?.length || 1) || 0,
      positive_cash_flow:
        stats?.filter((r) => (r.net_change_in_cash || 0) > 0).length || 0,
      negative_cash_flow:
        stats?.filter((r) => (r.net_change_in_cash || 0) < 0).length || 0,
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
    console.error("Error in GET /api/finance/reports/cash-flow:", error);
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
      const cashFlowData = await generateCashFlowFromTransactions(
        supabase,
        period_start,
        period_end
      );
      reportData = { ...reportData, ...cashFlowData };
    }

    const { data: report, error: reportError } = await supabase
      .from("cash_flow_reports")
      .insert([reportData])
      .select()
      .single();

    if (reportError) {
      console.error("Error creating cash flow report:", reportError);
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    if (line_items && line_items.length > 0) {
      const lineItemsData = line_items.map((item: any) => ({
        report_id: report.id,
        account_id: item.account_id,
        section: item.section,
        category: item.category,
        line_description: item.line_description,
        amount: item.amount,
        sort_order: item.sort_order || 0,
      }));

      const { error: lineItemsError } = await supabase
        .from("cash_flow_line_items")
        .insert(lineItemsData);

      if (lineItemsError) {
        console.error("Error creating line items:", lineItemsError);
      }
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/finance/reports/cash-flow:", error);
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
      .from("cash_flow_reports")
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
      console.error("Error updating cash flow report:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error in PUT /api/finance/reports/cash-flow:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateCashFlowFromTransactions(
  supabase: any,
  periodStart: string,
  periodEnd: string
) {
  try {
    // Get cash and cash equivalent transactions
    const { data: cashTransactions } = await supabase
      .from("financial_transactions")
      .select(
        `
        total_amount,
        transaction_type,
        transaction_entries(
          debit_amount,
          credit_amount,
          accounts(account_code, account_name, account_type, account_subtype)
        )
      `
      )
      .gte("transaction_date", periodStart)
      .lte("transaction_date", periodEnd)
      .eq("status", "APPROVED");

    let operatingCash = 0;
    let investingCash = 0;
    let financingCash = 0;

    // Get beginning cash balance
    const { data: beginningBalance } = await supabase
      .from("financial_transactions")
      .select(
        `
        transaction_entries(
          debit_amount,
          credit_amount,
          accounts!inner(account_code)
        )
      `
      )
      .lt("transaction_date", periodStart)
      .eq("transaction_entries.accounts.account_code", "1000") // Cash account
      .eq("status", "APPROVED");

    let beginningCash = 0;
    beginningBalance?.forEach((transaction: any) => {
      transaction.transaction_entries?.forEach((entry: any) => {
        beginningCash += (entry.debit_amount || 0) - (entry.credit_amount || 0);
      });
    });

    // Categorize cash flows
    cashTransactions?.forEach((transaction: any) => {
      transaction.transaction_entries?.forEach((entry: any) => {
        const cashAmount =
          entry.accounts?.account_code === "1000"
            ? (entry.debit_amount || 0) - (entry.credit_amount || 0)
            : 0;

        // Determine category based on transaction type and account
        if (
          transaction.transaction_type === "REVENUE" ||
          transaction.transaction_type === "EXPENSE"
        ) {
          operatingCash += cashAmount;
        } else if (
          transaction.transaction_type === "ASSET_PURCHASE" ||
          transaction.transaction_type === "ASSET_SALE"
        ) {
          investingCash += cashAmount;
        } else if (
          transaction.transaction_type === "LOAN" ||
          transaction.transaction_type === "EQUITY"
        ) {
          financingCash += cashAmount;
        } else {
          // Default to operating for unknown types
          operatingCash += cashAmount;
        }
      });
    });

    const netChangeInCash = operatingCash + investingCash + financingCash;
    const endingCash = beginningCash + netChangeInCash;

    return {
      net_cash_from_operations: operatingCash,
      net_cash_from_investing: investingCash,
      net_cash_from_financing: financingCash,
      net_change_in_cash: netChangeInCash,
      beginning_cash_balance: beginningCash,
      ending_cash_balance: endingCash,
    };
  } catch (error) {
    console.error("Error generating cash flow from transactions:", error);
    return {};
  }
}
