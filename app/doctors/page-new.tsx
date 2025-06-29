"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import type { Doctor } from "@/types/doctor"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (`${doctor.first_name} ${doctor.last_name}`).toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col animate-fade-in-up">
        <div className="flex items-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold mr-4">
            SJ
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Available Doctors</h1>
            <p className="text-gray-600">Hello Dr. Sarah Johnson, view your colleagues available today</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            <strong>Note:</strong> You can view the schedules of available doctors. For any changes to the doctor registry, please contact the administration.
          </p>
        </div>
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
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-all duration-300 p-6 transform hover:scale-105 animate-fade-in-up animate-stagger-${Math.min(index + 1, 5)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{`${doctor.first_name} ${doctor.last_name}`}</h3>
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
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-700">Available Today</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Next availability:</strong> 2:00 PM - 4:30 PM
                    </p>
                    <button className="mt-3 px-4 py-1.5 w-full text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200">
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                No doctors match your search criteria. Please try adjusting your search or check back later for updates to the doctor registry.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
