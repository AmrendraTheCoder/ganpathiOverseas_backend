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
    const report_type = searchParams.get("report_type");
    const tax_year = searchParams.get("tax_year");
    const filing_status = searchParams.get("filing_status");
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("tax_reports")
      .select(
        `
        *,
        users!generated_by(email, full_name),
        tax_report_line_items(
          id,
          account_id,
          tax_category,
          line_description,
          taxable_amount,
          tax_rate,
          tax_amount,
          sort_order,
          chart_of_accounts(account_code, account_name, account_type)
        )
      `
      )
      .order("generated_at", { ascending: false });

    if (report_type) {
      query = query.eq("report_type", report_type);
    }

    if (tax_year) {
      query = query.eq("tax_year", parseInt(tax_year));
    }

    if (filing_status) {
      query = query.eq("filing_status", filing_status);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: reports, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching tax reports:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count } = await supabase
      .from("tax_reports")
      .select("*", { count: "exact", head: true });

    const { data: stats } = await supabase
      .from("tax_reports")
      .select(
        "report_type, gst_net_payable, income_tax_liability, filing_status, status, tax_year"
      );

    const summary = {
      total_reports: count || 0,
      pending_filings:
        stats?.filter((r) => r.filing_status === "PENDING").length || 0,
      filed_reports:
        stats?.filter((r) => r.filing_status === "FILED").length || 0,
      total_gst_payable:
        stats?.reduce((sum, r) => sum + (r.gst_net_payable || 0), 0) || 0,
      total_income_tax:
        stats?.reduce((sum, r) => sum + (r.income_tax_liability || 0), 0) || 0,
      by_type: {
        gst: stats?.filter((r) => r.report_type === "GST").length || 0,
        income_tax:
          stats?.filter((r) => r.report_type === "INCOME_TAX").length || 0,
        tds: stats?.filter((r) => r.report_type === "TDS").length || 0,
      },
      by_year:
        stats?.reduce((acc: any, r) => {
          acc[r.tax_year] = (acc[r.tax_year] || 0) + 1;
          return acc;
        }, {}) || {},
      overdue_reports:
        stats?.filter(
          (r) =>
            r.filing_status === "PENDING" &&
            r.filing_due_date &&
            new Date(r.filing_due_date) < new Date()
        ).length || 0,
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
    console.error("Error in GET /api/finance/reports/tax:", error);
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
      report_type,
      tax_period_start,
      tax_period_end,
      tax_year,
      filing_due_date,
      line_items,
      generate_from_transactions = false,
    } = body;

    if (
      !report_name ||
      !report_type ||
      !tax_period_start ||
      !tax_period_end ||
      !tax_year
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let reportData = {
      report_name,
      report_type,
      tax_period_start,
      tax_period_end,
      tax_year,
      filing_due_date,
      generated_by: user.id,
      status: "DRAFT",
      filing_status: "PENDING",
    };

    if (generate_from_transactions) {
      const taxData = await generateTaxFromTransactions(
        supabase,
        report_type,
        tax_period_start,
        tax_period_end
      );
      reportData = { ...reportData, ...taxData };
    }

    const { data: report, error: reportError } = await supabase
      .from("tax_reports")
      .insert([reportData])
      .select()
      .single();

    if (reportError) {
      console.error("Error creating tax report:", reportError);
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    if (line_items && line_items.length > 0) {
      const lineItemsData = line_items.map((item: any) => ({
        report_id: report.id,
        account_id: item.account_id,
        tax_category: item.tax_category,
        line_description: item.line_description,
        taxable_amount: item.taxable_amount,
        tax_rate: item.tax_rate,
        tax_amount: item.tax_amount,
        sort_order: item.sort_order || 0,
      }));

      const { error: lineItemsError } = await supabase
        .from("tax_report_line_items")
        .insert(lineItemsData);

      if (lineItemsError) {
        console.error("Error creating line items:", lineItemsError);
      }
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/finance/reports/tax:", error);
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
    const { id, status, filing_status, filed_date, notes, ...updateData } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const { data: report, error } = await supabase
      .from("tax_reports")
      .update({
        ...updateData,
        status,
        filing_status,
        filed_date:
          filing_status === "FILED"
            ? filed_date || new Date().toISOString()
            : filed_date,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating tax report:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error in PUT /api/finance/reports/tax:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateTaxFromTransactions(
  supabase: any,
  reportType: string,
  periodStart: string,
  periodEnd: string
) {
  try {
    const { data: transactions } = await supabase
      .from("financial_transactions")
      .select(
        `
        total_amount,
        gst_amount,
        tds_amount,
        transaction_entries(
          debit_amount,
          credit_amount,
          accounts(account_type, account_code)
        )
      `
      )
      .gte("transaction_date", periodStart)
      .lte("transaction_date", periodEnd)
      .eq("status", "APPROVED");

    let taxData: any = {};

    if (reportType === "GST") {
      let gstTaxableSales = 0;
      let gstOutputTax = 0;
      let gstInputTax = 0;

      transactions?.forEach((transaction: any) => {
        // Calculate GST on sales (output tax)
        if (transaction.gst_amount > 0) {
          gstTaxableSales += transaction.total_amount - transaction.gst_amount;
          gstOutputTax += transaction.gst_amount;
        }
        // Calculate GST on purchases (input tax) - this would need more logic
      });

      taxData = {
        gst_taxable_sales: gstTaxableSales,
        gst_output_tax: gstOutputTax,
        gst_input_tax: gstInputTax,
        gst_net_payable: gstOutputTax - gstInputTax,
      };
    } else if (reportType === "INCOME_TAX") {
      let grossIncome = 0;
      let totalDeductions = 0;

      transactions?.forEach((transaction: any) => {
        transaction.transaction_entries?.forEach((entry: any) => {
          if (entry.accounts?.account_type === "REVENUE") {
            grossIncome += entry.credit_amount || 0;
          } else if (entry.accounts?.account_type === "EXPENSE") {
            totalDeductions += entry.debit_amount || 0;
          }
        });
      });

      const taxableIncome = grossIncome - totalDeductions;
      const incomeTaxLiability = calculateIncomeTax(taxableIncome);

      taxData = {
        gross_income: grossIncome,
        total_deductions: totalDeductions,
        taxable_income: taxableIncome,
        income_tax_liability: incomeTaxLiability,
      };
    } else if (reportType === "TDS") {
      const totalTdsDeducted =
        transactions?.reduce(
          (sum: number, t: any) => sum + (t.tds_amount || 0),
          0
        ) || 0;

      taxData = {
        tds_deducted: totalTdsDeducted,
      };
    }

    return taxData;
  } catch (error) {
    console.error("Error generating tax data from transactions:", error);
    return {};
  }
}

// Simplified income tax calculation (this would need proper tax slabs and rates)
function calculateIncomeTax(taxableIncome: number): number {
  // This is a simplified calculation - in reality, you'd need proper tax slabs
  if (taxableIncome <= 250000) return 0;
  if (taxableIncome <= 500000) return (taxableIncome - 250000) * 0.05;
  if (taxableIncome <= 1000000) return 12500 + (taxableIncome - 500000) * 0.2;
  return 112500 + (taxableIncome - 1000000) * 0.3;
}
