"use client"

import { useState, useEffect } from "react"
import { User, Plus, Search, Brain, Stethoscope, FileText, Eye, Download, Calendar, Pill, Heart, Activity } from "lucide-react"
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
  const [showA4Modal, setShowA4Modal] = useState(false)
  const [a4ModalPatient, setA4ModalPatient] = useState<PatientDetails | null>(null)
  const [currentView, setCurrentView] = useState<"prescriptions" | "patients" | "ai-workflow">("prescriptions")
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    // Initialize date on client side to avoid hydration mismatch
    setCurrentDate(new Date())
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

  const handleViewPatientDetails = async (patientId: string, patientName: string) => {
    try {
      // Find patient in existing data or fetch from API
      let patient = patients.find(p => p.id === patientId)
      
      if (!patient) {
        // If not found in local data, try to fetch from API
        const response = await apiService.getPatient(patientId)
        patient = response.data
      }

      if (patient) {
        // Convert Patient to PatientDetails with enhanced data
        const enhancedPatient: PatientDetails = {
          ...patient,
          age: calculateAge(patient.date_of_birth),
          gender: patient.gender || "Not specified",
          diagnosis: ["Hypertension", "Type 2 Diabetes", "Hyperlipidemia"],
          current_medications: ["Lisinopril 10mg daily", "Metformin 500mg twice daily", "Atorvastatin 20mg daily"],
          allergies: ["Penicillin", "Shellfish", "Latex"],
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
            { test_name: "Total Cholesterol", value: "220 mg/dL", normal_range: "<200 mg/dL", date: "2024-01-15", status: "abnormal" },
            { test_name: "Creatinine", value: "1.1 mg/dL", normal_range: "0.6-1.2 mg/dL", date: "2024-01-15", status: "normal" },
          ],
          visit_history: [
            {
              date: "2024-01-15",
              reason: "Routine Follow-up",
              diagnosis: "Diabetes Management",
              treatment: "Medication adjustment, lifestyle counseling",
              doctor: "Dr. Sarah Smith",
            },
            {
              date: "2023-12-10",
              reason: "Annual Physical Exam",
              diagnosis: "Hypertension, Diabetes",
              treatment: "Blood pressure monitoring, diet modification",
              doctor: "Dr. Michael Johnson",
            },
          ],
          insurance_info: {
            provider: "Blue Cross Blue Shield",
            policy_number: "BC123456789",
            group_number: "GRP001",
            coverage_type: "PPO",
          },
          emergency_contact: {
            name: "Jane Doe",
            relationship: "Spouse",
            phone: "(555) 123-4567",
          },
          medical_history: "Patient has a 10-year history of Type 2 diabetes and hypertension. Recently diagnosed with hyperlipidemia. Family history of cardiovascular disease.",
        }

        setA4ModalPatient(enhancedPatient)
        setShowA4Modal(true)
      }
    } catch (error) {
      console.error("Error fetching patient details:", error)
      alert("Failed to load patient details. Please try again.")
    }
  }

  const handleSavePrescription = (prescription: any) => {
    console.log("Prescription saved:", prescription)
    fetchPrescriptions()
    setShowAIPrescription(false)
    setCurrentView("prescriptions")
    setSelectedPatient(null)
  }

  const handleDownloadPatientData = (patient: PatientDetails) => {
    // Get prescriptions for this patient
    const patientPrescriptions = prescriptions.filter(p => p.patients?.name === patient.name)
    
    const patientData = {
      personalInfo: {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        dateOfBirth: patient.date_of_birth,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        gender: patient.gender || "Not specified",
      },
      medicalInfo: {
        diagnosis: patient.diagnosis,
        allergies: patient.allergies,
        medicalHistory: patient.medical_history,
        currentMedications: patient.current_medications,
        vitalSigns: patient.vital_signs,
      },
      labResults: patient.lab_results,
      visitHistory: patient.visit_history,
      insuranceInfo: patient.insurance_info,
      emergencyContact: patient.emergency_contact,
      prescriptions: patientPrescriptions,
      downloadDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(patientData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const a = document.createElement("a")
    a.href = url
    a.download = `${patient.name.replace(/\s+/g, "_")}_complete_medical_records.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription)
    setShowForm(true)
  }

  const handleUpdatePrescription = async (updatedPrescription: any) => {
    try {
      if (editingPrescription) {
        await apiService.updatePrescription(editingPrescription.id, updatedPrescription)
        fetchPrescriptions()
        setShowForm(false)
        setEditingPrescription(null)
      }
    } catch (error: any) {
      console.error("Error updating prescription:", error)
      alert(`Failed to update prescription: ${error.message || "Unknown error"}`)
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
                <Card key={prescription.id} className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <CardContent className="p-6">
                    {/* Patient Header */}
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                      <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{prescription.patients?.name || "Unknown Patient"}</h3>
                        <p className="text-blue-100 text-sm">Patient ID: {prescription.patient_id?.slice(0, 8) || "N/A"}</p>
                      </div>
                    </div>

                    {/* Medication Info */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-4 border border-purple-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Pill className="h-5 w-5 text-purple-600" />
                          <h4 className="text-lg font-bold text-gray-900">{prescription.medication}</h4>
                        </div>
                        {prescription.instructions?.includes("AI Generated") && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium text-gray-600">Dosage:</span>
                          <p className="text-gray-900 font-semibold">{prescription.dosage}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <span className="font-medium text-gray-600">Frequency:</span>
                          <p className="text-gray-900 font-semibold">{prescription.frequency}</p>
                        </div>
                      </div>
                    </div>

                    {/* Prescription Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        <span className="font-medium">Doctor:</span>
                        <span className="ml-1">{prescription.doctors?.name || "Not specified"}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Duration:</span>
                        <span className="ml-1">{prescription.duration}</span>
                      </div>
                      {prescription.instructions && (
                        <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                          <p className="text-xs text-yellow-800">
                            <strong>Instructions:</strong> {prescription.instructions.substring(0, 80)}
                            {prescription.instructions.length > 80 && "..."}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <Button
                        onClick={() => handleViewPatientDetails(prescription.patient_id || "", prescription.patients?.name || "")}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View All Patient Details
                      </Button>
                      
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(prescription)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(prescription.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>

                    {/* Date Footer */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                      <span>📅 {formatDate(prescription.created_at || new Date())}</span>
                      <Badge variant="outline" className="text-xs">
                        Prescription #{prescription.id.slice(0, 6)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
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
          prescription={editingPrescription}
          onClose={() => {
            setShowForm(false)
            setEditingPrescription(null)
          }}
          onSuccess={(prescription) => {
            if (editingPrescription) {
              handleUpdatePrescription(prescription)
            } else {
              setShowForm(false)
              fetchPrescriptions()
            }
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

      {/* A4 Patient Details Modal */}
      {showA4Modal && a4ModalPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-[210mm] h-[297mm] max-w-full max-h-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Complete Patient Medical Record</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleDownloadPatientData(a4ModalPatient)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setShowA4Modal(false)}
                  variant="outline"
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  ✕ Close
                </Button>
              </div>
            </div>

            {/* A4 Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Patient Header */}
              <div className="border-b-2 border-blue-200 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{a4ModalPatient.name}</h1>
                      <p className="text-gray-600">Patient ID: {a4ModalPatient.id}</p>
                      <p className="text-gray-600">Age: {a4ModalPatient.age} years • {a4ModalPatient.gender}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Generated: {currentDate ? currentDate.toLocaleDateString() : "--/--/----"}</p>
                    <p>Report #: MR-{currentDate ? currentDate.getTime().toString().slice(-6) : "------"}</p>
                  </div>
                </div>
              </div>

              {/* Contact & Insurance Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {a4ModalPatient.email}</p>
                    <p><span className="font-medium">Phone:</span> {a4ModalPatient.phone}</p>
                    <p><span className="font-medium">DOB:</span> {formatDate(a4ModalPatient.date_of_birth)}</p>
                    <p><span className="font-medium">Address:</span> {a4ModalPatient.address}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Insurance Information
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Provider:</span> {a4ModalPatient.insurance_info.provider}</p>
                    <p><span className="font-medium">Policy:</span> {a4ModalPatient.insurance_info.policy_number}</p>
                    <p><span className="font-medium">Group:</span> {a4ModalPatient.insurance_info.group_number}</p>
                    <p><span className="font-medium">Type:</span> {a4ModalPatient.insurance_info.coverage_type}</p>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Current Vital Signs
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(a4ModalPatient.vital_signs).map(([key, value]) => (
                    <div key={key} className="bg-red-50 p-3 rounded-lg text-center">
                      <p className="text-xs font-medium text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-lg font-bold text-red-600">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnoses & Medications */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                    <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                    Current Diagnoses
                  </h3>
                  <div className="space-y-2">
                    {a4ModalPatient.diagnosis.map((diagnosis, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                        {diagnosis}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                    <Pill className="h-5 w-5 mr-2 text-purple-600" />
                    Current Medications
                  </h3>
                  <div className="space-y-2">
                    {a4ModalPatient.current_medications.map((medication, index) => (
                      <div key={index} className="bg-purple-50 p-2 rounded text-sm">
                        {medication}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Recent Prescriptions
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {prescriptions
                    .filter(p => p.patients?.name === a4ModalPatient.name)
                    .slice(0, 4)
                    .map((prescription, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-green-900">{prescription.medication}</p>
                            <p className="text-sm text-green-700">{prescription.dosage}, {prescription.frequency}</p>
                            <p className="text-xs text-green-600">{prescription.instructions?.substring(0, 60)}...</p>
                          </div>
                          <div className="text-right text-xs text-green-600">
                            <p>{formatDate(prescription.created_at || new Date())}</p>
                            <p>{prescription.doctors?.name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Lab Results */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  <Activity className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Lab Results
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">Test</th>
                        <th className="text-left p-2">Value</th>
                        <th className="text-left p-2">Normal Range</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a4ModalPatient.lab_results.map((result, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{result.test_name}</td>
                          <td className="p-2">{result.value}</td>
                          <td className="p-2 text-gray-600">{result.normal_range}</td>
                          <td className="p-2">
                            <Badge 
                              className={
                                result.status === "normal" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {result.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-2">{formatDate(result.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allergies & Emergency Contact */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ Allergies</h3>
                  <div className="space-y-1">
                    {a4ModalPatient.allergies.map((allergy, index) => (
                      <div key={index} className="bg-red-100 p-2 rounded text-sm text-red-800">
                        {allergy}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">📞 Emergency Contact</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {a4ModalPatient.emergency_contact.name}</p>
                    <p><span className="font-medium">Relationship:</span> {a4ModalPatient.emergency_contact.relationship}</p>
                    <p><span className="font-medium">Phone:</span> {a4ModalPatient.emergency_contact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  📋 Medical History Summary
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">{a4ModalPatient.medical_history}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                <p>This is a comprehensive medical record generated on {currentDate ? currentDate.toLocaleDateString() : "--/--/----"} at {currentDate ? currentDate.toLocaleTimeString() : "--:--:--"}</p>
                <p>For medical use only • Confidential Patient Information</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
