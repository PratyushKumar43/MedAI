"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Users, Activity, Calendar, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [analytics, setAnalytics] = useState({
    totalPatients: 1247,
    totalDoctors: 45,
    totalAppointments: 892,
    emergencyCases: 23,
    patientSatisfaction: 4.8,
    averageWaitTime: 12,
    revenueGrowth: 15.3,
    operationalEfficiency: 87,
  })

  const chartData = {
    patientVisits: [
      { month: "Jan", visits: 120 },
      { month: "Feb", visits: 135 },
      { month: "Mar", visits: 148 },
      { month: "Apr", visits: 162 },
      { month: "May", visits: 178 },
      { month: "Jun", visits: 195 },
    ],
    departmentStats: [
      { department: "Cardiology", patients: 245, revenue: 125000 },
      { department: "Neurology", patients: 189, revenue: 98000 },
      { department: "Orthopedics", patients: 167, revenue: 87000 },
      { department: "Pediatrics", patients: 203, revenue: 76000 },
      { department: "Emergency", patients: 298, revenue: 145000 },
    ],
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-morphism rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-poppins">
                Analytics Dashboard
              </h1>
              <p className="text-xl text-gray-600 font-medium">Comprehensive healthcare insights and metrics</p>
            </div>
          </div>

          <div className="flex space-x-2">
            {(["7d", "30d", "90d", "1y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                  timeRange === range
                    ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg"
                    : "glass-morphism border border-white/30"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Patients",
            value: analytics.totalPatients,
            icon: Users,
            color: "from-blue-500 to-blue-600",
            change: "+12.5%",
          },
          {
            title: "Active Doctors",
            value: analytics.totalDoctors,
            icon: Activity,
            color: "from-green-500 to-green-600",
            change: "+8.3%",
          },
          {
            title: "Appointments",
            value: analytics.totalAppointments,
            icon: Calendar,
            color: "from-purple-500 to-purple-600",
            change: "+15.7%",
          },
          {
            title: "Emergency Cases",
            value: analytics.emergencyCases,
            icon: BarChart3,
            color: "from-red-500 to-red-600",
            change: "-5.2%",
          },
        ].map((metric, index) => (
          <div
            key={index}
            className="glass-morphism rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${metric.color} shadow-lg`}>
                <metric.icon className="h-6 w-6 text-white" />
              </div>
              <span
                className={`text-sm font-semibold ${metric.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
              >
                {metric.change}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{metric.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Patient Visits Chart */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 font-poppins">Patient Visits Trend</h3>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>

          <div className="space-y-4">
            {chartData.patientVisits.map((data, index) => (
              <div key={data.month} className="flex items-center space-x-4">
                <span className="w-8 text-sm font-medium text-gray-600">{data.month}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000"
                    style={{ width: `${(data.visits / 200) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-sm font-semibold text-gray-900">{data.visits}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Performance */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 font-poppins">Department Performance</h3>
            <PieChart className="h-6 w-6 text-purple-600" />
          </div>

          <div className="space-y-4">
            {chartData.departmentStats.map((dept, index) => (
              <div key={dept.department} className="glass-morphism rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{dept.department}</h4>
                  <span className="text-sm text-green-600 font-semibold">${(dept.revenue / 1000).toFixed(0)}k</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{dept.patients} patients</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full"
                      style={{ width: `${(dept.patients / 300) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Patient Satisfaction",
            value: `${analytics.patientSatisfaction}/5.0`,
            color: "from-green-500 to-green-600",
          },
          { title: "Avg Wait Time", value: `${analytics.averageWaitTime} min`, color: "from-blue-500 to-blue-600" },
          { title: "Revenue Growth", value: `+${analytics.revenueGrowth}%`, color: "from-purple-500 to-purple-600" },
          {
            title: "Operational Efficiency",
            value: `${analytics.operationalEfficiency}%`,
            color: "from-orange-500 to-orange-600",
          },
        ].map((metric, index) => (
          <div key={index} className="glass-morphism rounded-2xl p-6 border border-white/30 shadow-xl">
            <h3 className="text-sm font-medium text-gray-600 mb-2">{metric.title}</h3>
            <p className={`text-2xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
              {metric.value}
            </p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`} style={{ width: "75%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
