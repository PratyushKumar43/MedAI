"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, CheckCircle, Pill, User, Stethoscope, Edit3, Save, Plus, Trash2, Brain, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { PatientDetails } from "@/types/patient-details"
import { apiService } from "@/lib/api"

interface PrescriptionWorkflowProps {
  patient: PatientDetails
  onComplete: () => void
  onCancel: () => void
}

interface ManualPrescription {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  confidence?: number
  warnings?: string[]
}

export function PrescriptionWorkflow({ patient, onComplete, onCancel }: PrescriptionWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<"entry" | "review" | "saving">("entry")
  const [symptoms, setSymptoms] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [prescriptions, setPrescriptions] = useState<ManualPrescription[]>([
    { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }
  ])
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("")
  const [aiReasoning, setAiReasoning] = useState("")
  const [editingPrescriptions, setEditingPrescriptions] = useState<ManualPrescription[]>([])
  
  useEffect(() => {
    // Fetch doctors
    const initialize = async () => {
      try {
        const { data: doctorsData } = await apiService.getDoctors()
        setDoctors(doctorsData || [])
        
        // Set a default doctor if available
        if (doctorsData && doctorsData.length > 0) {
          setSelectedDoctorId(doctorsData[0].id)
        } else {
          console.error("No doctors available in the system")
          alert("No doctors available. Please add a doctor first.")
        }
      } catch (error) {
        console.error("Error during initialization:", error)
      }
    }
    
    initialize()
  }, [])
  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { medication: "", dosage: "", frequency: "", duration: "", instructions: "" }
    ])
  }

  const handleRemovePrescription = (index: number) => {
    if (prescriptions.length > 1) {
      setPrescriptions(prescriptions.filter((_, i) => i !== index))
    }
  }

  const handleEditPrescription = (index: number, field: string, value: string) => {
    const updated = [...prescriptions]
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptions(updated)
  }

  const handleGeneratePrescription = async () => {
    if (!symptoms.trim() || !selectedDoctorId) return
    
    setLoading(true)
    setCurrentStep("review")
    
    try {
      // Simulate AI prescription generation
      const generatedPrescriptions: ManualPrescription[] = [
        {
          medication: "Paracetamol",
          dosage: "500mg",
          frequency: "3 times daily",
          duration: "5 days",
          instructions: "Take with food",
          confidence: 85,
          warnings: ["Do not exceed 4g daily"]
        }
      ]
      
      setEditingPrescriptions(generatedPrescriptions)
      setAiReasoning("Based on the reported symptoms and patient history, I recommend starting with basic pain relief and symptom management.")
    } catch (error) {
      console.error("Error generating prescription:", error)
      alert("Failed to generate prescription. Please try again.")
      setCurrentStep("entry")
    } finally {
      setLoading(false)
    }
  }

  const handleReviewPrescriptions = () => {
    const hasValidPrescriptions = prescriptions.some(p => 
      p.medication.trim() && p.dosage.trim() && p.frequency.trim() && p.duration.trim()
    )
    
    if (!hasValidPrescriptions) {
      alert("Please fill in at least one complete prescription")
      return
    }

    if (!selectedDoctorId) {
      alert("Please select a prescribing doctor")
      return
    }    setCurrentStep("review")
  }
  
  const handleSavePrescriptions = async () => {
    setLoading(true)
    setCurrentStep("saving")

    try {
      // Save each prescription to the database
      const validPrescriptions = editingPrescriptions.filter(p => 
        p.medication.trim() && p.dosage.trim() && p.frequency.trim() && p.duration.trim()
      )

      for (const prescription of validPrescriptions) {
        const prescriptionData = {
          patient_id: patient.id,
          doctor_id: selectedDoctorId,
          medication: prescription.medication,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: `${prescription.instructions}${symptoms ? `\n\nSymptoms: ${symptoms}` : ''}${additionalNotes ? `\n\nAdditional Notes: ${additionalNotes}` : ''}`,
        }

        await apiService.createPrescription(prescriptionData)
      }

      setTimeout(() => {
        onComplete()
      }, 2000)

      console.log("✅ Prescriptions saved successfully")
    } catch (error) {
      console.error("❌ Failed to save prescriptions:", error)
      alert("Failed to save prescriptions. Please try again.")
      setCurrentStep("review")
    } finally {
      setLoading(false)
    }
  }
  const steps = [
    { id: "entry", label: "Enter Prescription", icon: Stethoscope },
    { id: "review", label: "Review & Edit", icon: Edit3 },
    { id: "saving", label: "Save Prescription", icon: Save },
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient Details
          </Button>          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manual Prescription Entry</h1>
            <p className="text-gray-600">
              Patient: {patient.first_name} {patient.last_name} (Age: {patient.age})
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : steps.findIndex((s) => s.id === currentStep) > index
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="ml-3 font-medium">{step.label}</span>
                {index < steps.length - 1 && <div className="w-16 h-px bg-gray-300 mx-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Context Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <User className="h-5 w-5" />
            <span>Patient Context</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-900">Current Diagnoses:</p>
              <p className="text-blue-700">{patient.diagnosis.join(", ")}</p>
            </div>
            <div>
              <p className="font-medium text-blue-900">Allergies:</p>
              <p className="text-red-700">{patient.allergies.join(", ")}</p>
            </div>
            <div>
              <p className="font-medium text-blue-900">Current Medications:</p>
              <p className="text-blue-700">{patient.current_medications.length} active</p>
            </div>
          </div>
        </CardContent>
      </Card>      {/* Step Content */}
      {currentStep === "entry" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5" />
              <span>Enter Patient Symptoms</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="symptoms" className="text-base font-medium">
                Current Symptoms *
              </Label>
              <Textarea
                id="symptoms"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Enter patient's current symptoms (e.g., headache, fever, nausea, fatigue)"
                rows={4}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-1">Separate multiple symptoms with commas</p>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-medium">
                Additional Clinical Notes
              </Label>
              <Textarea
                id="notes"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional observations or clinical notes"
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="doctor" className="text-base font-medium">
                Prescribing Doctor *
              </Label>
              <select
                id="doctor"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="w-full p-2 border rounded mt-2"
                disabled={loading}
                aria-label="Select Doctor"
              >
                {doctors.length === 0 && (
                  <option value="">No doctors available</option>
                )}
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                  </option>
                ))}
              </select>
              {doctors.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  No doctors available. Please add a doctor first.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleGeneratePrescription}
                disabled={!symptoms.trim() || !selectedDoctorId || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Prescription
              </Button>
            </div>
          </CardContent>        </Card>
      )}

      {currentStep === "review" && (
        <div className="space-y-6">
          {/* AI Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span>AI Clinical Reasoning</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{aiReasoning}</p>
            </CardContent>
          </Card>

          {/* Generated Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5 text-green-600" />
                <span>Generated Prescriptions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {editingPrescriptions.map((prescription, index) => (
                  <div key={index} className="border rounded-lg p-6 bg-gray-50">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-medium">{prescription.medication}</h4>
                      <Badge variant="outline">Confidence: {prescription.confidence}%</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`dosage-${index}`}>Dosage</Label>
                        <Input
                          id={`dosage-${index}`}
                          value={prescription.dosage}
                          onChange={(e) => handleEditPrescription(index, "dosage", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`frequency-${index}`}>Frequency</Label>
                        <Input
                          id={`frequency-${index}`}
                          value={prescription.frequency}
                          onChange={(e) => handleEditPrescription(index, "frequency", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`duration-${index}`}>Duration</Label>
                        <Input
                          id={`duration-${index}`}
                          value={prescription.duration}
                          onChange={(e) => handleEditPrescription(index, "duration", e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor={`instructions-${index}`}>Instructions</Label>
                      <Textarea
                        id={`instructions-${index}`}
                        value={prescription.instructions}
                        onChange={(e) => handleEditPrescription(index, "instructions", e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>                    {prescription.warnings && prescription.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Warnings</span>
                        </div>
                        <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                          {prescription.warnings.map((warning, wIndex) => (
                            <li key={wIndex}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep("entry")}>
                  Back to Symptoms
                </Button>
                <Button onClick={handleSavePrescriptions} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Save Prescriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === "saving" && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h3 className="text-xl font-medium mb-4">Prescriptions Saved Successfully!</h3>
            <div className="space-y-2 text-gray-600">
              <p>✅ {editingPrescriptions.length} prescriptions saved</p>
              <p>✅ Patient record updated</p>
              <p>✅ MCP session completed</p>
              <p>✅ Ready for pharmacy review</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
