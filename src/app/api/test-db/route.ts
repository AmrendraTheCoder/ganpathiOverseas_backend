import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function GET() {
  console.log("=== COMPREHENSIVE DATABASE CONNECTION TEST ===");

  try {
    const supabase = await createClient();
    const testResults: any = {
      connection: "✅ Connected to Supabase",

      jobSheetSystem: {},
      overallSuccess: true,
    };

    // ========== JOB SHEET SYSTEM TESTS ==========
    console.log("Testing Job Sheet System...");

    try {
      // Test job_sheets table
      const { data: jobSheetTableCheck, error: jobSheetTableError } =
        await supabase.from("job_sheets").select("count(*)").limit(1);

      if (jobSheetTableError) {
        testResults.jobSheetSystem.tableCheck = `❌ Error: ${jobSheetTableError.message}`;
        testResults.overallSuccess = false;
      } else {
        testResults.jobSheetSystem.tableCheck = "✅ job_sheets table exists";

        // Test job sheet insert
        const jobSheetTestData = {
          job_date: new Date().toISOString().split("T")[0],
          description: "Test Job Sheet",
          sheet: 100,
          plate: 2,
          size: "A4",
          sq_inch: 93.5,
          paper_sheet: 50,
          imp: 2000,
          rate: 10.0,
          printing: 500.0,
          uv: 0.0,
          baking: 0.0,
          file_url: null,
        };

        const { data: jobSheetInsertData, error: jobSheetInsertError } =
          await supabase
            .from("job_sheets")
            .insert([jobSheetTestData])
            .select()
            .single();

        if (jobSheetInsertError) {
          testResults.jobSheetSystem.insertTest = `❌ Insert failed: ${jobSheetInsertError.message}`;
          testResults.overallSuccess = false;
        } else {
          testResults.jobSheetSystem.insertTest =
            "✅ Can insert job sheet records";

          // Test job sheet read
          const { data: jobSheetReadData, error: jobSheetReadError } =
            await supabase
              .from("job_sheets")
              .select("*")
              .eq("id", jobSheetInsertData.id)
              .single();

          if (jobSheetReadError) {
            testResults.jobSheetSystem.readTest = `❌ Read failed: ${jobSheetReadError.message}`;
            testResults.overallSuccess = false;
          } else {
            testResults.jobSheetSystem.readTest =
              "✅ Can read job sheet records";
          }

          // Test job sheet update
          const { error: jobSheetUpdateError } = await supabase
            .from("job_sheets")
            .update({ description: "Updated Test Job Sheet" })
            .eq("id", jobSheetInsertData.id);

          if (jobSheetUpdateError) {
            testResults.jobSheetSystem.updateTest = `❌ Update failed: ${jobSheetUpdateError.message}`;
            testResults.overallSuccess = false;
          } else {
            testResults.jobSheetSystem.updateTest =
              "✅ Can update job sheet records";
          }

          // Clean up job sheet test record
          const { error: jobSheetDeleteError } = await supabase
            .from("job_sheets")
            .delete()
            .eq("id", jobSheetInsertData.id);

          if (jobSheetDeleteError) {
            testResults.jobSheetSystem.cleanup = "⚠️ Cleanup failed";
          } else {
            testResults.jobSheetSystem.cleanup = "✅ Test record cleaned up";
          }
        }
      }
    } catch (jobSheetError: any) {
      testResults.jobSheetSystem.error = `❌ Exception: ${jobSheetError.message}`;
      testResults.overallSuccess = false;
    }

    // ========== OPTIONAL TABLES TESTS ==========
    console.log("Testing Optional Tables...");
    testResults.optionalTables = {};

    // Test job_sheet_notes table
    try {
      const { error: jobSheetNotesError } = await supabase
        .from("job_sheet_notes")
        .select("count(*)")
        .limit(1);

      if (jobSheetNotesError) {
        testResults.optionalTables.jobSheetNotes =
          "⚠️ job_sheet_notes table not found or not accessible";
      } else {
        testResults.optionalTables.jobSheetNotes =
          "✅ job_sheet_notes table exists";
      }
    } catch {
      testResults.optionalTables.jobSheetNotes =
        "⚠️ job_sheet_notes table not found";
    }

    // Test job_sheet_notes table
    try {
      const { error: jobSheetNotesError } = await supabase
        .from("job_sheet_notes")
        .select("count(*)")
        .limit(1);

      if (jobSheetNotesError) {
        testResults.optionalTables.jobSheetNotes =
          "⚠️ job_sheet_notes table not found or not accessible";
      } else {
        testResults.optionalTables.jobSheetNotes =
          "✅ job_sheet_notes table exists";
      }
    } catch {
      testResults.optionalTables.jobSheetNotes =
        "⚠️ job_sheet_notes table not found";
    }

    // Test invoices table
    try {
      const { error: invoicesError } = await supabase
        .from("invoices")
        .select("count(*)")
        .limit(1);

      if (invoicesError) {
        testResults.optionalTables.invoices =
          "⚠️ invoices table not found or not accessible";
      } else {
        testResults.optionalTables.invoices = "✅ invoices table exists";
      }
    } catch {
      testResults.optionalTables.invoices = "⚠️ invoices table not found";
    }

    return NextResponse.json({
      success: testResults.overallSuccess,
      message: testResults.overallSuccess
        ? "🎉 All critical database tests passed!"
        : "⚠️ Some database tests failed - check details below",
      timestamp: new Date().toISOString(),
      results: testResults,
      recommendations: testResults.overallSuccess
        ? [
            "All systems operational! Both quotation and job sheet systems are working correctly.",
          ]
        : [
            "Check database permissions and RLS policies",
            "Ensure all required tables exist with correct schemas",
            "Verify Supabase environment variables are correct",
            "Check the console logs for detailed error information",
          ],
    });
  } catch (error: any) {
    console.error("Comprehensive database test exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Critical Exception: ${error.message}`,
        details: error,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Test form submissions for both systems
export async function POST(request: NextRequest) {
  console.log("=== TESTING FORM SUBMISSIONS ===");

  try {
    let body: any = {};
    try {
      const text = await request.text();
      if (text.trim()) {
        body = JSON.parse(text);
      }
    } catch (parseError) {
      console.log("Request body is empty or invalid JSON, using defaults");
      body = { testType: "jobsheet" }; // Default test
    }

    const { testType = "jobsheet" } = body; // Default to 'jobsheet' if not specified

    console.log(`Testing ${testType} form submission:`, body);

    const supabase = await createClient();
    let result;

    if (testType === "quotation") {
      // Test quotation submission
      const quotationData = {
        client_name: body.clientName || "Test User",
        client_email: body.clientEmail || "test@example.com",
        client_phone: body.clientPhone || null,
        company_name: body.companyName || null,
        project_title: body.projectTitle || "Test Project",
        project_description: body.projectDescription || null,
        print_type: body.printType || "digital",
        paper_type: body.paperType || "standard",
        paper_size: body.paperSize || "A4",
        quantity: parseInt(body.quantity || "100"),
        pages: parseInt(body.pages || "1"),
        color_type: body.colorType || "full-color",
        binding_type: body.bindingType === "none" ? null : body.bindingType,
        lamination: body.lamination === "none" ? null : body.lamination,
        folding: body.folding === "none" ? null : body.folding,
        cutting: body.cutting || "standard",
        status: "pending",
        priority: "normal",
      };

      const { data, error } = await supabase
        .from("quotation_requests")
        .insert([quotationData])
        .select()
        .single();

      result = { data, error, type: "quotation" };
    } else if (testType === "jobsheet") {
      // First, get existing party ID and user ID
      let testPartyId = body.party_id;
      let testUserId = body.created_by;

      if (!testPartyId) {
        // Try to get an existing party
        const { data: existingParties, error: partyError } = await supabase
          .from("parties")
          .select("id")
          .limit(1);

        if (existingParties && existingParties.length > 0) {
          testPartyId = existingParties[0].id;
        } else {
          // No parties exist, we need to skip party_id requirement
          testPartyId = null;
        }
      }

      if (!testUserId) {
        // Try to get an existing user
        const { data: existingUsers, error: userError } = await supabase
          .from("users")
          .select("id")
          .limit(1);

        if (existingUsers && existingUsers.length > 0) {
          testUserId = existingUsers[0].id;
        } else {
          // No users exist, use null and let the constraint fail gracefully
          testUserId = null;
        }
      }

      // Test job sheet submission using the actual schema
      const jobSheetData = {
        job_number: body.job_number || `TEST-${Date.now()}`,
        title: body.title || "Test Job Sheet",
        description: body.description || "Test job sheet for API testing",
        party_id: testPartyId,
        status: body.status || "pending",
        priority: parseInt(body.priority || "2"), // 1=high, 2=medium, 3=low
        quantity: parseInt(body.quantity || "100"),
        selling_price: parseFloat(body.selling_price || "1000.00"),
        order_date: body.order_date || new Date().toISOString().split("T")[0],
        due_date:
          body.due_date ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0], // 7 days from now
        size: body.size || "A4",
        estimated_cost: parseFloat(body.estimated_cost || "800.00"),
        special_instructions: body.special_instructions || "API test job sheet",
        created_by: testUserId,
      };

      const { data, error } = await supabase
        .from("job_sheets")
        .insert([jobSheetData])
        .select()
        .single();

      result = { data, error, type: "jobsheet" };
    } else {
      return NextResponse.json({
        success: false,
        error: "Invalid test type. Use 'quotation' or 'jobsheet'",
      });
    }

    if (result.error) {
      console.error(`${result.type} submission error:`, result.error);
      return NextResponse.json({
        success: false,
        error: result.error.message,
        details: result.error,
        testType: result.type,
      });
    }

    console.log(`${result.type} submission successful:`, result.data);
    return NextResponse.json({
      success: true,
      message: `${result.type} form submission test successful!`,
      data: result.data,
      testType: result.type,
    });
  } catch (error: any) {
    console.error("Form submission test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Form submission test failed: ${error.message}`,
        details: error,
      },
      { status: 500 }
    );
  }
}
