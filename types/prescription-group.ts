export interface PrescriptionGroup {
  id: string
  patient_id: string
  doctor_id: string
  visit_date: string
  visit_reason?: string
  diagnosis: string[]
  symptoms: string[]
  treatment_plan?: string
  follow_up_date?: string
  notes?: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  
  // Joined data
  patient_name?: string
  patient_email?: string
  patient_phone?: string
  doctor_name?: string
  doctor_specialization?: string
  doctor_email?: string
  
  // Medications in this group
  medications: Array<{
    prescription_id: string
    medication: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
    status: string
    created_at: string
  }>
  
  medication_count: number
}

export interface CreatePrescriptionGroupRequest {
  patient_id: string
  doctor_id: string
  visit_reason?: string
  diagnosis?: string[]
  symptoms?: string[]
  treatment_plan?: string
  follow_up_date?: string
  notes?: string
  medications: Array<{
    medication: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }>
}
