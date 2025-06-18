"use client"

import { useState, useEffect } from "react"
import {
  User,
  Heart,
  Activity,
  FileText,
  AlertTriangle,
  Phone,
  Shield,
  Calendar,
  Pill,
  Brain,
  Stethoscope,
  TrendingUp,
  MapPin,
  Loader2,
  Download,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PatientDetails } from "@/types/patient-details"
import { formatDate } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { MCPDashboard } from "@/components/mcp/mcp-dashboard"

interface PatientDetailsViewerProps {
  patientId?: string
  patient?: PatientDetails
  onGeneratePrescription: (patient?: PatientDetails) => void
}

export function PatientDetailsViewer({
  patientId,
  patient: initialPatient,
  onGeneratePrescription,
}: PatientDetailsViewerProps) {
  const [patient, setPatient] = useState<PatientDetails | null>(initialPatient || null)
  const [loading, setLoading] = useState(!initialPatient && !!patientId)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false)

  useEffect(() => {
    if (!initialPatient && patientId) {
      fetchPatientDetails()
    }
  }, [patientId, initialPatient])

  useEffect(() => {
    if (patient) {
      fetchPatientPrescriptions()
    }
  }, [patient])

  const fetchPatientDetails = async () => {
    if (!patientId) return

    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getPatient(patientId)

      // Enhance with comprehensive medical data for hackathon demo
      const enhancedPatient: PatientDetails = {
        ...response.data,
        age: calculateAge(response.data.date_of_birth),
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
          {
            test_name: "Total Cholesterol",
            value: "220 mg/dL",
            normal_range: "<200 mg/dL",
            date: "2024-01-15",
            status: "abnormal",
          },
          {
            test_name: "Creatinine",
            value: "1.1 mg/dL",
            normal_range: "0.6-1.2 mg/dL",
            date: "2024-01-15",
            status: "normal",
          },
          {
            test_name: "LDL Cholesterol",
            value: "140 mg/dL",
            normal_range: "<100 mg/dL",
            date: "2024-01-15",
            status: "abnormal",
          },
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
          {
            date: "2023-10-05",
            reason: "Lab Results Review",
            diagnosis: "Hyperlipidemia",
            treatment: "Started statin therapy",
            doctor: "Dr. Sarah Smith",
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
        medical_history:
          "Patient has a 10-year history of Type 2 diabetes and hypertension. Recently diagnosed with hyperlipidemia. Family history of cardiovascular disease. Non-smoker, occasional alcohol use. Sedentary lifestyle.",
      }

      setPatient(enhancedPatient)
    } catch (error: any) {
      console.error("Error fetching patient details:", error)
      setError("Failed to load patient details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientPrescriptions = async () => {
    if (!patient?.id) return

    try {
      setLoadingPrescriptions(true)
      // In a real application, you would fetch prescriptions from the API
      // For demo purposes, we'll use mock data
      const mockPrescriptions = [
        {
          id: "presc-001",
          medication: "Lisinopril",
          dosage: "10mg",
          frequency: "once daily",
          duration: "30 days",
          instructions: "Take in the morning with food",
          created_at: "2024-01-20",
          doctor: "Dr. Sarah Smith",
        },
        {
          id: "presc-002",
          medication: "Metformin",
          dosage: "500mg",
          frequency: "twice daily",
          duration: "90 days",
          instructions: "Take with meals morning and evening",
          created_at: "2024-01-15",
          doctor: "Dr. Michael Johnson",
        },
        {
          id: "presc-003",
          medication: "Atorvastatin",
          dosage: "20mg",
          frequency: "once daily",
          duration: "30 days",
          instructions: "Take in the evening",
          created_at: "2024-01-10",
          doctor: "Dr. Sarah Smith",
        },
      ]

      setPrescriptions(mockPrescriptions)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    } finally {
      setLoadingPrescriptions(false)
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

  const downloadPatientData = () => {
    if (!patient) return

    // Create a comprehensive patient data object for download
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
      prescriptions: prescriptions,
      downloadDate: new Date().toISOString(),
    }

    // Convert to JSON and create a downloadable file
    const dataStr = JSON.stringify(patientData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    // Create download link and trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = `${patient.name.replace(/\s+/g, "_")}_medical_records.json`
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { status: "Normal", color: "text-green-600" }
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-600" }
    return { status: "Obese", color: "text-red-600" }
  }

  const getLabStatus = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "abnormal":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading Patient Details</h3>
          <p className="text-gray-500">Please wait while we fetch the patient information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error Loading Patient</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchPatientDetails} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Patient Selected</h3>
        <p className="text-gray-500">Please select a patient to view their details.</p>
      </div>
    )
  }

  const bmiStatus = getBMIStatus(patient.vital_signs.bmi)

  return (
    <div className="max-w-7xl mx-auto p-6 pt-24 space-y-6">
      {/* Patient Header - Enhanced for Hackathon */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{patient.name}</h1>
              <div className="grid grid-cols-2 gap-4 text-blue-100">
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Age: {patient.age} years
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.phone}
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  ID: {patient.id.slice(0, 8)}
                </p>
                <p className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  {patient.insurance_info.coverage_type}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end space-y-3">
            <Button
              onClick={() => onGeneratePrescription(patient)}
              size="lg"
              className="bg-white text-purple-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Generate AI Prescription
            </Button>
            <Button
              onClick={downloadPatientData}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg shadow-lg border-2 border-green-500"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Complete Records
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                <p className="text-2xl font-bold text-red-600">{patient.vital_signs.blood_pressure}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                <p className="text-2xl font-bold text-blue-600">{patient.vital_signs.heart_rate} bpm</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">BMI</p>
                <p className={`text-2xl font-bold ${bmiStatus.color}`}>{patient.vital_signs.bmi}</p>
                <p className={`text-xs ${bmiStatus.color}`}>{bmiStatus.status}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Medications</p>
                <p className="text-2xl font-bold text-purple-600">{patient.current_medications.length}</p>
              </div>
              <Pill className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
        <nav className="flex space-x-8 px-6">
          {[
            { id: "overview", label: "Medical Overview", icon: Stethoscope },
            { id: "combined", label: "Vitals & Prescriptions ✨", icon: Heart },
            { id: "mcp", label: "AI Assistant 🤖", icon: Brain },
            { id: "labs", label: "Lab Results", icon: Activity },
            { id: "history", label: "Visit History", icon: Calendar },
            { id: "insurance", label: "Insurance Info", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Diagnoses */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Current Diagnoses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.diagnosis.map((diagnosis, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-900">{diagnosis}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Medical History Summary</h4>
                  <p className="text-sm text-gray-700">{patient.medical_history}</p>
                </div>
              </CardContent>
            </Card>

            {/* Critical Alerts */}
            <div className="space-y-4">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Allergy Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patient.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-800">{allergy}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span>Emergency Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{patient.emergency_contact.name}</p>
                    <p className="text-sm text-gray-600">{patient.emergency_contact.relationship}</p>
                    <p className="text-sm font-medium text-blue-600">{patient.emergency_contact.phone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "combined" && (
          <div className="space-y-6">
            {/* Enhanced Combined View with Better Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Vital Signs Section - Expanded */}
              <Card className="xl:col-span-2 bg-gradient-to-br from-red-50 to-pink-50 border-red-100">
                <CardHeader className="border-b border-red-200 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <span>Current Vital Signs</span>
                    </div>
                    <Badge className="bg-red-100 text-red-700">Live Data</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(patient.vital_signs).map(([key, value]) => (
                      <div key={key} className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 capitalize mb-1">
                              {key.replace("_", " ")}
                            </p>
                            <p className="text-xl font-bold text-gray-900">{value}</p>
                            {key === "bmi" && (
                              <p className={`text-sm font-medium mt-1 ${bmiStatus.color}`}>{bmiStatus.status}</p>
                            )}
                            {key === "blood_pressure" && (
                              <p className="text-xs text-gray-500 mt-1">mmHg</p>
                            )}
                            {key === "heart_rate" && (
                              <p className="text-xs text-gray-500 mt-1">beats/min</p>
                            )}
                            {key === "temperature" && (
                              <p className="text-xs text-gray-500 mt-1">°F</p>
                            )}
                          </div>
                          <div className="ml-3">
                            {key === "blood_pressure" && <Heart className="h-7 w-7 text-red-500 opacity-70" />}
                            {key === "heart_rate" && <Activity className="h-7 w-7 text-blue-500 opacity-70" />}
                            {key === "bmi" && <TrendingUp className="h-7 w-7 text-green-500 opacity-70" />}
                            {key === "temperature" && <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center"><span className="text-orange-600 text-xs font-bold">°F</span></div>}
                            {key === "weight" && <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center"><span className="text-purple-600 text-xs font-bold">lb</span></div>}
                            {key === "height" && <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center"><span className="text-indigo-600 text-xs font-bold">in</span></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Prescriptions Section */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                <CardHeader className="border-b border-purple-200 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-purple-600" />
                      <span>Recent Prescriptions</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingPrescriptions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                  ) : prescriptions.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {prescriptions.map((prescription, index) => (
                        <div key={index} className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-900 mb-1">{prescription.medication}</h4>
                              <p className="text-purple-700 font-medium">
                                {prescription.dosage}, {prescription.frequency}
                              </p>
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{prescription.instructions}</p>
                              <div className="flex items-center mt-3 text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(prescription.created_at)} • {prescription.doctor}</span>
                              </div>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 ml-4">{prescription.duration}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No active prescriptions</p>
                      <Button
                        onClick={() => onGeneratePrescription(patient)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Create First Prescription
                      </Button>
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t border-purple-200">
                    <Button
                      onClick={() => onGeneratePrescription(patient)}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate New AI Prescription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Medications - Full Width */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100">
              <CardHeader className="border-b border-blue-200 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    <span>Current Medications ({patient.current_medications.length})</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Long-term</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.current_medications.map((medication, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-blue-900 block">{medication}</span>
                        <span className="text-xs text-blue-600">Ongoing treatment</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Medication Safety Notice */}
                <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-800 mb-1">Medication Safety Notes</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Always verify medication list with patient at each visit</li>
                        <li>• Check for potential drug interactions before prescribing</li>
                        <li>• Review allergies: {patient.allergies.join(", ")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "mcp" && (
          <MCPDashboard 
            patient={patient} 
            doctorId="dr-current-session" 
            onPrescriptionGenerated={(prescription) => {
              console.log("MCP Generated Prescription:", prescription)
              // Handle the generated prescription
              onGeneratePrescription(patient)
            }}
          />
        )}

        {activeTab === "labs" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Lab Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Test Name</th>
                      <th className="text-left py-3 px-4 font-medium">Value</th>
                      <th className="text-left py-3 px-4 font-medium">Normal Range</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.lab_results.map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{result.test_name}</td>
                        <td className="py-3 px-4">{result.value}</td>
                        <td className="py-3 px-4 text-gray-600">{result.normal_range}</td>
                        <td className="py-3 px-4">{formatDate(result.date)}</td>
                        <td className="py-3 px-4">
                          <Badge className={getLabStatus(result.status)}>{result.status.toUpperCase()}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Visit History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patient.visit_history.map((visit, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6 py-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-lg">{visit.reason}</h4>
                      <span className="text-sm text-gray-500">{formatDate(visit.date)}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                      </p>
                      <p>
                        <strong>Treatment:</strong> {visit.treatment}
                      </p>
                      <p>
                        <strong>Provider:</strong> {visit.doctor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "insurance" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Insurance Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Insurance Provider</label>
                  <p className="text-lg font-medium">{patient.insurance_info.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Coverage Type</label>
                  <p className="text-lg font-medium">{patient.insurance_info.coverage_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Policy Number</label>
                  <p className="text-lg font-mono">{patient.insurance_info.policy_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Group Number</label>
                  <p className="text-lg font-mono">{patient.insurance_info.group_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Download Button - Bottom Floating */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <Button
            onClick={downloadPatientData}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-2xl border border-green-500 transition-all duration-300 transform hover:scale-105"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Complete Records
          </Button>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Export all patient data as JSON
            <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900"></div>
          </div>
          
          {/* Pulse animation ring */}
          <div className="absolute inset-0 rounded-lg bg-green-600 opacity-30 animate-ping"></div>
        </div>
      </div>
    </div>
  )
}
