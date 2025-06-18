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
    const as_of_date = searchParams.get("as_of_date");
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("balance_sheet_reports")
      .select(
        `
        *,
        users!generated_by(email, full_name),
        balance_sheet_line_items(
          id,
          account_id,
          section,
          line_description,
          amount,
          sort_order,
          chart_of_accounts(account_code, account_name, account_type)
        )
      `
      )
      .order("generated_at", { ascending: false });

    if (as_of_date) {
      query = query.eq("as_of_date", as_of_date);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: reports, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching balance sheet reports:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count } = await supabase
      .from("balance_sheet_reports")
      .select("*", { count: "exact", head: true });

    const { data: stats } = await supabase
      .from("balance_sheet_reports")
      .select(
        "total_assets, total_liabilities, total_equity, is_balanced, status"
      );

    const summary = {
      total_reports: count || 0,
      avg_total_assets:
        stats?.reduce((sum, r) => sum + (r.total_assets || 0), 0) /
          (stats?.length || 1) || 0,
      avg_total_liabilities:
        stats?.reduce((sum, r) => sum + (r.total_liabilities || 0), 0) /
          (stats?.length || 1) || 0,
      balanced_reports: stats?.filter((r) => r.is_balanced).length || 0,
      unbalanced_reports: stats?.filter((r) => !r.is_balanced).length || 0,
      draft_reports: stats?.filter((r) => r.status === "DRAFT").length || 0,
      finalized_reports:
        stats?.filter((r) => r.status === "FINALIZED").length || 0,
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
    console.error("Error in GET /api/finance/reports/balance-sheet:", error);
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
      as_of_date,
      line_items,
      generate_from_transactions = false,
    } = body;

    if (!report_name || !as_of_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let reportData = {
      report_name,
      as_of_date,
      generated_by: user.id,
      status: "DRAFT",
    };

    if (generate_from_transactions) {
      const balanceSheetData = await generateBalanceSheetFromTransactions(
        supabase,
        as_of_date
      );
      reportData = { ...reportData, ...balanceSheetData };
    }

    const { data: report, error: reportError } = await supabase
      .from("balance_sheet_reports")
      .insert([reportData])
      .select()
      .single();

    if (reportError) {
      console.error("Error creating balance sheet report:", reportError);
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    if (line_items && line_items.length > 0) {
      const lineItemsData = line_items.map((item: any) => ({
        report_id: report.id,
        account_id: item.account_id,
        section: item.section,
        line_description: item.line_description,
        amount: item.amount,
        sort_order: item.sort_order || 0,
      }));

      const { error: lineItemsError } = await supabase
        .from("balance_sheet_line_items")
        .insert(lineItemsData);

      if (lineItemsError) {
        console.error("Error creating line items:", lineItemsError);
      }
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/finance/reports/balance-sheet:", error);
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

    // Check if balance sheet is balanced
    const isBalanced =
      Math.abs(
        updateData.total_assets -
          (updateData.total_liabilities + updateData.total_equity)
      ) < 0.01;

    const { data: report, error } = await supabase
      .from("balance_sheet_reports")
      .update({
        ...updateData,
        is_balanced: isBalanced,
        status,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating balance sheet report:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error in PUT /api/finance/reports/balance-sheet:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateBalanceSheetFromTransactions(
  supabase: any,
  asOfDate: string
) {
  try {
    const { data: accountBalances } = await supabase
      .from("financial_transactions")
      .select(
        `
        transaction_entries(
          debit_amount,
          credit_amount,
          accounts(account_type, account_subtype)
        )
      `
      )
      .lte("transaction_date", asOfDate)
      .eq("status", "APPROVED");

    let totalCurrentAssets = 0;
    let totalFixedAssets = 0;
    let totalCurrentLiabilities = 0;
    let totalLongTermLiabilities = 0;
    let totalEquity = 0;

    accountBalances?.forEach((transaction: any) => {
      transaction.transaction_entries?.forEach((entry: any) => {
        const netAmount =
          (entry.debit_amount || 0) - (entry.credit_amount || 0);

        if (entry.accounts?.account_type === "ASSET") {
          if (entry.accounts?.account_subtype === "CURRENT_ASSETS") {
            totalCurrentAssets += netAmount;
          } else {
            totalFixedAssets += netAmount;
          }
        } else if (entry.accounts?.account_type === "LIABILITY") {
          if (entry.accounts?.account_subtype === "CURRENT_LIABILITIES") {
            totalCurrentLiabilities += Math.abs(netAmount);
          } else {
            totalLongTermLiabilities += Math.abs(netAmount);
          }
        } else if (entry.accounts?.account_type === "EQUITY") {
          totalEquity += Math.abs(netAmount);
        }
      });
    });

    const totalAssets = totalCurrentAssets + totalFixedAssets;
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
    const totalLiabilitiesEquity = totalLiabilities + totalEquity;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesEquity) < 0.01;

    return {
      total_current_assets: totalCurrentAssets,
      total_fixed_assets: totalFixedAssets,
      total_assets: totalAssets,
      total_current_liabilities: totalCurrentLiabilities,
      total_long_term_liabilities: totalLongTermLiabilities,
      total_liabilities: totalLiabilities,
      total_equity: totalEquity,
      total_liabilities_equity: totalLiabilitiesEquity,
      is_balanced: isBalanced,
    };
  } catch (error) {
    console.error("Error generating balance sheet from transactions:", error);
    return {};
  }
}
