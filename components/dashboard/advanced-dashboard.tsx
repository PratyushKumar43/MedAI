"use client"

import { TrendingUp, TrendingDown, Activity, AlertTriangle, Brain, Video, Users, FileText } from "lucide-react"

interface AdvancedDashboardProps {
  stats: any
  loading: boolean
}

export function AdvancedDashboard({ stats, loading }: AdvancedDashboardProps) {
  const cards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Active Doctors",
      value: stats.totalDoctors,
      icon: Activity,
      color: "from-green-500 to-green-600",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "AI Predictions",
      value: stats.aiPredictions,
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      trend: "+28%",
      trendUp: true,
      badge: "AI",
    },
    {
      title: "Telemedicine Active",
      value: stats.telemedicineActive,
      icon: Video,
      color: "from-cyan-500 to-cyan-600",
      trend: "+15%",
      trendUp: true,
      badge: "Live",
    },
    {
      title: "Prescriptions",
      value: stats.totalPrescriptions,
      icon: FileText,
      color: "from-orange-500 to-orange-600",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Emergency Cases",
      value: stats.emergencyCases,
      icon: AlertTriangle,
      color: "from-red-500 to-red-600",
      trend: "-3%",
      trendUp: false,
      badge: "SOS",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color} shadow-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            {card.badge && (
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full">
                {card.badge}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {loading ? <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" /> : card.value.toLocaleString()}
              </span>
              <div className={`flex items-center space-x-1 ${card.trendUp ? "text-green-600" : "text-red-600"}`}>
                {card.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span className="text-sm font-medium">{card.trend}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${card.color} transition-all duration-1000`}
                style={{ width: `${Math.min((card.value / 100) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
