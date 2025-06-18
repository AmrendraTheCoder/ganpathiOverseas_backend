-- Working Demo Data - Fixed for Current Schema
-- This adds demo data that matches the current database structure

-- Add sample parties (without balance column since it doesn't exist in current schema)
INSERT INTO parties (name, phone, email, address) VALUES 
('Premium Paper Works', '+91-9876543210', 'contact@premiumpapers.com', '123 Business District, Mumbai'),
('Quality Print Solutions', '+91-9876543211', 'info@qualityprint.com', '456 Industrial Area, Delhi'),
('Express Graphics Ltd', '+91-9876543212', 'hello@expressgfx.com', '789 Print Street, Bangalore'),
('Modern Publishing House', '+91-9876543213', 'orders@modernpub.com', '321 Book Market, Chennai'),
('Digital Design Studio', '+91-9876543214', 'studio@digitaldesign.com', '654 Creative Lane, Pune')
ON CONFLICT (name) DO NOTHING;

-- Add sample financial transactions using party names (since we can't guarantee party IDs)
WITH party_lookup AS (
  SELECT id, name FROM parties WHERE name IN ('Premium Paper Works', 'Quality Print Solutions', 'Express Graphics Ltd')
)
INSERT INTO financial_transactions (
  transaction_number, 
  date, 
  type, 
  party_id, 
  description, 
  debit_account_id, 
  credit_account_id, 
  amount, 
  reference_number
)
SELECT 
  'TXN-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  CURRENT_DATE - (ROW_NUMBER() OVER() - 1) * INTERVAL '1 day',
  txn_type,
  party_id,
  description,
  debit_account,
  credit_account,
  amount,
  'REF-' || LPAD((ROW_NUMBER() OVER())::text, 4, '0')
FROM party_lookup
CROSS JOIN (
  VALUES 
    ('revenue', 'Printing job completed', 
     (SELECT id FROM chart_of_accounts WHERE name = 'Accounts Receivable' LIMIT 1),
     (SELECT id FROM chart_of_accounts WHERE name = 'Printing Revenue' LIMIT 1),
     25000.00),
    ('revenue', 'UV coating service', 
     (SELECT id FROM chart_of_accounts WHERE name = 'Accounts Receivable' LIMIT 1),
     (SELECT id FROM chart_of_accounts WHERE name = 'Printing Revenue' LIMIT 1),
     8500.00),
    ('payment', 'Payment received', 
     (SELECT id FROM chart_of_accounts WHERE name = 'Cash' LIMIT 1),
     (SELECT id FROM chart_of_accounts WHERE name = 'Accounts Receivable' LIMIT 1),
     25000.00)
) AS transactions(txn_type, description, debit_account, credit_account, amount)
ON CONFLICT (transaction_number) DO NOTHING;

-- Add sample job sheets with UV and baking values
INSERT INTO job_sheets (
  customer_name, 
  job_description, 
  paper_type, 
  quantity, 
  rate, 
  amount, 
  uv, 
  baking, 
  status,
  created_at
) VALUES 
('Premium Paper Works', 'Business Card Printing with UV Coating', 'Art Card 300 GSM', 1000, 2.50, 2500.00, 500.00, 150.00, 'completed', CURRENT_DATE - INTERVAL '2 days'),
('Quality Print Solutions', 'Brochure Printing', 'Matt Paper 150 GSM', 5000, 1.80, 9000.00, 800.00, 200.00, 'in_progress', CURRENT_DATE - INTERVAL '1 day'),
('Express Graphics Ltd', 'Poster Printing with Special Coating', 'Glossy Paper 200 GSM', 500, 15.00, 7500.00, 1200.00, 300.00, 'pending', CURRENT_DATE),
('Modern Publishing House', 'Book Cover Printing', 'Art Board 250 GSM', 2000, 3.20, 6400.00, 600.00, 180.00, 'completed', CURRENT_DATE - INTERVAL '3 days'),
('Digital Design Studio', 'Label Printing with UV Protection', 'Vinyl Sticker', 10000, 0.85, 8500.00, 900.00, 0.00, 'in_progress', CURRENT_DATE - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- Add sample profit and loss report
INSERT INTO profit_loss_reports (
  report_date,
  period_start,
  period_end,
  total_revenue,
  total_cogs,
  gross_profit,
  total_expenses,
  net_profit,
  report_data
) VALUES (
  CURRENT_DATE,
  DATE_TRUNC('month', CURRENT_DATE),
  CURRENT_DATE,
  42000.00,
  18500.00,
  23500.00,
  12000.00,
  11500.00,
  '{"revenue_breakdown": {"printing": 35000, "uv_coating": 7000}, "expense_breakdown": {"materials": 8500, "labor": 3500}}'
) ON CONFLICT (report_date) DO UPDATE SET
  total_revenue = EXCLUDED.total_revenue,
  total_cogs = EXCLUDED.total_cogs,
  gross_profit = EXCLUDED.gross_profit,
  total_expenses = EXCLUDED.total_expenses,
  net_profit = EXCLUDED.net_profit,
  report_data = EXCLUDED.report_data;

-- Add sample balance sheet report
INSERT INTO balance_sheet_reports (
  report_date,
  total_assets,
  total_liabilities,
  total_equity,
  report_data
) VALUES (
  CURRENT_DATE,
  485000.00,
  125000.00,
  360000.00,
  '{"assets": {"current_assets": 185000, "fixed_assets": 300000}, "liabilities": {"current_liabilities": 85000, "long_term_liabilities": 40000}}'
) ON CONFLICT (report_date) DO UPDATE SET
  total_assets = EXCLUDED.total_assets,
  total_liabilities = EXCLUDED.total_liabilities,
  total_equity = EXCLUDED.total_equity,
  report_data = EXCLUDED.report_data;

-- Add success message
DO $$
BEGIN
  RAISE NOTICE 'Demo data added successfully! Added:';
  RAISE NOTICE '✓ 5 sample parties';
  RAISE NOTICE '✓ Financial transactions';
  RAISE NOTICE '✓ 5 job sheets with UV/baking values';
  RAISE NOTICE '✓ Sample P&L and Balance Sheet reports';
END $$; 