"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import type { Doctor } from "@/types/doctor"
import { DoctorForm } from "@/components/doctors/doctor-form"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    // Ensure page starts at top
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.scrollTo(0, 0)
    }

    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await apiService.getDoctors()
      setDoctors(response.data)
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return

    try {
      await apiService.deleteDoctor(id)
      fetchDoctors()
    } catch (error) {
      console.error("Error deleting doctor:", error)
    }
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600 mt-2">Manage medical professionals</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 animate-slide-in-right"
        >
          ➕ Add Doctor
        </button>
      </div>

      <div className="flex items-center space-x-4 animate-fade-in-up animate-stagger-1">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <div
              key={doctor.id}
              className={`bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 p-6 transform hover:scale-105 animate-fade-in-up animate-stagger-${Math.min(index + 1, 5)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
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

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200">
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(doctor.id)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors duration-200"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="animate-fade-in">
          <DoctorForm
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false)
              fetchDoctors()
            }}
          />
        </div>
      )}
    </div>
  )
}
