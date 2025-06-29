-- UNIFIED DATABASE SETUP SCRIPT
-- Run this entire script in your Supabase SQL Editor to set up or update your schema.

-- Step 1: Create core tables if they don't exist

-- Doctors table
DROP TABLE IF EXISTS doctors CASCADE;
CREATE TABLE doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  specialization VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  license_number VARCHAR(100),
  years_of_experience INTEGER DEFAULT 0,
  qualifications TEXT,
  working_hours VARCHAR(255),
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  bio TEXT,
  availability_status VARCHAR(50) DEFAULT 'Available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table
DROP TABLE IF EXISTS patients CASCADE;
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT,
  medical_history TEXT,
  room_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
DROP TABLE IF EXISTS appointments CASCADE;
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient Vitals table
DROP TABLE IF EXISTS patient_vitals CASCADE;
CREATE TABLE patient_vitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  heart_rate INTEGER,
  blood_pressure VARCHAR(20),
  temperature DECIMAL(4, 1),
  oxygen_saturation DECIMAL(5, 2),
  respiratory_rate INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prescriptions table
DROP TABLE IF EXISTS prescriptions CASCADE;
CREATE TABLE prescriptions (
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
  medication_details JSONB,
  is_ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency Cases table
DROP TABLE IF EXISTS emergency_cases CASCADE;
CREATE TABLE emergency_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name VARCHAR(255) NOT NULL,
  location JSONB,
  emergency_type VARCHAR(255) NOT NULL,
  severity VARCHAR(50) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) CHECK (status IN ('pending', 'dispatched', 'en-route', 'arrived', 'completed')),
  time_reported TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  ambulance_id VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create functions and policies

-- Temporarily disable RLS for development
ALTER TABLE doctors DISABLE ROW LEVEL SECURITY;

-- Create or replace the profile creation function
CREATE OR REPLACE FUNCTION create_doctor_profile(
    p_user_id UUID,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_email VARCHAR,
    p_phone VARCHAR,
    p_specialization VARCHAR,
    p_license_number VARCHAR,
    p_years_of_experience INTEGER,
    p_qualifications TEXT,
    p_working_hours VARCHAR,
    p_consultation_fee DECIMAL,
    p_bio TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    new_doctor_id UUID;
BEGIN
    INSERT INTO doctors (
        user_id, first_name, last_name, email, phone, specialization, license_number,
        years_of_experience, qualifications, working_hours, consultation_fee, bio,
        availability_status, created_at, updated_at
    ) VALUES (
        p_user_id, p_first_name, p_last_name, p_email, p_phone, p_specialization, p_license_number,
        p_years_of_experience, p_qualifications, p_working_hours, p_consultation_fee, p_bio,
        'Available', NOW(), NOW()
    ) RETURNING id INTO new_doctor_id;

    result := json_build_object('success', true, 'message', 'Doctor profile created successfully', 'doctor_id', new_doctor_id);
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'message', SQLERRM, 'error_code', SQLSTATE, 'error_detail', SQLERRM);
    RETURN result;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_doctor_profile(UUID, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER, TEXT, VARCHAR, DECIMAL, TEXT) TO authenticated, anon, service_role;

-- Create policies for when RLS is re-enabled
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON doctors;
CREATE POLICY "Allow insert for authenticated users" ON doctors FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow select for own profile" ON doctors;
CREATE POLICY "Allow select for own profile" ON doctors FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow update for own profile" ON doctors;
CREATE POLICY "Allow update for own profile" ON doctors FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create user deletion function
CREATE OR REPLACE FUNCTION delete_user_data(user_uuid UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    DELETE FROM doctors WHERE user_id = user_uuid;
    DELETE FROM auth.users WHERE id = user_uuid;
    result := json_build_object('success', true, 'message', 'User data deleted successfully');
    RETURN result;
EXCEPTION WHEN OTHERS THEN
    result := json_build_object('success', false, 'message', SQLERRM, 'error_code', SQLSTATE);
    RETURN result;
END;
$$;

-- Grant permissions for user deletion
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;

DO $$
BEGIN
    RAISE NOTICE 'SUCCESS: Database setup script completed successfully!';
END $$;

