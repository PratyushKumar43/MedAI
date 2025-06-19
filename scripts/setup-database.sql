-- Create tables for MediOca

-- Doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  experience INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Prescriptions table with better indexing
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  medication VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  instructions TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  prescribed_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_medication ON prescriptions(medication);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_prescribed_date ON prescriptions(prescribed_date);
CREATE INDEX IF NOT EXISTS idx_prescriptions_created_at ON prescriptions(created_at);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prescriptions_updated_at 
    BEFORE UPDATE ON prescriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Insert sample data
INSERT INTO doctors (name, specialization, email, phone, experience) VALUES
('Dr. Sarah Johnson', 'Cardiology', 'sarah.johnson@medioca.com', '+1-555-0101', 15),
('Dr. Michael Chen', 'Pediatrics', 'michael.chen@medioca.com', '+1-555-0102', 12),
('Dr. Emily Rodriguez', 'Dermatology', 'emily.rodriguez@medioca.com', '+1-555-0103', 8),
('Dr. David Wilson', 'Orthopedics', 'david.wilson@medioca.com', '+1-555-0104', 20),
('Dr. Lisa Thompson', 'Neurology', 'lisa.thompson@medioca.com', '+1-555-0105', 18)
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (name, email, phone, date_of_birth, address, medical_history) VALUES
('John Smith', 'john.smith@email.com', '+1-555-1001', '1985-03-15', '123 Main St, Anytown, ST 12345', 'Hypertension, managed with medication'),
('Maria Garcia', 'maria.garcia@email.com', '+1-555-1002', '1990-07-22', '456 Oak Ave, Somewhere, ST 67890', 'Diabetes Type 2, diet controlled'),
('Robert Brown', 'robert.brown@email.com', '+1-555-1003', '1978-11-08', '789 Pine Rd, Elsewhere, ST 54321', 'Asthma, uses inhaler as needed'),
('Jennifer Davis', 'jennifer.davis@email.com', '+1-555-1004', '1992-05-30', '321 Elm St, Nowhere, ST 98765', 'No significant medical history'),
('William Miller', 'william.miller@email.com', '+1-555-1005', '1965-12-12', '654 Maple Dr, Anywhere, ST 13579', 'High cholesterol, on statin therapy')
ON CONFLICT (email) DO NOTHING;

-- Insert enhanced sample prescriptions
INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, frequency, duration, instructions, status) 
SELECT 
    p.id as patient_id,
    d.id as doctor_id,
    medications.medication,
    medications.dosage,
    medications.frequency,
    medications.duration,
    medications.instructions,
    'active'
FROM patients p
CROSS JOIN doctors d
CROSS JOIN (
    VALUES 
    ('Amoxicillin', '500mg', 'Three times daily', '7 days', 'Take with food to reduce stomach upset'),
    ('Lisinopril', '10mg', 'Once daily', '30 days', 'Take at the same time each day, monitor blood pressure'),
    ('Metformin', '500mg', 'Twice daily', '90 days', 'Take with meals, monitor blood sugar levels'),
    ('Atorvastatin', '20mg', 'Once daily at bedtime', '30 days', 'Avoid grapefruit juice'),
    ('Omeprazole', '20mg', 'Once daily before breakfast', '14 days', 'Take 30 minutes before eating')
) AS medications(medication, dosage, frequency, duration, instructions)
WHERE p.email LIKE '%@email.com' 
AND d.email LIKE '%@medioca.com'
LIMIT 15
ON CONFLICT DO NOTHING;
