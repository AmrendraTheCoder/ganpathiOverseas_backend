-- Drop existing time_logs table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS time_logs CASCADE;

-- Create time_logs table for operator time tracking with correct column names
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES job_sheets(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_id UUID REFERENCES machines(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    break_time_minutes INTEGER DEFAULT 0,
    notes TEXT,
    productivity_score INTEGER CHECK (productivity_score >= 1 AND productivity_score <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_time_logs_job_id ON time_logs(job_id);
CREATE INDEX idx_time_logs_operator_id ON time_logs(operator_id);
CREATE INDEX idx_time_logs_started_at ON time_logs(started_at);
CREATE INDEX idx_time_logs_machine_id ON time_logs(machine_id);
CREATE INDEX idx_time_logs_ended_at ON time_logs(ended_at);

-- Enable Row Level Security
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for time logs (development - allow all operations)
CREATE POLICY "Allow all operations on time_logs" ON time_logs FOR ALL USING (true);

-- Add comment for documentation
COMMENT ON TABLE time_logs IS 'Operator time tracking and productivity monitoring';
COMMENT ON COLUMN time_logs.started_at IS 'When the operator started working on the job';
COMMENT ON COLUMN time_logs.ended_at IS 'When the operator finished working on the job';
COMMENT ON COLUMN time_logs.break_time_minutes IS 'Total break time taken during this work session';
COMMENT ON COLUMN time_logs.productivity_score IS 'Self-reported productivity score from 1-10'; 