export interface VitalSigns {
  blood_pressure: string;
  heart_rate: string;
  temperature: string;
  weight: string;
  height: string;
  bmi: string;
  [key: string]: string; // Index signature to allow dynamic access
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender?: string;
  address: string;
  medical_history?: string;
  vital_signs?: VitalSigns;
  diagnosis?: string[];
  allergies?: string[];
  current_medications?: string[];
  created_at?: string;
  updated_at?: string;
}
