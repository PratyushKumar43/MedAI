export interface Prescription {
  id: string
  patient_id: string
  doctor_id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  created_at?: string
  updated_at?: string
  doctors?: {
    id: string
    first_name: string
    last_name: string
    specialization: string
    email: string
  }
  patients?: {
    id: string
    first_name: string
    last_name: string
    email: string
    phone: string
    date_of_birth: string
    address: string
  }
  // For storing additional medication details
  medication_details?: MedicationDetails
  is_ai_generated?: boolean
}

export interface MedicationDetails {
  generic_name?: string
  route?: string
  warnings?: string[]
  interactions?: string[]
  cost_estimate?: string
  confidence_score?: number
}
