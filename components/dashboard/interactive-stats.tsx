"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Users, Brain, Activity, Zap, Sparkles, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface InteractiveStatsProps {
  stats: any
  loading: boolean
}

export function InteractiveStats({ stats, loading }: InteractiveStatsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const statCards = [
    {
      id: "patients",
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      gradient: "from-blue-500 via-blue-600 to-cyan-500",
      trend: "+12.5%",
      trendUp: true,
      description: "Active patient records",
      bgPattern: "patients",
    },
    {
      id: "doctors",
      title: "Medical Staff",
      value: stats.totalDoctors,
      icon: Activity,
      gradient: "from-green-500 via-emerald-600 to-teal-500",
      trend: "+8.3%",
      trendUp: true,
      description: "Certified professionals",
      bgPattern: "doctors",
    },
    {
      id: "ai",
      title: "AI Queries",
      value: stats.geminiQueries,
      icon: Brain,
      gradient: "from-purple-500 via-violet-600 to-indigo-500",
      trend: "+45.2%",
      trendUp: true,
      description: "AI-powered insights",
      bgPattern: "ai",
    },
    {
      id: "accuracy",
      title: "AI Accuracy Rate",
      value: `${stats.accuracyRate.toFixed(1)}%`,
      icon: Sparkles,
      gradient: "from-pink-500 via-rose-600 to-red-500",
      trend: "+2.1%",
      trendUp: true,
      description: "Diagnostic precision",
      bgPattern: "accuracy",
    },
    {
      id: "telemedicine",
      title: "Active Sessions",
      value: stats.telemedicineActive,
      icon: Zap,
      gradient: "from-orange-500 via-amber-600 to-yellow-500",
      trend: "+18.7%",
      trendUp: true,
      description: "Live consultations",
      bgPattern: "sessions",
    },
    {
      id: "emergency",
      title: "Emergency Cases",
      value: stats.emergencyCases,
      icon: Shield,
      gradient: "from-red-500 via-red-600 to-pink-500",
      trend: "-5.2%",
      trendUp: false,
      description: "Critical interventions",
      bgPattern: "emergency",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((card) => (
        <div
          key={card.id}
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
          className={cn(
            "relative group glass-morphism rounded-3xl p-6 border border-white/30 shadow-xl transition-all duration-500 cursor-pointer overflow-hidden",
            hoveredCard === card.id ? "scale-105 shadow-2xl" : "hover:scale-102",
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className={`w-full h-full bg-gradient-to-br ${card.gradient}`}></div>
          </div>

          {/* Animated Background Elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute -bottom-5 -left-5 w-15 h-15 bg-white/5 rounded-full animate-bounce"></div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div
                className={cn(
                  "p-4 rounded-2xl bg-gradient-to-br shadow-lg transition-all duration-300",
                  `${card.gradient}`,
                  hoveredCard === card.id ? "scale-110 shadow-xl" : "",
                )}
              >
                <card.icon className="h-7 w-7 text-white" />
              </div>
              <div
                className={cn(
                  "flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300",
                  card.trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                  hoveredCard === card.id ? "scale-110" : "",
                )}
              >
                {card.trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{card.trend}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700 font-poppins">{card.title}</h3>
              <div className="flex items-baseline space-x-2">
                <span
                  className={cn(
                    "text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent transition-all duration-300",
                    `${card.gradient}`,
                    hoveredCard === card.id ? "scale-110" : "",
                  )}
                >
                  {loading ? (
                    <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
                  ) : typeof card.value === "string" ? (
                    card.value
                  ) : (
                    card.value.toLocaleString()
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-medium">{card.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-2 rounded-full bg-gradient-to-r transition-all duration-1000",
                    `${card.gradient}`,
                    hoveredCard === card.id ? "animate-pulse" : "",
                  )}
                  style={{
                    width: `${Math.min(typeof card.value === "string" ? 85 : (card.value / 100) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Hover Effect Overlay */}
            {hoveredCard === card.id && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl pointer-events-none"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
