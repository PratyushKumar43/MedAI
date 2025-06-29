"use client"

import { useState, useEffect } from "react"
import { Shield, MapPin, Phone, Clock, AlertTriangle, Truck, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/api"

interface EmergencyCase {
  id: string
  patientName: string
  location: {
    address: string
    coordinates: { lat: number; lng: number }
  }
  emergencyType: string
  severity: "low" | "medium" | "high" | "critical"
  status: "pending" | "dispatched" | "en-route" | "arrived" | "completed"
  timeReported: Date
  estimatedArrival?: Date
  ambulanceId?: string
  description: string
}

interface UserLocation {
  latitude: number
  longitude: number
  address?: string
}

export default function EmergencyPage() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [emergencyCases, setEmergencyCases] = useState<EmergencyCase[]>([])

  const [showBookingForm, setShowBookingForm] = useState(false)
  interface BookingForm {
    patientName: string;
    emergencyType: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    contactNumber: string;
    manualAddress: string;
  }

  const [bookingForm, setBookingForm] = useState<BookingForm>({
    patientName: "",
    emergencyType: "",
    severity: "medium" as const,
    description: "",
    contactNumber: "",
    manualAddress: "",
  })

  useEffect(() => {
    // Fetch latest emergency cases from database
    const fetchCases = async () => {
      try {
        const { data, error } = await supabase
          .from('emergency_cases')
          .select('*')
          .order('time_reported', { ascending: false })
        if (!error && data) {
          const formattedCases = data.map((c: any) => ({
            ...c,
            patientName: c.patient_name,
            emergencyType: c.emergency_type,
            timeReported: new Date(c.time_reported),
            estimatedArrival: c.estimated_arrival ? new Date(c.estimated_arrival) : undefined,
            ambulanceId: c.ambulance_id,
          }));
          setEmergencyCases(formattedCases);
        }
      } catch (err) {
        console.error('Failed to fetch emergency cases', err)
      }
    }
    fetchCases()
  }, [])

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        try {
          const address = await reverseGeocode(latitude, longitude);
          setUserLocation((prev) => (prev ? { ...prev, address } : null));
        } catch (err) {
          console.error("Address lookup failed", err);
        }
      },
      (error) => {
        setLocationError("Unable to access GPS location.");
        console.error("Geolocation error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const handleRetryLocation = () => {
    setLocationError(null);
    requestBrowserLocation();
  };

  // initial location fetch on mount
  useEffect(() => {
    requestBrowserLocation();
  }, []);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ latitude, longitude })

          // Reverse geocoding to get address (simulated)
          try {
            // In a real app, you'd use a geocoding service like Google Maps API
            const address = await reverseGeocode(latitude, longitude)
            setUserLocation((prev) => (prev ? { ...prev, address } : null))
          } catch (error) {
            console.error("Failed to get address:", error)
          }
        },
        (error) => {
          setLocationError("Unable to access location. Please enable location services.")
          console.error("Geolocation error:", error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      )
    } else {
      setLocationError("Geolocation is not supported by this browser.")
    }
  }, [])

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          "User-Agent": "MedAIApp/1.0 (+https://medai.local)"
        }
      })
      const data = await response.json()
      return data.display_name || `${lat}, ${lng}`
    } catch (err) {
      console.error("Reverse geocode failed", err)
      return `${lat}, ${lng}`
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "from-red-600 to-red-700"
      case "high":
        return "from-orange-500 to-red-500"
      case "medium":
        return "from-yellow-500 to-orange-500"
      case "low":
        return "from-green-500 to-green-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "from-gray-500 to-gray-600"
      case "dispatched":
        return "from-blue-500 to-blue-600"
      case "en-route":
        return "from-purple-500 to-purple-600"
      case "arrived":
        return "from-green-500 to-green-600"
      case "completed":
        return "from-gray-400 to-gray-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const handleBookAmbulance = async () => {
    if (!userLocation && !bookingForm.manualAddress) {
      alert("Please provide or enable location to book an ambulance")
      return
    }

    const newCase: EmergencyCase = {
      id: Date.now().toString(),
      patientName: bookingForm.patientName,
      location: {
        address: userLocation ? (userLocation.address || `${userLocation.latitude}, ${userLocation.longitude}`) : bookingForm.manualAddress,
        coordinates: userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude } : { lat: 0, lng: 0 },
      },
      emergencyType: bookingForm.emergencyType,
      severity: bookingForm.severity,
      status: "pending",
      timeReported: new Date(),
      description: bookingForm.description,
      ambulanceId: `AMB-${String(Math.floor(Math.random() * 999)).padStart(3, "0")}`,
    }

    setEmergencyCases((prev) => [newCase, ...prev])
    setShowBookingForm(false)
    setBookingForm({
      patientName: "",
      emergencyType: "",
      severity: "medium",
      description: "",
      contactNumber: "",
      manualAddress: "",
    })

    // Simulate dispatch process
    setTimeout(() => {
      setEmergencyCases((prev) =>
        prev.map((case_) =>
          case_.id === newCase.id
            ? { ...case_, status: "dispatched", estimatedArrival: new Date(Date.now() + 15 * 60 * 1000) }
            : case_,
        ),
      )
    }, 2000)
  }

  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m ago`
  }

  const formatETA = (date: Date) => {
    const minutes = Math.floor((date.getTime() - Date.now()) / (1000 * 60))
    if (minutes <= 0) return "Arriving now"
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ${minutes % 60}m`
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-morphism rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>            <h1 className="text-xl xs:text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent font-poppins">
              Emergency Services
            </h1>
            <p className="text-sm xs:text-base md:text-lg text-gray-600 font-medium">Rapid response and ambulance dispatch system</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-700 font-semibold">24/7 Emergency Response</span>
          </div>
          <div className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-blue-600" />
            <span className="text-blue-700 font-semibold">5 Ambulances Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-semibold">Avg Response: 8 min</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
          <h2 className="text-lg xs:text-xl font-bold text-gray-900 mb-6 font-poppins">Emergency Actions</h2>

          {/* Location Status */}
          <div className="mb-6 glass-morphism rounded-xl p-4 border border-white/30">
            <div className="flex items-center space-x-3 mb-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">Your Location</span>
            </div>
            {userLocation ? (
              <div>
                <p className="text-sm text-gray-600 mb-1">{userLocation.address || "Location detected"}</p>
                <p className="text-xs text-gray-500">
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </p>
                <div className="flex items-center space-x-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600 font-medium">Location Active</span>
                </div>
              </div>
            ) : locationError ? (
              <div>
                <p className="text-sm text-red-600 mb-2">{locationError}</p>
                <button
                  onClick={handleRetryLocation}
                  className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full hover:bg-red-200 transition-colors"
                >
                  Retry Location
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">Getting location...</span>
              </div>
            )}
          </div>

          {/* Emergency Buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => setShowBookingForm(true)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              disabled={!userLocation}
            >
              <Truck className="h-6 w-6 mr-3" />
              Book Ambulance
            </Button>

            <Button
              onClick={() => (window.location.href = 'tel:112')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
              <Phone className="h-5 w-5 mr-2" />
              Call 112
            </Button>

            <Button
              onClick={() => setShowBookingForm(true)}
              className="w-full glass-morphism border border-white/30 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Report Emergency
            </Button>
          </div>

          {/* Emergency Contacts */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <h3 className="font-semibold text-gray-900 mb-3">Emergency Contacts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Emergency:</span>
                <span className="font-semibold text-red-600">112</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hospital Direct:</span>
                <span className="font-semibold text-blue-600">108</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fire Control:</span>
                <span className="font-semibold text-green-600">115</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Cases */}
        <div className="xl:col-span-2 glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg xs:text-xl font-bold text-gray-900 font-poppins">Active Emergency Cases</h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 font-medium">Live Updates</span>
            </div>
          </div>

          <div className="space-y-4">
            {emergencyCases.map((case_) => (
              <div
                key={case_.id}
                className="glass-morphism rounded-xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getSeverityColor(case_.severity)} flex items-center justify-center shadow-lg`}
                    >
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{case_.patientName}</h3>
                      <p className="text-sm text-gray-600">{case_.emergencyType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(case_.status)} text-white text-sm font-medium capitalize mb-1`}
                    >
                      {case_.status.replace("-", " ")}
                    </div>
                    <p className="text-xs text-gray-500">{formatTimeAgo(case_.timeReported)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{case_.location.address}</p>
                      <p className="text-xs text-gray-500">
                        {case_.location.coordinates.lat.toFixed(4)}, {case_.location.coordinates.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {case_.estimatedArrival && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">ETA: {formatETA(case_.estimatedArrival)}</p>
                        <p className="text-xs text-gray-500">Ambulance {case_.ambulanceId}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-700">{case_.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        case_.severity === "critical"
                          ? "bg-red-100 text-red-700"
                          : case_.severity === "high"
                            ? "bg-orange-100 text-orange-700"
                            : case_.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                      }`}
                    >
                      {case_.severity} Priority
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors">
                      <Navigation className="h-3 w-3 mr-1 inline" />
                      Track
                    </button>
                    <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors">
                      <Phone className="h-3 w-3 mr-1 inline" />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-white/30 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg xs:text-xl font-bold text-gray-900 font-poppins">Book Emergency Ambulance</h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name</label>
                <input
                  type="text"
                  value={bookingForm.patientName}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, patientName: e.target.value }))}
                  className="w-full px-4 py-3 glass-morphism border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Type</label>
                <select
                  value={bookingForm.emergencyType}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, emergencyType: e.target.value }))}
                  className="w-full px-4 py-3 glass-morphism border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select emergency type</option>
                  <option value="Cardiac Arrest">Cardiac Arrest</option>
                  <option value="Stroke">Stroke</option>
                  <option value="Severe Injury">Severe Injury</option>
                  <option value="Breathing Problems">Breathing Problems</option>
                  <option value="Unconscious">Unconscious</option>
                  <option value="Severe Bleeding">Severe Bleeding</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Severity Level</label>
                <select
                  value={bookingForm.severity}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, severity: e.target.value as any }))}
                  className="w-full px-4 py-3 glass-morphism border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="low">Low - Non-urgent</option>
                  <option value="medium">Medium - Urgent</option>
                  <option value="high">High - Very Urgent</option>
                  <option value="critical">Critical - Life Threatening</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                <input
                  type="tel"
                  value={bookingForm.contactNumber}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, contactNumber: e.target.value }))}
                  className="w-full px-4 py-3 glass-morphism border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter contact number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={bookingForm.description}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={3}
                  placeholder="Describe the emergency situation..."
                />
              </div>

              {userLocation ? (
                <div className="glass-morphism rounded-xl p-4 border border-white/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Emergency Location</span>
                  </div>
                  <p className="text-sm text-gray-600">{userLocation.address || "Current location"}</p>
                  <p className="text-xs text-gray-500">
                    {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <div className="glass-morphism rounded-xl p-4 border border-white/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-900">Emergency Location</span>
                  </div>
                  <input
                    type="text"
                    value={bookingForm.manualAddress}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, manualAddress: e.target.value }))}
                    placeholder="Enter address or landmark"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/20">
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1 bg-white border border-gray-200 py-3 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookAmbulance}
                  disabled={!bookingForm.patientName || !bookingForm.emergencyType || (!userLocation && !bookingForm.manualAddress.trim())}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Truck className="h-4 w-4 mr-2 inline" />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
