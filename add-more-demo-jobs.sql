-- Add 10 more demo jobs to showcase UI functionality
-- Make sure to run this after the main database setup

INSERT INTO job_sheets (
  id, job_number, title, description, party_id, status, priority, quantity, 
  colors, paper_type, size, finishing_requirements, estimated_cost, actual_cost, 
  selling_price, order_date, due_date, started_at, completed_at, assigned_to, 
  machine_id, special_instructions, internal_notes, created_by, created_at, updated_at
) VALUES 

-- Job 5: Corporate Annual Report
('5', 'JOB000005', 'Corporate Annual Report', 
 '150 page annual report with color graphs and charts', 
 '11111111-1111-1111-1111-111111111111', 'pending', 5, 250, 
 '4+4', 'Matt Art Paper 130gsm', 'A4 Portrait', 'Perfect Binding, Lamination', 
 45000, 0, 65000, '2024-01-16', '2024-02-05', NULL, NULL, 
 '44444444-4444-4444-4444-444444444444', '1', 
 'High quality print, color accuracy critical for charts', 
 'Annual report - deadline cannot be missed', 
 '11111111-1111-1111-1111-111111111111', '2024-01-16T14:30:00Z', '2024-01-16T14:30:00Z'),

-- Job 6: Product Catalog Design  
('6', 'JOB000006', 'Product Catalog Design',
 '48 page full-color product catalog for electronics store',
 '22222222-2222-2222-2222-222222222222', 'in_progress', 3, 500,
 '4+4', 'Glossy Art Paper 150gsm', 'A4 Landscape', 'Saddle Stitching, UV Coating',
 28000, 0, 42000, '2024-01-17', '2024-01-28', '2024-01-18T09:15:00Z', NULL,
 '44444444-4444-4444-4444-444444444444', '1',
 'Product images must be sharp and vibrant',
 'Client is very particular about image quality',
 '22222222-2222-2222-2222-222222222222', '2024-01-17T11:20:00Z', '2024-01-18T09:15:00Z'),

-- Job 7: Restaurant Menu Cards
('7', 'JOB000007', 'Restaurant Menu Cards',
 '200 laminated menu cards for upscale restaurant',
 '33333333-3333-3333-3333-333333333333', 'completed', 2, 200,
 '4+4', 'Card Stock 350gsm', '11" x 17"', 'Thermal Lamination, Corner Rounding',
 8500, 8200, 13500, '2024-01-08', '2024-01-15', '2024-01-09T10:00:00Z', '2024-01-14T16:30:00Z',
 '55555555-5555-5555-5555-555555555555', '2',
 'Food images must look appetizing, accurate colors essential',
 'Regular customer, monthly menu updates needed',
 '22222222-2222-2222-2222-222222222222', '2024-01-08T13:45:00Z', '2024-01-14T16:30:00Z'),

-- Job 8: Event Posters
('8', 'JOB000008', 'Event Posters',
 '50 large format posters for music festival',
 '11111111-1111-1111-1111-111111111111', 'pending', 4, 50,
 '4+0', 'Photo Paper 200gsm', '24" x 36"', 'Large Format Printing, Weather Resistant Coating',
 12000, 0, 18000, '2024-01-18', '2024-01-25', NULL, NULL,
 '44444444-4444-4444-4444-444444444444', NULL,
 'Vibrant colors needed, outdoor display quality',
 'Rush job for weekend event',
 '11111111-1111-1111-1111-111111111111', '2024-01-18T16:00:00Z', '2024-01-18T16:00:00Z'),

-- Job 9: Company Letterheads
('9', 'JOB000009', 'Company Letterheads',
 '2000 premium letterheads with embossed logo',
 '22222222-2222-2222-2222-222222222222', 'completed', 1, 2000,
 '2+0', 'Linen Textured Paper 120gsm', 'A4', 'Embossing, Premium Paper Stock',
 15000, 14500, 22000, '2024-01-05', '2024-01-12', '2024-01-06T08:00:00Z', '2024-01-11T17:00:00Z',
 '55555555-5555-5555-5555-555555555555', '1',
 'Logo embossing must be crisp and well-aligned',
 'Premium client, ensure top quality always',
 '11111111-1111-1111-1111-111111111111', '2024-01-05T10:30:00Z', '2024-01-11T17:00:00Z'),

-- Job 10: Training Manual Booklets
('10', 'JOB000010', 'Training Manual Booklets',
 '100 copies of 80-page employee training manual',
 '33333333-3333-3333-3333-333333333333', 'in_progress', 2, 100,
 '1+1', 'Bond Paper 80gsm', 'A4', 'Perfect Binding, Plastic Coil',
 18000, 0, 25000, '2024-01-19', '2024-01-30', '2024-01-20T09:00:00Z', NULL,
 '44444444-4444-4444-4444-444444444444', '1',
 'Text must be clearly readable, consistent page margins',
 'Educational content, ensure professional binding',
 '22222222-2222-2222-2222-222222222222', '2024-01-19T14:15:00Z', '2024-01-20T09:00:00Z'),

-- Job 11: Packaging Labels
('11', 'JOB000011', 'Packaging Labels',
 '5000 product labels with barcode and nutrition info',
 '11111111-1111-1111-1111-111111111111', 'pending', 3, 5000,
 '4+0', 'Vinyl Sticker Material', '4" x 3"', 'Die Cutting, Adhesive Backing',
 22000, 0, 32000, '2024-01-20', '2024-02-02', NULL, NULL,
 '55555555-5555-5555-5555-555555555555', NULL,
 'Barcode must be scannable, FDA compliant nutrition facts',
 'Food industry client, accuracy is critical',
 '11111111-1111-1111-1111-111111111111', '2024-01-20T11:45:00Z', '2024-01-20T11:45:00Z'),

-- Job 12: Medical Report Forms
('12', 'JOB000012', 'Medical Report Forms',
 '500 carbonless medical report forms in triplicate',
 '22222222-2222-2222-2222-222222222222', 'completed', 4, 500,
 '2+1', 'NCR 3-Part Forms', '8.5" x 11"', 'Sequential Numbering, Perforated Edges',
 12000, 11800, 17500, '2024-01-10', '2024-01-20', '2024-01-11T14:00:00Z', '2024-01-18T15:30:00Z',
 '44444444-4444-4444-4444-444444444444', '1',
 'Medical standards compliance required, clean carbon transfer',
 'Healthcare client, precision is essential',
 '22222222-2222-2222-2222-222222222222', '2024-01-10T16:20:00Z', '2024-01-18T15:30:00Z'),

-- Job 13: Conference Badges
('13', 'JOB000013', 'Conference Badges',
 '300 conference name badges with lanyards',
 '33333333-3333-3333-3333-333333333333', 'pending', 5, 300,
 '4+0', 'PVC Card Stock', '3.5" x 2.25"', 'Lamination, Hole Punching, Lanyard Attachment',
 9000, 0, 13500, '2024-01-21', '2024-01-27', NULL, NULL,
 '55555555-5555-5555-5555-555555555555', NULL,
 'Urgent for tech conference, professional appearance required',
 'High priority - conference is next week',
 '11111111-1111-1111-1111-111111111111', '2024-01-21T09:30:00Z', '2024-01-21T09:30:00Z'),

-- Job 14: Sales Presentation Folders
('14', 'JOB000014', 'Sales Presentation Folders',
 '200 custom presentation folders with business card slots',
 '11111111-1111-1111-1111-111111111111', 'in_progress', 2, 200,
 '4+4', 'Cover Stock 300gsm', '9" x 12"', 'Die Cutting, Gluing, Business Card Slits',
 16000, 0, 24000, '2024-01-16', '2024-01-26', '2024-01-17T13:00:00Z', NULL,
 '44444444-4444-4444-4444-444444444444', '2',
 'Professional finish, precise die cutting for card slots',
 'Sales team needs these for trade show presentation',
 '22222222-2222-2222-2222-222222222222', '2024-01-16T15:45:00Z', '2024-01-17T13:00:00Z');

-- Verify the insert
SELECT COUNT(*) as total_jobs FROM job_sheets;
SELECT job_number, title, status, priority, assigned_to FROM job_sheets ORDER BY created_at DESC; 