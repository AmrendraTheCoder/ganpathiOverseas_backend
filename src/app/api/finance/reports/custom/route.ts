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
    const status = searchParams.get("status");
    const is_public = searchParams.get("is_public");
    const created_by = searchParams.get("created_by");

    const offset = (page - 1) * limit;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase
      .from("custom_reports")
      .select(
        `
        *,
        users!created_by(email, full_name),
        custom_report_results(
          id,
          generated_at,
          row_count,
          execution_time_ms
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (report_type) {
      query = query.eq("report_type", report_type);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (is_public !== null) {
      query = query.eq("is_public", is_public === "true");
    }

    if (created_by) {
      query = query.eq("created_by", created_by);
    } else {
      // Users can only see their own reports or public reports (unless admin/finance)
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!userData || !["admin", "finance"].includes(userData.role)) {
        query = query.or(`created_by.eq.${user.id},is_public.eq.true`);
      }
    }

    const { data: reports, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching custom reports:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { count } = await supabase
      .from("custom_reports")
      .select("*", { count: "exact", head: true })
      .or(`created_by.eq.${user.id},is_public.eq.true`);

    const { data: stats } = await supabase
      .from("custom_reports")
      .select("report_type, status, is_scheduled, is_public")
      .or(`created_by.eq.${user.id},is_public.eq.true`);

    const summary = {
      total_reports: count || 0,
      my_reports: stats?.filter((r) => !r.is_public).length || 0,
      public_reports: stats?.filter((r) => r.is_public).length || 0,
      scheduled_reports: stats?.filter((r) => r.is_scheduled).length || 0,
      active_reports: stats?.filter((r) => r.status === "ACTIVE").length || 0,
      by_type:
        stats?.reduce((acc: any, r) => {
          acc[r.report_type] = (acc[r.report_type] || 0) + 1;
          return acc;
        }, {}) || {},
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
    console.error("Error in GET /api/finance/reports/custom:", error);
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

    const body = await request.json();
    const {
      report_name,
      report_type,
      description,
      parameters,
      sql_query,
      report_template,
      period_start,
      period_end,
      filters,
      is_public,
      is_scheduled,
      schedule_frequency,
      execute_now = false,
    } = body;

    if (!report_name || !report_type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const reportData = {
      report_name,
      report_type,
      description,
      parameters: parameters || {},
      sql_query,
      report_template: report_template || "TABLE",
      period_start,
      period_end,
      filters: filters || {},
      is_public: is_public || false,
      is_scheduled: is_scheduled || false,
      schedule_frequency,
      created_by: user.id,
      status: "ACTIVE",
    };

    const { data: report, error: reportError } = await supabase
      .from("custom_reports")
      .insert([reportData])
      .select()
      .single();

    if (reportError) {
      console.error("Error creating custom report:", reportError);
      return NextResponse.json({ error: reportError.message }, { status: 500 });
    }

    // Execute the report if requested
    if (execute_now && sql_query) {
      try {
        const startTime = Date.now();
        const result = await executeCustomReport(
          supabase,
          sql_query,
          parameters || {}
        );
        const executionTime = Date.now() - startTime;

        // Save the result
        await supabase.from("custom_report_results").insert([
          {
            report_id: report.id,
            result_data: result.data,
            generated_by: user.id,
            parameters_used: parameters || {},
            execution_time_ms: executionTime,
            row_count: result.data?.length || 0,
          },
        ]);

        return NextResponse.json(
          {
            report,
            result: result.data,
            execution_time: executionTime,
          },
          { status: 201 }
        );
      } catch (executeError) {
        console.error("Error executing custom report:", executeError);
        // Still return the created report even if execution fails
        return NextResponse.json(
          {
            report,
            error: "Report created but execution failed",
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/finance/reports/custom:", error);
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
    const { id, execute = false, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Check if user owns the report or has admin access
    const { data: existingReport } = await supabase
      .from("custom_reports")
      .select("created_by")
      .eq("id", id)
      .single();

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      !existingReport ||
      (existingReport.created_by !== user.id &&
        !["admin", "finance"].includes(userData?.role))
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { data: report, error } = await supabase
      .from("custom_reports")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        last_generated_at: execute
          ? new Date().toISOString()
          : updateData.last_generated_at,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating custom report:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Execute the report if requested
    if (execute && updateData.sql_query) {
      try {
        const startTime = Date.now();
        const result = await executeCustomReport(
          supabase,
          updateData.sql_query,
          updateData.parameters || {}
        );
        const executionTime = Date.now() - startTime;

        // Save the result
        await supabase.from("custom_report_results").insert([
          {
            report_id: report.id,
            result_data: result.data,
            generated_by: user.id,
            parameters_used: updateData.parameters || {},
            execution_time_ms: executionTime,
            row_count: result.data?.length || 0,
          },
        ]);

        return NextResponse.json({
          report,
          result: result.data,
          execution_time: executionTime,
        });
      } catch (executeError) {
        console.error("Error executing custom report:", executeError);
        return NextResponse.json({
          report,
          error: "Report updated but execution failed",
        });
      }
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error in PUT /api/finance/reports/custom:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function executeCustomReport(
  supabase: any,
  sqlQuery: string,
  parameters: any
) {
  try {
    // This is a simplified version - in production, you'd want:
    // 1. Query validation and sanitization
    // 2. Parameter substitution
    // 3. Row/time limits
    // 4. Proper error handling

    // Replace parameters in the query (basic implementation)
    let processedQuery = sqlQuery;
    Object.entries(parameters).forEach(([key, value]) => {
      processedQuery = processedQuery.replace(
        new RegExp(`\\$\\{${key}\\}`, "g"),
        String(value)
      );
    });

    // For security, we'll limit the types of queries that can be executed
    const allowedTables = [
      "financial_transactions",
      "transaction_entries",
      "chart_of_accounts",
      "parties",
      "job_sheets",
      "profit_loss_reports",
      "balance_sheet_reports",
      "cash_flow_reports",
      "tax_reports",
    ];

    const queryLower = processedQuery.toLowerCase();
    const hasAllowedTable = allowedTables.some((table) =>
      queryLower.includes(table)
    );

    if (
      !hasAllowedTable ||
      queryLower.includes("delete") ||
      queryLower.includes("update") ||
      queryLower.includes("insert") ||
      queryLower.includes("drop") ||
      queryLower.includes("create")
    ) {
      throw new Error("Query not allowed for security reasons");
    }

    // Execute a simplified version using Supabase client
    // In production, you might want to use raw SQL with proper escaping
    const { data, error } = await supabase.rpc("execute_custom_report", {
      query: processedQuery,
    });

    if (error) {
      throw error;
    }

    return { data: data || [] };
  } catch (error) {
    console.error("Error executing custom report query:", error);
    throw error;
  }
}
