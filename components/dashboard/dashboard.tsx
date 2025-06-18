"use client"

import { useEffect, useState } from "react"
import { StatsCard } from "./stats-card"
import { RecentActivity } from "./recent-activity"
import { MCPStatus } from "@/components/mcp/mcp-status"
import { Users, UserCheck, FileText, Activity } from "lucide-react"
import { apiService } from "@/lib/api"

interface Stats {
  totalDoctors: number
  totalPatients: number
  totalPrescriptions: number
  activeToday: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalDoctors: 0,
    totalPatients: 0,
    totalPrescriptions: 0,
    activeToday: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log("Dashboard: Starting to fetch stats...")

        // Test Supabase connection first
        const { data: testData, error: testError } = await apiService.supabase
          .from("doctors")
          .select("count", { count: "exact", head: true })

        if (testError) {
          console.error("Supabase connection test failed:", testError)
          setError("Database connection failed. Please check your configuration.")
          return
        }

        const [doctorsRes, patientsRes, prescriptionsRes] = await Promise.all([
          apiService.getDoctors(),
          apiService.getPatients(),
          apiService.getPrescriptions(),
        ])

        console.log("Dashboard: Fetched data", { doctorsRes, patientsRes, prescriptionsRes })

        setStats({
          totalDoctors: doctorsRes.data?.length || 0,
          totalPatients: patientsRes.data?.length || 0,
          totalPrescriptions: prescriptionsRes.data?.length || 0,
          activeToday: Math.floor(Math.random() * 50) + 10,
        })
        setError(null)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to your medical management system</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">Please ensure:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Your Supabase project is active</li>
                  <li>Database tables are created</li>
                  <li>Environment variables are correct</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your medical management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Doctors" value={stats.totalDoctors} icon={UserCheck} color="blue" loading={loading} />
        <StatsCard title="Total Patients" value={stats.totalPatients} icon={Users} color="green" loading={loading} />
        <StatsCard
          title="Prescriptions"
          value={stats.totalPrescriptions}
          icon={FileText}
          color="purple"
          loading={loading}
        />
        <StatsCard title="Active Today" value={stats.activeToday} icon={Activity} color="orange" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentActivity />
        <MCPStatus />
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Add New Patient</div>
              <div className="text-sm text-gray-500">Register a new patient in the system</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Create Prescription</div>
              <div className="text-sm text-gray-500">Write a new prescription for a patient</div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">Schedule Appointment</div>
              <div className="text-sm text-gray-500">Book an appointment with a doctor</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
