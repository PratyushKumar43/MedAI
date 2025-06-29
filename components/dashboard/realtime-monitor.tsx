"use client"

import { useState, useEffect } from "react"
import { Activity, Heart, Thermometer, Droplets, Zap, AlertTriangle, Pill } from "lucide-react"

// Utility function to safely convert values to numbers
const safeNumber = (value: any, fallback: number): number => {
  if (typeof value === 'number' && !isNaN(value)) return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function RealTimeMonitor() {
  const [vitals, setVitals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch patient data from the API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { supabase } = await import('@/lib/api');
        const { data, error } = await supabase
          .from("patients")
          .select("id, first_name, last_name, vital_signs, current_medications, diagnosis, allergies")
          .order("created_at", { ascending: false })
          .limit(6);
          
        if (error) {
          console.error("Error fetching patients:", error);
          throw error;
        }
        
        // Transform data into vitals format
        const patientsVitals = data.map((patient: any, index: number) => {
          const roomTypes = ["Ward", "ICU", "ER"];
          const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
          const roomNumber = Math.floor(Math.random() * 300) + 100;
          
          // Determine status based on vitals
          let status = "stable";
          const heartRate = safeNumber(patient.vital_signs?.heart_rate, 70 + Math.floor(Math.random() * 30));
          const oxygenSat = 90 + Math.floor(Math.random() * 10);
          
          if (heartRate > 100 || patient.vital_signs?.blood_pressure?.startsWith("16") || oxygenSat < 92) {
            status = "warning";
          }
          if (heartRate > 120 || patient.vital_signs?.blood_pressure?.startsWith("17") || oxygenSat < 90) {
            status = "critical";
          }
          
          return {
            id: patient.id,
            patientName: `${patient.first_name} ${patient.last_name}`,
            room: `${roomType}-${roomNumber}`,
            heartRate: heartRate,
            bloodPressure: patient.vital_signs?.blood_pressure || "120/80",
            temperature: safeNumber(patient.vital_signs?.temperature, 98.6),
            oxygenSat: oxygenSat,
            status: status,
            bmi: safeNumber(patient.vital_signs?.bmi, 24.5),
            medications: patient.current_medications || [],
            diagnosis: patient.diagnosis || [],
            allergies: patient.allergies || []
          };
        });
        
        setVitals(patientsVitals);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
        // Fallback to mock data
        setVitals([
          {
            id: 1,
            patientName: "John Smith",
            room: "ICU-101",
            heartRate: 72,
            bloodPressure: "120/80",
            temperature: 98.6,
            oxygenSat: 98,
            status: "stable",
            bmi: 25.8,
            medications: ["Lisinopril", "Metformin"],
            diagnosis: ["Hypertension", "Type 2 Diabetes"],
            allergies: ["Penicillin", "Shellfish"]
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
            bmi: 27.4,
            medications: ["Atorvastatin"],
            diagnosis: ["Hypertension"],
            allergies: []
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
            bmi: 31.2,
            medications: ["Lisinopril", "Metformin", "Aspirin"],
            diagnosis: ["Hypertension", "Type 2 Diabetes"],
            allergies: ["Penicillin"]
          },
          {
            id: 4,
            patientName: "Sarah Johnson",
            room: "Ward-110",
            heartRate: 65,
            bloodPressure: "110/70",
            temperature: 98.2,
            oxygenSat: 99,
            status: "stable",
            bmi: 22.1,
            medications: [],
            diagnosis: ["Routine checkup"],
            allergies: []
          },
          {
            id: 5,
            patientName: "James Wilson",
            room: "ER-203",
            heartRate: 115,
            bloodPressure: "150/95",
            temperature: 100.8,
            oxygenSat: 91,
            status: "warning",
            bmi: 29.7,
            medications: ["Lisinopril"],
            diagnosis: ["Hypertension"],
            allergies: ["Shellfish"]
          },
          {
            id: 6,
            patientName: "Emily Davis",
            room: "ICU-105",
            heartRate: 130,
            bloodPressure: "170/110",
            temperature: 102.4,
            oxygenSat: 88,
            status: "critical",
            bmi: 30.5,
            medications: ["Metformin", "Lisinopril"],
            diagnosis: ["Type 2 Diabetes", "Hypertension"],
            allergies: ["Penicillin", "Peanuts"]
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVitals((prev) =>
        prev.map((vital) => {
          // Create more realistic variations based on patient status
          let heartRateChange, tempChange, oxygenChange;
          
          switch(vital.status) {
            case "critical":
              // Critical patients have higher fluctuations
              heartRateChange = (Math.random() - 0.3) * 15;
              tempChange = (Math.random() - 0.3) * 1.5;
              oxygenChange = (Math.random() - 0.6) * 6; // More likely to decrease
              break;
            case "warning":
              // Warning patients have moderate fluctuations
              heartRateChange = (Math.random() - 0.4) * 10;
              tempChange = (Math.random() - 0.4) * 1.2;
              oxygenChange = (Math.random() - 0.5) * 4;
              break;
            default:
              // Stable patients have minimal fluctuations
              heartRateChange = (Math.random() - 0.5) * 5;
              tempChange = (Math.random() - 0.5) * 0.5;
              oxygenChange = (Math.random() - 0.5) * 2;
          }
          
          // Calculate new values
          const newHeartRate = vital.heartRate + heartRateChange;
          const newTemp = vital.temperature + tempChange;
          const newOxygen = vital.oxygenSat + oxygenChange;
          
          // Determine new status based on values
          let newStatus = vital.status;
          
          // Update status based on new vital signs
          if (newHeartRate > 120 || newTemp > 101 || newOxygen < 90) {
            newStatus = "critical";
          } else if (newHeartRate > 100 || newTemp > 99.5 || newOxygen < 94) {
            newStatus = "warning";
          } else if (newHeartRate >= 60 && newHeartRate <= 100 && 
                     newTemp >= 97.7 && newTemp <= 99.5 &&
                     newOxygen >= 95) {
            newStatus = "stable";
          }
          
          // Generate a random new blood pressure based on status
          let systolic, diastolic;
          if (newStatus === "critical") {
            systolic = Math.floor(Math.random() * 30) + 150; // 150-180
            diastolic = Math.floor(Math.random() * 20) + 95; // 95-115
          } else if (newStatus === "warning") {
            systolic = Math.floor(Math.random() * 20) + 130; // 130-150
            diastolic = Math.floor(Math.random() * 15) + 85; // 85-100
          } else {
            systolic = Math.floor(Math.random() * 20) + 110; // 110-130
            diastolic = Math.floor(Math.random() * 15) + 70; // 70-85
          }
          
          return {
            ...vital,
            heartRate: Math.max(40, Math.min(180, newHeartRate)), // Clamp between 40-180
            temperature: Math.max(95, Math.min(104, newTemp)), // Clamp between 95-104
            oxygenSat: Math.max(85, Math.min(100, newOxygen)), // Clamp between 85-100
            bloodPressure: `${Math.round(systolic)}/${Math.round(diastolic)}`,
            status: newStatus
          };
        }),
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
            <h3 className="text-xl font-bold text-gray-900">Patient Vital Monitoring</h3>
            <p className="text-sm text-gray-600">Live health metrics from ward</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
          <span className="text-sm text-gray-600">Live Updates</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin h-12 w-12 border-4 border-red-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="grid gap-6 max-h-[480px] overflow-y-auto pr-2">
          {vitals.map((vital) => (
            <div
              key={vital.id}
              className={`bg-white/60 rounded-xl p-4 border hover:shadow-lg transition-all duration-200 ${
                vital.status === 'critical' 
                  ? 'border-red-200' 
                  : vital.status === 'warning'
                  ? 'border-yellow-200'
                  : 'border-green-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    {vital.patientName}
                    {vital.status === 'critical' && (
                      <span className="inline-block ml-2 animate-ping h-2 w-2 rounded-full bg-red-600"></span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600">{vital.room}</p>
                </div>
                <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(vital.status)}`}>
                  <span className="text-white text-xs font-medium capitalize">{vital.status}</span>
                </div>
              </div>

              {/* Vital Card Layout Similar to Image */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {/* Blood Pressure Card */}
                <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-red-700 mb-1">Blood Pressure</p>
                      <p className="text-xl font-bold text-red-600">{vital.bloodPressure} <span className="text-sm font-normal">mmHg</span></p>
                    </div>
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                </div>

                {/* Heart Rate Card */}
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-blue-700 mb-1">Heart Rate</p>
                      <p className="text-xl font-bold text-blue-600">{Math.round(vital.heartRate)} <span className="text-sm font-normal">bpm</span></p>
                    </div>
                    <Activity className="h-5 w-5 text-blue-500" />
                  </div>
                </div>

                {/* BMI Card */}
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-amber-700 mb-1">BMI</p>                      <p className="text-xl font-bold text-amber-600">{vital.bmi.toFixed(1)}</p>
                      <p className="text-xs text-amber-700">
                        {(() => {
                          const bmi = vital.bmi;
                          if (bmi < 18.5) return "Underweight";
                          if (bmi < 25) return "Normal";
                          if (bmi < 30) return "Overweight";
                          return "Obese";
                        })()}
                      </p>
                    </div>
                    <Activity className="h-5 w-5 text-amber-500" />
                  </div>
                </div>

                {/* Medications Card */}
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-purple-700 mb-1">Active Medications</p>
                      <p className="text-xl font-bold text-purple-600">
                        {Array.isArray(vital.medications) ? vital.medications.length : 0}
                      </p>
                    </div>
                    <Pill className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Additional Patient Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {vital.diagnosis && vital.diagnosis.length > 0 && (
                  <div className="bg-gray-50 p-2 rounded-md border border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-1">Current Diagnoses:</p>
                    <div className="flex flex-wrap gap-1">
                      {vital.diagnosis.map((diag: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-xs rounded-md text-gray-700"
                        >
                          {diag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {vital.allergies && vital.allergies.length > 0 && (
                  <div className="bg-red-50 p-2 rounded-md border border-red-100">
                    <p className="text-xs font-medium text-red-700 mb-1">Allergy Alerts:</p>
                    <div className="flex flex-wrap gap-1">
                      {vital.allergies.map((allergy: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-red-100 text-xs rounded-md text-red-700 flex items-center"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other Vitals in Smaller Format */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center space-x-2">
                  <Thermometer className={`h-4 w-4 ${
                    vital.temperature > 99.5 ? 'text-red-500' : 
                    vital.temperature < 97.7 ? 'text-blue-500' : 
                    'text-green-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{vital.temperature.toFixed(1)}°F</div>
                    <div className="text-xs text-gray-500">Temperature</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Droplets className={`h-4 w-4 ${
                    vital.oxygenSat < 92 ? 'text-red-500' : 
                    vital.oxygenSat < 95 ? 'text-yellow-500' : 
                    'text-cyan-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium">{Math.round(vital.oxygenSat)}%</div>
                    <div className="text-xs text-gray-500">Oxygen Saturation</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto">
        <button className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium">
          View Complete Patient Vitals
        </button>
      </div>
    </div>
  )
}
