"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiService } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import type { Prescription } from "@/types/prescription"

export default function EditPrescriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPrescription()
  }, [params.id])

  const fetchPrescription = async () => {
    try {
      setLoading(true)
      const { data } = await apiService.getPrescriptionById(params.id)
      setPrescription(data)
    } catch (error) {
      console.error("Error fetching prescription:", error)
      alert("Failed to fetch prescription details")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!prescription) return

    try {
      setSaving(true)
      await apiService.updatePrescription(params.id, {
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
        medication_details: prescription.medication_details
      })
      alert("Prescription updated successfully")
      router.push("/prescriptions")
    } catch (error) {
      console.error("Error updating prescription:", error)
      alert("Failed to update prescription")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    if (!prescription) return
    setPrescription({
      ...prescription,
      [field]: value
    })
  }

  const handleDetailChange = (field: string, value: any) => {
    if (!prescription || !prescription.medication_details) return
    setPrescription({
      ...prescription,
      medication_details: {
        ...prescription.medication_details,
        [field]: value
      }
    })
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                <p className="mt-4 text-muted-foreground">Loading prescription details...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="page-content">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center min-h-[300px]">
                <p className="text-muted-foreground">Prescription not found</p>
                <Button className="mt-4" onClick={() => router.push("/prescriptions")}>
                  Back to Prescriptions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.push("/prescriptions")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Prescription</h1>
          {prescription.is_ai_generated && (
            <Badge className="ml-4 bg-blue-500">AI Generated</Badge>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  value={prescription.medication}
                  onChange={(e) => handleChange("medication", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={prescription.dosage}
                  onChange={(e) => handleChange("dosage", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={prescription.frequency}
                  onChange={(e) => handleChange("frequency", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={prescription.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={prescription.instructions || ""}
                  onChange={(e) => handleChange("instructions", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {prescription.medication_details && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {prescription.medication_details.generic_name && (
                  <div>
                    <Label htmlFor="genericName">Generic Name</Label>
                    <Input
                      id="genericName"
                      value={prescription.medication_details.generic_name}
                      onChange={(e) => handleDetailChange("generic_name", e.target.value)}
                    />
                  </div>
                )}
                {prescription.medication_details.route && (
                  <div>
                    <Label htmlFor="route">Route</Label>
                    <Input
                      id="route"
                      value={prescription.medication_details.route}
                      onChange={(e) => handleDetailChange("route", e.target.value)}
                    />
                  </div>
                )}
                {prescription.medication_details.warnings && (
                  <div>
                    <Label>Warnings</Label>
                    <div className="border rounded-md p-3 bg-gray-50">
                      <ul className="list-disc pl-5 space-y-1">
                        {prescription.medication_details.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {prescription.medication_details.interactions && (
                  <div>
                    <Label>Interactions</Label>
                    <div className="border rounded-md p-3 bg-gray-50">
                      <ul className="list-disc pl-5 space-y-1">
                        {prescription.medication_details.interactions.map((interaction, index) => (
                          <li key={index}>{interaction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {prescription.medication_details.cost_estimate && (
                  <div>
                    <Label htmlFor="costEstimate">Cost Estimate</Label>
                    <Input
                      id="costEstimate"
                      value={prescription.medication_details.cost_estimate}
                      onChange={(e) => handleDetailChange("cost_estimate", e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.push("/prescriptions")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
