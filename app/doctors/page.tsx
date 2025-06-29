"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import type { Doctor } from "@/types/doctor"
import { useAuth } from "@/providers/auth-provider"

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const { user } = useAuth()

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
    }
    return user?.email?.split('@')[0] || 'Doctor'
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    const words = name.split(' ')
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
  }
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentDate, setCurrentDate] = useState<Date | null>(null)

  useEffect(() => {
    // Ensure page starts at top
    const mainContent = document.getElementById("main-content")
    if (mainContent) {
      mainContent.scrollTo(0, 0)
    }

    // Initialize date on client side
    setCurrentDate(new Date())
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
      doctor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  
  return (
    <div className="space-y-6">
      {/* Full-width glass morphism header with enhanced styling */}
      <div className="mb-8 -mx-8 -mt-8 animate-fade-in-up">
        <div className="relative w-full">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-500/10 to-indigo-600/10 z-0"></div>
          
          {/* Main glass morphism container */}
          <div className="relative glass-morphism px-8 py-10 shadow-2xl backdrop-blur-md border-b border-white/40 z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-white/30">
                  {getUserInitials()}
                </div>
                
                {/* Text content */}
                <div className="flex-1">                  <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-poppins">
                    Available Doctors
                  </h1>
                  <p className="text-base md:text-lg text-gray-600 mt-1">Hello Dr. {getUserDisplayName()}, view your colleagues available today</p>
                  
                  {/* Notification box */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 mt-6 shadow-lg max-w-3xl">
                    <p className="text-blue-800">
                      <strong>Note:</strong> You can view the schedules of available doctors. For any changes to the doctor registry, please contact the administration.
                    </p>
                  </div>
                </div>
                
                {/* Stats Cards - visible on larger screens */}
                <div className="hidden lg:flex flex-col gap-3">
                  <div className="glass-morphism-dark px-4 py-2 rounded-lg text-white shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">{doctors.length} Doctor{doctors.length === 1 ? '' : 's'} Online</span>
                    </div>
                  </div>
                  <div className="glass-morphism px-4 py-2 rounded-lg text-blue-800 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm font-medium">Today: {currentDate ? currentDate.toLocaleDateString() : "--/--/----"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>      <div className="flex items-center space-x-4 animate-fade-in-up animate-stagger-1 bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-md">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all duration-300 shadow-inner bg-white/80"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div className="glass-morphism px-4 py-2 rounded-lg border border-blue-100 text-sm text-blue-800">
            Total: {doctors.length} doctors
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
      ) : (        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className={`glass-morphism rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 transform hover:scale-102 animate-fade-in-up animate-stagger-${Math.min(index + 1, 5)} border border-white/40`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{doctor.first_name} {doctor.last_name}</h3>
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
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium text-green-700">Available Today</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Next availability:</strong> 2:00 PM - 4:30 PM
                    </p>
                    <button className="mt-3 px-4 py-2 w-full text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg">
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (            <div className="col-span-3 text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-500 mb-6 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="glass-morphism max-w-md mx-auto p-8 rounded-xl border border-white/30 shadow-xl">
                <h3 className="text-xl font-medium text-gray-900 mb-3">No doctors found</h3>
                <p className="text-gray-600 mb-4">
                  No doctors match your search criteria. Please try adjusting your search or check back later for updates to the doctor registry.
                </p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg text-sm"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
