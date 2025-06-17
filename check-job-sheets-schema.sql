-- Check the current structure of job_sheets table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'job_sheets' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if we need to add the missing column
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'job_sheets' 
      AND column_name = 'paper_type'
      AND table_schema = 'public'
) AS paper_type_exists; 