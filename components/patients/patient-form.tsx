"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { VitalSigns, Patient } from "@/types/patient"

interface PatientFormProps {
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient; // Optional patient for editing
  isEdit?: boolean;
}

export function PatientForm({ onClose, onSuccess, patient, isEdit = false }: PatientFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Omit<Patient, 'id'> & { vital_signs: VitalSigns }>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    address: "",
    medical_history: "",
    vital_signs: {
      blood_pressure: "",
      heart_rate: "",
      temperature: "",
      weight: "",
      height: "",
      bmi: ""
    },
    diagnosis: [],
    allergies: [],
    current_medications: []
  })

  // Initialize form data if patient is provided (edit mode)
  useEffect(() => {
    if (patient && isEdit) {
      setFormData({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email,
        phone: patient.phone,
        date_of_birth: patient.date_of_birth,
        address: patient.address,
        medical_history: patient.medical_history || "",
        vital_signs: patient.vital_signs || {
          blood_pressure: "",
          heart_rate: "",
          temperature: "",
          weight: "",
          height: "",
          bmi: ""
        },
        diagnosis: patient.diagnosis || [],
        allergies: patient.allergies || [],
        current_medications: patient.current_medications || []
      });
    }
  }, [patient, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Process vital signs - replace empty values with "Not Examined"
      const processedVitalSigns: VitalSigns = { ...formData.vital_signs };
      
      // Use type-safe approach with explicit keys
      const vitalKeys: (keyof VitalSigns)[] = ['blood_pressure', 'heart_rate', 'temperature', 'weight', 'height', 'bmi'];
      vitalKeys.forEach(key => {
        if (!processedVitalSigns[key]) {
          processedVitalSigns[key] = "Not Examined";
        }
      });

      // Calculate BMI if height and weight are available and BMI is not set
      if (
        processedVitalSigns.height && 
        processedVitalSigns.height !== "Not Examined" && 
        processedVitalSigns.weight && 
        processedVitalSigns.weight !== "Not Examined" && 
        (!processedVitalSigns.bmi || processedVitalSigns.bmi === "Not Examined")
      ) {
        const height = parseFloat(processedVitalSigns.height);
        const weight = parseFloat(processedVitalSigns.weight);
        const heightInMeters = height / 100;
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        processedVitalSigns.bmi = bmi;
      }

      // Prepare final data with processed vital signs
      const finalData = {
        ...formData,
        vital_signs: processedVitalSigns,
        // Initialize empty arrays if not provided
        diagnosis: formData.diagnosis || [],
        allergies: formData.allergies || [],
        current_medications: formData.current_medications || []
      };

      if (isEdit && patient) {
        await apiService.updatePatient(patient.id, finalData);
      } else {
        await apiService.createPatient(finalData);
      }
      onSuccess();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} patient:`, error);
      alert(`Failed to ${isEdit ? 'update' : 'create'} patient. Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVitalsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const vital_signs = { ...prev.vital_signs, [name]: value };

      // Recalculate BMI if height or weight changes
      if (name === "height" || name === "weight") {
        const height = parseFloat(vital_signs.height || "0");
        const weight = parseFloat(vital_signs.weight || "0");
        if (height > 0 && weight > 0) {
          const heightInMeters = height / 100;
          vital_signs.bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        } else {
          vital_signs.bmi = "";
        }
      }
      return { ...prev, vital_signs };
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div 
          className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <h2 id="modal-title" className="text-xl font-semibold">
              {isEdit ? `Edit Patient: ${patient?.first_name} ${patient?.last_name}` : 'Add New Patient'}
            </h2>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              title="Close"
              aria-label="Close form"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          
          {/* Main Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(95vh-140px)]">
            <div className="p-6 space-y-8">
              {/* Patient Information Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                  <h3 className="text-base font-semibold text-gray-800">Patient Information</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-100 to-transparent ml-2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400" placeholder="John" />
                  </div>
                  {/* Last Name */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400" placeholder="Doe" />
                  </div>
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400" placeholder="john.doe@example.com" />
                  </div>
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400" placeholder="(123) 456-7890" />
                  </div>
                  {/* Date of Birth */}
                  <div>
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700" />
                  </div>
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input id="address" name="address" value={formData.address} onChange={handleChange} required className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400" placeholder="123 Main St, Anytown, USA" />
                  </div>
                  {/* Medical History */}
                  <div className="md:col-span-2">
                    <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
                    <textarea id="medical_history" name="medical_history" value={formData.medical_history} onChange={handleChange} rows={3} className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400" placeholder="Brief summary of past conditions, surgeries, etc." />
                  </div>
                </div>
              </section>

              {/* Vital Signs Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                  <h3 className="text-base font-semibold text-gray-800">Vital Signs</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-green-100 to-transparent ml-2" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {/* Blood Pressure */}
                  <div>
                    <label htmlFor="blood_pressure" className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                    <input id="blood_pressure" name="blood_pressure" value={formData.vital_signs.blood_pressure} onChange={handleVitalsChange} className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="e.g., 120/80" />
                  </div>
                  {/* Heart Rate */}
                  <div>
                    <label htmlFor="heart_rate" className="block text-sm font-medium text-gray-700 mb-1">Heart Rate</label>
                    <input id="heart_rate" name="heart_rate" value={formData.vital_signs.heart_rate} onChange={handleVitalsChange} className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="bpm" />
                  </div>
                  {/* Temperature */}
                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                    <input id="temperature" name="temperature" value={formData.vital_signs.temperature} onChange={handleVitalsChange} className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="°C" />
                  </div>
                  {/* Weight */}
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                    <input id="weight" name="weight" type="number" value={formData.vital_signs.weight} onChange={handleVitalsChange} className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="kg" />
                  </div>
                  {/* Height */}
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                    <input id="height" name="height" type="number" value={formData.vital_signs.height} onChange={handleVitalsChange} className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="cm" />
                  </div>
                  {/* BMI */}
                  <div>
                    <label htmlFor="bmi" className="block text-sm font-medium text-gray-700 mb-1">BMI</label>
                    <input id="bmi" name="bmi" value={formData.vital_signs.bmi} readOnly className="block w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed" placeholder="Auto-calculated" />
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated from weight and height.</p>
                  </div>
                </div>
              </section>
            </div>
            
            {/* Form Actions Footer */}
            <div className="sticky bottom-0 z-10 bg-white/80 backdrop-blur-sm p-4 sm:p-6 border-t border-gray-200">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-70 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center min-w-[120px] ${
                    loading 
                      ? 'bg-blue-500' 
                      : isEdit 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEdit ? 'Update Patient' : 'Create Patient'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
