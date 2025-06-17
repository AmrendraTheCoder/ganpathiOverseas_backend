-- CORRECTED: Add sample jobs for testing the enhanced operator dashboard
-- This version uses the correct column names based on the latest schema

-- Insert sample job sheets with correct column structure
INSERT INTO job_sheets (
    job_number, 
    title, 
    description, 
    party_id, 
    status, 
    priority, 
    quantity, 
    selling_price, 
    due_date,
    assigned_to, 
    machine_id, 
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
        '77777777-7777-7777-7777-777777777777',
        'pending',
        5,
        500,
        75000,
        CURRENT_DATE + INTERVAL '7 days',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'Gold + Black',
        'Premium Card Stock 350gsm',
        '5x7 inches',
        'Foil Stamping, Embossing, Die Cutting'
    ),
    (
        'GO25004',
        'Corporate Annual Report',
        'Annual report with financial charts and company overview',
        '88888888-8888-8888-8888-888888888888',
        'pending',
        4,
        200,
        120000,
        CURRENT_DATE + INTERVAL '5 days',
        '44444444-4444-4444-4444-444444444444',
        '66666666-6666-6666-6666-666666666666',
        '11111111-1111-1111-1111-111111111111',
        'CMYK + Spot Colors',
        'Coated Paper 200gsm',
        'A4',
        'Perfect Binding, UV Coating'
    ),
    (
        'GO25005',
        'Product Catalog Design',
        'Full-color product catalog with 50 pages',
        '99999999-9999-9999-9999-999999999999',
        'pending',
        3,
        1000,
        85000,
        CURRENT_DATE + INTERVAL '10 days',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'CMYK',
        'Matt Paper 150gsm',
        'A4',
        'Saddle Stitching, Lamination'
    ),
    (
        'GO25006',
        'Marketing Flyers - Urgent',
        'Promotional flyers for upcoming sale event',
        '22222222-2222-2222-2222-222222222222',
        'pending',
        5,
        2000,
        35000,
        CURRENT_DATE + INTERVAL '2 days',
        '44444444-4444-4444-4444-444444444444',
        '66666666-6666-6666-6666-666666666666',
        '11111111-1111-1111-1111-111111111111',
        'CMYK',
        'Uncoated Paper 120gsm',
        'A5',
        'Cutting, Folding'
    );

-- Simple verification query
SELECT job_number, title, status, priority FROM job_sheets WHERE job_number LIKE 'GO250%'; 