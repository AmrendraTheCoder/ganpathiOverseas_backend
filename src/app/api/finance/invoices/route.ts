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
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const partyId = searchParams.get("partyId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const overdue = searchParams.get("overdue") === "true";

    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("invoices")
      .select(
        `
        *,
        parties!party_id(name, email, phone, address),
        job_sheets!job_sheet_id(job_number, description, quantity),
        users!created_by(email, full_name),
        invoice_items(
          id,
          description,
          quantity,
          unit_price,
          total_price
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (partyId) {
      query = query.eq("party_id", partyId);
    }

    if (startDate) {
      query = query.gte("invoice_date", startDate);
    }

    if (endDate) {
      query = query.lte("invoice_date", endDate);
    }

    if (overdue) {
      query = query.lt("due_date", new Date().toISOString().split("T")[0]);
      query = query.neq("status", "PAID");
    }

    // Get paginated results
    const { data: invoices, error } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error("Error fetching invoices:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate days overdue for each invoice
    const processedInvoices = invoices?.map((invoice) => {
      const today = new Date();
      const dueDate = new Date(invoice.due_date);
      const daysOverdue = Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...invoice,
        days_overdue:
          daysOverdue > 0 && invoice.status !== "PAID" ? daysOverdue : null,
        balance_due: invoice.total_amount - (invoice.paid_amount || 0),
      };
    });

    // Get total count for pagination
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true });

    // Get summary statistics
    const { data: stats } = await supabase
      .from("invoices")
      .select("total_amount, paid_amount, status, due_date");

    const today = new Date().toISOString().split("T")[0];
    const totalOutstanding =
      stats?.reduce(
        (sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)),
        0
      ) || 0;
    const overdueAmount =
      stats
        ?.filter((inv) => inv.due_date < today && inv.status !== "PAID")
        .reduce(
          (sum, inv) => sum + (inv.total_amount - (inv.paid_amount || 0)),
          0
        ) || 0;

    const summary = {
      totalInvoices: count || 0,
      totalAmount: stats?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0,
      totalOutstanding,
      overdueAmount,
      paidInvoices: stats?.filter((inv) => inv.status === "PAID").length || 0,
      draftInvoices: stats?.filter((inv) => inv.status === "DRAFT").length || 0,
      overdueInvoices:
        stats?.filter((inv) => inv.due_date < today && inv.status !== "PAID")
          .length || 0,
    };

    return NextResponse.json({
      invoices: processedInvoices || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      summary,
    });
  } catch (error) {
    console.error("Error in GET /api/finance/invoices:", error);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has finance role
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "finance"].includes(userData.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      party_id,
      job_sheet_id,
      due_date,
      items,
      tax_amount = 0,
      discount_amount = 0,
      terms,
      notes,
    } = body;

    // Validate required fields
    if (!party_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Party ID and items are required" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unit_price,
      0
    );
    const total_amount = subtotal + tax_amount - discount_amount;

    // Generate invoice number
    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("invoice_number")
      .order("created_at", { ascending: false })
      .limit(1);

    let invoiceNumber = "INV-2024-001";
    if (lastInvoice && lastInvoice.length > 0) {
      const lastNumber = parseInt(lastInvoice[0].invoice_number.split("-")[2]);
      invoiceNumber = `INV-2024-${String(lastNumber + 1).padStart(3, "0")}`;
    }

    // Set due date (default to 30 days from now if not provided)
    const dueDateValue =
      due_date ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        party_id,
        job_sheet_id,
        due_date: dueDateValue,
        subtotal,
        tax_amount,
        discount_amount,
        total_amount,
        terms,
        notes,
        created_by: user.id,
        status: "DRAFT",
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Error creating invoice:", invoiceError);
      return NextResponse.json(
        { error: invoiceError.message },
        { status: 500 }
      );
    }

    // Create invoice items
    const invoiceItems = items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(invoiceItems);

    if (itemsError) {
      console.error("Error creating invoice items:", itemsError);
      // Rollback invoice
      await supabase.from("invoices").delete().eq("id", invoice.id);

      return NextResponse.json(
        { error: "Failed to create invoice items" },
        { status: 500 }
      );
    }

    // Create corresponding financial transaction
    const { error: transactionError } = await supabase
      .from("financial_transactions")
      .insert({
        transaction_number: `TXN-${invoiceNumber}`,
        reference_type: "INVOICE",
        reference_id: invoice.id,
        party_id,
        description: `Invoice ${invoiceNumber}`,
        total_amount,
        created_by: user.id,
        status: "PENDING",
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/finance/invoices:", error);
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, paid_amount, payment_date } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (paid_amount !== undefined) {
      updateData.paid_amount = paid_amount;
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating invoice:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If payment is made, create payment record
    if (paid_amount && payment_date) {
      const { data: lastPayment } = await supabase
        .from("payments")
        .select("payment_number")
        .order("created_at", { ascending: false })
        .limit(1);

      let paymentNumber = "PAY-2024-001";
      if (lastPayment && lastPayment.length > 0) {
        const lastNumber = parseInt(
          lastPayment[0].payment_number.split("-")[2]
        );
        paymentNumber = `PAY-2024-${String(lastNumber + 1).padStart(3, "0")}`;
      }

      await supabase.from("payments").insert({
        payment_number: paymentNumber,
        invoice_id: id,
        party_id: invoice.party_id,
        payment_date,
        amount: paid_amount,
        created_by: user.id,
        status: "COMPLETED",
      });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error("Error in PUT /api/finance/invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
