-- Add vital signs support to patients table
-- This script adds a JSONB column for storing vital signs data

-- Add vital_signs column if it doesn't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS vital_signs JSONB DEFAULT '{}';

-- Add additional patient fields if they don't exist
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS diagnosis TEXT[],
ADD COLUMN IF NOT EXISTS allergies TEXT[],
ADD COLUMN IF NOT EXISTS current_medications TEXT[];

-- Create index on vital_signs for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_vital_signs ON patients USING GIN (vital_signs);

-- Add sample vital signs structure comment
COMMENT ON COLUMN patients.vital_signs IS 'JSON object storing vital signs data: {
  "blood_pressure": "120/80 mmHg",
  "heart_rate": "72",
  "temperature": "98.6",
  "weight": "150",
  "height": "70",
  "bmi": "25.8"
}';

-- Update function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for patients table if it doesn't exist
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for doctors table if it doesn't exist
DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON doctors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for prescriptions table if it doesn't exist
DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
