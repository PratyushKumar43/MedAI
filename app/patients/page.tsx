"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import type { Patient } from "@/types/patient"
import { PatientForm } from "@/components/patients/patient-form"
import { formatDate } from "@/lib/utils"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Ensure page starts at top
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.scrollTo(0, 0)
    }

    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      const response = await apiService.getPatients()
      setPatients(response.data)
    } catch (error) {
      console.error("Error fetching patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return

    try {
      await apiService.deletePatient(id)
      fetchPatients()
    } catch (error) {
      console.error("Error deleting patient:", error)
    }
  }
  
  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsEditing(true)
    setShowForm(true)
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">Manage patient records</p>
        </div>
        <button
          onClick={() => {
            setSelectedPatient(undefined)
            setIsEditing(false)
            setShowForm(true)
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 animate-slide-in-right"
        >
          ➕ Add Patient
        </button>
      </div>

      <div className="flex items-center space-x-4 animate-fade-in-up animate-stagger-1">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 w-full transition-all duration-300"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <div
              key={patient.id}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 p-6 transform hover:scale-105 animate-fade-in-up animate-stagger-${Math.min(index + 1, 5)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">{patient.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong>Phone:</strong> {patient.phone}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {formatDate(patient.date_of_birth)}
                </p>
                <p>
                  <strong>Address:</strong> {patient.address}
                </p>
                {patient.medical_history && (
                  <p>
                    <strong>Medical History:</strong> {patient.medical_history.substring(0, 100)}...
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleEdit(patient)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200">
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(patient.id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors duration-200"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="animate-fade-in">
          <PatientForm
            patient={selectedPatient}
            isEdit={isEditing}
            onClose={() => {
              setShowForm(false)
              setSelectedPatient(undefined)
              setIsEditing(false)
            }}
            onSuccess={() => {
              setShowForm(false)
              setSelectedPatient(undefined)
              setIsEditing(false)
              fetchPatients()
            }}
          />
        </div>
      )}
    </div>
  )
}
