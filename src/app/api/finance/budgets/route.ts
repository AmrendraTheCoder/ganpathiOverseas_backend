import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

interface Budget {
  id?: string;
  category: string;
  department: string;
  monthly_limit: number;
  annual_limit: number;
  current_spent: number;
  remaining_budget: number;
  period_start: string;
  period_end: string;
  status: "active" | "exceeded" | "warning" | "inactive";
  notifications_enabled: boolean;
  approval_required: boolean;
  approver_id?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

interface BudgetAllocation {
  id?: string;
  budget_id: string;
  amount: number;
  description: string;
  allocated_date: string;
  allocated_by: string;
  approval_status: "pending" | "approved" | "rejected";
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const department = searchParams.get("department");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const period = searchParams.get("period") || "current";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("budgets")
      .select(
        `
        *,
        budget_allocations (
          id,
          amount,
          description,
          allocated_date,
          approval_status
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (department) {
      query = query.eq("department", department);
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (status) {
      query = query.eq("status", status);
    }

    // Period filter
    if (period === "current") {
      const currentDate = new Date().toISOString();
      query = query
        .lte("period_start", currentDate)
        .gte("period_end", currentDate);
    }

    const {
      data: budgets,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching budgets:", error);
      return NextResponse.json(
        { error: "Failed to fetch budgets" },
        { status: 500 }
      );
    }

    // Calculate budget utilization for each budget
    const budgetsWithUtilization = budgets?.map((budget) => ({
      ...budget,
      utilization_percentage:
        budget.monthly_limit > 0
          ? (budget.current_spent / budget.monthly_limit) * 100
          : 0,
      days_remaining: Math.ceil(
        (new Date(budget.period_end).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      ),
      variance: budget.monthly_limit - budget.current_spent,
      variance_percentage:
        budget.monthly_limit > 0
          ? ((budget.monthly_limit - budget.current_spent) /
              budget.monthly_limit) *
            100
          : 0,
    }));

    // Get budget summary
    const { data: summaryData } = await supabase
      .from("budgets")
      .select("monthly_limit, current_spent, status")
      .eq("status", "active");

    const summary = summaryData?.reduce(
      (acc, budget) => ({
        total_allocated: acc.total_allocated + budget.monthly_limit,
        total_spent: acc.total_spent + budget.current_spent,
        total_remaining:
          acc.total_remaining + (budget.monthly_limit - budget.current_spent),
      }),
      { total_allocated: 0, total_spent: 0, total_remaining: 0 }
    );

    return NextResponse.json({
      success: true,
      data: budgetsWithUtilization,
      summary,
      pagination: {
        current_page: page,
        total_pages: Math.ceil((count || 0) / limit),
        total_count: count || 0,
        per_page: limit,
      },
    });
  } catch (error) {
    console.error("Budget fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const budgetData: Budget = await request.json();

    // Validation
    if (
      !budgetData.category ||
      !budgetData.department ||
      !budgetData.monthly_limit
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields: category, department, monthly_limit",
        },
        { status: 400 }
      );
    }

    // Check for duplicate budget for same category and department
    const { data: existingBudget } = await supabase
      .from("budgets")
      .select("id")
      .eq("category", budgetData.category)
      .eq("department", budgetData.department)
      .eq("status", "active")
      .single();

    if (existingBudget) {
      return NextResponse.json(
        {
          error:
            "Active budget already exists for this category and department",
        },
        { status: 409 }
      );
    }

    // Set defaults
    const budget: Budget = {
      ...budgetData,
      current_spent: 0,
      remaining_budget: budgetData.monthly_limit,
      status: "active",
      notifications_enabled: budgetData.notifications_enabled ?? true,
      approval_required: budgetData.approval_required ?? false,
      period_start: budgetData.period_start || new Date().toISOString(),
      period_end:
        budgetData.period_end ||
        new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("budgets")
      .insert([budget])
      .select()
      .single();

    if (error) {
      console.error("Error creating budget:", error);
      return NextResponse.json(
        { error: "Failed to create budget" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data,
        message: "Budget created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Budget creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("id");

    if (!budgetId) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Calculate new remaining budget if monthly_limit is updated
    if (updateData.monthly_limit) {
      const { data: currentBudget } = await supabase
        .from("budgets")
        .select("current_spent")
        .eq("id", budgetId)
        .single();

      if (currentBudget) {
        updateData.remaining_budget =
          updateData.monthly_limit - currentBudget.current_spent;

        // Update status based on utilization
        const utilization =
          (currentBudget.current_spent / updateData.monthly_limit) * 100;
        if (utilization >= 100) {
          updateData.status = "exceeded";
        } else if (utilization >= 80) {
          updateData.status = "warning";
        } else {
          updateData.status = "active";
        }
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("budgets")
      .update(updateData)
      .eq("id", budgetId)
      .select()
      .single();

    if (error) {
      console.error("Error updating budget:", error);
      return NextResponse.json(
        { error: "Failed to update budget" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Budget updated successfully",
    });
  } catch (error) {
    console.error("Budget update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get("id");

    if (!budgetId) {
      return NextResponse.json(
        { error: "Budget ID is required" },
        { status: 400 }
      );
    }

    // Check if budget has allocations
    const { data: allocations } = await supabase
      .from("budget_allocations")
      .select("id")
      .eq("budget_id", budgetId);

    if (allocations && allocations.length > 0) {
      // Soft delete - mark as inactive instead of hard delete
      const { error } = await supabase
        .from("budgets")
        .update({
          status: "inactive",
          updated_at: new Date().toISOString(),
        })
        .eq("id", budgetId);

      if (error) {
        console.error("Error deactivating budget:", error);
        return NextResponse.json(
          { error: "Failed to deactivate budget" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Budget deactivated successfully (has existing allocations)",
      });
    } else {
      // Hard delete if no allocations
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budgetId);

      if (error) {
        console.error("Error deleting budget:", error);
        return NextResponse.json(
          { error: "Failed to delete budget" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Budget deleted successfully",
      });
    }
  } catch (error) {
    console.error("Budget deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
