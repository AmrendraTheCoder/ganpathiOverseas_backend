import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
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

    console.log("🔧 Starting job sheets fix process...");

    const results = {
      job_sheets_fixed: false,
      columns_added: [],
      issues: [],
      recommendations: [],
    };

    // Step 1: Check if columns exist first
    console.log("📋 Checking existing job_sheets columns...");

    try {
      // Try to query the columns - this will tell us if they exist
      const { data: testData, error: testError } = await supabase
        .from("job_sheets")
        .select("id, uv, baking")
        .limit(1);

      if (!testError) {
        console.log("✅ Both UV and baking columns already exist");
        results.job_sheets_fixed = true;
        results.columns_added.push(
          "uv (already exists)",
          "baking (already exists)"
        );
      } else {
        console.log(
          "❌ Columns missing, will need manual fix:",
          testError.message
        );
        results.issues.push(`Missing columns: ${testError.message}`);
        results.recommendations.push(
          "Execute the database fix script in Supabase Dashboard"
        );
        results.recommendations.push(
          "Visit /fix-database-now for complete instructions"
        );
      }
    } catch (err: any) {
      console.error("Error checking job_sheets columns:", err);
      results.issues.push(`Column check failed: ${err.message}`);
    }

    // Step 2: Try to add columns programmatically (this usually fails in Supabase)
    if (!results.job_sheets_fixed) {
      console.log("🔧 Attempting to add missing columns...");

      try {
        // This will likely fail because Supabase restricts DDL operations
        const { error: alterError } = await supabase.rpc("exec_sql", {
          sql: `
            ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS uv DECIMAL(10,2);
            ALTER TABLE job_sheets ADD COLUMN IF NOT EXISTS baking DECIMAL(10,2);
          `,
        });

        if (!alterError) {
          console.log("✅ Columns added successfully via RPC");
          results.job_sheets_fixed = true;
          results.columns_added.push("uv", "baking");
        } else {
          console.log("❌ RPC method failed:", alterError.message);
          results.issues.push(`RPC failed: ${alterError.message}`);
        }
      } catch (err: any) {
        console.log("❌ Programmatic approach failed:", err.message);
        results.issues.push(`Programmatic fix failed: ${err.message}`);
      }
    }

    // Step 3: Provide manual fix instructions
    if (!results.job_sheets_fixed) {
      results.recommendations.push(
        "MANUAL FIX REQUIRED:",
        "1. Open Supabase Dashboard > SQL Editor",
        "2. Run: ALTER TABLE job_sheets ADD COLUMN uv DECIMAL(10,2);",
        "3. Run: ALTER TABLE job_sheets ADD COLUMN baking DECIMAL(10,2);",
        "4. Or execute complete fix script from execute-database-fix.sql"
      );
    }

    console.log(
      `✅ Job sheets fix completed. Success: ${results.job_sheets_fixed}`
    );

    return NextResponse.json({
      success: results.job_sheets_fixed,
      message: results.job_sheets_fixed
        ? "Job sheets columns verified/added successfully"
        : "Manual database fix required - see recommendations",
      results,
      next_steps: results.job_sheets_fixed
        ? ["✅ Job sheets ready", "Check other database components"]
        : [
            "❌ Manual fix needed",
            "Follow recommendations",
            "Visit /fix-database-now for complete guide",
          ],
    });
  } catch (error: any) {
    console.error("Job sheets fix error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Job sheets fix failed",
        recommendations: [
          "Manual database fix required",
          "Execute complete fix script in Supabase Dashboard",
          "Visit /fix-database-now for instructions",
        ],
      },
      { status: 500 }
    );
  }
}
