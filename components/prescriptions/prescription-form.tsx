"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Trash2, Pill } from "lucide-react"
import { apiService } from "@/lib/api"
import type { Doctor } from "@/types/doctor"
import type { Patient } from "@/types/patient"
import type { Prescription } from "@/types/prescription"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MedicationForm {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

interface PrescriptionFormProps {
  prescription?: Prescription | null
  onClose: () => void
  onSuccess: (prescription?: any) => void
  selectedPatientId?: string // Pre-select a patient
}

export function PrescriptionForm({ prescription, onClose, onSuccess, selectedPatientId }: PrescriptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [formData, setFormData] = useState({
    patient_id: selectedPatientId || "",
    doctor_id: "",
    visit_reason: "",
    notes: "",
  })
  
  // Multiple medications array
  const [medications, setMedications] = useState<MedicationForm[]>([
    {
      id: "1",
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    }
  ])

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
        visit_reason: "Medication update",
        notes: "",
      })
      
      // For editing, convert single prescription to medications array
      setMedications([{
        id: "1",
        medication: prescription.medication || "",
        dosage: prescription.dosage || "",
        frequency: prescription.frequency || "",
        duration: prescription.duration || "",
        instructions: prescription.instructions || "",
      }])
    }
  }, [prescription])

  const addMedication = () => {
    const newMedication: MedicationForm = {
      id: Date.now().toString(),
      medication: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    }
    setMedications([...medications, newMedication])
  }

  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id))
    }
  }

  const updateMedication = (id: string, field: keyof MedicationForm, value: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, [field]: value } : med
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.patient_id || !formData.doctor_id) {
      alert("Please select both patient and doctor")
      return
    }

    // Validate medications
    const validMedications = medications.filter(med => 
      med.medication.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    )

    if (validMedications.length === 0) {
      alert("Please add at least one complete medication")
      return
    }

    setLoading(true)

    try {
      if (prescription) {
        // For editing, update single prescription
        const updatedPrescription = {
          ...formData,
          ...validMedications[0], // Use first medication for backward compatibility
        }
        
        console.log("Updating prescription:", updatedPrescription)
        await apiService.updatePrescription(prescription.id, updatedPrescription)
        console.log("Prescription updated successfully")
      } else {
        // For new prescriptions, create multiple if needed
        console.log("Creating prescriptions for multiple medications:", validMedications)
        
        for (const medication of validMedications) {
          const prescriptionData = {
            ...formData,
            ...medication,
          }
          await apiService.createPrescription(prescriptionData)
        }
        
        console.log(`${validMedications.length} prescription(s) created successfully`)
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-xl w-full sm:max-w-3xl lg:max-w-5xl h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border border-blue-200">
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
                      {`${patient.first_name} ${patient.last_name}`}
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
                      {`${doctor.first_name} ${doctor.last_name}`} - {doctor.specialization}
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
                  <p className="text-gray-900">{(patients.find(p => p.id === formData.patient_id)) ? `${patients.find(p => p.id === formData.patient_id)?.first_name} ${patients.find(p => p.id === formData.patient_id)?.last_name}` : "Unknown Patient"}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Doctor:</span>
                  <p className="text-gray-900">{(doctors.find(d => d.id === formData.doctor_id)) ? `${doctors.find(d => d.id === formData.doctor_id)?.first_name} ${doctors.find(d => d.id === formData.doctor_id)?.last_name}` : "Unknown Doctor"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Visit Information */}
          {!prescription && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="visit_reason" className="block text-sm font-medium text-gray-700">
                  Visit Reason
                </label>
                <input
                  id="visit_reason"
                  name="visit_reason"
                  value={formData.visit_reason}
                  onChange={handleChange}
                  placeholder="e.g., Regular checkup, Follow-up"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          )}

          {/* Medications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Pill className="h-5 w-5 mr-2 text-purple-600" />
                Medications
              </h3>
              {!prescription && (
                <Button
                  type="button"
                  onClick={addMedication}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </Button>
              )}
            </div>

            {medications.map((medication, index) => (
              <Card key={medication.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Medication {index + 1}
                    </CardTitle>
                    {!prescription && medications.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMedication(medication.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Medication Details - Two Column Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Medication *
                      </label>
                      <input
                        value={medication.medication}
                        onChange={(e) => updateMedication(medication.id, 'medication', e.target.value)}
                        required
                        placeholder="e.g., Lisinopril"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dosage *
                      </label>
                      <input
                        value={medication.dosage}
                        onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                        required
                        placeholder="e.g., 10mg"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Frequency *
                      </label>
                      <input
                        value={medication.frequency}
                        onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                        required
                        placeholder="e.g., Once daily"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Duration *
                      </label>
                      <input
                        value={medication.duration}
                        onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                        required
                        placeholder="e.g., 30 days"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Instructions
                    </label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                      rows={3}
                      placeholder="Additional instructions for the patient..."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
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
