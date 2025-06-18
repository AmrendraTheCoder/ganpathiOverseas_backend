import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

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

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type") || "dashboard";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period") || "month"; // month, quarter, year

    // Set default date range if not provided
    let start =
      startDate ||
      new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split("T")[0];
    let end = endDate || new Date().toISOString().split("T")[0];

    switch (reportType) {
      case "profit-loss":
        return await generateProfitLossReport(supabase, start, end);

      case "balance-sheet":
        return await generateBalanceSheetReport(supabase, end);

      case "cash-flow":
        return await generateCashFlowReport(supabase, start, end);

      case "dashboard":
        return await generateDashboardReport(supabase, start, end);

      case "receivables":
        return await generateReceivablesReport(supabase);

      default:
        return NextResponse.json(
          { error: "Invalid report type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error in GET /api/finance/reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateDashboardReport(
  supabase: any,
  startDate: string,
  endDate: string
) {
  try {
    // Get revenue data
    const { data: revenue } = await supabase
      .from("invoices")
      .select("total_amount, invoice_date, status")
      .gte("invoice_date", startDate)
      .lte("invoice_date", endDate);

    // Get expense data
    const { data: expenses } = await supabase
      .from("expenses")
      .select("total_amount, expense_date, category, status")
      .gte("expense_date", startDate)
      .lte("expense_date", endDate);

    // Get outstanding invoices
    const { data: outstanding } = await supabase
      .from("invoices")
      .select("total_amount, paid_amount, due_date, status")
      .neq("status", "PAID");

    const totalRevenue =
      revenue?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;
    const totalExpenses =
      expenses?.reduce((sum, exp) => sum + exp.total_amount, 0) || 0;
    const netProfit = totalRevenue - totalExpenses;

    const totalOutstanding =
      outstanding?.reduce(
        (sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)),
        0
      ) || 0;

    const today = new Date().toISOString().split("T")[0];
    const overdueAmount =
      outstanding
        ?.filter((inv) => inv.due_date < today)
        .reduce(
          (sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)),
          0
        ) || 0;

    // Group expenses by category
    const expensesByCategory =
      expenses?.reduce((acc: any, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.total_amount;
        return acc;
      }, {}) || {};

    return NextResponse.json({
      reportType: "dashboard",
      period: { startDate, endDate },
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalOutstanding,
        overdueAmount,
        profitMargin:
          totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
      },
      charts: {
        expensesByCategory,
        monthlyTrend: generateMonthlyTrend(revenue, expenses),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating dashboard report:", error);
    return NextResponse.json(
      { error: "Failed to generate dashboard report" },
      { status: 500 }
    );
  }
}

async function generateProfitLossReport(
  supabase: any,
  startDate: string,
  endDate: string
) {
  try {
    // Get revenue data
    const { data: revenue } = await supabase
      .from("invoices")
      .select("total_amount, invoice_date")
      .gte("invoice_date", startDate)
      .lte("invoice_date", endDate)
      .eq("status", "PAID");

    // Get expenses by category
    const { data: expenses } = await supabase
      .from("expenses")
      .select("total_amount, category, subcategory, expense_date")
      .gte("expense_date", startDate)
      .lte("expense_date", endDate)
      .eq("status", "PAID");

    const totalRevenue =
      revenue?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

    // Group expenses by category
    const expensesByCategory =
      expenses?.reduce((acc: any, exp) => {
        if (!acc[exp.category]) {
          acc[exp.category] = { total: 0, subcategories: {} };
        }
        acc[exp.category].total += exp.total_amount;

        if (exp.subcategory) {
          acc[exp.category].subcategories[exp.subcategory] =
            (acc[exp.category].subcategories[exp.subcategory] || 0) +
            exp.total_amount;
        }
        return acc;
      }, {}) || {};

    const totalExpenses = Object.values(expensesByCategory).reduce(
      (sum: number, cat: any) => sum + cat.total,
      0
    );
    const grossProfit = totalRevenue;
    const netProfit = grossProfit - totalExpenses;

    return NextResponse.json({
      reportType: "profit-loss",
      period: { startDate, endDate },
      revenue: {
        totalRevenue,
        breakdown: {
          jobOrders: totalRevenue, // All revenue from job orders for now
        },
      },
      expenses: {
        totalExpenses,
        byCategory: expensesByCategory,
      },
      profit: {
        grossProfit,
        netProfit,
        profitMargin:
          totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating P&L report:", error);
    return NextResponse.json(
      { error: "Failed to generate P&L report" },
      { status: 500 }
    );
  }
}

async function generateBalanceSheetReport(supabase: any, asOfDate: string) {
  try {
    // Get accounts with balances
    const { data: accounts } = await supabase
      .from("accounts")
      .select(
        `
        *,
        transaction_entries(debit_amount, credit_amount)
      `
      )
      .eq("is_active", true);

    // Calculate account balances
    const accountBalances = accounts?.map((account: any) => {
      const totalDebits =
        account.transaction_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.debit_amount || 0),
          0
        ) || 0;
      const totalCredits =
        account.transaction_entries?.reduce(
          (sum: number, entry: any) => sum + (entry.credit_amount || 0),
          0
        ) || 0;

      // For assets and expenses, balance = debits - credits
      // For liabilities, equity, and revenue, balance = credits - debits
      let balance = 0;
      if (
        account.account_type === "ASSET" ||
        account.account_type === "EXPENSE"
      ) {
        balance = totalDebits - totalCredits;
      } else {
        balance = totalCredits - totalDebits;
      }

      return {
        ...account,
        balance,
      };
    });

    // Group by account type
    const assets =
      accountBalances?.filter((acc) => acc.account_type === "ASSET") || [];
    const liabilities =
      accountBalances?.filter((acc) => acc.account_type === "LIABILITY") || [];
    const equity =
      accountBalances?.filter((acc) => acc.account_type === "EQUITY") || [];

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce(
      (sum, acc) => sum + acc.balance,
      0
    );
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

    return NextResponse.json({
      reportType: "balance-sheet",
      asOfDate,
      assets: {
        accounts: assets,
        total: totalAssets,
      },
      liabilities: {
        accounts: liabilities,
        total: totalLiabilities,
      },
      equity: {
        accounts: equity,
        total: totalEquity,
      },
      totals: {
        totalAssets,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        balanced:
          Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating balance sheet:", error);
    return NextResponse.json(
      { error: "Failed to generate balance sheet" },
      { status: 500 }
    );
  }
}

async function generateCashFlowReport(
  supabase: any,
  startDate: string,
  endDate: string
) {
  try {
    // Get all financial transactions
    const { data: transactions } = await supabase
      .from("financial_transactions")
      .select("total_amount, reference_type, transaction_date, description")
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate)
      .eq("status", "APPROVED");

    // Get payments
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, payment_date, payment_method")
      .gte("payment_date", startDate)
      .lte("payment_date", endDate)
      .eq("status", "COMPLETED");

    const cashInflows = transactions?.filter((t) => t.total_amount > 0) || [];
    const cashOutflows = transactions?.filter((t) => t.total_amount < 0) || [];

    const totalInflows = cashInflows.reduce(
      (sum, t) => sum + t.total_amount,
      0
    );
    const totalOutflows = Math.abs(
      cashOutflows.reduce((sum, t) => sum + t.total_amount, 0)
    );
    const netCashFlow = totalInflows - totalOutflows;

    // Group by category
    const inflowsByType = cashInflows.reduce((acc: any, t) => {
      acc[t.reference_type] = (acc[t.reference_type] || 0) + t.total_amount;
      return acc;
    }, {});

    const outflowsByType = cashOutflows.reduce((acc: any, t) => {
      acc[t.reference_type] =
        (acc[t.reference_type] || 0) + Math.abs(t.total_amount);
      return acc;
    }, {});

    return NextResponse.json({
      reportType: "cash-flow",
      period: { startDate, endDate },
      inflows: {
        total: totalInflows,
        byType: inflowsByType,
        details: cashInflows,
      },
      outflows: {
        total: totalOutflows,
        byType: outflowsByType,
        details: cashOutflows.map((t) => ({
          ...t,
          total_amount: Math.abs(t.total_amount),
        })),
      },
      netCashFlow,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating cash flow report:", error);
    return NextResponse.json(
      { error: "Failed to generate cash flow report" },
      { status: 500 }
    );
  }
}

async function generateReceivablesReport(supabase: any) {
  try {
    const { data: invoices } = await supabase
      .from("invoices")
      .select(
        `
        *,
        parties!party_id(name, email, phone)
      `
      )
      .neq("status", "PAID")
      .order("due_date", { ascending: true });

    const today = new Date();
    const processedInvoices = invoices?.map((invoice: any) => {
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const balanceDue = invoice.total_amount - (invoice.paid_amount || 0);

      return {
        ...invoice,
        balance_due: balanceDue,
        days_overdue: daysOverdue > 0 ? daysOverdue : null,
        aging_bucket: getAgingBucket(daysOverdue),
      };
    });

    // Group by aging buckets
    const agingBuckets = {
      current: 0, // 0-30 days
      days_31_60: 0, // 31-60 days
      days_61_90: 0, // 61-90 days
      over_90: 0, // >90 days
    };

    processedInvoices?.forEach((inv: any) => {
      if (inv.days_overdue === null || inv.days_overdue <= 30) {
        agingBuckets.current += inv.balance_due;
      } else if (inv.days_overdue <= 60) {
        agingBuckets.days_31_60 += inv.balance_due;
      } else if (inv.days_overdue <= 90) {
        agingBuckets.days_61_90 += inv.balance_due;
      } else {
        agingBuckets.over_90 += inv.balance_due;
      }
    });

    const totalReceivables = Object.values(agingBuckets).reduce(
      (sum, amount) => sum + amount,
      0
    );

    return NextResponse.json({
      reportType: "receivables",
      summary: {
        totalReceivables,
        totalInvoices: processedInvoices?.length || 0,
        overdueInvoices:
          processedInvoices?.filter((inv: any) => inv.days_overdue > 0)
            .length || 0,
      },
      agingBuckets,
      invoices: processedInvoices || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error generating receivables report:", error);
    return NextResponse.json(
      { error: "Failed to generate receivables report" },
      { status: 500 }
    );
  }
}

function getAgingBucket(daysOverdue: number) {
  if (daysOverdue === null || daysOverdue <= 30) return "current";
  if (daysOverdue <= 60) return "31-60 days";
  if (daysOverdue <= 90) return "61-90 days";
  return "over 90 days";
}

function generateMonthlyTrend(revenue: any[], expenses: any[]) {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format

    const monthRevenue =
      revenue
        ?.filter((r) => r.invoice_date.startsWith(monthKey))
        .reduce((sum, r) => sum + r.total_amount, 0) || 0;

    const monthExpenses =
      expenses
        ?.filter((e) => e.expense_date.startsWith(monthKey))
        .reduce((sum, e) => sum + e.total_amount, 0) || 0;

    months.push({
      month: monthKey,
      revenue: monthRevenue,
      expenses: monthExpenses,
      profit: monthRevenue - monthExpenses,
    });
  }

  return months;
}
