import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Read the migration file
    const migrationPath = join(
      process.cwd(),
      "supabase/migrations/20241223000002_complete_finance_schema.sql"
    );

    let migrationSQL: string;

    try {
      migrationSQL = readFileSync(migrationPath, "utf8");
    } catch (readError) {
      return NextResponse.json(
        {
          success: false,
          error: "Migration file not found",
          message: "Could not read the migration file",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      migrationSQL,
      fileName: "20241223000002_complete_finance_schema.sql",
      instructions: [
        "1. Copy the SQL content below",
        "2. Go to your Supabase Dashboard",
        "3. Navigate to SQL Editor",
        "4. Paste the SQL and click 'Run'",
        "5. Return here and click 'Refresh' to verify",
      ],
      message: "Migration SQL ready for manual execution",
    });
  } catch (error: any) {
    console.error("Get migration SQL error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to retrieve migration SQL",
      },
      { status: 500 }
    );
  }
}
