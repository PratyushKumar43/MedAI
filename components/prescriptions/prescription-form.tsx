"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import type { Doctor } from "@/types/doctor"
import type { Patient } from "@/types/patient"

interface PrescriptionFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function PrescriptionForm({ onClose, onSuccess }: PrescriptionFormProps) {
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
      console.log("Submitting prescription form:", formData)
      await apiService.createPrescription(formData)
      console.log("Prescription created successfully")
      onSuccess()
    } catch (error: any) {
      console.error("Error creating prescription:", error)
      alert(`Failed to create prescription: ${error.message || "Unknown error"}`)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Prescription</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div>
            <label htmlFor="medication" className="block text-sm font-medium text-gray-700">
              Medication
            </label>
            <input
              id="medication"
              name="medication"
              value={formData.medication}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="dosage" className="block text-sm font-medium text-gray-700">
              Dosage
            </label>
            <input
              id="dosage"
              name="dosage"
              value={formData.dosage}
              onChange={handleChange}
              required
              placeholder="e.g., 500mg"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
              Frequency
            </label>
            <input
              id="frequency"
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              required
              placeholder="e.g., Twice daily"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
              Duration
            </label>
            <input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              placeholder="e.g., 7 days"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            />
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
              rows={3}
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
              {loading ? "Creating..." : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
