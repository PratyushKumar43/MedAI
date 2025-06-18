// This file contains helper functions to fix the prescription saving issue

import { apiService } from "./api";

// Function to check if prescriptions table exists and has the required columns
export async function checkPrescriptionsTable() {
  try {
    console.log("Checking prescriptions table...");
    const response = await fetch("/api/check-prescriptions-table");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error checking prescriptions table:", error);
    return { error: "Failed to check prescriptions table" };
  }
}

// Function to get a valid doctor ID from the database
export async function getValidDoctorId() {
  try {
    const { data } = await apiService.getDoctors();
    if (!data || data.length === 0) {
      console.error("No doctors found in database");
      return null;
    }
    return data[0].id; // Return the ID of the first doctor
  } catch (error) {
    console.error("Error getting doctor ID:", error);
    return null;
  }
}

// Simplified function to save a basic prescription without complex nested data
export async function saveSimplePrescription(patientId: string) {
  try {
    console.log("Saving simple prescription...");
    
    // Get a valid doctor ID
    const doctorId = await getValidDoctorId();
    if (!doctorId) {
      return { error: "No valid doctor ID found. Please add a doctor to the system." };
    }
    
    const prescriptionData = {
      patient_id: patientId,
      doctor_id: doctorId, // Use a real doctor ID
      medication: "Test Medication",
      dosage: "1 pill",
      frequency: "Once daily",
      duration: "7 days",
      instructions: "Take with food",
      is_ai_generated: false
    };
    
    const result = await apiService.createPrescription(prescriptionData);
    console.log("Simple prescription saved successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving simple prescription:", error);
    return { error: "Failed to save simple prescription", details: error };
  }
}

// Function to save a prescription with structured medication details
export async function savePrescriptionWithDetails(patientId: string) {
  try {
    console.log("Saving prescription with details...");
    
    // Get a valid doctor ID
    const doctorId = await getValidDoctorId();
    if (!doctorId) {
      return { error: "No valid doctor ID found. Please add a doctor to the system." };
    }
    
    const prescriptionData = {
      patient_id: patientId,
      doctor_id: doctorId, // Use a real doctor ID
      medication: "Test Medication with Details",
      dosage: "10mg",
      frequency: "Twice daily",
      duration: "14 days",
      instructions: "Take with water",
      is_ai_generated: true,
      medication_details: {
        generic_name: "Generic Test Med",
        route: "Oral",
        warnings: ["May cause drowsiness"],
        interactions: ["Avoid alcohol"],
        cost_estimate: "$10-15",
        confidence_score: 85
      }
    };
    
    const result = await apiService.createPrescription(prescriptionData);
    console.log("Prescription with details saved successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving prescription with details:", error);
    return { error: "Failed to save prescription with details", details: error };
  }
}
