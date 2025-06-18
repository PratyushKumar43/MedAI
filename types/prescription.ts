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
    name: string
    specialization: string
  }
  patients?: {
    name: string
    email: string
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
