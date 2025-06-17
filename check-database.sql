-- =============================================
-- Database Check Script for Ganpathi Overseas ERP
-- =============================================
-- Run this in Supabase SQL Editor to check current database state

-- 1. Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. Check for existing users
SELECT 
    id,
    email,
    username,
    name,
    role,
    is_active,
    created_at
FROM users
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users');

-- 4. Check authentication setup
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public';

-- 5. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND rowsecurity = true;

-- 6. Check for extensions
SELECT 
    extname,
    extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- 7. Check sample data counts
SELECT 
    'parties' as table_name, 
    COUNT(*) as record_count
FROM parties
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parties')

UNION ALL

SELECT 
    'machines' as table_name, 
    COUNT(*) as record_count
FROM machines
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'machines')

UNION ALL

SELECT 
    'job_sheets' as table_name, 
    COUNT(*) as record_count
FROM job_sheets
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'job_sheets')

UNION ALL

SELECT 
    'transactions' as table_name, 
    COUNT(*) as record_count
FROM transactions
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions');

-- 8. Check auth.users table (Supabase auth)
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    role
FROM auth.users
LIMIT 10; 