import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
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
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const method = searchParams.get("method");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("payments")
      .select(
        `
        *,
        parties (
          name,
          email,
          phone
        ),
        invoices (
          invoice_number,
          total_amount
        ),
        expenses (
          expense_number,
          total_amount
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (type) {
      query = query.eq("payment_type", type);
    }

    if (method) {
      query = query.eq("payment_method", method);
    }

    if (startDate) {
      query = query.gte("payment_date", startDate);
    }

    if (endDate) {
      query = query.lte("payment_date", endDate);
    }

    // Execute query with pagination
    const {
      data: payments,
      error,
      count,
    } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const { data: summaryData } = await supabase
      .from("payments")
      .select("payment_type, amount, status, reconciled");

    const summary = {
      totalPayments: summaryData?.length || 0,
      totalIncoming:
        summaryData
          ?.filter((p) => p.payment_type === "INCOMING")
          ?.reduce((sum, p) => sum + p.amount, 0) || 0,
      totalOutgoing:
        summaryData
          ?.filter((p) => p.payment_type === "OUTGOING")
          ?.reduce((sum, p) => sum + p.amount, 0) || 0,
      pendingPayments:
        summaryData?.filter((p) => p.status === "PENDING").length || 0,
      completedPayments:
        summaryData?.filter((p) => p.status === "COMPLETED").length || 0,
      failedPayments:
        summaryData?.filter((p) => p.status === "FAILED").length || 0,
      unreconciled: summaryData?.filter((p) => !p.reconciled).length || 0,
    };

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      success: true,
      payments: payments || [],
      summary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
      },
    });
  } catch (error) {
    console.error("API error:", error);
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
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "payment_type",
      "amount",
      "payment_method",
      "payment_date",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate payment number
    const { data: lastPayment } = await supabase
      .from("payments")
      .select("payment_number")
      .order("created_at", { ascending: false })
      .limit(1);

    const lastNumber = lastPayment?.[0]?.payment_number || "PAY-2024-0000";
    const nextNumber = lastNumber.replace(/(\d+)$/, (match) =>
      String(parseInt(match) + 1).padStart(4, "0")
    );

    // Calculate total amount
    const totalAmount =
      body.amount + (body.tax_amount || 0) - (body.discount_amount || 0);

    // Prepare payment data
    const paymentData = {
      payment_number: nextNumber,
      payment_type: body.payment_type,
      invoice_id: body.invoice_id || null,
      expense_id: body.expense_id || null,
      party_id: body.party_id || null,
      amount: totalAmount,
      payment_method: body.payment_method,
      payment_date: body.payment_date,
      reference_number: body.reference_number || null,
      description: body.description || null,
      status: "PENDING",
      reconciled: false,
    };

    // Insert payment record
    const { data: payment, error } = await supabase
      .from("payments")
      .insert([paymentData])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to create payment" },
        { status: 500 }
      );
    }

    // If this is an invoice payment, update invoice status
    if (body.invoice_id) {
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          paid_amount: supabase.raw(`paid_amount + ${totalAmount}`),
          status: supabase.raw(`
            CASE 
              WHEN (paid_amount + ${totalAmount}) >= total_amount THEN 'PAID'::invoice_status
              ELSE status
            END
          `),
        })
        .eq("id", body.invoice_id);

      if (invoiceError) {
        console.error("Invoice update error:", invoiceError);
      }
    }

    // Create corresponding financial transaction
    const transactionData = {
      transaction_type:
        body.payment_type === "INCOMING" ? "RECEIPT" : "PAYMENT",
      amount: totalAmount,
      description: `Payment: ${payment.payment_number}`,
      reference_number: payment.payment_number,
      party_id: body.party_id,
      status: "APPROVED",
    };

    const { error: transactionError } = await supabase
      .from("financial_transactions")
      .insert([transactionData]);

    if (transactionError) {
      console.error("Transaction creation error:", transactionError);
    }

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment recorded successfully",
    });
  } catch (error) {
    console.error("API error:", error);
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
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
    }

    if (body.reconciled !== undefined) {
      updateData.reconciled = body.reconciled;
      if (body.reconciled) {
        updateData.reconciled_at = new Date().toISOString();
      }
    }

    if (body.reference_number) {
      updateData.reference_number = body.reference_number;
    }

    if (body.description) {
      updateData.description = body.description;
    }

    // Update payment
    const { data: payment, error } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment updated successfully",
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
