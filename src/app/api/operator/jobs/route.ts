import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const operatorId = searchParams.get("operatorId");

    if (!operatorId) {
      return NextResponse.json(
        { error: "Operator ID is required" },
        { status: 400 }
      );
    }

    // Fetch jobs assigned to the operator with related data
    const { data: jobs, error } = await supabase
      .from("job_sheets")
      .select(
        `
        *,
        parties!inner (
          id,
          name,
          phone,
          email,
          address
        )
      `
      )
      .eq("assigned_to", operatorId)
      .in("status", ["pending", "in_progress"])
      .order("priority", { ascending: false })
      .order("due_date", { ascending: true });

    // If jobs found, fetch machine data separately to avoid foreign key issues
    let jobsWithMachines = jobs;
    if (jobs && jobs.length > 0) {
      // Get unique machine IDs
      const machineIds = jobs
        .map((job) => job.machine_id)
        .filter((id) => id !== null);

      if (machineIds.length > 0) {
        const { data: machines } = await supabase
          .from("machines")
          .select("id, name, type, model")
          .in("id", machineIds);

        // Add machine data to jobs
        jobsWithMachines = jobs.map((job) => ({
          ...job,
          machines: machines?.find((m) => m.id === job.machine_id) || null,
        }));
      } else {
        // Add null machines for jobs without machine assignments
        jobsWithMachines = jobs.map((job) => ({
          ...job,
          machines: null,
        }));
      }
    }

    if (error) {
      console.error("Error fetching operator jobs:", error);
      return NextResponse.json(
        {
          message: "Database query failed",
          details: error.message,
          hint: error.hint || "",
          code: error.code || "",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ jobs: jobsWithMachines || [] });
  } catch (error: any) {
    console.error("Unexpected error fetching operator jobs:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        details: error.message || "Unknown error",
        hint: "",
        code: "",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { jobId, operatorId, action, data } = body;

    if (!jobId || !operatorId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: jobId, operatorId, action" },
        { status: 400 }
      );
    }

    switch (action) {
      case "start_job":
        // Start a job - update status and create time log
        const { error: startError } = await supabase
          .from("job_sheets")
          .update({
            status: "in_progress",
            started_at: new Date().toISOString(),
          })
          .eq("id", jobId)
          .eq("assigned_to", operatorId);

        if (startError) {
          return NextResponse.json(
            { error: startError.message },
            { status: 500 }
          );
        }

        // Try to create time log entry if time_logs table exists
        try {
          await supabase.from("time_logs").insert({
            job_sheet_id: jobId,
            operator_id: operatorId,
            machine_id: data?.machineId,
            clock_in: new Date().toISOString(),
            notes: data?.notes || "Job started",
          });
        } catch (timeLogError) {
          // Don't fail the request if time_logs doesn't exist
          console.warn("Time logs not available:", timeLogError);
        }

        return NextResponse.json({
          success: true,
          message: "Job started successfully",
        });

      case "pause_job":
        // Update job status to pending
        const { error: pauseError } = await supabase
          .from("job_sheets")
          .update({
            status: "pending",
          })
          .eq("id", jobId)
          .eq("assigned_to", operatorId);

        if (pauseError) {
          return NextResponse.json(
            { error: pauseError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Job paused successfully",
        });

      case "complete_job":
        // Complete job
        const { error: completeError } = await supabase
          .from("job_sheets")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", jobId)
          .eq("assigned_to", operatorId);

        if (completeError) {
          return NextResponse.json(
            { error: completeError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Job completed successfully",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error processing job action:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
