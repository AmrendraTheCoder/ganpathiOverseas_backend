-- Fix for balance column error in parties table
-- This script adds sample parties using only existing columns

-- Simple test - add parties without balance column
INSERT INTO parties (name, phone, email, address) VALUES 
('Test Company A', '+91-9876543210', 'test@companya.com', '123 Test Street, Mumbai'),
('Test Company B', '+91-9876543211', 'info@companyb.com', '456 Demo Road, Delhi'),
('Test Company C', '+91-9876543212', 'hello@companyc.com', '789 Sample Avenue, Bangalore')
ON CONFLICT (name) DO NOTHING;

-- Check what was inserted
SELECT id, name, phone, email FROM parties WHERE name LIKE 'Test Company%';

-- Success message
SELECT 'Parties added successfully without balance column error!' as result; 