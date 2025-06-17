-- Add time_logs table for operator time tracking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_sheet_id UUID NOT NULL REFERENCES job_sheets(id),
    operator_id UUID NOT NULL REFERENCES users(id),
    machine_id UUID REFERENCES machines(id),
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_time_minutes INTEGER DEFAULT 0,
    notes TEXT,
    productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_logs_job_sheet_id ON time_logs(job_sheet_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_operator_id ON time_logs(operator_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_clock_in ON time_logs(clock_in);
CREATE INDEX IF NOT EXISTS idx_time_logs_machine_id ON time_logs(machine_id);

-- Enable Row Level Security
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for time logs
CREATE POLICY "Allow all operations" ON time_logs FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_time_logs_updated_at 
    BEFORE UPDATE ON time_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 