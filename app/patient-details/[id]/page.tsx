"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { apiService } from "@/lib/api"
import { Loader2, User, Calendar, Phone, Mail, MapPin, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function PatientDetailsPage() {
  const params = useParams()
  const patientId = params.id as string
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [symptoms, setSymptoms] = useState("")
  const [aiRecommendations, setAiRecommendations] = useState<any>(null)
  const [generatingPrescription, setGeneratingPrescription] = useState(false)

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails()
    }
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      const response = await apiService.getPatient(patientId)

      // Enhanced patient data for demo
      const enhancedPatient = {
        ...response.data,
        age: calculateAge(response.data.date_of_birth),
        diagnosis: ["Hypertension", "Type 2 Diabetes"],
        current_medications: ["Lisinopril 10mg daily", "Metformin 500mg twice daily"],
        allergies: ["Penicillin", "Shellfish"],
        vital_signs: {
          blood_pressure: "142/88 mmHg",
          heart_rate: 76,
          temperature: 98.4,
          weight: 185,
          height: 68,
          bmi: 28.1,
        },
        lab_results: [
          { test_name: "HbA1c", value: "7.8%", normal_range: "<7%", status: "abnormal" },
          { test_name: "LDL Cholesterol", value: "145 mg/dL", normal_range: "<100 mg/dL", status: "abnormal" },
        ],
        medical_history:
          "Patient has a 10-year history of Type 2 diabetes and hypertension. Family history significant for cardiovascular disease.",
      }

      setPatient(enhancedPatient)
    } catch (error) {
      console.error("Error fetching patient details:", error)
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

  const handleGeneratePrescription = async () => {
    if (!symptoms.trim()) {
      alert("Please enter patient symptoms")
      return
    }

    setGeneratingPrescription(true)
    try {
      // Mock AI prescription generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setAiRecommendations({
        medications: [
          {
            name: "Amlodipine",
            dosage: "5mg",
            frequency: "Once daily",
            duration: "30 days",
            instructions: "Take in the morning with or without food",
          },
        ],
        reasoning:
          "Based on patient symptoms and medical history, this medication is recommended for blood pressure control.",
      })
    } catch (error) {
      console.error("Error generating prescription:", error)
    } finally {
      setGeneratingPrescription(false)
    }
  }

  const handleSavePrescription = async () => {
    try {
      // Save prescription logic here
      alert("Prescription saved successfully!")
      setShowPrescriptionForm(false)
      setSymptoms("")
      setAiRecommendations(null)
    } catch (error) {
      console.error("Error saving prescription:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading patient details...</span>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600">Unable to load patient information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{`${patient.first_name} ${patient.last_name}`}</h1>
                <p className="text-gray-600">
                  Age: {patient.age} • Patient ID: {patient.id}
                </p>
              </div>
            </div>
            <Button onClick={() => setShowPrescriptionForm(true)} className="bg-purple-600 hover:bg-purple-700">
              Generate AI Prescription
            </Button>
          </div>
        </div>

        {/* Patient Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{patient.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>DOB: {new Date(patient.date_of_birth).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{patient.address || "Address not provided"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Vital Signs */}
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Blood Pressure:</span>
                <Badge variant="destructive">{patient.vital_signs?.blood_pressure}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Heart Rate:</span>
                <span>{patient.vital_signs?.heart_rate} bpm</span>
              </div>
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span>{patient.vital_signs?.temperature}°F</span>
              </div>
              <div className="flex justify-between">
                <span>BMI:</span>
                <Badge variant="secondary">{patient.vital_signs?.bmi}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Allergies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>Allergies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.allergies?.map((allergy: string, index: number) => (
                  <Badge key={index} variant="destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical History and Current Medications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Diagnoses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.diagnosis?.map((diag: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {diag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patient.current_medications?.map((med: string, index: number) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    {med}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lab Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Lab Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Test</th>
                    <th className="text-left p-2">Value</th>
                    <th className="text-left p-2">Normal Range</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.lab_results?.map((result: any, index: number) => (
                    <tr key={index} className="border-b">
                      <td className="p-2">{result.test_name}</td>
                      <td className="p-2">{result.value}</td>
                      <td className="p-2">{result.normal_range}</td>
                      <td className="p-2">
                        <Badge variant={result.status === "normal" ? "default" : "destructive"}>{result.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader>
            <CardTitle>Medical History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{patient.medical_history}</p>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Generation Modal */}
      {showPrescriptionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">AI Prescription Generation</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Symptoms</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Enter patient symptoms..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={4}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleGeneratePrescription}
                    disabled={generatingPrescription}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {generatingPrescription ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate AI Prescription"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPrescriptionForm(false)
                      setSymptoms("")
                      setAiRecommendations(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>

                {aiRecommendations && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">AI Recommendations</h3>
                    <div className="space-y-3">
                      {aiRecommendations.medications.map((med: any, index: number) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="font-medium">
                            {med.name} {med.dosage}
                          </div>
                          <div className="text-sm text-gray-600">
                            {med.frequency} for {med.duration}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">{med.instructions}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded">
                      <div className="text-sm text-blue-800">
                        <strong>Clinical Reasoning:</strong> {aiRecommendations.reasoning}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleSavePrescription} className="bg-green-600 hover:bg-green-700">
                        Save Prescription
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
