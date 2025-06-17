-- Update job_sheets table with missing columns for operator functionality
-- Run this in Supabase SQL Editor

-- Add missing columns to job_sheets table
ALTER TABLE job_sheets 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS colors VARCHAR(50),
ADD COLUMN IF NOT EXISTS size VARCHAR(50),
ADD COLUMN IF NOT EXISTS finishing_requirements TEXT,
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS design_files TEXT[],
ADD COLUMN IF NOT EXISTS sample_images TEXT[],
ADD COLUMN IF NOT EXISTS completion_photos TEXT[],
ADD COLUMN IF NOT EXISTS special_instructions TEXT,
ADD COLUMN IF NOT EXISTS client_feedback TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Update existing job sheets with some sample data
UPDATE job_sheets 
SET 
    colors = 'CMYK',
    size = 'A4',
    finishing_requirements = 'Lamination, Cutting'
WHERE colors IS NULL; 