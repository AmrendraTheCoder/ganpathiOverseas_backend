-- Add more sample jobs for testing the enhanced operator dashboard
-- Run this in Supabase SQL Editor after the main setup
-- Fixed version with correct column names

-- First, add some parties for the new jobs if they don't exist
INSERT INTO parties (
    name, 
    contact_person, 
    phone, 
    email, 
    address, 
    city, 
    state, 
    gst_number, 
    credit_limit, 
    current_balance
) VALUES 
    ('Elegant Weddings Pvt Ltd', 'Priya Mehta', '+91 98765 43230', 'priya@elegantweddings.com', '123 Wedding Street, Bandra', 'Mumbai', 'Maharashtra', '27ELEGW1234F1Z5', 200000, 0),
    ('TechCorp Industries', 'Rahul Sharma', '+91 98765 43231', 'rahul@techcorp.com', '456 Tech Park, Powai', 'Mumbai', 'Maharashtra', '27TECHC5678G2H3', 500000, 0),
    ('Creative Designs Studio', 'Anita Singh', '+91 98765 43232', 'anita@creativedesigns.com', '789 Design Hub, Andheri', 'Mumbai', 'Maharashtra', '27CREAT9012I3J4', 300000, 0),
    ('Flash Marketing Agency', 'Vikram Joshi', '+91 98765 43233', 'vikram@flashmarketing.com', '321 Marketing Lane, Malad', 'Mumbai', 'Maharashtra', '27FLASH3456K5L6', 150000, 0),
    ('Tasty Treats Restaurant', 'Sunita Patel', '+91 98765 43234', 'sunita@tastytreats.com', '654 Food Street, Juhu', 'Mumbai', 'Maharashtra', '27TASTY7890M7N8', 100000, 0),
    ('Global Conference Solutions', 'Arjun Kumar', '+91 98765 43235', 'arjun@globalconf.com', '987 Conference Center, BKC', 'Mumbai', 'Maharashtra', '27GLOBL1357O9P0', 400000, 0)
ON CONFLICT (name) DO NOTHING;

-- Insert more job sheets for the operator to work on
INSERT INTO job_sheets (
    job_number, 
    title, 
    description, 
    party_id, 
    status, 
    priority, 
    quantity, 
    selling_price, 
    order_date, 
    due_date,
    assigned_operator_id, 
    assigned_machine_id, 
    created_by,
    colors,
    paper_type,
    size,
    finishing_requirements
) VALUES 
    (
        'GO25003',
        'Premium Wedding Invitations',
        'Elegant wedding invitations with gold foil and embossing',
        (SELECT id FROM parties WHERE name = 'Elegant Weddings Pvt Ltd' LIMIT 1),
        'pending',
        5,
        500,
        75000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '7 days',
        (SELECT id FROM users WHERE role = 'operator' LIMIT 1),
        (SELECT id FROM machines WHERE machine_type = 'digital' LIMIT 1),
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
        'Gold + Black',
        'Premium Card Stock 350gsm',
        '5x7 inches',
        'Foil Stamping, Embossing, Die Cutting'
    ),
    (
        'GO25004',
        'Corporate Annual Report',
        'Annual report with financial charts and company overview',
        (SELECT id FROM parties WHERE name = 'TechCorp Industries' LIMIT 1),
        'pending',
        4,
        200,
        120000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '5 days',
        (SELECT id FROM users WHERE role = 'operator' LIMIT 1),
        (SELECT id FROM machines WHERE machine_type = 'offset' LIMIT 1),
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
        'CMYK + Spot Colors',
        'Coated Paper 200gsm',
        'A4',
        'Perfect Binding, UV Coating'
    ),
    (
        'GO25005',
        'Product Catalog Design',
        'Full-color product catalog with 50 pages',
        (SELECT id FROM parties WHERE name = 'Creative Designs Studio' LIMIT 1),
        'pending',
        3,
        1000,
        85000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '10 days',
        (SELECT id FROM users WHERE role = 'operator' LIMIT 1),
        (SELECT id FROM machines WHERE machine_type = 'digital' LIMIT 1),
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
        'CMYK',
        'Matt Paper 150gsm',
        'A4',
        'Saddle Stitching, Lamination'
    ),
    (
        'GO25006',
        'Marketing Flyers - Urgent',
        'Promotional flyers for upcoming sale event',
        (SELECT id FROM parties WHERE name = 'Flash Marketing Agency' LIMIT 1),
        'pending',
        5,
        2000,
        35000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '2 days',
        (SELECT id FROM users WHERE role = 'operator' LIMIT 1),
        (SELECT id FROM machines WHERE machine_type = 'offset' LIMIT 1),
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
        'CMYK',
        'Uncoated Paper 120gsm',
        'A5',
        'Cutting, Folding'
    ),
    (
        'GO25007',
        'Restaurant Menu Cards',
        'High-quality menu cards with food photography',
        (SELECT id FROM parties WHERE name = 'Tasty Treats Restaurant' LIMIT 1),
        'pending',
        2,
        300,
        45000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '14 days',
        (SELECT id FROM users WHERE role = 'operator' LIMIT 1),
        (SELECT id FROM machines WHERE machine_type = 'digital' LIMIT 1),
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
        'CMYK + Varnish',
        'Synthetic Paper 250gsm',
        '11x17 inches',
        'UV Coating, Lamination'
    ),
    (
        'GO25008',
        'Conference Banners',
        'Large format banners for tech conference',
        (SELECT id FROM parties WHERE name = 'Global Conference Solutions' LIMIT 1),
        'pending',
        4,
        10,
        28000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '3 days',
        (SELECT id FROM users WHERE role = 'operator' LIMIT 1),
        (SELECT id FROM machines WHERE machine_type = 'finishing' LIMIT 1),
        (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
        'CMYK',
        'Vinyl Banner Material',
        '6x3 feet',
        'Grommets, Hemming'
    );

-- Add some paper types for reference (if paper_types table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'paper_types') THEN
        INSERT INTO paper_types (
            name,
            gsm,
            size,
            color,
            finish,
            cost_per_sheet,
            stock_quantity,
            minimum_stock,
            supplier
        ) VALUES 
            ('Premium Card Stock', 350, 'A4', 'White', 'Smooth', 12.50, 5000, 500, 'Paper Pro Ltd'),
            ('Coated Art Paper', 200, 'A4', 'White', 'Glossy', 8.75, 8000, 800, 'Quality Papers Inc'),
            ('Matt Finish Paper', 150, 'A4', 'Off-White', 'Matt', 6.25, 10000, 1000, 'Eco Print Supplies'),
            ('Synthetic Paper', 250, 'A4', 'White', 'Waterproof', 15.00, 2000, 200, 'Synthetic Solutions'),
            ('Uncoated Paper', 120, 'A4', 'Natural White', 'Uncoated', 4.50, 15000, 1500, 'Basic Papers Co')
        ON CONFLICT (name) DO NOTHING;
    END IF;
END $$;

-- Update party balances after new jobs
UPDATE parties SET current_balance = current_balance + 75000 WHERE name = 'Elegant Weddings Pvt Ltd';
UPDATE parties SET current_balance = current_balance + 120000 WHERE name = 'TechCorp Industries';
UPDATE parties SET current_balance = current_balance + 85000 WHERE name = 'Creative Designs Studio';
UPDATE parties SET current_balance = current_balance + 35000 WHERE name = 'Flash Marketing Agency';
UPDATE parties SET current_balance = current_balance + 45000 WHERE name = 'Tasty Treats Restaurant';
UPDATE parties SET current_balance = current_balance + 28000 WHERE name = 'Global Conference Solutions';

-- Show summary of added jobs
SELECT 
    job_number,
    title,
    status,
    priority,
    quantity,
    selling_price,
    due_date,
    p.name as party_name
FROM job_sheets js
JOIN parties p ON js.party_id = p.id
WHERE job_number LIKE 'GO250%'
ORDER BY job_number; 