"use client"

import { useState } from "react"
import { Video, VideoOff, Mic, MicOff, Phone, Users, Calendar, MessageSquare } from "lucide-react"

export default function TelemedicinePage() {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [activeCall, setActiveCall] = useState(false)

  const upcomingConsultations = [
    {
      id: 1,
      patient: "John Smith",
      time: "2:00 PM",
      type: "Follow-up",
      priority: "Normal",
    },
    {
      id: 2,
      patient: "Maria Garcia",
      time: "2:30 PM",
      type: "Initial Consultation",
      priority: "High",
    },
    {
      id: 3,
      patient: "Robert Brown",
      time: "3:00 PM",
      type: "Prescription Review",
      priority: "Normal",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Telemedicine Center
        </h1>
        <p className="text-gray-600 mt-2">Virtual consultations and remote patient care</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Video Call Interface */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl relative overflow-hidden mb-6">
            {activeCall ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold">Connected with John Smith</h3>
                  <p className="text-green-400">Call duration: 05:23</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <Video className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Ready for Video Call</h3>
                  <p>Click "Start Call" to begin consultation</p>
                </div>
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full ${isMicOn ? "bg-gray-700" : "bg-red-600"} text-white hover:opacity-80 transition-opacity`}
              >
                {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setActiveCall(!activeCall)}
                className={`p-4 rounded-full ${activeCall ? "bg-red-600" : "bg-green-600"} text-white hover:opacity-80 transition-opacity`}
              >
                <Phone className="h-6 w-6" />
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full ${isVideoOn ? "bg-gray-700" : "bg-red-600"} text-white hover:opacity-80 transition-opacity`}
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Patient Info During Call */}
          {activeCall && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Name:</span> John Smith
                </div>
                <div>
                  <span className="text-blue-600">Age:</span> 45
                </div>
                <div>
                  <span className="text-blue-600">Condition:</span> Hypertension
                </div>
                <div>
                  <span className="text-blue-600">Last Visit:</span> 2 weeks ago
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Consultations */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
            </div>

            <div className="space-y-3">
              {upcomingConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="bg-white/60 rounded-lg p-3 border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{consultation.patient}</span>
                    <span className="text-sm text-gray-600">{consultation.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{consultation.type}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        consultation.priority === "High" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {consultation.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors">
                Start Emergency Call
              </button>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors">
                Schedule Consultation
              </button>
              <button className="w-full bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors">
                Send Prescription
              </button>
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Patient Chat</h3>
            </div>
            <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
              <div className="bg-blue-100 rounded-lg p-2 text-sm">
                <strong>John:</strong> I'm feeling much better today
              </div>
              <div className="bg-gray-100 rounded-lg p-2 text-sm text-right">
                <strong>You:</strong> That's great to hear!
              </div>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
