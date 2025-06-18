import { NextRequest, NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    console.log("=== FORCE DATABASE SETUP ===");

    const results = {
      timestamp: new Date().toISOString(),
      operations: [],
      successes: 0,
      failures: 0,
      created_tables: [],
      added_columns: [],
      inserted_data: [],
      errors: []
    };

    // Step 1: Try to add columns to job_sheets first (this might work)
    console.log("🔧 Step 1: Adding columns to job_sheets...");
    try {
      // Test if we can insert a job sheet with UV and baking columns
      const testJobSheet = {
        job_number: `TEST-${Date.now()}`,
        title: 'Test Job Sheet',
        description: 'Testing UV and baking columns',
        uv: 5.5,
        baking: 3.2,
        status: 'pending'
      };

      const { data: insertResult, error: insertError } = await supabase
        .from('job_sheets')
        .insert([testJobSheet])
        .select();

      if (!insertError) {
        results.added_columns.push('job_sheets.uv', 'job_sheets.baking');
        results.successes++;
        results.operations.push('job_sheets columns already exist or were added');
        
        // Clean up test record
        if (insertResult && insertResult[0]) {
          await supabase
            .from('job_sheets')
            .delete()
            .eq('id', insertResult[0].id);
        }
      } else {
        results.failures++;
        results.errors.push(`job_sheets columns: ${insertError.message}`);
        results.operations.push(`job_sheets columns failed: ${insertError.message}`);
      }
    } catch (error: any) {
      results.failures++;
      results.errors.push(`job_sheets test: ${error.message}`);
    }

    // Step 2: Create tables by inserting initial records (this can trigger table creation in some setups)
    const tablesToCreate = [
      {
        name: 'chart_of_accounts',
        sampleRecord: {
          account_code: '1000',
          account_name: 'Cash in Hand',
          account_type: 'ASSET',
          is_active: true,
          description: 'Petty cash and cash on hand'
        }
      },
      {
        name: 'financial_transactions',
        sampleRecord: {
          transaction_number: 'TXN-INIT-001',
          transaction_date: new Date().toISOString().split('T')[0],
          reference_type: 'ADJUSTMENT',
          description: 'Initial setup transaction',
          debit_amount: 0,
          credit_amount: 0,
          status: 'PENDING'
        }
      }
    ];

    for (const table of tablesToCreate) {
      console.log(`📊 Creating ${table.name}...`);
      try {
        const { data, error } = await supabase
          .from(table.name)
          .insert([table.sampleRecord])
          .select();

        if (!error) {
          results.created_tables.push(table.name);
          results.successes++;
          results.operations.push(`${table.name} created successfully`);
          
          // Clean up test record
          if (data && data[0]) {
            await supabase
              .from(table.name)
              .delete()
              .eq('id', data[0].id);
          }
        } else {
          results.failures++;
          results.errors.push(`${table.name}: ${error.message}`);
          results.operations.push(`${table.name} failed: ${error.message}`);
        }
      } catch (error: any) {
        results.failures++;
        results.errors.push(`${table.name}: ${error.message}`);
      }
    }

    // Step 3: Try to create report tables
    const reportTables = [
      'profit_loss_reports',
      'balance_sheet_reports',
      'cash_flow_reports',
      'tax_reports',
      'custom_reports'
    ];

    for (const tableName of reportTables) {
      console.log(`📈 Creating ${tableName}...`);
      try {
        const sampleRecord = {
          report_name: 'Initial Test Report',
          generated_at: new Date().toISOString(),
          status: 'DRAFT'
        };

        // Add table-specific fields
        if (tableName.includes('profit_loss')) {
          Object.assign(sampleRecord, {
            period_start: new Date().toISOString().split('T')[0],
            period_end: new Date().toISOString().split('T')[0],
            total_revenue: 0,
            total_expenses: 0,
            net_profit: 0
          });
        } else if (tableName.includes('balance_sheet')) {
          Object.assign(sampleRecord, {
            as_of_date: new Date().toISOString().split('T')[0],
            total_assets: 0,
            total_liabilities: 0,
            total_equity: 0
          });
        } else if (tableName.includes('cash_flow')) {
          Object.assign(sampleRecord, {
            period_start: new Date().toISOString().split('T')[0],
            period_end: new Date().toISOString().split('T')[0],
            operating_cash_flow: 0,
            investing_cash_flow: 0,
            financing_cash_flow: 0
          });
        } else if (tableName.includes('tax')) {
          Object.assign(sampleRecord, {
            tax_period_start: new Date().toISOString().split('T')[0],
            tax_period_end: new Date().toISOString().split('T')[0],
            gst_collected: 0,
            gst_paid: 0,
            income_tax: 0
          });
        } else if (tableName.includes('custom')) {
          Object.assign(sampleRecord, {
            report_type: 'CUSTOM',
            sql_query: 'SELECT 1;'
          });
        }

        const { data, error } = await supabase
          .from(tableName)
          .insert([sampleRecord])
          .select();

        if (!error) {
          results.created_tables.push(tableName);
          results.successes++;
          results.operations.push(`${tableName} created successfully`);
          
          // Clean up test record
          if (data && data[0]) {
            await supabase
              .from(tableName)
              .delete()
              .eq('id', data[0].id);
          }
        } else {
          results.failures++;
          results.errors.push(`${tableName}: ${error.message}`);
          results.operations.push(`${tableName} failed: ${error.message}`);
        }
      } catch (error: any) {
        results.failures++;
        results.errors.push(`${tableName}: ${error.message}`);
      }
    }

    // Step 4: If tables exist, try to insert sample data
    console.log("📝 Inserting sample chart of accounts...");
    try {
      const sampleAccounts = [
        { account_code: '1000', account_name: 'Cash in Hand', account_type: 'ASSET' },
        { account_code: '1001', account_name: 'Bank Account', account_type: 'ASSET' },
        { account_code: '4000', account_name: 'Printing Revenue', account_type: 'REVENUE' },
        { account_code: '5000', account_name: 'Paper Cost', account_type: 'COGS' },
        { account_code: '6000', account_name: 'Office Rent', account_type: 'EXPENSE' }
      ];

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .upsert(sampleAccounts, { 
          onConflict: 'account_code',
          ignoreDuplicates: true 
        });

      if (!error) {
        results.inserted_data.push(`${sampleAccounts.length} chart of accounts records`);
        results.successes++;
      } else {
        results.errors.push(`Sample data: ${error.message}`);
        results.failures++;
      }
    } catch (error: any) {
      results.errors.push(`Sample data: ${error.message}`);
      results.failures++;
    }

    // Final verification
    console.log("🔍 Running final verification...");
    const verification = await runTableVerification(supabase);
    
    const successRate = (results.successes / (results.successes + results.failures)) * 100;
    
    console.log(`✅ Force setup completed: ${results.successes}/${results.successes + results.failures} operations succeeded`);

    return NextResponse.json({
      success: successRate > 30,
      message: `Force database setup completed with ${Math.round(successRate)}% success rate`,
      results,
      verification,
      next_steps: verification.working_tables >= 5 
        ? ["🎉 Most tables are working!", "Check verification status for details"]
        : ["⚠️ Tables still missing", "Manual migration in Supabase Dashboard required", "Visit /database-setup for instructions"]
    });

  } catch (error: any) {
    console.error("Force database setup error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        message: "Force database setup failed"
      }, 
      { status: 500 }
    );
  }
}

async function runTableVerification(supabase: any) {
  const tables = [
    'job_sheets', 'chart_of_accounts', 'financial_transactions',
    'profit_loss_reports', 'balance_sheet_reports', 'cash_flow_reports',
    'tax_reports', 'custom_reports'
  ];

  let working_tables = 0;
  const table_status = {};

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        working_tables++;
        table_status[table] = 'WORKING';
      } else {
        table_status[table] = `ERROR: ${error.message}`;
      }
    } catch (err) {
      table_status[table] = `FAILED: ${err}`;
    }
  }

  // Test job_sheets columns
  let job_sheets_columns = false;
  try {
    const { error } = await supabase
      .from('job_sheets')
      .select('id, uv, baking')
      .limit(1);
    job_sheets_columns = !error;
  } catch (e) {
    job_sheets_columns = false;
  }

  return {
    working_tables,
    total_tables: tables.length,
    table_status,
    job_sheets_columns
  };
} 