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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PatientDetails } from "@/types/patient-details"
import { formatDate } from "@/lib/utils"
import { apiService } from "@/lib/api"

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

  useEffect(() => {
    if (!initialPatient && patientId) {
      fetchPatientDetails()
    }
  }, [patientId, initialPatient])

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
          <div className="text-right">
            <Button
              onClick={() => onGeneratePrescription(patient)}
              size="lg"
              className="bg-white text-purple-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg"
            >
              <Brain className="h-5 w-5 mr-2" />
              Generate AI Prescription
            </Button>
            <p className="text-blue-100 text-sm mt-2">Powered by Advanced AI</p>
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
            { id: "vitals", label: "Vital Signs", icon: Heart },
            { id: "labs", label: "Lab Results", icon: Activity },
            { id: "history", label: "Visit History", icon: Calendar },
            { id: "medications", label: "Current Medications", icon: Pill },
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

        {activeTab === "vitals" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(patient.vital_signs).map(([key, value]) => (
              <Card key={key}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">{key.replace("_", " ")}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                      {key === "bmi" && (
                        <p className={`text-sm font-medium mt-1 ${bmiStatus.color}`}>{bmiStatus.status}</p>
                      )}
                    </div>
                    <Heart className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        {activeTab === "medications" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5" />
                <span>Current Medications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.current_medications.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Pill className="h-5 w-5 text-blue-500" />
                      <div>
                        <span className="font-medium text-gray-900">{medication}</span>
                        <p className="text-sm text-gray-600">Active prescription</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  </div>
                ))}
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
    </div>
  )
}
