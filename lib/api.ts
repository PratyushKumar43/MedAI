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
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        
        .order("created_at", { ascending: false })

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
        doctors:doctor_id(id, first_name, last_name, specialization, email),
        patients:patient_id(id, first_name, last_name, email, phone, date_of_birth, address)
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
        doctors:doctor_id(id, first_name, last_name, specialization, email),
        patients:patient_id(id, first_name, last_name, email, phone, date_of_birth, address)
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
        doctors:doctor_id(id, first_name, last_name, specialization, email),
        patients:patient_id(id, first_name, last_name, email, phone, date_of_birth, address)
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
        doctors:doctor_id(id, first_name, last_name, specialization, email),
        patients:patient_id(id, first_name, last_name, email, phone, date_of_birth, address)
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
        doctors:doctor_id(id, first_name, last_name, specialization, email),
        patients:patient_id(id, first_name, last_name, email, phone, date_of_birth, address)
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
          doctors:doctor_id(id, first_name, last_name, specialization, email),
          patients:patient_id(id, first_name, last_name, email, phone, date_of_birth, address)
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

  // Utility function to get a default doctor ID
  async getDefaultDoctorId() {
    try {
      const { data } = await this.getDoctors();
      if (!data || data.length === 0) {
        console.error("No doctors found in database");
        throw new Error("No doctors found in database. Please add a doctor first.");
      }
      return data[0].id; // Return the ID of the first doctor
    } catch (error) {
      console.error("Error getting default doctor ID:", error);
      throw error;
    }
  },

  // Grouped Prescription Methods
  async getPrescriptionGroups() {
    try {
      console.log("Fetching prescription groups from Supabase...")
      
      const { data, error } = await supabase.rpc('get_all_prescription_groups')

      if (error) {
        console.error("Error fetching prescription groups:", error)
        throw error
      }

      console.log("Prescription groups fetched successfully:", data?.length || 0, "groups")
      return { data: data || [] }
    } catch (error: any) {
      console.error("Error in getPrescriptionGroups:", error)
      throw error
    }
  },

  async getPatientPrescriptionGroups(patientId: string) {
    try {
      console.log("Fetching prescription groups for patient:", patientId)
      
      const { data, error } = await supabase.rpc('get_patient_prescription_groups', {
        patient_uuid: patientId
      })

      if (error) {
        console.error("Error fetching patient prescription groups:", error)
        throw error
      }

      console.log("Patient prescription groups fetched successfully:", data?.length || 0, "groups")
      return { data: data || [] }
    } catch (error: any) {
      console.error("Error in getPatientPrescriptionGroups:", error)
      throw error
    }
  },

  async createPrescriptionGroup(groupData: {
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
  }) {
    try {
      console.log("Creating prescription group:", groupData)

      // First create the prescription group
      const { data: groupResult, error: groupError } = await supabase
        .from("prescription_groups")
        .insert([{
          patient_id: groupData.patient_id,
          doctor_id: groupData.doctor_id,
          visit_reason: groupData.visit_reason || "Medical consultation",
          diagnosis: groupData.diagnosis || [],
          symptoms: groupData.symptoms || [],
          treatment_plan: groupData.treatment_plan || "",
          follow_up_date: groupData.follow_up_date || null,
          notes: groupData.notes || "",
          status: "active"
        }])
        .select()
        .single()

      if (groupError) {
        console.error("Error creating prescription group:", groupError)
        throw groupError
      }

      const groupId = groupResult.id

      // Then create all the medications for this group
      if (groupData.medications && groupData.medications.length > 0) {
        const medicationsWithGroupId = groupData.medications.map(med => ({
          ...med,
          patient_id: groupData.patient_id,
          doctor_id: groupData.doctor_id,
          prescription_group_id: groupId,
          status: "active"
        }))

        const { data: medicationsResult, error: medicationsError } = await supabase
          .from("prescriptions")
          .insert(medicationsWithGroupId)
          .select()

        if (medicationsError) {
          console.error("Error creating medications:", medicationsError)
          // Try to clean up the group if medications failed
          await supabase.from("prescription_groups").delete().eq("id", groupId)
          throw medicationsError
        }

        console.log("Prescription group created successfully with", medicationsResult.length, "medications")
      }

      return { data: groupResult }
    } catch (error: any) {
      console.error("Error in createPrescriptionGroup:", error)
      throw error
    }
  },

  async updatePrescriptionGroup(groupId: string, updates: any) {
    try {
      console.log("Updating prescription group:", groupId, updates)

      const { data, error } = await supabase
        .from("prescription_groups")
        .update(updates)
        .eq("id", groupId)
        .select()
        .single()

      if (error) {
        console.error("Error updating prescription group:", error)
        throw error
      }

      console.log("Prescription group updated successfully")
      return { data }
    } catch (error: any) {
      console.error("Error in updatePrescriptionGroup:", error)
      throw error
    }
  },

  async deletePrescriptionGroup(groupId: string) {
    try {
      console.log("Deleting prescription group:", groupId)

      // This will cascade delete all associated prescriptions
      const { error } = await supabase
        .from("prescription_groups")
        .delete()
        .eq("id", groupId)

      if (error) {
        console.error("Error deleting prescription group:", error)
        throw error
      }

      console.log("Prescription group deleted successfully")
      return { success: true }
    } catch (error: any) {
      console.error("Error in deletePrescriptionGroup:", error)
      throw error
    }
  },

  async getAnalyticsSummary() {
    try {
      console.log("Fetching analytics summary...");

      const [
        { count: totalPatients, error: patientsError },
        { count: totalDoctors, error: doctorsError },
        { count: totalAppointments, error: appointmentsError },
        { count: emergencyCases, error: emergencyCasesError }
      ] = await Promise.all([
        supabase.from("patients").select("*", { count: "exact", head: true }),
        supabase.from("doctors").select("*", { count: "exact", head: true }),
        supabase.from("appointments").select("*", { count: "exact", head: true }),
        supabase.from("emergency_cases").select("*", { count: "exact", head: true })
      ]);

      if (patientsError) throw patientsError;
      if (doctorsError) throw doctorsError;
      if (appointmentsError) throw appointmentsError;
      if (emergencyCasesError) throw emergencyCasesError;

      const summary = {
        totalPatients: totalPatients ?? 0,
        totalDoctors: totalDoctors ?? 0,
        totalAppointments: totalAppointments ?? 0,
        emergencyCases: emergencyCases ?? 0,
      };

      console.log("Analytics summary fetched successfully:", summary);
      return { data: summary };
    } catch (error: any) {
      console.error("Error in getAnalyticsSummary:", error);
      throw error;
    }
  },

  async getPatientVisitsTrend(timeRange: '7d' | '30d' | '90d' | '1y') {
    try {
      console.log(`Fetching patient visits trend for ${timeRange}...`);

      const getISODate = (daysAgo: number) => new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

      let startDate: string;
      switch (timeRange) {
        case '7d': startDate = getISODate(7); break;
        case '30d': startDate = getISODate(30); break;
        case '90d': startDate = getISODate(90); break;
        case '1y': startDate = getISODate(365); break;
        default: startDate = getISODate(30);
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('created_at')
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} appointments for trend.`);
      return { data: data || [] };

    } catch (error: any) {
      console.error("Error in getPatientVisitsTrend:", error);
      throw error;
    }
  },

  async getDepartmentStats() {
    try {
      console.log("Fetching department stats...");

      const { data, error } = await supabase
        .from('appointments')
        .select(`id, doctors (specialization)`);

      if (error) {
        console.error("Error fetching department stats:", error);
        throw error;
      }
      
      if (!data) {
        return { data: [] };
      }

      const stats: { [key: string]: { patients: number } } = {};
      
      data.forEach((appointment: any) => {
        const department = appointment.doctors?.specialization || 'General';
        if (!stats[department]) {
          stats[department] = { patients: 0 };
        }
        stats[department].patients += 1;
      });

      const departmentStats = Object.entries(stats).map(([department, { patients }]) => ({
        department,
        patients,
        revenue: patients * 500 // Dummy revenue for now
      }));
      
      console.log("Department stats fetched successfully:", departmentStats);
      return { data: departmentStats };

    } catch (error: any) {
      console.error("Error in getDepartmentStats:", error);
      throw error;
    }
  },

  async getPatientVitals() {
    try {
      console.log("Fetching patient vitals...");
      const { data, error } = await supabase
        .from('patient_vitals')
        .select(`
          id,
          heart_rate,
          blood_pressure,
          temperature,
          oxygen_saturation,
          respiratory_rate,
          last_updated,
          patients (
            id,
            first_name,
            last_name,
            room_number
          ),
          doctors (
            id,
            first_name,
            last_name,
            specialization
          )
        `)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error("Error fetching patient vitals:", error);
        throw error;
      }

      if (!data) {
        return { data: [] };
      }

      const transformedData = data.map((vital: any) => ({
        id: vital.id,
        patientName: vital.patients ? `${vital.patients.first_name} ${vital.patients.last_name}`.trim() : 'Unknown Patient',
        room: vital.patients?.room_number || 'N/A',
        heartRate: vital.heart_rate,
        bloodPressure: vital.blood_pressure,
        temperature: vital.temperature,
        oxygenSat: vital.oxygen_saturation,
        respiratoryRate: vital.respiratory_rate,
        lastUpdated: new Date(vital.last_updated),
        status: 'stable' // Placeholder, will be calculated on client
      }));

      console.log("Patient vitals fetched successfully:", transformedData.length, "records");
      return { data: transformedData };

    } catch (error: any) {
      console.error("Error in getPatientVitals:", error);
      throw error;
    }
  },
}
