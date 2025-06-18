"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import type { Doctor } from "@/types/doctor"
import type { Patient } from "@/types/patient"

import type { Prescription } from "@/types/prescription"

interface PrescriptionFormProps {
  prescription?: Prescription | null
  onClose: () => void
  onSuccess: (prescription?: any) => void
}

export function PrescriptionForm({ prescription, onClose, onSuccess }: PrescriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching doctors and patients for prescription form...")
        const [doctorsRes, patientsRes] = await Promise.all([apiService.getDoctors(), apiService.getPatients()])

        console.log("Fetched doctors:", doctorsRes.data?.length || 0)
        console.log("Fetched patients:", patientsRes.data?.length || 0)

        setDoctors(doctorsRes.data || [])
        setPatients(patientsRes.data || [])
      } catch (error) {
        console.error("Error fetching data for prescription form:", error)
        alert("Failed to load doctors and patients. Please refresh and try again.")
      }
    }
    fetchData()
  }, [])

  // Initialize form with prescription data when editing
  useEffect(() => {
    if (prescription) {
      setFormData({
        patient_id: prescription.patient_id || "",
        doctor_id: prescription.doctor_id || "",
        medication: prescription.medication || "",
        dosage: prescription.dosage || "",
        frequency: prescription.frequency || "",
        duration: prescription.duration || "",
        instructions: prescription.instructions || "",
      })
    }
  }, [prescription])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (
      !formData.patient_id ||
      !formData.doctor_id ||
      !formData.medication ||
      !formData.dosage ||
      !formData.frequency ||
      !formData.duration
    ) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      if (prescription) {
        // Update existing prescription
        console.log("Updating prescription:", formData)
        await apiService.updatePrescription(prescription.id, formData)
        console.log("Prescription updated successfully")
      } else {
        // Create new prescription
        console.log("Creating new prescription:", formData)
        await apiService.createPrescription(formData)
        console.log("Prescription created successfully")
      }
      onSuccess(formData)
    } catch (error: any) {
      console.error(`Error ${prescription ? 'updating' : 'creating'} prescription:`, error)
      alert(`Failed to ${prescription ? 'update' : 'create'} prescription: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {prescription ? "Edit Prescription" : "New Prescription"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Only show patient and doctor selection for new prescriptions */}
          {!prescription && (
            <>
              <div>
                <label htmlFor="patient_id" className="block text-sm font-medium text-gray-700">
                  Patient
                </label>
                <select
                  id="patient_id"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="doctor_id" className="block text-sm font-medium text-gray-700">
                  Doctor
                </label>
                <select
                  id="doctor_id"
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Show read-only patient and doctor info when editing */}
          {prescription && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Prescription Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Patient:</span>
                  <p className="text-gray-900">{patients.find(p => p.id === formData.patient_id)?.name || "Unknown Patient"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Doctor:</span>
                  <p className="text-gray-900">{doctors.find(d => d.id === formData.doctor_id)?.name || "Unknown Doctor"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Medication Details - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="medication" className="block text-sm font-medium text-gray-700">
                Medication *
              </label>
              <input
                id="medication"
                name="medication"
                value={formData.medication}
                onChange={handleChange}
                required
                placeholder="e.g., Lisinopril"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">
                Dosage *
              </label>
              <input
                id="dosage"
                name="dosage"
                value={formData.dosage}
                onChange={handleChange}
                required
                placeholder="e.g., 10mg"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                Frequency *
              </label>
              <input
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
                placeholder="e.g., Once daily"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                Duration *
              </label>
              <input
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                placeholder="e.g., 30 days"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              rows={4}
              placeholder="Additional instructions for the patient..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {loading 
                ? (prescription ? "Updating..." : "Creating...") 
                : (prescription ? "Update Prescription" : "Create Prescription")
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
