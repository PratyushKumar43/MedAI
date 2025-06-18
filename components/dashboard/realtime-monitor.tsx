"use client"

import { useState, useEffect } from "react"
import { Activity, Heart, Thermometer, Droplets, Zap } from "lucide-react"

export function RealTimeMonitor() {
  const [vitals, setVitals] = useState([
    {
      id: 1,
      patientName: "John Smith",
      room: "ICU-101",
      heartRate: 72,
      bloodPressure: "120/80",
      temperature: 98.6,
      oxygenSat: 98,
      status: "stable",
    },
    {
      id: 2,
      patientName: "Maria Garcia",
      room: "Ward-205",
      heartRate: 88,
      bloodPressure: "140/90",
      temperature: 99.2,
      oxygenSat: 95,
      status: "warning",
    },
    {
      id: 3,
      patientName: "Robert Brown",
      room: "ICU-102",
      heartRate: 110,
      bloodPressure: "160/100",
      temperature: 101.3,
      oxygenSat: 92,
      status: "critical",
    },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals((prev) =>
        prev.map((vital) => ({
          ...vital,
          heartRate: vital.heartRate + (Math.random() - 0.5) * 10,
          temperature: vital.temperature + (Math.random() - 0.5) * 2,
          oxygenSat: Math.max(85, Math.min(100, vital.oxygenSat + (Math.random() - 0.5) * 5)),
        })),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable":
        return "from-green-500 to-green-600"
      case "warning":
        return "from-yellow-500 to-yellow-600"
      case "critical":
        return "from-red-500 to-red-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Real-Time Monitoring</h3>
            <p className="text-sm text-gray-600">Live patient vital signs</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
          <span className="text-sm text-gray-600">Live Data</span>
        </div>
      </div>

      <div className="space-y-4">
        {vitals.map((vital) => (
          <div
            key={vital.id}
            className="bg-white/60 rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{vital.patientName}</h4>
                <p className="text-sm text-gray-600">{vital.room}</p>
              </div>
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(vital.status)}`}>
                <span className="text-white text-xs font-medium capitalize">{vital.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <div>
                  <div className="text-sm font-medium">{Math.round(vital.heartRate)} BPM</div>
                  <div className="text-xs text-gray-500">Heart Rate</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <div className="text-sm font-medium">{vital.bloodPressure}</div>
                  <div className="text-xs text-gray-500">Blood Pressure</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4 text-orange-500" />
                <div>
                  <div className="text-sm font-medium">{vital.temperature.toFixed(1)}°F</div>
                  <div className="text-xs text-gray-500">Temperature</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4 text-cyan-500" />
                <div>
                  <div className="text-sm font-medium">{Math.round(vital.oxygenSat)}%</div>
                  <div className="text-xs text-gray-500">Oxygen Sat</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium">
          View All Monitored Patients
        </button>
      </div>
    </div>
  )
}
