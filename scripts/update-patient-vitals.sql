-- Add vital_signs column to patients table as JSONB
ALTER TABLE patients ADD COLUMN IF NOT EXISTS vital_signs JSONB;

-- Add current_medications column to patients table as JSONB array
ALTER TABLE patients ADD COLUMN IF NOT EXISTS current_medications JSONB;

-- Add allergies column to patients table as JSONB array
ALTER TABLE patients ADD COLUMN IF NOT EXISTS allergies JSONB;

-- Add diagnosis column to patients table as JSONB array
ALTER TABLE patients ADD COLUMN IF NOT EXISTS diagnosis JSONB;

-- Add emergency_contact column to patients table as JSONB
ALTER TABLE patients ADD COLUMN IF NOT EXISTS emergency_contact JSONB;

-- Update existing patients with example vital signs
UPDATE patients
SET 
  vital_signs = jsonb_build_object(
    'blood_pressure', CASE WHEN RANDOM() > 0.7 THEN '140/90' WHEN RANDOM() > 0.4 THEN '120/80' ELSE '110/70' END,
    'heart_rate', FLOOR(60 + RANDOM() * 40),
    'temperature', 97.6 + RANDOM() * 2,
    'weight', 150 + FLOOR(RANDOM() * 50),
    'height', 65 + FLOOR(RANDOM() * 15),
    'bmi', 22 + RANDOM() * 8
  ),
  current_medications = CASE WHEN RANDOM() > 0.5 
                          THEN jsonb_build_array('Lisinopril', 'Metformin') 
                          WHEN RANDOM() > 0.3 
                          THEN jsonb_build_array('Atorvastatin')
                          ELSE jsonb_build_array()
                        END,
  allergies = CASE WHEN RANDOM() > 0.7
                THEN jsonb_build_array('Penicillin', 'Shellfish')
                WHEN RANDOM() > 0.4
                THEN jsonb_build_array('Peanuts')
                ELSE jsonb_build_array()
              END,
  diagnosis = CASE WHEN RANDOM() > 0.6
                THEN jsonb_build_array('Hypertension', 'Type 2 Diabetes')
                WHEN RANDOM() > 0.3
                THEN jsonb_build_array('Asthma')
                ELSE jsonb_build_array('Routine checkup')
              END,
  emergency_contact = jsonb_build_object(
    'name', 'Emergency Contact',
    'relationship', 'Spouse',
    'phone', '(555) 123-4567'
  )
WHERE id IS NOT NULL;
