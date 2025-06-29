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
    
    // Check if this is a vital sign field
    if (name.startsWith('vital_')) {
      const vitalField = name.replace('vital_', '') as keyof VitalSigns;
      setFormData((prev) => ({
        ...prev,
        vital_signs: {
          ...prev.vital_signs,
          [vitalField]: value
        }
      }));
    } else if (name === 'height' || name === 'weight') {
      // Calculate BMI when height or weight changes
      const updatedVitals = { ...formData.vital_signs, [name]: value };
      const height = name === 'height' ? parseFloat(value) : parseFloat(formData.vital_signs.height || '0');
      const weight = name === 'weight' ? parseFloat(value) : parseFloat(formData.vital_signs.weight || '0');
      
      // Calculate BMI if both height and weight are valid
      if (height > 0 && weight > 0) {
        // BMI = weight(kg) / height(m)^2
        const heightInMeters = height / 100; // Convert cm to meters
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        updatedVitals.bmi = bmi;
      }
      
      setFormData((prev) => ({
        ...prev,
        vital_signs: updatedVitals
      }));
    } else {
      // Handle regular fields
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm"></div>
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full sm:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-green-200">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-green-50/80">
            <h2 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit' : 'Add New'} Patient</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label htmlFor="medical_history" className="block text-sm font-medium text-gray-700">
                Medical History
              </label>
              <textarea
                id="medical_history"
                name="medical_history"
                value={formData.medical_history}
                onChange={handleChange}
                rows={3}
                placeholder="Enter patient's medical history..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 border border-transparent rounded-md text-sm font-medium text-white disabled:opacity-50 shadow-sm ${
                  isEdit 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Patient" : "Create Patient")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
