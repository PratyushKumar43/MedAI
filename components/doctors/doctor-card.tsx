"use client"

import { useState } from "react"
import { MoreVertical, Edit, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Doctor } from "@/types/doctor"
import { apiService } from "@/lib/api"

interface DoctorCardProps {
  doctor: Doctor
  onUpdate: () => void
}

export function DoctorCard({ doctor, onUpdate }: DoctorCardProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    setLoading(true)
    try {
      await apiService.deleteDoctor(doctor.id)
      onUpdate()
    } catch (error) {
      console.error("Error deleting doctor:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{`${doctor.first_name} ${doctor.last_name}`}</h3>
          <p className="text-sm text-gray-600">{doctor.specialization}</p>
        </div>
        <div className="relative">
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <strong>Email:</strong> {doctor.email}
        </p>
        <p>
          <strong>Phone:</strong> {doctor.phone}
        </p>
        <p>
          <strong>Experience:</strong> {doctor.experience} years
        </p>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          View Patients
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
