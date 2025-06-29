"use client"

import { useState } from "react"
import { Download, FileText, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Prescription } from "@/types/prescription"
import { downloadPrescriptionPDF, downloadPrescriptionFromHTML } from "@/lib/pdf-generator"
import { formatDate } from "@/lib/utils"

interface PrescriptionPDFViewProps {
  prescription: Prescription
  showDownloadButton?: boolean
}

export function PrescriptionPDFView({ prescription, showDownloadButton = true }: PrescriptionPDFViewProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      await downloadPrescriptionPDF({
        ...prescription,
        doctor_name: prescription.doctors ? `${prescription.doctors.first_name} ${prescription.doctors.last_name}` : "Unknown Doctor",
        patient_name: prescription.patients ? `${prescription.patients.first_name} ${prescription.patients.last_name}` : "Unknown Patient",
        clinic_name: "MediOca Healthcare Platform",
        clinic_address: "Digital Healthcare Solutions",
      })
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download PDF. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadFromHTML = async () => {
    setDownloading(true)
    try {
      await downloadPrescriptionFromHTML({
        ...prescription,
        doctor_name: prescription.doctors ? `${prescription.doctors.first_name} ${prescription.doctors.last_name}` : "Unknown Doctor",
        patient_name: prescription.patients ? `${prescription.patients.first_name} ${prescription.patients.last_name}` : "Unknown Patient",
      }, "prescription-view")
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Failed to download PDF. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {showDownloadButton && (
        <div className="mb-6 flex gap-3 justify-end print:hidden">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Generating PDF..." : "Download PDF"}
          </Button>
          <Button
            onClick={handleDownloadFromHTML}
            disabled={downloading}
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            {downloading ? "Generating..." : "HTML to PDF"}
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-gray-600 text-gray-600 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      )}

      {/* Prescription View for PDF/Print */}
      <div 
        id="prescription-view"
        className="bg-white p-8 shadow-lg rounded-lg print:shadow-none print:rounded-none"
        style={{ minHeight: "297mm" }} // A4 height
      >
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">MediOca Healthcare Platform</h1>
          <p className="text-gray-600 text-lg">Digital Healthcare Solutions</p>
          <div className="mt-4">
            <h2 className="text-2xl font-semibold text-gray-800">PRESCRIPTION</h2>
          </div>
        </div>

        {/* Prescription Info Bar */}
        <div className="flex justify-between items-center mb-8 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Prescription ID</p>
            <p className="font-mono font-semibold">{prescription.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date Issued</p>
            <p className="font-semibold">{formatDate(prescription.created_at || new Date())}</p>
          </div>
          {prescription.is_ai_generated && (
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <p className="text-xs font-semibold text-blue-800">AI Assisted</p>
            </div>
          )}
        </div>

        {/* Doctor and Patient Info */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">
                  Dr. {prescription.doctors ? `${prescription.doctors.first_name} ${prescription.doctors.last_name}` : "Unknown Doctor"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Specialization</p>
                <p className="text-gray-800">{prescription.doctors?.specialization || "General Practitioner"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">License</p>
                <p className="text-gray-800">Available on request</p>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold text-gray-900">
                  {prescription.patients ? `${prescription.patients.first_name} ${prescription.patients.last_name}` : "Unknown Patient"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-800">{prescription.patients?.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="text-gray-800">Not specified</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescription Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">Prescription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-gray-300 rounded-lg p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Medication</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{prescription.medication}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Dosage</p>
                  <p className="text-lg font-semibold text-gray-800 mt-1">{prescription.dosage}</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Frequency</p>
                  <p className="text-lg text-gray-800 mt-1">{prescription.frequency}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Duration</p>
                  <p className="text-lg text-gray-800 mt-1">{prescription.duration}</p>
                </div>
              </div>

              {prescription.instructions && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Instructions</p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-gray-800 leading-relaxed">{prescription.instructions}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Warnings and Additional Info */}
        {prescription.medication_details?.warnings && prescription.medication_details.warnings.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg text-red-700 flex items-center">
                <span className="mr-2">⚠️</span>
                Important Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <ul className="space-y-2">
                  {prescription.medication_details.warnings.map((warning, index) => (
                    <li key={index} className="text-red-800 flex items-start">
                      <span className="mr-2 mt-1">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer/Signature Section */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="flex justify-between items-end">
            <div>
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-2">Doctor's Signature</p>
                <div className="border-b-2 border-gray-400 w-48 h-12"></div>
              </div>
            </div>
            <div>
              <div className="mb-8">
                <p className="text-sm text-gray-600 mb-2">Date</p>
                <div className="border-b-2 border-gray-400 w-32 h-12"></div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 text-xs text-gray-500">
            <p>This is a computer-generated prescription from MediOca Healthcare Platform.</p>
            <p>Please verify all details before dispensing medication.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
