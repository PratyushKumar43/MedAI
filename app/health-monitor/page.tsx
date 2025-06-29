"use client"

import { useState, useEffect } from "react"
import { apiService } from "@/lib/api"
import { Activity, Heart, Thermometer, Droplets } from "lucide-react"

interface PatientVitals {
  id: string
  patientName: string
  room: string
  heartRate: number
  bloodPressure: string
  temperature: number
  oxygenSat: number
  respiratoryRate: number
  status: "stable" | "warning" | "critical"
  lastUpdated: Date
}

export default function HealthMonitorPage() {
  const [patients, setPatients] = useState<PatientVitals[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientVitals | null>(null);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "stable">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        setLoading(true);
        const { data } = await apiService.getPatientVitals();
        if (data) {
          const patientsWithStatus = data.map(p => ({ ...p, status: determineStatus(p) }));
          setPatients(patientsWithStatus);
        }
      } catch (error) {
        console.error("Failed to fetch initial patient vitals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVitals();

    const channel = apiService.supabase
      .channel('patient_vitals_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'patient_vitals' }, 
        async (payload) => {
          console.log('Change received!', payload);
          // Refetch all vitals to ensure data consistency
          // A more optimized approach would be to process the payload (new/updated record)
          await fetchVitals(); 
        }
      )
      .subscribe();

    return () => {
      apiService.supabase.removeChannel(channel);
    };
  }, []);

  const determineStatus = (patient: Omit<PatientVitals, 'status'>): "stable" | "warning" | "critical" => {
    if (
      patient.heartRate > 120 || 
      patient.heartRate < 50 || 
      patient.temperature > 101 || 
      patient.oxygenSat < 90 ||
      patient.respiratoryRate > 24
    ) {
      return "critical"
    } else if (
      patient.heartRate > 100 || 
      patient.heartRate < 60 || 
      patient.temperature > 99.5 || 
      patient.oxygenSat < 94 ||
      patient.respiratoryRate > 20
    ) {
      return "warning"
    } else {
      return "stable"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "stable": return "from-green-500 to-green-600"
      case "warning": return "from-yellow-500 to-yellow-600"
      case "critical": return "from-red-500 to-red-600"
      default: return "from-gray-500 to-gray-600"
    }
  }

  const filteredPatients = filter === "all" 
    ? patients 
    : patients.filter(patient => patient.status === filter)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-morphism rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div>            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent font-poppins">
              Health Monitoring
            </h1>
            <p className="text-base md:text-lg text-gray-600 font-medium">Real-time patient vital signs and monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6 mt-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-700 font-semibold">{patients.filter(p => p.status === "stable").length} Stable</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-700 font-semibold">{patients.filter(p => p.status === "warning").length} Warning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-700 font-semibold">{patients.filter(p => p.status === "critical").length} Critical</span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex space-x-4">
        <button 
          onClick={() => setFilter("all")}
          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
            filter === "all" 
              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg" 
              : "glass-morphism border border-white/30"
          }`}
        >
          All Patients
        </button>
        <button 
          onClick={() => setFilter("critical")}
          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
            filter === "critical" 
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg" 
              : "glass-morphism border border-white/30"
          }`}
        >
          Critical
        </button>
        <button 
          onClick={() => setFilter("warning")}
          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
            filter === "warning" 
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg" 
              : "glass-morphism border border-white/30"
          }`}
        >
          Warning
        </button>
        <button 
          onClick={() => setFilter("stable")}
          className={`px-6 py-3 rounded-xl transition-all duration-300 ${
            filter === "stable" 
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg" 
              : "glass-morphism border border-white/30"
          }`}
        >
          Stable
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Patient List */}
        <div className="xl:col-span-2 glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Patient Monitoring</h2>
          
          <div className="space-y-4">
            {filteredPatients.map((patient) => (
              <div 
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`glass-morphism rounded-xl p-4 border border-white/30 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  selectedPatient?.id === patient.id ? "scale-105 shadow-xl" : "hover:scale-102"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${getStatusColor(patient.status)} flex items-center justify-center shadow-lg`}>
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.patientName}</h3>
                      <p className="text-sm text-gray-600">{patient.room}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(patient.status)} text-white text-sm font-medium capitalize`}>
                    {patient.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="text-sm font-medium">{Math.round(patient.heartRate)} BPM</div>
                      <div className="text-xs text-gray-500">Heart Rate</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">{patient.bloodPressure}</div>
                      <div className="text-xs text-gray-500">Blood Pressure</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium">{patient.temperature.toFixed(1)}°F</div>
                      <div className="text-xs text-gray-500">Temperature</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                    <div>
                      <div className="text-sm font-medium">{Math.round(patient.oxygenSat)}%</div>
                      <div className="text-xs text-gray-500">Oxygen Sat</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Patient Details */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-6 h-fit">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Patient Details</h2>
          
          {selectedPatient ? (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getStatusColor(selectedPatient.status)} flex items-center justify-center shadow-lg`}>
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPatient.patientName}</h3>
                  <p className="text-gray-600">Room: {selectedPatient.room}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-morphism rounded-xl p-4 border border-white/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium">Heart Rate</h4>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(selectedPatient.heartRate)} <span className="text-sm font-normal text-gray-500">BPM</span></p>
                    <p className="text-xs text-gray-500 mt-1">Normal range: 60-100 BPM</p>
                  </div>
                  
                  <div className="glass-morphism rounded-xl p-4 border border-white/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium">Blood Pressure</h4>
                    </div>
                    <p className="text-2xl font-bold">{selectedPatient.bloodPressure} <span className="text-sm font-normal text-gray-500">mmHg</span></p>
                    <p className="text-xs text-gray-500 mt-1">Normal range: ≤120/80 mmHg</p>
                  </div>
                  
                  <div className="glass-morphism rounded-xl p-4 border border-white/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      <h4 className="font-medium">Temperature</h4>
                    </div>
                    <p className="text-2xl font-bold">{selectedPatient.temperature.toFixed(1)} <span className="text-sm font-normal text-gray-500">°F</span></p>
                    <p className="text-xs text-gray-500 mt-1">Normal range: 97.8-99.1°F</p>
                  </div>
                  
                  <div className="glass-morphism rounded-xl p-4 border border-white/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="h-5 w-5 text-cyan-500" />
                      <h4 className="font-medium">Oxygen Saturation</h4>
                    </div>
                    <p className="text-2xl font-bold">{Math.round(selectedPatient.oxygenSat)} <span className="text-sm font-normal text-gray-500">%</span></p>
                    <p className="text-xs text-gray-500 mt-1">Normal range: 95-100%</p>
                  </div>
                </div>
                
                <div className="glass-morphism rounded-xl p-4 border border-white/30">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 bg-${selectedPatient.status === 'stable' ? 'green' : selectedPatient.status === 'warning' ? 'yellow' : 'red'}-500 rounded-full animate-pulse`}></div>
                      <h4 className="font-medium capitalize">{selectedPatient.status} Status</h4>
                    </div>
                    <p className="text-xs text-gray-500">Updated: {selectedPatient.lastUpdated.toLocaleTimeString()}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedPatient.status === 'stable' ? 
                      'Patient vitals are within normal ranges.' : 
                      selectedPatient.status === 'warning' ? 
                      'One or more vitals require attention.' : 
                      'Immediate medical attention required.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Select a patient to view detailed vital information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
