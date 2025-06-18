"use client"

import { useState, useEffect } from "react"
import { Brain, Activity, AlertTriangle, CheckCircle, Clock, User, Stethoscope, Pill } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mcpServer, type MCPContext } from "@/lib/mcp-server"
import type { PatientDetails } from "@/types/patient-details"

interface MCPDashboardProps {
  patient: PatientDetails
  doctorId: string
  onPrescriptionGenerated?: (prescription: any) => void
}

export function MCPDashboard({ patient, doctorId, onPrescriptionGenerated }: MCPDashboardProps) {
  const [mcpContext, setMcpContext] = useState<MCPContext | null>(null)
  const [sessionActive, setSessionActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [newSymptom, setNewSymptom] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [recommendations, setRecommendations] = useState<any>(null)
  const [generatedPrescription, setGeneratedPrescription] = useState<any>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  useEffect(() => {
    initializeMCPSession()
  }, [patient.id, doctorId])
  const initializeMCPSession = async () => {
    try {
      setLoading(true)
      const context = await mcpServer.initializeSession(patient.id, doctorId)
      setMcpContext(context)
      setSessionActive(true)
      setSessionStartTime(new Date())
      
      // Get initial recommendations
      const recs = await mcpServer.getContextualRecommendations()
      setRecommendations(recs)
    } catch (error) {
      console.error("Failed to initialize MCP session:", error)
    } finally {
      setLoading(false)
    }
  }

  const addSymptom = () => {
    if (newSymptom.trim() && !symptoms.includes(newSymptom.trim())) {
      const updatedSymptoms = [...symptoms, newSymptom.trim()]
      setSymptoms(updatedSymptoms)
      mcpServer.addSymptoms([newSymptom.trim()])
      setNewSymptom("")
    }
  }

  const handleDiagnosisSubmit = async () => {
    if (!diagnosis.trim()) return
    
    try {
      setLoading(true)
      const validation = await mcpServer.setDiagnosis(diagnosis)
      
      if (validation.validated) {
        // Update recommendations after diagnosis
        const recs = await mcpServer.getContextualRecommendations()
        setRecommendations(recs)
      }
    } catch (error) {
      console.error("Failed to set diagnosis:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIPrescription = async () => {
    try {
      setLoading(true)
      const prescription = await mcpServer.generatePrescription()
      setGeneratedPrescription(prescription)
      onPrescriptionGenerated?.(prescription)
    } catch (error) {
      console.error("Failed to generate prescription:", error)
      alert("Please ensure symptoms and diagnosis are provided before generating prescription.")
    } finally {
      setLoading(false)
    }
  }

  const endSession = async () => {
    try {
      const summary = await mcpServer.endSession()
      setSessionActive(false)
      setMcpContext(null)
      alert(`Session ended: ${summary.summary}`)
    } catch (error) {
      console.error("Failed to end session:", error)
    }
  }

  if (loading && !sessionActive) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-6 text-center">
          <Brain className="h-8 w-8 animate-pulse text-blue-600 mx-auto mb-4" />
          <p>Initializing MCP AI Assistant...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* MCP Session Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-blue-600" />
              <span>MCP AI Assistant</span>
              {sessionActive && (
                <Badge className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" />
                  Active Session
                </Badge>
              )}
            </div>
            {sessionActive && (
              <Button onClick={endSession} variant="outline" size="sm">
                End Session
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Patient:</span>
              <p className="font-semibold">{patient.name}</p>
            </div>            <div>
              <span className="font-medium text-gray-600">Session Start:</span>
              <p>{sessionStartTime ? sessionStartTime.toLocaleTimeString() : "--:--:--"}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Doctor ID:</span>
              <p>{doctorId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptoms Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="h-5 w-5 text-purple-600" />
              <span>Symptoms Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                placeholder="Add symptom..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
              />
              <Button onClick={addSymptom} size="sm">Add</Button>
            </div>
            
            <div className="space-y-2">
              {symptoms.map((symptom, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <span>{symptom}</span>
                  <Badge variant="outline">Recorded</Badge>
                </div>
              ))}
            </div>

            {/* Diagnosis Input */}
            <div className="pt-4 border-t">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Working Diagnosis
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <Button 
                  onClick={handleDiagnosisSubmit} 
                  size="sm"
                  disabled={!diagnosis.trim() || loading}
                >
                  Validate
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clinical Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Clinical Alerts & Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations ? (
              <div className="space-y-4">
                {recommendations.clinical_alerts.length > 0 && (
                  <div>
                    <h4 className="font-medium text-red-700 mb-2">🚨 Clinical Alerts</h4>
                    <div className="space-y-1">
                      {recommendations.clinical_alerts.map((alert: string, index: number) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                          {alert}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.drug_interactions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2">⚠️ Drug Interactions</h4>
                    <div className="space-y-1">
                      {recommendations.drug_interactions.map((interaction: string, index: number) => (
                        <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          {interaction}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recommendations.monitoring_requirements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">📊 Monitoring</h4>
                    <div className="space-y-1">
                      {recommendations.monitoring_requirements.map((req: string, index: number) => (
                        <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                          {req}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Initialize session to see recommendations
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Prescription Generation */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-green-600" />
              <span>AI Prescription Generation</span>
            </div>
            <Button 
              onClick={generateAIPrescription}
              disabled={!diagnosis || symptoms.length === 0 || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Prescription
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {generatedPrescription ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">AI Prescription Generated</span>
                <Badge className="bg-green-100 text-green-800">
                  Confidence: {generatedPrescription.confidence_score}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Medications</h4>
                  <div className="space-y-2">
                    {generatedPrescription.medications.map((med: any, index: number) => (
                      <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium">{med.name}</div>
                        <div className="text-sm text-gray-600">{med.dosage} - {med.frequency}</div>
                        {med.cost_estimate && (
                          <div className="text-xs text-gray-500 mt-1">Est. cost: {med.cost_estimate}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Clinical Reasoning</h4>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                    {generatedPrescription.reasoning}
                  </div>

                  {generatedPrescription.red_flags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 text-red-700">🚨 Red Flags</h4>
                      <div className="space-y-1">
                        {generatedPrescription.red_flags.map((flag: string, index: number) => (
                          <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                            {flag}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Add symptoms and diagnosis to generate AI prescription</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
