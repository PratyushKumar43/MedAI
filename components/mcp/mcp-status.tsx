"use client"

import { useState, useEffect } from "react"
import { Activity, Clock, CheckCircle, AlertTriangle, Brain, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { mcpServer } from "@/lib/mcp-server"

interface MCPStatusProps {
  compact?: boolean
}

export function MCPStatus({ compact = false }: MCPStatusProps) {
  const [sessionActive, setSessionActive] = useState(false)
  const [lastActivity, setLastActivity] = useState<string | null>(null)
  const [eventHistory, setEventHistory] = useState<any[]>([])
  const [sessionStats, setSessionStats] = useState({
    symptoms: 0,
    diagnosis: "",
    prescriptions: 0,
    alerts: 0
  })

  useEffect(() => {
    // Set up event listeners
    const handleSessionStarted = (payload: any) => {
      setSessionActive(true)
      setLastActivity("Session started")
      setEventHistory(prev => [...prev, { type: "session_started", ...payload, timestamp: new Date() }])
    }

    const handleSymptomAdded = (payload: any) => {
      setLastActivity(`Added ${payload.symptoms.length} symptom(s)`)
      setSessionStats(prev => ({ ...prev, symptoms: payload.total_symptoms }))
      setEventHistory(prev => [...prev, { type: "symptom_added", ...payload, timestamp: new Date() }])
    }

    const handleDiagnosisSet = (payload: any) => {
      setLastActivity("Diagnosis validated")
      setSessionStats(prev => ({ ...prev, diagnosis: payload.diagnosis }))
      setEventHistory(prev => [...prev, { type: "diagnosis_set", ...payload, timestamp: new Date() }])
    }

    const handlePrescriptionGenerated = (payload: any) => {
      setLastActivity("AI prescription generated")
      setSessionStats(prev => ({ ...prev, prescriptions: payload.medication_count }))
      setEventHistory(prev => [...prev, { type: "prescription_generated", ...payload, timestamp: new Date() }])
    }

    const handleSessionEnded = (payload: any) => {
      setSessionActive(false)
      setLastActivity("Session ended")
      setEventHistory(prev => [...prev, { type: "session_ended", ...payload, timestamp: new Date() }])
      // Reset stats
      setSessionStats({ symptoms: 0, diagnosis: "", prescriptions: 0, alerts: 0 })
    }

    // Register event listeners
    mcpServer.on('session_started', handleSessionStarted)
    mcpServer.on('symptom_added', handleSymptomAdded)
    mcpServer.on('diagnosis_set', handleDiagnosisSet)
    mcpServer.on('prescription_generated', handlePrescriptionGenerated)
    mcpServer.on('session_ended', handleSessionEnded)

    // Check initial state
    setSessionActive(mcpServer.isSessionActive)

    // Cleanup
    return () => {
      mcpServer.off('session_started', handleSessionStarted)
      mcpServer.off('symptom_added', handleSymptomAdded)
      mcpServer.off('diagnosis_set', handleDiagnosisSet)
      mcpServer.off('prescription_generated', handlePrescriptionGenerated)
      mcpServer.off('session_ended', handleSessionEnded)
    }
  }, [])

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className={`h-2 w-2 rounded-full ${sessionActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="font-medium">MCP Assistant</span>
        <Badge variant={sessionActive ? "default" : "outline"} className="text-xs">
          {sessionActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    )
  }

  return (
    <Card className="border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span>MCP Assistant Status</span>
          </div>
          <Badge 
            variant={sessionActive ? "default" : "outline"}
            className={sessionActive ? "bg-green-100 text-green-800" : ""}
          >
            {sessionActive ? (
              <>
                <Activity className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              "Inactive"
            )}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session Stats */}
        {sessionActive && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">{sessionStats.symptoms}</div>
              <div className="text-xs text-blue-700">Symptoms</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">{sessionStats.diagnosis ? "✓" : "—"}</div>
              <div className="text-xs text-purple-700">Diagnosis</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">{sessionStats.prescriptions}</div>
              <div className="text-xs text-green-700">Medications</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">{sessionStats.alerts}</div>
              <div className="text-xs text-orange-700">Alerts</div>
            </div>
          </div>
        )}

        {/* Last Activity */}
        {lastActivity && (
          <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">Last: {lastActivity}</span>
          </div>
        )}

        {/* Recent Events */}
        {eventHistory.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {eventHistory.slice(-5).reverse().map((event, index) => (
                <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="flex-shrink-0">
                    {event.type === 'session_started' && <Zap className="h-3 w-3 text-green-500" />}
                    {event.type === 'symptom_added' && <Activity className="h-3 w-3 text-blue-500" />}
                    {event.type === 'diagnosis_set' && <CheckCircle className="h-3 w-3 text-purple-500" />}
                    {event.type === 'prescription_generated' && <Brain className="h-3 w-3 text-green-500" />}
                    {event.type === 'session_ended' && <AlertTriangle className="h-3 w-3 text-gray-500" />}
                  </div>
                  <span className="flex-1">
                    {event.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                  <span className="text-gray-400">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        {!sessionActive && (
          <div className="text-center text-gray-500 text-sm">
            Navigate to a patient's "AI Assistant" tab to start an MCP session
          </div>
        )}
      </CardContent>
    </Card>
  )
}
