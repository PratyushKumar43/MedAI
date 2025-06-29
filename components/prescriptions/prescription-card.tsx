"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Calendar, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Prescription } from "@/types/prescription"
import { apiService } from "@/lib/api"
import { formatDate } from "@/lib/utils"
import { downloadPrescriptionPDF } from "@/lib/pdf-generator"

interface PrescriptionCardProps {
  prescription: Prescription
  onUpdate: () => void
}

export function PrescriptionCard({ prescription, onUpdate }: PrescriptionCardProps) {
  const [loading, setLoading] = useState(false)
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this prescription?")) return

    setLoading(true)
    try {
      await apiService.deletePrescription(prescription.id)
      onUpdate()
    } catch (error: any) {
      console.error("Error deleting prescription:", error)
      alert(`Failed to delete prescription: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true)
    try {
      await downloadPrescriptionPDF({
        ...prescription,
        doctor_name: doctorName,
        patient_name: patientName,
        clinic_name: "MediOca Healthcare Platform",
        clinic_address: "Digital Healthcare Solutions",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download PDF. Please try again.")
    } finally {
      setDownloadingPDF(false)
    }
  }

  // Handle the nested data structure from Supabase joins
  const doctorName = prescription.doctors ? `${prescription.doctors.first_name} ${prescription.doctors.last_name}` : "Unknown Doctor"
  const patientName = prescription.patients ? `${prescription.patients.first_name} ${prescription.patients.last_name}` : "Unknown Patient"
  const patientEmail = prescription.patients?.email || ""

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{prescription.medication}</h3>
          {prescription.is_ai_generated && (
            <Badge className="text-xs bg-blue-500">AI</Badge>
          )}
        </div>
        <div className="relative">
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <strong>Patient:</strong> {patientName}
          {patientEmail && <span className="text-xs text-gray-500"> ({patientEmail})</span>}
        </p>
        <p>
          <strong>Doctor:</strong> {doctorName}
        </p>
        <p>
          <strong>Frequency:</strong> {prescription.frequency}
        </p>
        <p>
          <strong>Duration:</strong> {prescription.duration}
        </p>
        {prescription.instructions && (
          <p>
            <strong>Instructions:</strong>{" "}
            {prescription.instructions.length > 100
              ? `${prescription.instructions.substring(0, 100)}...`
              : prescription.instructions}
          </p>
        )}
        {prescription.medication_details && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            {prescription.medication_details.warnings && (
              <p className="text-amber-600">
                <strong>Warnings:</strong> {prescription.medication_details.warnings.length} items
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(prescription.created_at || new Date())}
        </div>        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
          >
            <Download className="h-4 w-4 mr-1" />
            {downloadingPDF ? "Generating..." : "PDF"}
          </Button>
          <Link href={`/prescriptions/${prescription.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={loading}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
