"use client"
import { User, Calendar, Phone, Mail, Brain, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "@/types/patient"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface PatientCardProps {
  patient: Patient
  onGeneratePrescription?: (patient: Patient) => void
}

export function PatientCard({ patient, onGeneratePrescription }: PatientCardProps) {
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(patient.date_of_birth)

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{`${patient.first_name} ${patient.last_name}`}</h3>
            <p className="text-sm text-gray-600">Age: {age} years</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Active
          </Badge>
        </div>

        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>{patient.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>DOB: {formatDate(patient.date_of_birth)}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link href={`/patient-details/${patient.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          {onGeneratePrescription && (
            <Button
              onClick={() => onGeneratePrescription(patient)}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Prescription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
