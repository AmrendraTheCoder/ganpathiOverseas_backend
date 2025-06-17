import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const operatorId = searchParams.get("operatorId");
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    if (!operatorId) {
      return NextResponse.json(
        { error: "Operator ID is required" },
        { status: 400 }
      );
    }

    // Fetch time logs for the operator for the specified date
    const { data: timeLogs, error } = await supabase
      .from("time_logs")
      .select(
        `
        *,
        job_sheets (
          id,
          job_number,
          title,
          status
        ),
        machines (
          id,
          name,
          machine_type
        )
      `
      )
      .eq("operator_id", operatorId)
      .gte("clock_in_time", `${date}T00:00:00`)
      .lt("clock_in_time", `${date}T23:59:59`)
      .order("clock_in_time", { ascending: false });

    if (error) {
      console.error("Error fetching time logs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get active time log (if any)
    const { data: activeLog, error: activeError } = await supabase
      .from("time_logs")
      .select(
        `
        *,
        job_sheets (
          id,
          job_number,
          title
        ),
        machines (
          id,
          name,
          machine_type
        )
      `
      )
      .eq("operator_id", operatorId)
      .eq("status", "active")
      .single();

    if (activeError && activeError.code !== "PGRST116") {
      console.error("Error fetching active time log:", activeError);
    }

    return NextResponse.json({
      timeLogs,
      activeLog: activeLog || null,
    });
  } catch (error: any) {
    console.error("Unexpected error fetching time logs:", error);
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
      case "clock_in":
        // Create new time log entry
        const { data: newTimeLog, error: clockInError } = await supabase
          .from("time_logs")
          .insert({
            job_sheet_id: data.jobId,
            operator_id: operatorId,
            machine_id: data.machineId,
            clock_in_time: new Date().toISOString(),
            task_description: data.taskDescription,
            work_stage: data.workStage,
            status: "active",
          })
          .select()
          .single();

        if (clockInError) {
          return NextResponse.json(
            { error: clockInError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Clocked in successfully",
          timeLog: newTimeLog,
        });

      case "clock_out":
        // Update current active time log
        const { data: updatedTimeLog, error: clockOutError } = await supabase
          .from("time_logs")
          .update({
            clock_out_time: new Date().toISOString(),
            status: "completed",
            quantity_processed: data.quantityProcessed || 0,
            notes: data.notes || "",
            total_work_minutes: data.totalWorkMinutes,
          })
          .eq("id", data.timeLogId)
          .eq("operator_id", operatorId)
          .select()
          .single();

        if (clockOutError) {
          return NextResponse.json(
            { error: clockOutError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Clocked out successfully",
          timeLog: updatedTimeLog,
        });

      case "start_break":
        // Update current time log with break start time
        const { error: breakStartError } = await supabase
          .from("time_logs")
          .update({
            break_start_time: new Date().toISOString(),
            status: "break",
          })
          .eq("id", data.timeLogId)
          .eq("operator_id", operatorId);

        if (breakStartError) {
          return NextResponse.json(
            { error: breakStartError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Break started",
        });

      case "end_break":
        // Update current time log with break end time
        const { error: breakEndError } = await supabase
          .from("time_logs")
          .update({
            break_end_time: new Date().toISOString(),
            status: "active",
            total_break_minutes: data.totalBreakMinutes,
          })
          .eq("id", data.timeLogId)
          .eq("operator_id", operatorId);

        if (breakEndError) {
          return NextResponse.json(
            { error: breakEndError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Break ended",
        });

      case "update_progress":
        // Update progress in current time log
        const { error: progressError } = await supabase
          .from("time_logs")
          .update({
            quantity_processed: data.quantityProcessed,
            notes: data.notes || "",
          })
          .eq("id", data.timeLogId)
          .eq("operator_id", operatorId);

        if (progressError) {
          return NextResponse.json(
            { error: progressError.message },
            { status: 500 }
          );
        }

        // Also update job progress table
        const { error: jobProgressError } = await supabase
          .from("job_progress")
          .upsert({
            job_sheet_id: data.jobId,
            stage: data.workStage,
            status: "in_progress",
            progress_percentage: data.progressPercentage,
            quantity_completed: data.quantityProcessed,
            operator_id: operatorId,
          });

        if (jobProgressError) {
          console.error("Error updating job progress:", jobProgressError);
        }

        return NextResponse.json({
          success: true,
          message: "Progress updated successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Unexpected error in time log action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
