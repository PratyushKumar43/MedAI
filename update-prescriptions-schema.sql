
-- Add new columns to the prescriptions table
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS medication_details JSONB;
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;

