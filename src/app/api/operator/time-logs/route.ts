import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const operatorId = searchParams.get("operatorId");
    const jobId = searchParams.get("jobId");

    if (!operatorId) {
      return NextResponse.json(
        { error: "Operator ID is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("time_logs")
      .select("*")
      .eq("operator_id", operatorId)
      .order("started_at", { ascending: false });

    // Filter by specific job if provided
    if (jobId) {
      query = query.eq("job_id", jobId);
    }

    const { data: timeLogs, error } = await query;

    if (error) {
      console.error("Error fetching time logs:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If we have time logs, fetch related job sheets and machines data
    let enrichedTimeLogs = timeLogs || [];

    if (timeLogs && timeLogs.length > 0) {
      // Get unique job IDs and machine IDs
      const jobIds = [...new Set(timeLogs.map((log) => log.job_id))];
      const machineIds = [
        ...new Set(
          timeLogs.map((log) => log.machine_id).filter((id) => id !== null)
        ),
      ];

      // Fetch job sheets data
      const { data: jobSheets } = await supabase
        .from("job_sheets")
        .select("id, job_number, title, status")
        .in("id", jobIds);

      // Fetch machines data if we have machine IDs
      let machines = [];
      if (machineIds.length > 0) {
        const { data: machinesData } = await supabase
          .from("machines")
          .select("id, name, type, model")
          .in("id", machineIds);
        machines = machinesData || [];
      }

      // Enrich time logs with related data
      enrichedTimeLogs = timeLogs.map((log) => ({
        ...log,
        job_sheets: jobSheets?.find((job) => job.id === log.job_id) || null,
        machines:
          machines.find((machine) => machine.id === log.machine_id) || null,
      }));
    }

    return NextResponse.json({ timeLogs: enrichedTimeLogs });
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
    const {
      action,
      operatorId,
      jobId,
      machineId,
      notes,
      breakTimeMinutes,
      productivityScore,
    } = body;

    if (!action || !operatorId || !jobId) {
      return NextResponse.json(
        { error: "Missing required fields: action, operatorId, jobId" },
        { status: 400 }
      );
    }

    switch (action) {
      case "clock_in":
        // Check if there's already an active time log for this operator
        const { data: activeLog } = await supabase
          .from("time_logs")
          .select("id")
          .eq("operator_id", operatorId)
          .is("ended_at", null)
          .single();

        if (activeLog) {
          return NextResponse.json(
            {
              error:
                "You already have an active time log. Please clock out first.",
            },
            { status: 400 }
          );
        }

        // Create new time log entry
        const { data: newTimeLog, error: clockInError } = await supabase
          .from("time_logs")
          .insert({
            job_id: jobId,
            operator_id: operatorId,
            machine_id: machineId || null,
            started_at: new Date().toISOString(),
            notes: notes || "Started working on job",
          })
          .select()
          .single();

        if (clockInError) {
          return NextResponse.json(
            { error: clockInError.message },
            { status: 500 }
          );
        }

        // Update job status to in_progress
        await supabase
          .from("job_sheets")
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        return NextResponse.json({
          success: true,
          message: "Clocked in successfully",
          timeLog: newTimeLog,
        });

      case "clock_out":
        // Find the active time log for this operator and job
        const { data: activeTimeLog, error: findError } = await supabase
          .from("time_logs")
          .select("*")
          .eq("operator_id", operatorId)
          .eq("job_id", jobId)
          .is("ended_at", null)
          .single();

        if (findError || !activeTimeLog) {
          return NextResponse.json(
            { error: "No active time log found for this job" },
            { status: 400 }
          );
        }

        // Update time log with clock out time
        const { error: clockOutError } = await supabase
          .from("time_logs")
          .update({
            ended_at: new Date().toISOString(),
            break_time_minutes: breakTimeMinutes || 0,
            notes: notes || activeTimeLog.notes,
            productivity_score: productivityScore || null,
          })
          .eq("id", activeTimeLog.id);

        if (clockOutError) {
          return NextResponse.json(
            { error: clockOutError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Clocked out successfully",
        });

      case "add_break":
        // Add break time to active time log
        const { data: currentLog, error: getCurrentError } = await supabase
          .from("time_logs")
          .select("*")
          .eq("operator_id", operatorId)
          .eq("job_id", jobId)
          .is("ended_at", null)
          .single();

        if (getCurrentError || !currentLog) {
          return NextResponse.json(
            { error: "No active time log found" },
            { status: 400 }
          );
        }

        const { error: breakError } = await supabase
          .from("time_logs")
          .update({
            break_time_minutes:
              (currentLog.break_time_minutes || 0) + (breakTimeMinutes || 15),
            notes: notes
              ? `${currentLog.notes}\nBreak: ${notes}`
              : currentLog.notes,
          })
          .eq("id", currentLog.id);

        if (breakError) {
          return NextResponse.json(
            { error: breakError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Break time added successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error processing time log action:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
