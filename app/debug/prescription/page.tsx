"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { saveSimplePrescription, savePrescriptionWithDetails, checkPrescriptionsTable } from "@/lib/prescription-fix"
import { apiService } from "@/lib/api"

export default function PrescriptionDebugPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [tableInfo, setTableInfo] = useState<any>(null)
  const [operationResult, setOperationResult] = useState<any>(null)
  const [operationLog, setOperationLog] = useState<string[]>([])

  useEffect(() => {
    fetchPatients()
    checkTable()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { data } = await apiService.getPatients()
      setPatients(data || [])
      if (data && data.length > 0) {
        setSelectedPatient(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching patients:", error)
      addToLog("Error fetching patients: " + JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }

  const checkTable = async () => {
    try {
      const result = await checkPrescriptionsTable()
      setTableInfo(result)
      addToLog("Table check result: " + JSON.stringify(result, null, 2))
    } catch (error) {
      console.error("Error checking table:", error)
      addToLog("Error checking table: " + JSON.stringify(error))
    }
  }

  const handleSaveSimple = async () => {
    if (!selectedPatient) {
      alert("Please select a patient first")
      return
    }

    try {
      setOperationResult(null)
      addToLog("Saving simple prescription...")
      const result = await saveSimplePrescription(selectedPatient)
      setOperationResult(result)
      addToLog("Simple prescription result: " + JSON.stringify(result, null, 2))
    } catch (error) {
      console.error("Error in save simple:", error)
      setOperationResult({ error })
      addToLog("Error saving simple prescription: " + JSON.stringify(error))
    }
  }

  const handleSaveWithDetails = async () => {
    if (!selectedPatient) {
      alert("Please select a patient first")
      return
    }

    try {
      setOperationResult(null)
      addToLog("Saving prescription with details...")
      const result = await savePrescriptionWithDetails(selectedPatient)
      setOperationResult(result)
      addToLog("Prescription with details result: " + JSON.stringify(result, null, 2))
    } catch (error) {
      console.error("Error in save with details:", error)
      setOperationResult({ error })
      addToLog("Error saving prescription with details: " + JSON.stringify(error))
    }
  }

  const addToLog = (message: string) => {
    setOperationLog((prev) => [message, ...prev])
  }

  return (
    <div className="page-content">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Prescription Debug Page</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
            </CardHeader>
            <CardContent>
              {tableInfo ? (
                <div className="space-y-4">
                  <div>
                    <strong>Table Exists:</strong> {tableInfo.tableExists ? "Yes" : "No"}
                  </div>

                  {tableInfo.hasRequiredColumns && (
                    <div>
                      <strong>Required Columns:</strong>
                      <ul className="list-disc pl-5 mt-2">
                        {Object.entries(tableInfo.hasRequiredColumns || {}).map(([column, exists]) => (
                          <li key={column} className={exists ? "text-green-600" : "text-red-600"}>
                            {column}: {exists ? "Yes" : "No"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <strong>Test Query Successful:</strong>{" "}
                    {tableInfo.testQuerySuccessful ? "Yes" : "No"}
                  </div>

                  {tableInfo.testQueryError && (
                    <div className="text-red-600">
                      <strong>Test Query Error:</strong> {tableInfo.testQueryError}
                    </div>
                  )}

                  <Button onClick={checkTable} className="mt-4">
                    Refresh Table Info
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">Loading table information...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Prescription Save</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Select Patient:</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedPatient || ""}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    aria-label="Select Patient"
                  >
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {`${patient.first_name} ${patient.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleSaveSimple}
                    disabled={!selectedPatient || loading}
                    className="flex-1"
                  >
                    Save Simple Prescription
                  </Button>
                  <Button
                    onClick={handleSaveWithDetails}
                    disabled={!selectedPatient || loading}
                    className="flex-1"
                  >
                    Save With Details
                  </Button>
                </div>

                {operationResult && (
                  <div className={`mt-4 p-4 rounded ${operationResult.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className={`font-bold ${operationResult.error ? 'text-red-600' : 'text-green-600'}`}>
                      {operationResult.error ? 'Error' : 'Success'}
                    </h3>
                    <pre className="text-xs mt-2 overflow-auto max-h-40">
                      {JSON.stringify(operationResult, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Operation Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-auto max-h-96">
              {operationLog.map((log, index) => (
                <div key={index} className="mb-2">
                  {log}
                </div>
              ))}
              {operationLog.length === 0 && <div>No operations logged yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
