import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../../supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const operatorId = searchParams.get("operatorId");
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    if (!operatorId) {
      return NextResponse.json(
        { error: "Operator ID is required" },
        { status: 400 }
      );
    }

    // Determine which statuses to include
    const statusFilter = includeCompleted 
      ? ["pending", "in_progress", "completed"]
      : ["pending", "in_progress"];

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
      .in("status", statusFilter)
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
        // Check if operator already has an active time log
        const { data: existingActiveLog } = await supabase
          .from("time_logs")
          .select("id")
          .eq("operator_id", operatorId)
          .is("ended_at", null)
          .single();

        if (existingActiveLog) {
          return NextResponse.json(
            {
              error:
                "You already have an active time log. Please clock out first.",
            },
            { status: 400 }
          );
        }

        // Start the job - update status
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

        // Create time log entry
        const { error: timeLogError } = await supabase
          .from("time_logs")
          .insert({
            job_id: jobId,
            operator_id: operatorId,
            machine_id: data?.machineId || null,
            started_at: new Date().toISOString(),
            notes: data?.notes || "Job started",
          });

        if (timeLogError) {
          console.warn("Failed to create time log:", timeLogError);
          // Don't fail the request if time log creation fails
        }

        return NextResponse.json({
          success: true,
          message: "Job started successfully",
        });

      case "pause_job":
        // Clock out of current time log if active
        const { data: activeTimeLog } = await supabase
          .from("time_logs")
          .select("*")
          .eq("operator_id", operatorId)
          .eq("job_id", jobId)
          .is("ended_at", null)
          .single();

        if (activeTimeLog) {
          await supabase
            .from("time_logs")
            .update({
              ended_at: new Date().toISOString(),
              notes: `${activeTimeLog.notes}\nJob paused`,
            })
            .eq("id", activeTimeLog.id);
        }

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
        // Clock out of current time log if active
        const { data: completeActiveLog } = await supabase
          .from("time_logs")
          .select("*")
          .eq("operator_id", operatorId)
          .eq("job_id", jobId)
          .is("ended_at", null)
          .single();

        if (completeActiveLog) {
          await supabase
            .from("time_logs")
            .update({
              ended_at: new Date().toISOString(),
              notes: `${completeActiveLog.notes}\nJob completed`,
              productivity_score: data?.productivityScore || 8,
            })
            .eq("id", completeActiveLog.id);
        }

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
