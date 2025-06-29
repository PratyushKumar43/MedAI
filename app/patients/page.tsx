"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import type { Patient } from "@/types/patient"
import { PatientForm } from "@/components/patients/patient-form"
import { formatDate } from "@/lib/utils"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

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
      (patient.first_name + ' ' + patient.last_name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medical_history?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div className={`space-y-6 pb-10 relative ${showForm ? 'overflow-hidden h-screen' : ''}`}>
      {/* Blur overlay when form is open */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"></div>
      )}
      {/* Header with title and add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Patient Records</h1>
          <p className="text-gray-600 mt-1">Manage and view patient information</p>
        </div>
        <button
          onClick={() => {
            setSelectedPatient(undefined)
            setIsEditing(false)
            setShowForm(true)
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Patient
        </button>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="Search patients by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      {/* Patient count and filter info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{filteredPatients.length}</span> of <span className="font-medium text-gray-900">{patients.length}</span> patients
          {searchTerm && <span> matching "<span className="font-medium text-blue-600">{searchTerm}</span>"</span>}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Patient Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPatients.length === 0 ? (
              <div className="col-span-full bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-100 shadow-sm">
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No patients found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search criteria." : "Start by adding your first patient."}
                  </p>
                </div>
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <div key={patient.id} className="group flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden hover:border-blue-100">
                  {/* Card Header with Avatar and Name */}
                  <div className="p-6 pb-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xl shadow-sm">
                        {(patient.first_name[0] + patient.last_name[0]).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {`${patient.first_name} ${patient.last_name}`}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {calculateAge(patient.date_of_birth)} years old • {patient.gender || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Patient Details */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="space-y-4">
                      {/* Phone */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Phone</p>
                          <a href={`tel:${patient.phone}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                            {patient.phone || 'Not provided'}
                          </a>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-500">Email</p>
                          <a href={`mailto:${patient.email}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block">
                            {patient.email || 'Not provided'}
                          </a>
                        </div>
                      </div>

                      {/* Date of Birth */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                          <p className="text-sm text-gray-900">
                            {patient.date_of_birth ? formatDate(patient.date_of_birth) : 'Not provided'}
                          </p>
                        </div>
                      </div>

                      {/* Address */}
                      {patient.address && (
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Address</p>
                            <p className="text-sm text-gray-900">{patient.address}</p>
                          </div>
                        </div>
                      )}

                      {/* Medical History */}
                      {patient.medical_history && (
                        <div className="pt-3 mt-2 border-t border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-500 mb-1">Medical Notes</p>
                              <p className="text-sm text-gray-700 line-clamp-3">{patient.medical_history}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Footer with Actions */}
                  <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Last Updated : {new Date(patient.updated_at || patient.created_at || Date.now()).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(patient);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        aria-label="Edit patient"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
                            handleDelete(patient.id);
                          }
                        }}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        aria-label="Delete patient"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Patient form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
        </div>
      )}
    </div>
  )
}
