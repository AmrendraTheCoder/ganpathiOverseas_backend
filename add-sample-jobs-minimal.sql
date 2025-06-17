-- MINIMAL: Add sample jobs using only essential columns
-- This version should work with any schema variant

-- Insert basic job sheets with minimal required fields
INSERT INTO job_sheets (
    job_number, 
    title, 
    description, 
    party_id, 
    status, 
    priority, 
    quantity, 
    selling_price, 
    due_date
) VALUES 
    (
        'GO25003',
        'Premium Wedding Invitations',
        'Elegant wedding invitations with gold foil and embossing',
        1, -- Assuming party ID 1 exists
        'pending',
        5,
        500,
        75000,
        CURRENT_DATE + INTERVAL '7 days'
    ),
    (
        'GO25004',
        'Corporate Annual Report', 
        'Annual report with financial charts and company overview',
        1, -- Assuming party ID 1 exists
        'pending',
        4,
        200,
        120000,
        CURRENT_DATE + INTERVAL '5 days'
    ),
    (
        'GO25005',
        'Product Catalog Design',
        'Full-color product catalog with 50 pages',
        1, -- Assuming party ID 1 exists
        'pending',
        3,
        1000,
        85000,
        CURRENT_DATE + INTERVAL '10 days'
    ),
    (
        'GO25006',
        'Marketing Flyers - Urgent',
        'Promotional flyers for upcoming sale event',
        1, -- Assuming party ID 1 exists
        'pending',
        5,
        2000,
        35000,
        CURRENT_DATE + INTERVAL '2 days'
    );

-- Check what was added
SELECT 
    job_number,
    title,
    status,
    priority,
    quantity,
    selling_price,
    due_date
FROM job_sheets 
WHERE job_number LIKE 'GO250%'
ORDER BY job_number; 