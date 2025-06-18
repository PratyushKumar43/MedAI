"use client"

import { Calendar, MessageSquare, Brain, Video, Shield, Zap, FileText } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "AI Diagnosis",
      description: "Upload medical images for AI analysis",
      icon: Brain,
      color: "from-purple-500 to-purple-600",
      badge: "AI",
    },
    {
      title: "Start Telemedicine",
      description: "Begin video consultation with patient",
      icon: Video,
      color: "from-green-500 to-green-600",
      badge: "Live",
    },
    {
      title: "Emergency Protocol",
      description: "Activate emergency response system",
      icon: Shield,
      color: "from-red-500 to-red-600",
      badge: "SOS",
    },
    {
      title: "Smart Prescription",
      description: "AI-powered prescription recommendations",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      badge: "AI",
    },
    {
      title: "Schedule AI Scan",
      description: "Book automated health screening",
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      badge: "Auto",
    },
    {
      title: "Chat Assistant",
      description: "Ask medical AI for quick answers",
      icon: MessageSquare,
      color: "from-cyan-500 to-cyan-600",
      badge: "AI",
    },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
          <p className="text-sm text-gray-600">AI-powered medical tools at your fingertips</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            className="group bg-white/60 rounded-xl p-4 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform duration-200`}
              >
                <action.icon className="h-5 w-5 text-white" />
              </div>
              {action.badge && (
                <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full">
                  {action.badge}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
            <p className="text-sm text-gray-600">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
