import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const operatorId = searchParams.get("operatorId");
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];
    const view = searchParams.get("view") || "day"; // 'day' or 'week'

    if (!operatorId) {
      return NextResponse.json(
        { error: "Operator ID is required" },
        { status: 400 }
      );
    }

    let startDate = date;
    let endDate = date;

    if (view === "week") {
      // Calculate week start (Monday) and end (Sunday)
      const currentDate = new Date(date);
      const dayOfWeek = currentDate.getDay();
      const diff =
        currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

      const weekStart = new Date(currentDate.setDate(diff));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      startDate = weekStart.toISOString().split("T")[0];
      endDate = weekEnd.toISOString().split("T")[0];
    }

    // Fetch scheduled jobs for the operator
    const { data: schedule, error } = await supabase
      .from("job_schedules")
      .select(
        `
        *,
        job_sheets (
          id,
          job_number,
          title,
          description,
          priority,
          quantity,
          status,
          due_date,
          parties (
            id,
            name,
            contact_person
          )
        ),
        machines (
          id,
          name,
          machine_type,
          model,
          status
        )
      `
      )
      .eq("operator_id", operatorId)
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .order("scheduled_date", { ascending: true })
      .order("scheduled_start_time", { ascending: true });

    if (error) {
      console.error("Error fetching operator schedule:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get operator's machine assignments
    const { data: machines, error: machinesError } = await supabase
      .from("machines")
      .select("*")
      .eq("current_operator_id", operatorId)
      .eq("is_active", true);

    if (machinesError) {
      console.error("Error fetching operator machines:", machinesError);
    }

    return NextResponse.json({
      schedule,
      machines: machines || [],
      view,
      startDate,
      endDate,
    });
  } catch (error: any) {
    console.error("Unexpected error fetching operator schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { action, operatorId, data } = body;

    switch (action) {
      case "update_schedule_status":
        // Update schedule status (e.g., mark as started, completed, etc.)
        const { error: updateError } = await supabase
          .from("job_schedules")
          .update({
            status: data.status,
            actual_start_time: data.actualStartTime || null,
            actual_end_time: data.actualEndTime || null,
            actual_duration_minutes: data.actualDurationMinutes || null,
            notes: data.notes || null,
          })
          .eq("id", data.scheduleId)
          .eq("operator_id", operatorId);

        if (updateError) {
          return NextResponse.json(
            { error: updateError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Schedule updated successfully",
        });

      case "reschedule":
        // Reschedule a job
        const { error: rescheduleError } = await supabase
          .from("job_schedules")
          .update({
            scheduled_date: data.newDate,
            scheduled_start_time: data.newStartTime,
            scheduled_end_time: data.newEndTime,
            status: "rescheduled",
            rescheduled_reason: data.reason,
          })
          .eq("id", data.scheduleId)
          .eq("operator_id", operatorId);

        if (rescheduleError) {
          return NextResponse.json(
            { error: rescheduleError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Job rescheduled successfully",
        });

      case "add_note":
        // Add note to schedule
        const { error: noteError } = await supabase
          .from("job_schedules")
          .update({
            notes: data.notes,
          })
          .eq("id", data.scheduleId)
          .eq("operator_id", operatorId);

        if (noteError) {
          return NextResponse.json(
            { error: noteError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Note added successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Unexpected error in schedule action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
