-- =====================================================
-- ADD MORE COMPREHENSIVE DEMO DATA
-- Run this after the main database setup is complete
-- =====================================================

-- Insert more demo parties
INSERT INTO parties (name, contact_person, email, phone, party_type, credit_limit, address) VALUES
('Tech Solutions India', 'Rahul Sharma', 'rahul@techsolutions.in', '+91 98765 43210', 'customer', 500000, 'Tech Park, Bangalore'),
('Digital Print House', 'Meera Patel', 'meera@digitalprint.com', '+91 98765 43211', 'customer', 300000, 'MG Road, Mumbai'),
('Educational Publishers', 'Dr. Anil Kumar', 'anil@edubooks.com', '+91 98765 43212', 'customer', 750000, 'Knowledge City, Pune'),
('Paper Supply Co', 'Suresh Gupta', 'suresh@papersupply.com', '+91 98765 43213', 'supplier', 200000, 'Industrial Area, Delhi'),
('Ink Solutions Ltd', 'Priya Singh', 'priya@inksol.com', '+91 98765 43214', 'supplier', 150000, 'Chemical Complex, Chennai'),
('Creative Designs Studio', 'Arjun Reddy', 'arjun@creativedesigns.in', '+91 98765 43215', 'customer', 400000, 'IT Corridor, Hyderabad'),
('Marketing Materials Inc', 'Kavya Nair', 'kavya@marketing.com', '+91 98765 43216', 'customer', 350000, 'Business District, Kochi'),
('Startup Hub', 'Vikram Joshi', 'vikram@startuphub.in', '+91 98765 43217', 'customer', 200000, 'Startup Park, Gurgaon')
ON CONFLICT (email) DO NOTHING;

-- Get account and party IDs for demo transactions
DO $$
DECLARE
    cash_account_id UUID;
    bank_account_id UUID;
    ar_account_id UUID;
    ap_account_id UUID;
    printing_revenue_id UUID;
    design_revenue_id UUID;
    digital_revenue_id UUID;
    paper_cost_id UUID;
    ink_cost_id UUID;
    salary_expense_id UUID;
    rent_expense_id UUID;
    electricity_expense_id UUID;
    marketing_expense_id UUID;
    maintenance_expense_id UUID;
    
    -- Party IDs
    tech_solutions_id UUID;
    digital_print_id UUID;
    edu_publishers_id UUID;
    paper_supply_id UUID;
    ink_solutions_id UUID;
    creative_designs_id UUID;
    
    -- User ID
    admin_user_id UUID;
BEGIN
    -- Get account IDs
    SELECT id INTO cash_account_id FROM chart_of_accounts WHERE account_code = '1000';
    SELECT id INTO bank_account_id FROM chart_of_accounts WHERE account_code = '1001';
    SELECT id INTO ar_account_id FROM chart_of_accounts WHERE account_code = '1100';
    SELECT id INTO ap_account_id FROM chart_of_accounts WHERE account_code = '2000';
    SELECT id INTO printing_revenue_id FROM chart_of_accounts WHERE account_code = '4000';
    SELECT id INTO design_revenue_id FROM chart_of_accounts WHERE account_code = '4001';
    SELECT id INTO digital_revenue_id FROM chart_of_accounts WHERE account_code = '4002';
    SELECT id INTO paper_cost_id FROM chart_of_accounts WHERE account_code = '5000';
    SELECT id INTO ink_cost_id FROM chart_of_accounts WHERE account_code = '5001';
    SELECT id INTO salary_expense_id FROM chart_of_accounts WHERE account_code = '6100';
    SELECT id INTO rent_expense_id FROM chart_of_accounts WHERE account_code = '6000';
    SELECT id INTO electricity_expense_id FROM chart_of_accounts WHERE account_code = '6001';
    SELECT id INTO marketing_expense_id FROM chart_of_accounts WHERE account_code = '6300';
    SELECT id INTO maintenance_expense_id FROM chart_of_accounts WHERE account_code = '6200';
    
    -- Get party IDs
    SELECT id INTO tech_solutions_id FROM parties WHERE email = 'rahul@techsolutions.in';
    SELECT id INTO digital_print_id FROM parties WHERE email = 'meera@digitalprint.com';
    SELECT id INTO edu_publishers_id FROM parties WHERE email = 'anil@edubooks.com';
    SELECT id INTO paper_supply_id FROM parties WHERE email = 'suresh@papersupply.com';
    SELECT id INTO ink_solutions_id FROM parties WHERE email = 'priya@inksol.com';
    SELECT id INTO creative_designs_id FROM parties WHERE email = 'arjun@creativedesigns.in';
    
    -- Get admin user
    SELECT id INTO admin_user_id FROM users LIMIT 1;

    -- Only proceed if we have the required data
    IF tech_solutions_id IS NOT NULL AND printing_revenue_id IS NOT NULL THEN
        
        -- December 2024 Transactions
        INSERT INTO financial_transactions (
            transaction_date, reference_type, account_id, debit_amount, credit_amount, 
            description, status, party_id, created_by
        ) VALUES
        
        -- Revenue Transactions - December
        ('2024-12-01', 'JOB_SHEET', ar_account_id, 85000, 0, 'Invoice - Business Cards & Letterheads - Tech Solutions India', 'APPROVED', tech_solutions_id, admin_user_id),
        ('2024-12-01', 'JOB_SHEET', printing_revenue_id, 0, 85000, 'Revenue - Business Cards & Letterheads - Tech Solutions India', 'APPROVED', tech_solutions_id, admin_user_id),
        
        ('2024-12-03', 'JOB_SHEET', ar_account_id, 120000, 0, 'Invoice - Brochure Design & Printing - Digital Print House', 'APPROVED', digital_print_id, admin_user_id),
        ('2024-12-03', 'JOB_SHEET', design_revenue_id, 0, 45000, 'Revenue - Brochure Design - Digital Print House', 'APPROVED', digital_print_id, admin_user_id),
        ('2024-12-03', 'JOB_SHEET', printing_revenue_id, 0, 75000, 'Revenue - Brochure Printing - Digital Print House', 'APPROVED', digital_print_id, admin_user_id),
        
        ('2024-12-05', 'JOB_SHEET', ar_account_id, 250000, 0, 'Invoice - Educational Books Printing - Educational Publishers', 'APPROVED', edu_publishers_id, admin_user_id),
        ('2024-12-05', 'JOB_SHEET', printing_revenue_id, 0, 250000, 'Revenue - Educational Books Printing - Educational Publishers', 'APPROVED', edu_publishers_id, admin_user_id),
        
        ('2024-12-07', 'JOB_SHEET', ar_account_id, 95000, 0, 'Invoice - Digital Printing Services - Creative Designs Studio', 'APPROVED', creative_designs_id, admin_user_id),
        ('2024-12-07', 'JOB_SHEET', digital_revenue_id, 0, 95000, 'Revenue - Digital Printing Services - Creative Designs Studio', 'APPROVED', creative_designs_id, admin_user_id),
        
        -- Payment Receipts
        ('2024-12-02', 'PAYMENT', bank_account_id, 85000, 0, 'Payment received - Tech Solutions India', 'APPROVED', tech_solutions_id, admin_user_id),
        ('2024-12-02', 'PAYMENT', ar_account_id, 0, 85000, 'Payment received - Tech Solutions India', 'APPROVED', tech_solutions_id, admin_user_id),
        
        ('2024-12-06', 'PAYMENT', bank_account_id, 120000, 0, 'Payment received - Digital Print House', 'APPROVED', digital_print_id, admin_user_id),
        ('2024-12-06', 'PAYMENT', ar_account_id, 0, 120000, 'Payment received - Digital Print House', 'APPROVED', digital_print_id, admin_user_id),
        
        ('2024-12-10', 'PAYMENT', bank_account_id, 125000, 0, 'Partial payment - Educational Publishers', 'APPROVED', edu_publishers_id, admin_user_id),
        ('2024-12-10', 'PAYMENT', ar_account_id, 0, 125000, 'Partial payment - Educational Publishers', 'APPROVED', edu_publishers_id, admin_user_id),
        
        -- Expense Transactions - Purchases
        ('2024-12-02', 'INVOICE', ap_account_id, 0, 45000, 'Paper purchase - Paper Supply Co', 'APPROVED', paper_supply_id, admin_user_id),
        ('2024-12-02', 'INVOICE', paper_cost_id, 45000, 0, 'Paper purchase - Paper Supply Co', 'APPROVED', paper_supply_id, admin_user_id),
        
        ('2024-12-04', 'INVOICE', ap_account_id, 0, 28000, 'Ink cartridges purchase - Ink Solutions Ltd', 'APPROVED', ink_solutions_id, admin_user_id),
        ('2024-12-04', 'INVOICE', ink_cost_id, 28000, 0, 'Ink cartridges purchase - Ink Solutions Ltd', 'APPROVED', ink_solutions_id, admin_user_id),
        
        -- Expense Payments
        ('2024-12-03', 'PAYMENT', ap_account_id, 45000, 0, 'Payment to Paper Supply Co', 'APPROVED', paper_supply_id, admin_user_id),
        ('2024-12-03', 'PAYMENT', bank_account_id, 0, 45000, 'Payment to Paper Supply Co', 'APPROVED', paper_supply_id, admin_user_id),
        
        ('2024-12-05', 'PAYMENT', ap_account_id, 28000, 0, 'Payment to Ink Solutions Ltd', 'APPROVED', ink_solutions_id, admin_user_id),
        ('2024-12-05', 'PAYMENT', bank_account_id, 0, 28000, 'Payment to Ink Solutions Ltd', 'APPROVED', ink_solutions_id, admin_user_id),
        
        -- Operating Expenses
        ('2024-12-01', 'ADJUSTMENT', rent_expense_id, 50000, 0, 'December office rent', 'APPROVED', NULL, admin_user_id),
        ('2024-12-01', 'ADJUSTMENT', bank_account_id, 0, 50000, 'December office rent payment', 'APPROVED', NULL, admin_user_id),
        
        ('2024-12-01', 'ADJUSTMENT', salary_expense_id, 125000, 0, 'December staff salaries', 'APPROVED', NULL, admin_user_id),
        ('2024-12-01', 'ADJUSTMENT', bank_account_id, 0, 125000, 'December staff salary payment', 'APPROVED', NULL, admin_user_id),
        
        ('2024-12-05', 'ADJUSTMENT', electricity_expense_id, 15000, 0, 'December electricity bill', 'APPROVED', NULL, admin_user_id),
        ('2024-12-05', 'ADJUSTMENT', bank_account_id, 0, 15000, 'December electricity payment', 'APPROVED', NULL, admin_user_id),
        
        ('2024-12-08', 'ADJUSTMENT', marketing_expense_id, 25000, 0, 'Digital marketing campaign', 'APPROVED', NULL, admin_user_id),
        ('2024-12-08', 'ADJUSTMENT', bank_account_id, 0, 25000, 'Digital marketing payment', 'APPROVED', NULL, admin_user_id),
        
        ('2024-12-12', 'ADJUSTMENT', maintenance_expense_id, 18000, 0, 'Printing machine maintenance', 'APPROVED', NULL, admin_user_id),
        ('2024-12-12', 'ADJUSTMENT', cash_account_id, 0, 18000, 'Maintenance payment in cash', 'APPROVED', NULL, admin_user_id);
        
        RAISE NOTICE '✅ Inserted comprehensive demo financial transactions for December 2024';
    ELSE
        RAISE NOTICE '⚠️ Could not insert demo transactions: missing required data';
    END IF;
END $$;

-- Insert more job sheets with UV and baking values
INSERT INTO job_sheets (
    customer_name, contact_person, email, phone, 
    paper_type, paper_size, quantity, colors,
    uv, baking, lamination, binding,
    total_amount, status, delivery_date,
    created_at, updated_at
) VALUES
('Tech Solutions India', 'Rahul Sharma', 'rahul@techsolutions.in', '+91 98765 43210', 
 'Art Paper 300gsm', 'A4', 5000, 4, 
 8.50, 0.00, 'Matt', 'Perfect Binding',
 85000, 'completed', '2024-12-02', 
 '2024-12-01 09:00:00', '2024-12-02 16:30:00'),

('Digital Print House', 'Meera Patel', 'meera@digitalprint.com', '+91 98765 43211', 
 'Coated Paper 250gsm', 'A5', 10000, 4, 
 12.75, 6.25, 'Gloss', 'Saddle Stitch',
 120000, 'completed', '2024-12-06', 
 '2024-12-03 10:30:00', '2024-12-06 14:00:00'),

('Educational Publishers', 'Dr. Anil Kumar', 'anil@edubooks.com', '+91 98765 43212', 
 'Book Paper 80gsm', 'A4', 25000, 2, 
 0.00, 0.00, 'None', 'Perfect Binding',
 250000, 'in_progress', '2024-12-15', 
 '2024-12-05 11:15:00', '2024-12-12 09:45:00'),

('Creative Designs Studio', 'Arjun Reddy', 'arjun@creativedesigns.in', '+91 98765 43215', 
 'Photo Paper 200gsm', 'A3', 2500, 6, 
 15.00, 8.75, 'UV Coating', 'Wire-O Binding',
 95000, 'completed', '2024-12-09', 
 '2024-12-07 14:20:00', '2024-12-09 17:00:00'),

('Marketing Materials Inc', 'Kavya Nair', 'kavya@marketing.com', '+91 98765 43216', 
 'Card Stock 350gsm', 'Custom', 7500, 4, 
 10.25, 4.50, 'Spot UV', 'Die Cut',
 135000, 'pending', '2024-12-20', 
 '2024-12-10 08:45:00', '2024-12-10 08:45:00'),

('Startup Hub', 'Vikram Joshi', 'vikram@startuphub.in', '+91 98765 43217', 
 'Recycled Paper 150gsm', 'A4', 3000, 2, 
 0.00, 0.00, 'None', 'Saddle Stitch',
 45000, 'quoted', '2024-12-25', 
 '2024-12-12 15:30:00', '2024-12-12 15:30:00');

-- Insert more profit and loss reports
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM users LIMIT 1;
    
    INSERT INTO profit_loss_reports (
        report_name, period_start, period_end, 
        total_revenue, total_expenses, cost_of_goods_sold,
        gross_profit, operating_expenses, operating_profit,
        net_profit, generated_by, status
    ) VALUES 
    (
        'November 2024 P&L Report',
        '2024-11-01',
        '2024-11-30',
        485000.00,
        297000.00,
        156000.00,
        329000.00,
        141000.00,
        188000.00,
        188000.00,
        admin_user_id,
        'FINAL'
    ),
    (
        'December 2024 P&L Report (Partial)',
        '2024-12-01',
        '2024-12-15',
        650000.00,
        358000.00,
        185000.00,
        465000.00,
        173000.00,
        292000.00,
        292000.00,
        admin_user_id,
        'DRAFT'
    );
    
    -- Insert more balance sheet reports
    INSERT INTO balance_sheet_reports (
        report_name, as_of_date,
        total_assets, current_assets, fixed_assets,
        total_liabilities, current_liabilities, long_term_liabilities,
        total_equity, retained_earnings, generated_by, status
    ) VALUES 
    (
        'November 2024 Balance Sheet',
        '2024-11-30',
        1250000.00,
        650000.00,
        600000.00,
        485000.00,
        285000.00,
        200000.00,
        765000.00,
        565000.00,
        admin_user_id,
        'FINAL'
    ),
    (
        'December 2024 Balance Sheet (Interim)',
        '2024-12-15',
        1485000.00,
        785000.00,
        700000.00,
        545000.00,
        345000.00,
        200000.00,
        940000.00,
        740000.00,
        admin_user_id,
        'DRAFT'
    );
    
    -- Insert cash flow reports
    INSERT INTO cash_flow_reports (
        report_name, period_start, period_end,
        opening_cash_balance, operating_cash_flow, investing_cash_flow,
        financing_cash_flow, net_cash_flow, closing_cash_balance,
        generated_by, status
    ) VALUES 
    (
        'November 2024 Cash Flow',
        '2024-11-01',
        '2024-11-30',
        125000.00,
        185000.00,
        -45000.00,
        -25000.00,
        115000.00,
        240000.00,
        admin_user_id,
        'FINAL'
    ),
    (
        'December 2024 Cash Flow (Partial)',
        '2024-12-01',
        '2024-12-15',
        240000.00,
        285000.00,
        -35000.00,
        0.00,
        250000.00,
        490000.00,
        admin_user_id,
        'DRAFT'
    );
    
    RAISE NOTICE '✅ Inserted additional financial reports';
END $$;

-- Update party balances based on transactions
UPDATE parties SET 
    current_balance = (
        SELECT COALESCE(SUM(ft.debit_amount - ft.credit_amount), 0)
        FROM financial_transactions ft 
        WHERE ft.party_id = parties.id AND ft.status = 'APPROVED'
    ),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT party_id 
    FROM financial_transactions 
    WHERE party_id IS NOT NULL
);

-- Final success message
SELECT 
    '🎉 COMPREHENSIVE DEMO DATA ADDED! 🎉' as result,
    (SELECT COUNT(*) FROM parties) as total_parties,
    (SELECT COUNT(*) FROM financial_transactions) as total_transactions,
    (SELECT COUNT(*) FROM job_sheets) as total_job_sheets,
    (SELECT COUNT(*) FROM profit_loss_reports) as total_pl_reports,
    (SELECT COUNT(*) FROM balance_sheet_reports) as total_bs_reports,
    (SELECT COUNT(*) FROM cash_flow_reports) as total_cf_reports; 