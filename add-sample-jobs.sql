-- Add more sample jobs for testing the enhanced operator dashboard
-- Run this in Supabase SQL Editor after the main setup

-- Insert more job sheets for the operator to work on
INSERT INTO job_sheets (
    id, 
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
    assigned_to, 
    machine_id, 
    created_by,
    colors,
    size,
    finishing_requirements
) VALUES 
    (
        'cccccccc-1111-1111-1111-111111111111',
        'GO25003',
        'Premium Wedding Invitations',
        'Elegant wedding invitations with gold foil and embossing',
        '77777777-7777-7777-7777-777777777777',
        'pending',
        5,
        500,
        75000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '7 days',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'Gold + Black',
        '5x7 inches',
        'Foil Stamping, Embossing, Die Cutting'
    ),
    (
        'cccccccc-2222-2222-2222-222222222222',
        'GO25004',
        'Corporate Annual Report',
        'Annual report with financial charts and company overview',
        '88888888-8888-8888-8888-888888888888',
        'pending',
        4,
        200,
        120000,
        CURRENT_DATE,
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
        'cccccccc-3333-3333-3333-333333333333',
        'GO25005',
        'Product Catalog Design',
        'Full-color product catalog with 50 pages',
        '99999999-9999-9999-9999-999999999999',
        'pending',
        3,
        1000,
        85000,
        CURRENT_DATE,
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
        'cccccccc-4444-4444-4444-444444444444',
        'GO25006',
        'Marketing Flyers - Urgent',
        'Promotional flyers for upcoming sale event',
        '22222222-2222-2222-2222-222222222222',
        'pending',
        5,
        2000,
        35000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '2 days',
        '44444444-4444-4444-4444-444444444444',
        '66666666-6666-6666-6666-666666666666',
        '11111111-1111-1111-1111-111111111111',
        'CMYK',
        'Uncoated Paper 120gsm',
        'A5',
        'Cutting, Folding'
    ),
    (
        'cccccccc-5555-5555-5555-555555555555',
        'GO25007',
        'Restaurant Menu Cards',
        'High-quality menu cards with food photography',
        '33333333-3333-3333-3333-333333333333',
        'pending',
        2,
        300,
        45000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '14 days',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555',
        '11111111-1111-1111-1111-111111111111',
        'CMYK + Varnish',
        'Synthetic Paper 250gsm',
        '11x17 inches',
        'UV Coating, Lamination'
    ),
    (
        'cccccccc-6666-6666-6666-666666666666',
        'GO25008',
        'Conference Banners',
        'Large format banners for tech conference',
        '77777777-7777-7777-7777-777777777777',
        'pending',
        4,
        10,
        28000,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '3 days',
        '44444444-4444-4444-4444-444444444444',
        '66666666-6666-6666-6666-666666666666',
        '11111111-1111-1111-1111-111111111111',
        'CMYK',
        'Vinyl Banner Material',
        '6x3 feet',
        'Grommets, Hemming'
    );

-- Add some paper types for reference
INSERT INTO paper_types (
    id,
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
    ('paper-001', 'Premium Card Stock', 350, 'A4', 'White', 'Smooth', 12.50, 5000, 500, 'Paper Pro Ltd'),
    ('paper-002', 'Coated Art Paper', 200, 'A4', 'White', 'Glossy', 8.75, 8000, 800, 'Quality Papers Inc'),
    ('paper-003', 'Matt Finish Paper', 150, 'A4', 'Off-White', 'Matt', 6.25, 10000, 1000, 'Eco Print Supplies'),
    ('paper-004', 'Synthetic Paper', 250, 'A4', 'White', 'Waterproof', 15.00, 2000, 200, 'Synthetic Solutions'),
    ('paper-005', 'Uncoated Paper', 120, 'A4', 'Natural White', 'Uncoated', 4.50, 15000, 1500, 'Basic Papers Co')
ON CONFLICT (id) DO NOTHING;

-- Update party balances after new jobs
UPDATE parties SET current_balance = current_balance + 75000 WHERE id = '77777777-7777-7777-7777-777777777777';
UPDATE parties SET current_balance = current_balance + 120000 WHERE id = '88888888-8888-8888-8888-888888888888';
UPDATE parties SET current_balance = current_balance + 85000 WHERE id = '99999999-9999-9999-9999-999999999999';
UPDATE parties SET current_balance = current_balance + 35000 WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE parties SET current_balance = current_balance + 45000 WHERE id = '33333333-3333-3333-3333-333333333333';

COMMENT ON TABLE paper_types IS 'Available paper types for printing jobs';
COMMENT ON TABLE job_sheets IS 'Updated with new sample jobs for operator testing'; 