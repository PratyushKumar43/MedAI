"use client"

import { useEffect, useState } from "react"
import { Clock, User, FileText } from "lucide-react"

interface Activity {
  id: string
  type: "patient" | "prescription" | "doctor"
  message: string
  time: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Mock recent activities
    const mockActivities: Activity[] = [
      {
        id: "1",
        type: "patient",
        message: "New patient John Doe registered",
        time: "2 minutes ago",
      },
      {
        id: "2",
        type: "prescription",
        message: "Prescription created for patient Sarah Wilson",
        time: "15 minutes ago",
      },
      {
        id: "3",
        type: "doctor",
        message: "Dr. Smith updated patient records",
        time: "1 hour ago",
      },
      {
        id: "4",
        type: "patient",
        message: "Patient appointment scheduled",
        time: "2 hours ago",
      },
    ]
    setActivities(mockActivities)
  }, [])

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "patient":
        return User
      case "prescription":
        return FileText
      case "doctor":
        return User
      default:
        return Clock
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getIcon(activity.type)
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
