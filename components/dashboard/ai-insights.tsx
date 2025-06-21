"use client"

import { useState } from "react"
import { Brain, AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react"

interface AIInsightsProps {
  insights?: any[]
}

export function AIInsights({ insights = [] }: AIInsightsProps) {
  const [defaultInsights] = useState([
    {
      id: 1,
      type: "prediction",
      title: "High Risk Patient Alert",
      description: "Patient John Smith shows 85% probability of diabetes complications",
      confidence: 85,
      priority: "high",
      action: "Schedule immediate consultation",
      timestamp: "2 minutes ago",
    },
    {
      id: 2,
      type: "optimization",
      title: "Resource Optimization",
      description: "AI suggests redistributing 3 nurses to Emergency Department",
      confidence: 92,
      priority: "medium",
      action: "Review staffing allocation",
      timestamp: "15 minutes ago",
    },
    {
      id: 3,
      type: "diagnosis",
      title: "Diagnostic Assistance",
      description: "AI identified potential pneumonia in chest X-ray for Patient #4521",
      confidence: 78,
      priority: "high",
      action: "Radiologist review required",
      timestamp: "1 hour ago",
    },
  ])

  const displayInsights = insights.length > 0 ? insights : defaultInsights

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "from-red-500 to-red-600"
      case "medium":
        return "from-yellow-500 to-yellow-600"
      case "low":
        return "from-green-500 to-green-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return AlertCircle
      case "medium":
        return Clock
      case "low":
        return CheckCircle
      default:
        return Brain
    }
  }

  return (
    <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 font-poppins">AI Insights</h3>
            <p className="text-gray-600">Real-time intelligent recommendations</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">AI Active</span>
        </div>
      </div>

      <div className="space-y-4">
        {displayInsights.map((insight) => {
          const PriorityIcon = getPriorityIcon(insight.priority)
          return (
            <div
              key={insight.id}
              className="glass-morphism rounded-xl p-4 border border-white/30 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${getPriorityColor(insight.priority)} shadow-lg`}>
                  <PriorityIcon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <span className="text-xs text-gray-500">{insight.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Confidence:</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{insight.confidence}%</span>
                    </div>
                    <button className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">
                      {insight.action}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/20">
        <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium">
          <TrendingUp className="h-4 w-4 mr-2 inline" />
          View All AI Recommendations
        </button>
      </div>
    </div>
  )
}
