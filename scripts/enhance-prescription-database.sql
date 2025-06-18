-- Enhancement script for better prescription grouping
-- This script adds support for grouping multiple medications for a single patient visit

-- Create prescription_groups table to group related prescriptions
CREATE TABLE IF NOT EXISTS prescription_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    visit_reason TEXT,
    diagnosis TEXT[],
    symptoms TEXT[],
    treatment_plan TEXT,
    follow_up_date DATE,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add prescription_group_id to prescriptions table to link multiple medications
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS prescription_group_id UUID REFERENCES prescription_groups(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prescription_groups_patient_id ON prescription_groups(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescription_groups_doctor_id ON prescription_groups(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_groups_visit_date ON prescription_groups(visit_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_group_id ON prescriptions(prescription_group_id);

-- Create trigger for updating prescription_groups updated_at
CREATE OR REPLACE FUNCTION update_prescription_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prescription_groups_updated_at 
    BEFORE UPDATE ON prescription_groups 
    FOR EACH ROW 
    EXECUTE FUNCTION update_prescription_groups_updated_at();

-- Create a view for easier querying of grouped prescriptions
CREATE OR REPLACE VIEW prescription_groups_with_medications AS
SELECT 
    pg.id as group_id,
    pg.patient_id,
    pg.doctor_id,
    pg.visit_date,
    pg.visit_reason,
    pg.diagnosis,
    pg.symptoms,
    pg.treatment_plan,
    pg.follow_up_date,
    pg.notes,
    pg.status as group_status,
    pg.created_at as group_created_at,
    p.name as patient_name,
    p.email as patient_email,
    p.phone as patient_phone,
    p.date_of_birth,
    d.name as doctor_name,
    d.specialization as doctor_specialization,
    d.email as doctor_email,
    COALESCE(
        JSON_AGG(
            CASE 
                WHEN pr.id IS NOT NULL THEN
                    JSON_BUILD_OBJECT(
                        'prescription_id', pr.id,
                        'medication', pr.medication,
                        'dosage', pr.dosage,
                        'frequency', pr.frequency,
                        'duration', pr.duration,
                        'instructions', pr.instructions,
                        'status', pr.status,
                        'created_at', pr.created_at
                    )
                ELSE NULL
            END
        ) FILTER (WHERE pr.id IS NOT NULL), 
        '[]'::json
    ) as medications,
    COUNT(pr.id) as medication_count
FROM prescription_groups pg
LEFT JOIN patients p ON pg.patient_id = p.id
LEFT JOIN doctors d ON pg.doctor_id = d.id
LEFT JOIN prescriptions pr ON pg.id = pr.prescription_group_id
GROUP BY 
    pg.id, pg.patient_id, pg.doctor_id, pg.visit_date, pg.visit_reason, 
    pg.diagnosis, pg.symptoms, pg.treatment_plan, pg.follow_up_date, 
    pg.notes, pg.status, pg.created_at,
    p.name, p.email, p.phone, p.date_of_birth,
    d.name, d.specialization, d.email
ORDER BY pg.visit_date DESC;

-- Insert sample prescription groups for existing data
INSERT INTO prescription_groups (patient_id, doctor_id, visit_date, visit_reason, diagnosis, symptoms, treatment_plan)
SELECT DISTINCT 
    pr.patient_id,
    pr.doctor_id,
    pr.created_at::date as visit_date,
    'Regular checkup and medication review' as visit_reason,
    ARRAY['Routine medication management'] as diagnosis,
    ARRAY['Follow-up', 'Medication review'] as symptoms,
    'Continue current medication regimen with monitoring' as treatment_plan
FROM prescriptions pr
WHERE pr.prescription_group_id IS NULL
GROUP BY pr.patient_id, pr.doctor_id, pr.created_at::date
ON CONFLICT DO NOTHING;

-- Update existing prescriptions to link them to prescription groups
UPDATE prescriptions pr
SET prescription_group_id = pg.id
FROM prescription_groups pg
WHERE pr.patient_id = pg.patient_id 
    AND pr.doctor_id = pg.doctor_id 
    AND pr.created_at::date = pg.visit_date::date
    AND pr.prescription_group_id IS NULL;

-- Create function to get grouped prescriptions for a patient
CREATE OR REPLACE FUNCTION get_patient_prescription_groups(patient_uuid UUID)
RETURNS TABLE (
    group_id UUID,
    visit_date TIMESTAMP,
    doctor_name TEXT,
    doctor_specialization TEXT,
    diagnosis TEXT[],
    medications JSON,
    medication_count BIGINT,
    status TEXT,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pgm.group_id,
        pgm.visit_date,
        pgm.doctor_name,
        pgm.doctor_specialization,
        pgm.diagnosis,
        pgm.medications,
        pgm.medication_count,
        pgm.group_status as status,
        pgm.notes
    FROM prescription_groups_with_medications pgm
    WHERE pgm.patient_id = patient_uuid
    ORDER BY pgm.visit_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get all prescription groups with patient and doctor info
CREATE OR REPLACE FUNCTION get_all_prescription_groups()
RETURNS TABLE (
    group_id UUID,
    patient_id UUID,
    patient_name TEXT,
    patient_email TEXT,
    doctor_name TEXT,
    doctor_specialization TEXT,
    visit_date TIMESTAMP,
    diagnosis TEXT[],
    medications JSON,
    medication_count BIGINT,
    status TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pgm.group_id,
        pgm.patient_id,
        pgm.patient_name,
        pgm.patient_email,
        pgm.doctor_name,
        pgm.doctor_specialization,
        pgm.visit_date,
        pgm.diagnosis,
        pgm.medications,
        pgm.medication_count,
        pgm.group_status as status,
        pgm.group_created_at as created_at
    FROM prescription_groups_with_medications pgm
    ORDER BY pgm.visit_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON prescription_groups TO authenticated;
GRANT SELECT ON prescription_groups_with_medications TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_prescription_groups(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_prescription_groups() TO authenticated;

-- Add comments
COMMENT ON TABLE prescription_groups IS 'Groups multiple prescriptions from the same visit/consultation';
COMMENT ON COLUMN prescription_groups.diagnosis IS 'Array of diagnoses for this visit';
COMMENT ON COLUMN prescription_groups.symptoms IS 'Array of symptoms reported during this visit';
COMMENT ON VIEW prescription_groups_with_medications IS 'View combining prescription groups with their medications and patient/doctor info';
