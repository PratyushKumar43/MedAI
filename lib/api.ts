import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log("Supabase URL:", supabaseUrl)
console.log("Supabase Key (first 20 chars):", supabaseAnonKey?.substring(0, 20) + "...")

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export const testConnection = async () => {
  try {
    console.log("Testing Supabase connection...")
    const { data, error } = await supabase.from("doctors").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("Connection test successful")
    return { success: true, data }
  } catch (error) {
    console.error("Connection test error:", error)
    return { success: false, error: "Failed to connect to database" }
  }
}

// API service functions
export const apiService = {
  // Add supabase client for subscriptions
  supabase,

  // Test database connection
  async testConnection() {
    return await testConnection()
  },

  // Doctors
  async getDoctors() {
    try {
      console.log("Fetching doctors...")
      const { data, error } = await supabase.from("doctors").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching doctors:", error)
        throw error
      }

      console.log("Doctors fetched successfully:", data?.length || 0, "records")
      return { data: data || [] }
    } catch (error: any) {
      console.error("Error in getDoctors:", error)
      throw error
    }
  },

  async createDoctor(doctor: any) {
    try {
      console.log("Creating doctor:", doctor)
      const { data, error } = await supabase.from("doctors").insert([doctor]).select()
      if (error) {
        console.error("Error creating doctor:", error)
        throw error
      }
      console.log("Doctor created successfully:", data)
      return { data }
    } catch (error) {
      console.error("Error in createDoctor:", error)
      throw error
    }
  },

  async updateDoctor(id: string, doctor: any) {
    const { data, error } = await supabase.from("doctors").update(doctor).eq("id", id).select()
    if (error) throw error
    return { data }
  },

  async deleteDoctor(id: string) {
    const { error } = await supabase.from("doctors").delete().eq("id", id)
    if (error) throw error
    return { success: true }
  },

  // Patients
  async getPatients() {
    try {
      console.log("Fetching patients...")
      const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching patients:", error)
        throw error
      }

      console.log("Patients fetched successfully:", data?.length || 0, "records")
      return { data: data || [] }
    } catch (error: any) {
      console.error("Error in getPatients:", error)
      throw error
    }
  },

  async getPatient(id: string) {
    try {
      console.log("Fetching patient:", id)
      const { data, error } = await supabase.from("patients").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching patient:", error)
        throw error
      }

      console.log("Patient fetched successfully:", data)
      return { data }
    } catch (error: any) {
      console.error("Error in getPatient:", error)
      throw error
    }
  },

  async createPatient(patient: any) {
    const { data, error } = await supabase.from("patients").insert([patient]).select()
    if (error) throw error
    return { data }
  },

  async updatePatient(id: string, patient: any) {
    const { data, error } = await supabase.from("patients").update(patient).eq("id", id).select()
    if (error) throw error
    return { data }
  },

  async deletePatient(id: string) {
    const { error } = await supabase.from("patients").delete().eq("id", id)
    if (error) throw error
    return { success: true }
  },

  // Prescriptions - Updated for better Supabase integration
  async getPrescriptions() {
    try {
      console.log("Fetching prescriptions from Supabase...")
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
        *,
        doctors:doctor_id(id, name, specialization, email),
        patients:patient_id(id, name, email, phone)
      `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching prescriptions:", error)
        throw error
      }

      console.log("Prescriptions fetched successfully:", data?.length || 0, "records")
      return { data: data || [] }
    } catch (error: any) {
      console.error("Error in getPrescriptions:", error)
      throw error
    }
  },

  async createPrescription(prescription: any) {
    try {
      console.log("Creating prescription in Supabase:", prescription)

      // Ensure all required fields are present
      const prescriptionData = {
        patient_id: prescription.patient_id,
        doctor_id: prescription.doctor_id,
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        medication_details: prescription.medication_details || null,
        is_ai_generated: prescription.is_ai_generated || false
      }

      console.log("Prepared prescription data:", JSON.stringify(prescriptionData, null, 2))

      const { data, error } = await supabase
        .from("prescriptions")
        .insert([prescriptionData])
        .select(`
        *,
        doctors:doctor_id(id, name, specialization),
        patients:patient_id(id, name, email)
      `)

      if (error) {
        console.error("Error creating prescription:", error)
        // Include more detailed error information in the thrown error
        throw new Error(`Supabase error: ${error.message} (Code: ${error.code})`);
      }

      console.log("Prescription created successfully:", data)
      return { data }
    } catch (error) {
      console.error("Error in createPrescription:", error)
      throw error
    }
  },

  async updatePrescription(id: string, prescription: any) {
    try {
      console.log("Updating prescription:", id, prescription)

      const updateData = {
        ...prescription,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from("prescriptions")
        .update(updateData)
        .eq("id", id)
        .select(`
        *,
        doctors:doctor_id(id, name, specialization),
        patients:patient_id(id, name, email)
      `)

      if (error) {
        console.error("Error updating prescription:", error)
        throw error
      }

      console.log("Prescription updated successfully:", data)
      return { data }
    } catch (error) {
      console.error("Error in updatePrescription:", error)
      throw error
    }
  },

  async deletePrescription(id: string) {
    try {
      console.log("Deleting prescription:", id)
      const { error } = await supabase.from("prescriptions").delete().eq("id", id)

      if (error) {
        console.error("Error deleting prescription:", error)
        throw error
      }

      console.log("Prescription deleted successfully")
      return { success: true }
    } catch (error) {
      console.error("Error in deletePrescription:", error)
      throw error
    }
  },

  // Add method to get prescriptions by patient
  async getPrescriptionsByPatient(patientId: string) {
    try {
      console.log("Fetching prescriptions for patient:", patientId)
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
        *,
        doctors:doctor_id(id, name, specialization),
        patients:patient_id(id, name, email)
      `)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching patient prescriptions:", error)
        throw error
      }

      console.log("Patient prescriptions fetched:", data?.length || 0, "records")
      return { data: data || [] }
    } catch (error) {
      console.error("Error in getPrescriptionsByPatient:", error)
      throw error
    }
  },

  // Add method to get prescriptions by doctor
  async getPrescriptionsByDoctor(doctorId: string) {
    try {
      console.log("Fetching prescriptions for doctor:", doctorId)
      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
        *,
        doctors:doctor_id(id, name, specialization),
        patients:patient_id(id, name, email)
      `)
        .eq("doctor_id", doctorId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching doctor prescriptions:", error)
        throw error
      }

      console.log("Doctor prescriptions fetched:", data?.length || 0, "records")
      return { data: data || [] }
    } catch (error) {
      console.error("Error in getPrescriptionsByDoctor:", error)
      throw error
    }
  },

  // Add method to get prescription by ID
  async getPrescriptionById(id: string) {
    try {
      console.log("Fetching prescription by ID:", id)

      const { data, error } = await supabase
        .from("prescriptions")
        .select(`
          *,
          doctors:doctor_id(id, name, specialization),
          patients:patient_id(id, name, email)
        `)
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching prescription:", error)
        throw error
      }

      console.log("Prescription fetched successfully")
      return { data }
    } catch (error) {
      console.error("Error in getPrescriptionById:", error)
      throw error
    }
  },
}
