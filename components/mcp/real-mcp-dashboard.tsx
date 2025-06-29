"use client"

import { useState, useEffect } from "react"
import { Brain, Activity, AlertTriangle, CheckCircle, Clock, User, Stethoscope, Pill, Zap, Bot, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { realMCPServer, type MCPSession, type PatientContext } from "@/lib/real-mcp-server"
import type { PatientDetails } from "@/types/patient-details"

interface MCPDashboardProps {
  patient: PatientDetails
  doctorId: string
  onPrescriptionGenerated?: (prescription: any) => void
}

export function MCPDashboard({ patient, doctorId, onPrescriptionGenerated }: MCPDashboardProps) {
  const [session, setSession] = useState<MCPSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [newSymptom, setNewSymptom] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [aiProvider, setAIProvider] = useState<'gemini'>('gemini')
  const [connectionStatus, setConnectionStatus] = useState(false)
  const [aiProviderStatus, setAIProviderStatus] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // Check connection status
    setConnectionStatus(realMCPServer.getConnectionStatus())
    setAIProviderStatus(realMCPServer.getAIProviderStatus())
    
    // Set up event listeners
    const handleSessionCreated = (data: any) => {
      console.log('Session created:', data)
    }

    const handleSymptomsAdded = (data: any) => {
      console.log('Symptoms analyzed:', data)
      refreshSession()
    }

    const handleDiagnosisSet = (data: any) => {
      console.log('Diagnosis validated:', data)
      refreshSession()
    }

    const handlePrescriptionGenerated = (data: any) => {
      console.log('Prescription generated:', data)
      if (onPrescriptionGenerated) {
        onPrescriptionGenerated(data.prescription)
      }
      refreshSession()
    }

    realMCPServer.on('sessionCreated', handleSessionCreated)
    realMCPServer.on('symptomsAdded', handleSymptomsAdded)
    realMCPServer.on('diagnosisSet', handleDiagnosisSet)
    realMCPServer.on('prescriptionGenerated', handlePrescriptionGenerated)

    return () => {
      realMCPServer.off('sessionCreated', handleSessionCreated)
      realMCPServer.off('symptomsAdded', handleSymptomsAdded)
      realMCPServer.off('diagnosisSet', handleDiagnosisSet)
      realMCPServer.off('prescriptionGenerated', handlePrescriptionGenerated)
    }
  }, [onPrescriptionGenerated])

  const refreshSession = () => {
    if (session) {
      const updatedSession = realMCPServer.getSession(session.id)
      setSession(updatedSession || null)
    }
  }

  const initializeSession = async () => {
    setLoading(true)
    try {      const patientContext: PatientContext = {
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        age: patient.age,
        gender: patient.gender || 'Not specified',
        medicalHistory: Array.isArray(patient.medical_history) 
          ? patient.medical_history 
          : typeof patient.medical_history === 'string' 
            ? patient.medical_history.split(',').map((h: string) => h.trim()).filter(Boolean) 
            : [],        currentMedications: Array.isArray(patient.current_medications)
          ? patient.current_medications
          : patient.current_medications
            ? String(patient.current_medications).split(',').map((m: string) => m.trim()).filter(Boolean) 
            : [],
        allergies: Array.isArray(patient.allergies)
          ? patient.allergies
          : patient.allergies
            ? String(patient.allergies).split(',').map((a: string) => a.trim()).filter(Boolean) 
            : [],
        vitals: {
          bloodPressure: patient.vital_signs?.blood_pressure || 'Not recorded',
          heartRate: patient.vital_signs?.heart_rate || 0,
          temperature: patient.vital_signs?.temperature || 0,
          oxygenSaturation: (patient.vital_signs as any)?.oxygen_saturation || 0
        }
      }

      const sessionId = await realMCPServer.createSession(patientContext, aiProvider)
      const newSession = realMCPServer.getSession(sessionId)
      setSession(newSession || null)
    } catch (error) {
      console.error('Failed to initialize session:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSymptoms = async () => {
    if (!session || !newSymptom.trim()) return

    setLoading(true)
    try {
      const symptomList = newSymptom.split(',').map(s => s.trim()).filter(Boolean)
      await realMCPServer.addSymptoms(session.id, symptomList)
      setNewSymptom('')
    } catch (error) {
      console.error('Failed to add symptoms:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateDiagnosis = async () => {
    if (!session || !diagnosis.trim()) return

    setLoading(true)
    try {
      await realMCPServer.setDiagnosis(session.id, diagnosis)
    } catch (error) {
      console.error('Failed to validate diagnosis:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePrescription = async () => {
    if (!session) return

    setLoading(true)
    try {
      await realMCPServer.generatePrescription(session.id)
    } catch (error) {
      console.error('Failed to generate prescription:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeSession = async () => {
    if (!session) return
    
    try {
      await realMCPServer.closeSession(session.id)
      setSession(null)
    } catch (error) {
      console.error('Failed to close session:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Alert className={connectionStatus ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <div className="flex items-center space-x-2">
          {connectionStatus ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          <AlertDescription>
            {connectionStatus 
              ? '✅ Real MCP Server Connected - AI providers active'
              : '⚠️ Using fallback mode - Configure AI API keys in environment variables'
            }
          </AlertDescription>
        </div>
      </Alert>

      {/* AI Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Provider Status</span>
          </CardTitle>
        </CardHeader>        <CardContent>
          <div className="flex items-center space-x-2">
            {Object.entries(aiProviderStatus).map(([provider, status]) => (
              <div key={provider} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm capitalize">{provider === 'gemini' ? '✨ Gemini AI' : provider}</span>
                <Badge variant={status ? 'default' : 'secondary'}>
                  {status ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      {!session ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>Initialize AI Session</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">            {/* AI Provider Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">AI Provider</label>
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled
                >
                  ✨ Gemini (Active)
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Using Google Gemini AI for prescription generation</p>
            </div>

            <Button 
              onClick={initializeSession} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Initializing AI Session...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Start Real AI Session</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Active AI Session</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(session.startTime).toLocaleTimeString()}</span>
                  </Badge>
                  <Button variant="destructive" size="sm" onClick={closeSession}>
                    End Session
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Session ID:</span>
                  <p className="text-gray-600 font-mono text-xs">{session.id.slice(0, 8)}...</p>
                </div>
                <div>
                  <span className="font-medium">AI Provider:</span>
                  <Badge>{session.aiProvider}</Badge>
                </div>
                <div>
                  <span className="font-medium">Symptoms:</span>
                  <p className="text-gray-600">{session.symptoms.length}</p>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${session.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs">{Math.round(session.confidence * 100)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Symptom Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Add Symptoms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter patient symptoms (comma-separated)"
                value={newSymptom}
                onChange={(e) => setNewSymptom(e.target.value)}
                rows={3}
              />
              <Button onClick={addSymptoms} disabled={loading || !newSymptom.trim()}>
                {loading ? 'Analyzing...' : 'Analyze Symptoms with AI'}
              </Button>
              {session.symptoms.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Current Symptoms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.symptoms.map((symptom, index) => (
                      <Badge key={index} variant="secondary">{symptom}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diagnosis Input */}
          <Card>
            <CardHeader>
              <CardTitle>Set Diagnosis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Enter preliminary diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              <Button onClick={validateDiagnosis} disabled={loading || !diagnosis.trim()}>
                {loading ? 'Validating...' : 'Validate with AI'}
              </Button>
              {session.currentDiagnosis && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Current Diagnosis:</h4>
                  <Badge variant="outline">{session.currentDiagnosis}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prescription Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Pill className="h-5 w-5" />
                <span>Generate Prescription</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={generatePrescription} disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate AI Prescription'}
              </Button>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          {session.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI Recommendations ({session.recommendations.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {session.recommendations.map((rec, index) => (
                  <div key={rec.id || index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{rec.type.replace('_', ' ')}</Badge>
                        <Badge variant="secondary">{rec.aiProvider}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(rec.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    {rec.warnings && rec.warnings.length > 0 && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription>
                          <ul className="list-disc list-inside">
                            {rec.warnings.map((warning, idx) => (
                              <li key={idx} className="text-red-700">{warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="text-sm">
                      <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
                        {typeof rec.content === 'object' 
                          ? JSON.stringify(rec.content, null, 2)
                          : rec.content
                        }
                      </pre>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${rec.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{Math.round(rec.confidence * 100)}%</span>
                      </div>
                      {rec.reasoning && (
                        <Button variant="ghost" size="sm">
                          View Reasoning
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
