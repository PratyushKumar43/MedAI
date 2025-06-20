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
import { ArrowLeft, Save, Trash2, Plus, Eye, Edit } from "lucide-react"
import { PrescriptionPDFView } from "@/components/prescriptions/prescription-pdf-view"
import type { Prescription, MedicationDetails } from "@/types/prescription"

export default function EditPrescriptionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit')

  useEffect(() => {
    fetchPrescription()
  }, [params.id])

  const fetchPrescription = async () => {
    try {
      setLoading(true)
      const { data } = await apiService.getPrescriptionById(params.id)
      
      // Initialize medication_details if it doesn't exist
      if (data && !data.medication_details) {
        data.medication_details = {
          warnings: [],
          interactions: [],
        }
      }
      
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
        medication_details: prescription.medication_details || {}
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
    if (!prescription) return
    
    // Initialize medication_details if it doesn't exist
    const currentDetails = prescription.medication_details || {}
    
    setPrescription({
      ...prescription,
      medication_details: {
        ...currentDetails,
        [field]: value
      }
    })
  }

  const handleWarningChange = (index: number, value: string) => {
    if (!prescription) return
    
    // Initialize medication_details and warnings if they don't exist
    const currentDetails = prescription.medication_details || {}
    const currentWarnings = Array.isArray(currentDetails.warnings) ? [...currentDetails.warnings] : []
    
    currentWarnings[index] = value
    
    setPrescription({
      ...prescription,
      medication_details: {
        ...currentDetails,
        warnings: currentWarnings
      }
    })
  }
  
  const addWarning = () => {
    if (!prescription) return
    
    // Initialize medication_details and warnings if they don't exist
    const currentDetails = prescription.medication_details || {}
    const currentWarnings = Array.isArray(currentDetails.warnings) ? [...currentDetails.warnings] : []
    
    setPrescription({
      ...prescription,
      medication_details: {
        ...currentDetails,
        warnings: [...currentWarnings, ""]
      }
    })
  }
  
  const removeWarning = (index: number) => {
    if (!prescription) return
    
    // Initialize medication_details and warnings if they don't exist
    const currentDetails = prescription.medication_details || {}
    const currentWarnings = Array.isArray(currentDetails.warnings) ? [...currentDetails.warnings] : []
    
    if (index >= 0 && index < currentWarnings.length) {
      currentWarnings.splice(index, 1)
      
      setPrescription({
        ...prescription,
        medication_details: {
          ...currentDetails,
          warnings: currentWarnings
        }
      })
    }
  }
  
  const handleInteractionChange = (index: number, value: string) => {
    if (!prescription) return
    
    // Initialize medication_details and interactions if they don't exist
    const currentDetails = prescription.medication_details || {}
    const currentInteractions = Array.isArray(currentDetails.interactions) ? [...currentDetails.interactions] : []
    
    currentInteractions[index] = value
    
    setPrescription({
      ...prescription,
      medication_details: {
        ...currentDetails,
        interactions: currentInteractions
      }
    })
  }
  
  const addInteraction = () => {
    if (!prescription) return
    
    // Initialize medication_details and interactions if they don't exist
    const currentDetails = prescription.medication_details || {}
    const currentInteractions = Array.isArray(currentDetails.interactions) ? [...currentDetails.interactions] : []
    
    setPrescription({
      ...prescription,
      medication_details: {
        ...currentDetails,
        interactions: [...currentInteractions, ""]
      }
    })
  }
  
  const removeInteraction = (index: number) => {
    if (!prescription) return
    
    // Initialize medication_details and interactions if they don't exist
    const currentDetails = prescription.medication_details || {}
    const currentInteractions = Array.isArray(currentDetails.interactions) ? [...currentDetails.interactions] : []
    
    if (index >= 0 && index < currentInteractions.length) {
      currentInteractions.splice(index, 1)
      
      setPrescription({
        ...prescription,
        medication_details: {
          ...currentDetails,
          interactions: currentInteractions
        }
      })
    }
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
  const medicationDetails = prescription.medication_details || {}

  return (
    <div className="page-content">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => router.push("/prescriptions")} className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">
              {viewMode === 'view' ? 'View Prescription' : 'Edit Prescription'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'view' ? 'default' : 'outline'}
              onClick={() => setViewMode('view')}
            >
              <Eye className="mr-2 h-4 w-4" />
              View PDF
            </Button>
            <Button
              variant={viewMode === 'edit' ? 'default' : 'outline'}
              onClick={() => setViewMode('edit')}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>        {viewMode === 'view' ? (
          <PrescriptionPDFView prescription={prescription} />
        ) : (
          <>
            <div>
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

          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="genericName">Generic Name</Label>
                <Input
                  id="genericName"
                  value={medicationDetails.generic_name || ""}
                  onChange={(e) => handleDetailChange("generic_name", e.target.value)}
                  placeholder="Generic medication name"
                />
              </div>
              
              <div>
                <Label htmlFor="route">Route of Administration</Label>
                <Input
                  id="route"
                  value={medicationDetails.route || ""}
                  onChange={(e) => handleDetailChange("route", e.target.value)}
                  placeholder="Oral, Topical, etc."
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Warnings</Label>
                  <Button 
                    variant="outline" 
                    onClick={addWarning} 
                    className="h-8 px-2 text-xs flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="border rounded-md p-3 bg-gray-50 min-h-[100px]">
                  {Array.isArray(medicationDetails.warnings) && medicationDetails.warnings.length > 0 ? (
                    <ul className="space-y-2">
                      {medicationDetails.warnings.map((warning, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Input
                            value={warning}
                            onChange={(e) => handleWarningChange(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            onClick={() => removeWarning(index)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[100px] text-gray-400">
                      <p>No warnings added</p>
                      <Button variant="ghost" onClick={addWarning} className="mt-2">
                        <Plus className="h-4 w-4 mr-1" /> Add Warning
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Interactions</Label>
                  <Button 
                    variant="outline" 
                    onClick={addInteraction} 
                    className="h-8 px-2 text-xs flex items-center"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
                
                <div className="border rounded-md p-3 bg-gray-50 min-h-[100px]">
                  {Array.isArray(medicationDetails.interactions) && medicationDetails.interactions.length > 0 ? (
                    <ul className="space-y-2">
                      {medicationDetails.interactions.map((interaction, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Input
                            value={interaction}
                            onChange={(e) => handleInteractionChange(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            onClick={() => removeInteraction(index)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[100px] text-gray-400">
                      <p>No interactions added</p>
                      <Button variant="ghost" onClick={addInteraction} className="mt-2">
                        <Plus className="h-4 w-4 mr-1" /> Add Interaction
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="costEstimate">Cost Estimate</Label>
                <Input
                  id="costEstimate"
                  value={medicationDetails.cost_estimate || ""}
                  onChange={(e) => handleDetailChange("cost_estimate", e.target.value)}
                  placeholder="$10-15/month"
                />
              </div>
            </CardContent>
          </Card>
        </div>        <div className="mt-6 flex justify-end space-x-4">
          <Button variant="outline" onClick={() => router.push("/prescriptions")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            <Save className="mr-2 h-4 w-4" />            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
          </>
        )}
      </div>
    </div>
  )
}
