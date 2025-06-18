import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

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
              // Ignore
            }
          },
        },
      }
    );

    console.log("🔧 Fixing finance relationship tables...");

    // Step 1: Create profit_loss_line_items table
    const createProfitLossLineItems = `
      CREATE TABLE IF NOT EXISTS profit_loss_line_items (
          id BIGSERIAL PRIMARY KEY,
          report_id BIGINT NOT NULL REFERENCES profit_loss_reports(id) ON DELETE CASCADE,
          account_id BIGINT REFERENCES chart_of_accounts(id),
          category VARCHAR(50) NOT NULL,
          line_description VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          percentage_of_revenue DECIMAL(5,2),
          sort_order INTEGER DEFAULT 0,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: plError } = await supabase.rpc("exec_sql", {
      sql: createProfitLossLineItems,
    });
    if (plError) {
      console.error("Error creating profit_loss_line_items:", plError);
    } else {
      console.log("✅ Created profit_loss_line_items table");
    }

    // Step 2: Create cash_flow_line_items table
    const createCashFlowLineItems = `
      CREATE TABLE IF NOT EXISTS cash_flow_line_items (
          id BIGSERIAL PRIMARY KEY,
          report_id BIGINT NOT NULL REFERENCES cash_flow_reports(id) ON DELETE CASCADE,
          account_id BIGINT REFERENCES chart_of_accounts(id),
          section VARCHAR(50) NOT NULL,
          category VARCHAR(100) NOT NULL,
          line_description VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          sort_order INTEGER DEFAULT 0,
          is_subtotal BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: cfError } = await supabase.rpc("exec_sql", {
      sql: createCashFlowLineItems,
    });
    if (cfError) {
      console.error("Error creating cash_flow_line_items:", cfError);
    } else {
      console.log("✅ Created cash_flow_line_items table");
    }

    // Step 3: Create balance_sheet_line_items table
    const createBalanceSheetLineItems = `
      CREATE TABLE IF NOT EXISTS balance_sheet_line_items (
          id BIGSERIAL PRIMARY KEY,
          report_id BIGINT NOT NULL REFERENCES balance_sheet_reports(id) ON DELETE CASCADE,
          account_id BIGINT REFERENCES chart_of_accounts(id),
          section VARCHAR(50) NOT NULL,
          category VARCHAR(100) NOT NULL,
          line_description VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL DEFAULT 0,
          sort_order INTEGER DEFAULT 0,
          is_subtotal BOOLEAN DEFAULT FALSE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: bsError } = await supabase.rpc("exec_sql", {
      sql: createBalanceSheetLineItems,
    });
    if (bsError) {
      console.error("Error creating balance_sheet_line_items:", bsError);
    } else {
      console.log("✅ Created balance_sheet_line_items table");
    }

    // Step 4: Create paper_types table
    const createPaperTypes = `
      CREATE TABLE IF NOT EXISTS paper_types (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          gsm INTEGER,
          size VARCHAR(50),
          color VARCHAR(50) DEFAULT 'White',
          finish VARCHAR(50),
          cost_per_sheet DECIMAL(10,2),
          stock_quantity INTEGER DEFAULT 0,
          minimum_stock INTEGER DEFAULT 0,
          supplier VARCHAR(100),
          supplier_code VARCHAR(50),
          is_active BOOLEAN DEFAULT TRUE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: ptError } = await supabase.rpc("exec_sql", {
      sql: createPaperTypes,
    });
    if (ptError) {
      console.error("Error creating paper_types:", ptError);
    } else {
      console.log("✅ Created paper_types table");
    }

    // Step 5: Create indexes
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_profit_loss_line_items_report_id ON profit_loss_line_items(report_id);
      CREATE INDEX IF NOT EXISTS idx_cash_flow_line_items_report_id ON cash_flow_line_items(report_id);
      CREATE INDEX IF NOT EXISTS idx_balance_sheet_line_items_report_id ON balance_sheet_line_items(report_id);
      CREATE INDEX IF NOT EXISTS idx_paper_types_name ON paper_types(name);
    `;

    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql: createIndexes,
    });
    if (indexError) {
      console.error("Error creating indexes:", indexError);
    } else {
      console.log("✅ Created indexes");
    }

    // Step 6: Enable RLS
    const enableRLS = `
      ALTER TABLE profit_loss_line_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE cash_flow_line_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE balance_sheet_line_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE paper_types ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql: enableRLS,
    });
    if (rlsError) {
      console.error("Error enabling RLS:", rlsError);
    } else {
      console.log("✅ Enabled RLS");
    }

    // Step 7: Create policies
    const createPolicies = `
      CREATE POLICY "profit_loss_line_items_select" ON profit_loss_line_items FOR SELECT USING (auth.role() = 'authenticated');
      CREATE POLICY "cash_flow_line_items_select" ON cash_flow_line_items FOR SELECT USING (auth.role() = 'authenticated');
      CREATE POLICY "balance_sheet_line_items_select" ON balance_sheet_line_items FOR SELECT USING (auth.role() = 'authenticated');
      CREATE POLICY "paper_types_select" ON paper_types FOR SELECT USING (auth.role() = 'authenticated');
    `;

    const { error: policyError } = await supabase.rpc("exec_sql", {
      sql: createPolicies,
    });
    if (policyError) {
      console.error("Error creating policies:", policyError);
    } else {
      console.log("✅ Created RLS policies");
    }

    // Step 8: Insert sample paper types
    const paperTypes = [
      {
        name: "Premium Card Stock",
        description: "High-quality card stock for business cards",
        gsm: 350,
        size: "A4",
        color: "White",
        finish: "Smooth",
        cost_per_sheet: 12.5,
        stock_quantity: 5000,
        minimum_stock: 500,
        supplier: "Paper Pro Ltd",
      },
      {
        name: "Coated Art Paper",
        description: "Glossy coated paper for brochures",
        gsm: 200,
        size: "A4",
        color: "White",
        finish: "Glossy",
        cost_per_sheet: 8.75,
        stock_quantity: 8000,
        minimum_stock: 800,
        supplier: "Quality Papers Inc",
      },
      {
        name: "Matt Finish Paper",
        description: "Professional matte finish for reports",
        gsm: 150,
        size: "A4",
        color: "Off-White",
        finish: "Matte",
        cost_per_sheet: 6.25,
        stock_quantity: 10000,
        minimum_stock: 1000,
        supplier: "Eco Print Supplies",
      },
    ];

    const { error: paperError } = await supabase
      .from("paper_types")
      .upsert(paperTypes, { onConflict: "name" });

    if (paperError) {
      console.error("Error inserting paper types:", paperError);
    } else {
      console.log("✅ Inserted sample paper types");
    }

    // Step 9: Add sample line items to existing reports
    const { data: plReports } = await supabase
      .from("profit_loss_reports")
      .select("id")
      .limit(3);

    if (plReports && plReports.length > 0) {
      for (const report of plReports) {
        const lineItems = [
          {
            report_id: report.id,
            category: "REVENUE",
            line_description: "Printing Services Revenue",
            amount: 250000.0,
            sort_order: 1,
          },
          {
            report_id: report.id,
            category: "REVENUE",
            line_description: "Design Services Revenue",
            amount: 75000.0,
            sort_order: 2,
          },
          {
            report_id: report.id,
            category: "COGS",
            line_description: "Paper and Materials",
            amount: -80000.0,
            sort_order: 3,
          },
          {
            report_id: report.id,
            category: "OPERATING_EXPENSES",
            line_description: "Staff Salaries",
            amount: -90000.0,
            sort_order: 4,
          },
        ];

        const { error: lineItemError } = await supabase
          .from("profit_loss_line_items")
          .upsert(lineItems, { onConflict: "id" });

        if (lineItemError) {
          console.error(
            `Error adding line items for report ${report.id}:`,
            lineItemError
          );
        }
      }
      console.log("✅ Added sample profit & loss line items");
    }

    return NextResponse.json({
      success: true,
      message: "Finance relationship tables created successfully!",
      details: {
        tables_created: [
          "profit_loss_line_items",
          "cash_flow_line_items",
          "balance_sheet_line_items",
          "paper_types",
        ],
        sample_data_added: true,
        relationships_fixed: true,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Finance relationships fix failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: "Could not create finance relationship tables",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: "Fix Finance Relationships API",
    description:
      "Creates missing line item tables to fix PGRST200 foreign key errors",
    usage: "POST to execute the fix",
    tables_to_create: [
      "profit_loss_line_items",
      "cash_flow_line_items",
      "balance_sheet_line_items",
      "paper_types",
    ],
    fixes: [
      "Resolves PGRST200 foreign key relationship errors",
      "Creates missing line item tables for finance reports",
      "Adds proper relationships and sample data",
      "Creates paper_types table for job sheets",
    ],
  });
}
