"use client"

import { useState, useEffect } from "react"
import { User, Plus, Search, Brain, Stethoscope, FileText } from "lucide-react"
import { apiService, supabase } from "@/lib/api"
import type { Prescription } from "@/types/prescription"
import type { Patient } from "@/types/patient"
import type { PatientDetails } from "@/types/patient-details"
import { PrescriptionForm } from "@/components/prescriptions/prescription-form"
import { PatientDetailsViewer } from "@/components/patient/patient-details-viewer"
import { AIPrescriptionGenerator } from "@/components/prescription/ai-prescription-generator"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const generatePrescriptionPDF = async (patient: PatientDetails) => {
  const { genericAIService } = await import("@/lib/generic-ai")

  const prompt = `Generate a professional medical prescription PDF content for:
  Patient: ${patient.name}
  Age: ${patient.age}
  Diagnoses: ${patient.diagnosis.join(", ")}
  Current Medications: ${patient.current_medications.join(", ")}
  Allergies: ${patient.allergies.join(", ")}
  
  Create a properly formatted prescription document with:
  1. Patient information header
  2. Current diagnoses
  3. Prescribed medications with dosages
  4. Instructions for use
  5. Doctor signature line
  6. Date and prescription number
  
  Format as HTML that can be converted to PDF.`

  const response = await genericAIService.generatePrescription(prompt, patient)
  return response // This would be the PDF data
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)
  const [showAIPrescription, setShowAIPrescription] = useState(false)
  const [currentView, setCurrentView] = useState<"prescriptions" | "patients" | "ai-workflow">("prescriptions")

  useEffect(() => {
    fetchData()

    // Set up real-time subscription for prescriptions
    const subscription = supabase
      .channel("prescriptions_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "prescriptions" }, (payload) => {
        console.log("Prescription change detected:", payload)
        fetchPrescriptions()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prescriptionsRes, patientsRes] = await Promise.all([
        apiService.getPrescriptions(),
        apiService.getPatients(),
      ])

      setPrescriptions(prescriptionsRes.data || [])
      setPatients(patientsRes.data || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      alert(`Failed to load data: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptions = async () => {
    try {
      const response = await apiService.getPrescriptions()
      setPrescriptions(response.data || [])
    } catch (error: any) {
      console.error("Error fetching prescriptions:", error)
    }
  }

  const handlePatientSelect = async (patient: Patient) => {
    try {
      // Convert Patient to PatientDetails with enhanced data
      const enhancedPatient: PatientDetails = {
        ...patient,
        age: calculateAge(patient.date_of_birth),
        gender: patient.gender || "Not specified", // Add gender field
        diagnosis: ["Hypertension", "Type 2 Diabetes"], // Mock data for demo
        current_medications: ["Lisinopril 10mg", "Metformin 500mg"],
        allergies: ["Penicillin", "Shellfish"],
        vital_signs: {
          blood_pressure: "140/90 mmHg",
          heart_rate: 78,
          temperature: 98.6,
          weight: 180,
          height: 70,
          bmi: 25.8,
        },
        lab_results: [
          { test_name: "HbA1c", value: "7.2%", normal_range: "<7%", date: "2024-01-15", status: "abnormal" },
          {
            test_name: "Total Cholesterol",
            value: "220 mg/dL",
            normal_range: "<200 mg/dL",
            date: "2024-01-15",
            status: "abnormal",
          },
        ],
        visit_history: [
          {
            date: "2024-01-15",
            reason: "Routine Follow-up",
            diagnosis: "Diabetes Management",
            treatment: "Medication adjustment",
            doctor: "Dr. Smith",
          },
        ],
        insurance_info: {
          provider: "Blue Cross Blue Shield",
          policy_number: "BC123456789",
          group_number: "GRP001",
          coverage_type: "PPO",
        },
        emergency_contact: {
          name: "Emergency Contact",
          relationship: "Spouse",
          phone: "(555) 123-4567",
        },
        medical_history: "Patient has a history of diabetes and hypertension. Regular follow-ups required.",
      }

      setSelectedPatient(enhancedPatient)
      setCurrentView("ai-workflow")
      setShowPatientDetails(true)
    } catch (error) {
      console.error("Error selecting patient:", error)
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleGeneratePrescription = (patient?: PatientDetails) => {
    if (patient) {
      setSelectedPatient(patient)
      setShowPatientDetails(false)
      setShowAIPrescription(true)
    }
  }

  const handleSavePrescription = (prescription: any) => {
    console.log("Prescription saved:", prescription)
    fetchPrescriptions()
    setShowAIPrescription(false)
    setCurrentView("prescriptions")
    setSelectedPatient(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return

    try {
      await apiService.deletePrescription(id)
      fetchPrescriptions()
    } catch (error: any) {
      console.error("Error deleting prescription:", error)
      alert(`Failed to delete prescription: ${error.message || "Unknown error"}`)
    }
  }

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      prescription.medication?.toLowerCase().includes(searchLower) ||
      prescription.patients?.name?.toLowerCase().includes(searchLower) ||
      prescription.doctors?.name?.toLowerCase().includes(searchLower) ||
      prescription.dosage?.toLowerCase().includes(searchLower) ||
      prescription.frequency?.toLowerCase().includes(searchLower)
    )
  })

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6 mt-8"> {/* Use margin top instead of padding for better spacing */}
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor's Prescription Workflow</h1>
          <p className="text-gray-600 mt-2">AI-powered prescription generation with patient context</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant={currentView === "prescriptions" ? "default" : "outline"}
            onClick={() => setCurrentView("prescriptions")}
          >
            <FileText className="h-4 w-4 mr-2" />
            View Prescriptions
          </Button>
          <Button
            variant={currentView === "patients" ? "default" : "outline"}
            onClick={() => setCurrentView("patients")}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Prescription Workflow
          </Button>
          <Button onClick={() => setShowForm(true)} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Manual Prescription
          </Button>
        </div>
      </div>

      {/* AI Workflow Steps */}
      {currentView === "patients" && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <span>AI Prescription Workflow</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-2">
                  1
                </div>
                <p className="text-sm font-medium">Select Patient</p>
                <p className="text-xs text-gray-600">Choose patient for prescription</p>
              </div>
              <div className="w-8 h-px bg-purple-300"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-2">
                  2
                </div>
                <p className="text-sm font-medium">View Details</p>
                <p className="text-xs text-gray-600">Review patient information</p>
              </div>
              <div className="w-8 h-px bg-purple-300"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-2">
                  3
                </div>
                <p className="text-sm font-medium">AI Analysis</p>
                <p className="text-xs text-gray-600">Enter symptoms & diagnosis</p>
              </div>
              <div className="w-8 h-px bg-purple-300"></div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-2">
                  4
                </div>
                <p className="text-sm font-medium">Review & Save</p>
                <p className="text-xs text-gray-600">Approve AI recommendations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={currentView === "prescriptions" ? "Search prescriptions..." : "Search patients..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === "prescriptions" && (
        <>
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
              {filteredPrescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{prescription.medication}</h3>
                      <p className="text-sm text-gray-600">{prescription.dosage}</p>
                    </div>
                    {prescription.instructions?.includes("AI Generated") && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Brain className="h-3 w-3 mr-1" />
                        AI Generated
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <strong>Patient:</strong> {prescription.patients?.name}
                    </p>
                    <p>
                      <strong>Doctor:</strong> {prescription.doctors?.name}
                    </p>
                    <p>
                      <strong>Frequency:</strong> {prescription.frequency}
                    </p>
                    <p>
                      <strong>Duration:</strong> {prescription.duration}
                    </p>
                    {prescription.instructions && (
                      <p>
                        <strong>Instructions:</strong> {prescription.instructions.substring(0, 100)}...
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-500">
                      📅 {formatDate(prescription.created_at || new Date())}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prescription.id)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {currentView === "patients" && (
        <>
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
              {filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-600">Age: {calculateAge(patient.date_of_birth)}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p>
                        <strong>Email:</strong> {patient.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {patient.phone}
                      </p>
                      <p>
                        <strong>DOB:</strong> {formatDate(patient.date_of_birth)}
                      </p>
                    </div>

                    <Button
                      onClick={() => handlePatientSelect(patient)}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Start AI Prescription
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showForm && (
        <PrescriptionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchPrescriptions()
          }}
        />
      )}

      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[85vh] overflow-y-auto mt-8">
            <PatientDetailsViewer patient={selectedPatient} onGeneratePrescription={handleGeneratePrescription} />
            <div className="p-4 border-t flex justify-between items-center">
              <Button
                onClick={async () => {
                  try {
                    // Generate PDF using Gemini AI
                    const pdfData = await generatePrescriptionPDF(selectedPatient)
                    // Download the PDF
                    const blob = new Blob([pdfData], { type: "application/pdf" })
                    const url = window.URL.createObjectURL(blob)
                    const a = document.createElement("a")
                    a.href = url
                    a.download = `${selectedPatient.name}_prescription.pdf`
                    a.click()
                    window.URL.revokeObjectURL(url)
                  } catch (error) {
                    console.error("Error generating PDF:", error)
                    alert("Failed to generate PDF. Please try again.")
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF Prescription
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPatientDetails(false)
                  setCurrentView("patients")
                }}
              >
                Back to Patients
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAIPrescription && selectedPatient && (
        <AIPrescriptionGenerator
          patient={selectedPatient}
          onClose={() => {
            setShowAIPrescription(false)
            setCurrentView("patients")
          }}
          onSavePrescription={handleSavePrescription}
        />
      )}
    </div>
  )
}
