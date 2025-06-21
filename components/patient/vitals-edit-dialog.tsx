"use client"

import { useState } from "react"
import { Edit, Save, X, Heart, Activity, TrendingUp, Thermometer, Weight, Ruler } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import type { VitalSigns } from "@/types/patient"
import { apiService } from "@/lib/api"

interface VitalsEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
  currentVitals: VitalSigns
  onVitalsUpdated: (updatedVitals: VitalSigns) => void
}

const vitalSignsConfig = [
  {
    key: "blood_pressure",
    label: "Blood Pressure",
    placeholder: "120/80 mmHg",
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  {
    key: "heart_rate",
    label: "Heart Rate",
    placeholder: "72 bpm",
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    key: "temperature",
    label: "Temperature",
    placeholder: "98.6°F",
    icon: Thermometer,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  {
    key: "weight",
    label: "Weight",
    placeholder: "150 lbs",
    icon: Weight,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    key: "height",
    label: "Height",
    placeholder: "70 inches",
    icon: Ruler,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    key: "bmi",
    label: "BMI",
    placeholder: "25.8",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
]

export function VitalsEditDialog({
  open,
  onOpenChange,
  patientId,
  currentVitals,
  onVitalsUpdated,
}: VitalsEditDialogProps) {
  const [vitals, setVitals] = useState<VitalSigns>(currentVitals)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleVitalChange = (key: string, value: string) => {
    setVitals(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  const calculateBMI = () => {
    const height = parseFloat(vitals.height.toString())
    const weight = parseFloat(vitals.weight.toString())
    
    if (height && weight && height > 0) {
      // Convert height from inches to meters, weight is assumed to be in pounds
      const heightInMeters = height * 0.0254
      const weightInKg = weight * 0.453592
      const bmi = weightInKg / (heightInMeters * heightInMeters)
      
      setVitals(prev => ({
        ...prev,
        bmi: bmi.toFixed(1),
      }))
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      // Auto-calculate BMI if height and weight are provided
      const updatedVitals = { ...vitals }
      const height = parseFloat(vitals.height.toString())
      const weight = parseFloat(vitals.weight.toString())
      
      if (height && weight && height > 0) {
        const heightInMeters = height * 0.0254
        const weightInKg = weight * 0.453592
        const bmi = weightInKg / (heightInMeters * heightInMeters)
        updatedVitals.bmi = bmi.toFixed(1)
      }      // Update patient with new vital signs
      const response = await apiService.updatePatient(patientId, {
        vital_signs: updatedVitals,
        updated_at: new Date().toISOString(),
      })

      if (response.data) {
        onVitalsUpdated(updatedVitals)
        onOpenChange(false)
        toast({
          title: "Vital Signs Updated",
          description: "Patient vital signs have been successfully updated.",
        })
      } else {
        throw new Error("Failed to update vital signs")
      }
    } catch (error: any) {
      console.error("Error updating vital signs:", error)
      toast({
        title: "Update Failed", 
        description: error.message || "Failed to update vital signs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setVitals(currentVitals)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto border-2 border-blue-200">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit className="h-5 w-5 text-blue-600" />
            <span>Edit Vital Signs</span>
          </DialogTitle>
          <DialogDescription>
            Update the patient's current vital signs. BMI will be automatically calculated from height and weight.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
          {vitalSignsConfig.map((vital) => {
            const IconComponent = vital.icon
            return (
              <Card key={vital.key} className={`${vital.bgColor} ${vital.borderColor} border`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg bg-white/50 ${vital.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Label htmlFor={vital.key} className={`font-medium ${vital.color}`}>
                      {vital.label}
                    </Label>
                  </div>
                  <Input
                    id={vital.key}
                    value={vitals[vital.key] || ""}
                    onChange={(e) => handleVitalChange(vital.key, e.target.value)}
                    placeholder={vital.placeholder}
                    className="bg-white/70 border-white/50 focus:bg-white"
                    onBlur={() => {
                      if ((vital.key === "height" || vital.key === "weight") && vitals.height && vitals.weight) {
                        calculateBMI()
                      }
                    }}
                  />
                  {vital.key === "bmi" && (
                    <p className="text-xs text-gray-600 mt-2">
                      Auto-calculated from height and weight
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <DialogFooter className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
