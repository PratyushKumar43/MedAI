export interface PatientDetails {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  address: string
  age: number
  diagnosis: string[]
  current_medications: string[]
  allergies: string[]
  vital_signs: {
    blood_pressure: string
    heart_rate: number
    temperature: number
    weight: number
    height: number
    bmi: number
  }
  lab_results: Array<{
    test_name: string
    value: string
    normal_range: string
    date: string
    status: "normal" | "abnormal" | "critical"
  }>
  visit_history: Array<{
    date: string
    reason: string
    diagnosis: string
    treatment: string
    doctor: string
  }>
  insurance_info: {
    provider: string
    policy_number: string
    group_number: string
    coverage_type: string
  }
  emergency_contact: {
    first_name: string
    last_name: string
    relationship: string
    phone: string
  }
  medical_history?: string
  created_at?: string
  updated_at?: string
}

export interface AIPrescriptionResponse {
  medications: Array<{
    name: string
    generic_name: string
    dosage: string
    frequency: string
    duration: string
    route: string
    instructions: string
    warnings: string[]
    interactions: string[]
    cost_estimate: string
  }>
  reasoning: string
  confidence_score: number
  alternative_treatments: any[]
  follow_up_recommendations: string[]
  red_flags: string[]
  drug_interactions: string[]
  contraindications: string[]
}
