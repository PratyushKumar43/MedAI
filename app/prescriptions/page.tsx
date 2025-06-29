"use client"

import { useState, useEffect } from "react"
import { User, Plus, Search, Brain, Stethoscope, FileText, Eye, Download, Calendar, Pill, Heart, Activity, Edit, Trash2 } from "lucide-react"
import { apiService, supabase } from "@/lib/api"
import type { Prescription } from "@/types/prescription"
import type { Patient } from "@/types/patient"
import type { PatientDetails } from "@/types/patient-details"
import { PrescriptionForm } from "@/components/prescriptions/prescription-form"
import { PatientDetailsViewer } from "@/components/patient/patient-details-viewer"
import { AIPrescriptionGenerator } from "@/components/prescription/ai-prescription-generator"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const generatePrescriptionPDF = (patient: PatientDetails) => {
  // Generate prescription HTML directly without AI to avoid timeout
  const currentDate = new Date().toLocaleDateString()
  const prescriptionNumber = `RX-${Date.now()}`
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical Prescription - ${patient.first_name} ${patient.last_name}</title>
        <style>
            @media print {
                body { margin: 0; }
                .no-print { display: none; }
                .page-break { page-break-before: always; }
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                margin: 20px;
                color: #333;
                background: #fff;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .prescription-header {
                text-align: center;
                border-bottom: 2px solid #0066cc;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .prescription-header h1 {
                color: #0066cc;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }
            
            .prescription-number {
                background: #f0f7ff;
                padding: 10px;
                border-radius: 5px;
                margin: 20px 0;
                text-align: center;
                font-weight: bold;
            }
            
            .patient-info {
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .patient-info h2 {
                color: #0066cc;
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .info-row {
                display: flex;
                margin-bottom: 10px;
            }
            
            .info-label {
                font-weight: bold;
                min-width: 120px;
                color: #555;
            }
            
            .medications-section {
                margin: 30px 0;
            }
            
            .medications-section h2 {
                color: #0066cc;
                border-bottom: 1px solid #ddd;
                padding-bottom: 10px;
                margin-bottom: 20px;
            }
            
            .medication-item {
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 5px;
                padding: 15px;
                margin-bottom: 15px;
            }
            
            .medication-name {
                font-weight: bold;
                font-size: 16px;
                color: #0066cc;
                margin-bottom: 5px;
            }
            
            .medication-instructions {
                color: #666;
                margin-top: 5px;
            }
            
            .allergies-section {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
            }
            
            .allergies-section h3 {
                color: #d63031;
                margin-top: 0;
                font-size: 16px;
            }
            
            .signature-section {
                margin-top: 50px;
                border-top: 1px solid #ddd;
                padding-top: 30px;
            }
            
            .signature-line {
                border-bottom: 1px solid #333;
                width: 300px;
                margin: 30px 0 10px 0;
            }
            
            .doctor-info {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
            }
            
            .footer {
                margin-top: 40px;
                text-align: center;
                font-size: 12px;
                color: #999;
                border-top: 1px solid #eee;
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="prescription-header">
            <h1>MEDICAL PRESCRIPTION</h1>
            <p>MediOca Healthcare System</p>
        </div>
        
        <div class="prescription-number">
            Prescription #: ${prescriptionNumber}
        </div>
        
        <div class="patient-info">
            <h2>Patient Information</h2>
            <div class="info-row">
                <CardTitle className="text-lg font-bold text-gray-800">
                ${patient.first_name} ${patient.last_name}
            </CardTitle>
            <div class="info-row">
                <span class="info-label">Age:</span>
                <span>${patient.age} years</span>
            </div>
            <div class="info-row">
                <span class="info-label">Gender:</span>
                <span>${patient.gender || 'Not specified'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span>${currentDate}</span>
            </div>
        </div>
        
        ${patient.allergies && patient.allergies.length > 0 ? `
        <div class="allergies-section">
            <h3>⚠️ ALLERGIES</h3>
            <p><strong>${patient.allergies.join(", ")}</strong></p>
        </div>
        ` : ''}
        
        <div class="medications-section">
            <h2>Current Diagnoses</h2>
            ${patient.diagnosis && patient.diagnosis.length > 0 ? 
              patient.diagnosis.map(d => `<div class="medication-item">• ${d}</div>`).join('') :
              '<div class="medication-item">No current diagnoses on file</div>'
            }
        </div>
        
        <div class="medications-section">
            <h2>Prescribed Medications</h2>
            ${patient.current_medications && patient.current_medications.length > 0 ? 
              patient.current_medications.map(med => `
                <div class="medication-item">
                    <div class="medication-name">${med}</div>
                    <div class="medication-instructions">Take as directed by physician</div>
                </div>
              `).join('') :
              '<div class="medication-item">No current medications prescribed</div>'
            }
        </div>
        
        <div class="signature-section">
            <p><strong>Doctor's Instructions:</strong></p>
            <p>Please follow the prescribed medication regimen. Contact our office if you experience any adverse effects.</p>
            
            <div style="margin-top: 40px;">
                <p>Doctor's Signature:</p>
                <div class="signature-line"></div>
                <div class="doctor-info">
                    <p>Dr. [Doctor Name]</p>
                    <p>MediOca Healthcare System</p>
                    <p>License #: [License Number]</p>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>This prescription was generated on ${currentDate}</p>
            <p>MediOca Healthcare System - Prescription #${prescriptionNumber}</p>
        </div>
        
        <script>
            // Auto-trigger print dialog after page loads
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 500);
            }
        </script>
    </body>
    </html>
  `
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null)
  const [showPatientDetails, setShowPatientDetails] = useState(false)
  const [showAIPrescription, setShowAIPrescription] = useState(false)
  const [showA4Modal, setShowA4Modal] = useState(false)
  const [a4ModalPatient, setA4ModalPatient] = useState<PatientDetails | null>(null)
  const [currentView, setCurrentView] = useState<"prescriptions" | "patients" | "ai-workflow">("prescriptions")
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [selectedPatientForForm, setSelectedPatientForForm] = useState<string>("")

  useEffect(() => {
    // Initialize date on client side to avoid hydration mismatch
    setCurrentDate(new Date())
    fetchData()

    // Set up real-time subscription for prescriptions
    const subscription = supabase
      .channel("prescriptions_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "prescriptions" }, (payload) => {
        console.log("Prescription change detected:", payload)
        fetchPrescriptions()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prescriptionsRes, patientsRes] = await Promise.all([
        apiService.getPrescriptions(),
        apiService.getPatients(),
      ])

      setPrescriptions(prescriptionsRes.data || [])
      setPatients(patientsRes.data || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      alert(`Failed to load data: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrescriptions = async () => {
    try {
      const response = await apiService.getPrescriptions()
      setPrescriptions(response.data || [])
    } catch (error: any) {
      console.error("Error fetching prescriptions:", error)
    }
  }

  const handlePatientSelect = async (patient: Patient) => {
    try {
      // Convert Patient to PatientDetails with enhanced data
      const enhancedPatient: PatientDetails = {
        ...patient,
        age: calculateAge(patient.date_of_birth),
        gender: patient.gender || "Not specified", // Add gender field
        diagnosis: ["Hypertension", "Type 2 Diabetes"], // Mock data for demo
        current_medications: ["Lisinopril 10mg", "Metformin 500mg"],
        allergies: ["Penicillin", "Shellfish"],
        vital_signs: {
          blood_pressure: "140/90 mmHg",
          heart_rate: 78,
          temperature: 98.6,
          weight: 180,
          height: 70,
          bmi: 25.8,
        },
        lab_results: [
          { test_name: "HbA1c", value: "7.2%", normal_range: "<7%", date: "2024-01-15", status: "abnormal" },
          {
            test_name: "Total Cholesterol",
            value: "220 mg/dL",
            normal_range: "<200 mg/dL",
            date: "2024-01-15",
            status: "abnormal",
          },
        ],
        visit_history: [
          {
            date: "2024-01-15",
            reason: "Routine Follow-up",
            diagnosis: "Diabetes Management",
            treatment: "Medication adjustment",
            doctor: "Dr. Smith",
          },
        ],
        insurance_info: {
          provider: "Blue Cross Blue Shield",
          policy_number: "BC123456789",
          group_number: "GRP001",
          coverage_type: "PPO",
        },
        emergency_contact: {
          first_name: "Emergency",
          last_name: "Contact",
          relationship: "Spouse",
          phone: "(555) 123-4567",
        },
        medical_history: "Patient has a history of diabetes and hypertension. Regular follow-ups required.",
      }

      setSelectedPatient(enhancedPatient)
      setCurrentView("ai-workflow")
      setShowPatientDetails(true)
    } catch (error) {
      console.error("Error selecting patient:", error)
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleGeneratePrescription = (patient?: PatientDetails) => {
    if (patient) {
      setSelectedPatient(patient)
      setShowPatientDetails(false)
      setShowAIPrescription(true)
    }
  }

  const handleViewPatientDetails = async (patientId: string, patientFirstName: string, patientLastName: string) => {
    try {
      // Find patient in existing data or fetch from API
      let patient = patients.find(p => p.id === patientId)
      
      if (!patient) {
        // If not found in local data, try to fetch from API
        const response = await apiService.getPatient(patientId)
        patient = response.data
      }

      if (patient) {
        // Convert Patient to PatientDetails with enhanced data
        const enhancedPatient: PatientDetails = {
          ...patient,
          age: calculateAge(patient.date_of_birth),
          gender: patient.gender || "Not specified",
          diagnosis: ["Hypertension", "Type 2 Diabetes", "Hyperlipidemia"],
          current_medications: ["Lisinopril 10mg daily", "Metformin 500mg twice daily", "Atorvastatin 20mg daily"],
          allergies: ["Penicillin", "Shellfish", "Latex"],
          vital_signs: {
            blood_pressure: "140/90 mmHg",
            heart_rate: 78,
            temperature: 98.6,
            weight: 180,
            height: 70,
            bmi: 25.8,
          },
          lab_results: [
            { test_name: "HbA1c", value: "7.2%", normal_range: "<7%", date: "2024-01-15", status: "abnormal" },
            { test_name: "Total Cholesterol", value: "220 mg/dL", normal_range: "<200 mg/dL", date: "2024-01-15", status: "abnormal" },
            { test_name: "Creatinine", value: "1.1 mg/dL", normal_range: "0.6-1.2 mg/dL", date: "2024-01-15", status: "normal" },
          ],
          visit_history: [
            {
              date: "2024-01-15",
              reason: "Routine Follow-up",
              diagnosis: "Diabetes Management",
              treatment: "Medication adjustment, lifestyle counseling",
              doctor: "Dr. Sarah Smith",
            },
            {
              date: "2023-12-10",
              reason: "Annual Physical Exam",
              diagnosis: "Hypertension, Diabetes",
              treatment: "Blood pressure monitoring, diet modification",
              doctor: "Dr. Michael Johnson",
            },
          ],
          insurance_info: {
            provider: "Blue Cross Blue Shield",
            policy_number: "BC123456789",
            group_number: "GRP001",
            coverage_type: "PPO",
          },
          emergency_contact: {
            first_name: "Jane",
            last_name: "Doe",
            relationship: "Spouse",
            phone: "(555) 123-4567",
          },
          medical_history: "Patient has a 10-year history of Type 2 diabetes and hypertension. Recently diagnosed with hyperlipidemia. Family history of cardiovascular disease.",
        }

        setA4ModalPatient(enhancedPatient)
        setShowA4Modal(true)
      }
    } catch (error) {
      console.error("Error fetching patient details:", error)
      alert("Failed to load patient details. Please try again.")
    }
  }

  const handleSavePrescription = (prescription: any) => {
    console.log("Prescription saved:", prescription)
    fetchPrescriptions()
    setShowAIPrescription(false)
    setCurrentView("prescriptions")
    setSelectedPatient(null)
  }

  const handleDownloadPatientData = async (patient: PatientDetails) => {
    try {
      // Get prescriptions for this patient
      const patientPrescriptions = prescriptions.filter(p => p.patient_id === patient.id)
      
      const patientData = {
        personalInfo: {
          id: patient.id,
          first_name: patient.first_name,
          last_name: patient.last_name,
          age: patient.age,
          dateOfBirth: patient.date_of_birth,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          gender: patient.gender || "Not specified",
        },
        medicalInfo: {
          diagnosis: patient.diagnosis,
          allergies: patient.allergies,
          medicalHistory: patient.medical_history,
          currentMedications: patient.current_medications,
          vitalSigns: patient.vital_signs,
        },
        labResults: patient.lab_results,
        visitHistory: patient.visit_history,
        insuranceInfo: patient.insurance_info,
        emergencyContact: patient.emergency_contact,
        prescriptions: patientPrescriptions,
        downloadDate: new Date().toISOString(),
      }

      // Generate HTML directly without AI to avoid timeout
      const htmlContent = generatePatientReportHTML(patientData)
      
      // Create a new window with the PDF content for printing
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()
        
        // Wait for content to load then trigger print
        setTimeout(() => {
          printWindow.print()
          printWindow.close()
        }, 1000)
      } else {
        // Fallback: download as HTML file
        const dataBlob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(dataBlob)
        
        const a = document.createElement("a")
        a.href = url
        a.download = `${patient.first_name.replace(/\s+/g, "_")}_${patient.last_name.replace(/\s+/g, "_")}_medical_report.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating patient report:', error)
      alert('Failed to generate patient report. Please try again.')
    }
  }

  const generatePatientReportHTML = (patientData: any) => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    })

    // Limit prescriptions to last 5 for compactness
    const prescriptions = Array.isArray(patientData.prescriptions)
      ? patientData.prescriptions.slice(-5)
      : []

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Patient Medical Report - ${patientData.personalInfo.first_name} ${patientData.personalInfo.last_name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
            @media print {
                body { margin: 0; -webkit-print-color-adjust: exact; }
                .no-print { display: none; }
                .page-break { page-break-before: always; }
            }
            body {
                font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
                font-size: 13px;
                margin: 0;
                padding: 8px;
                color: #1f2937;
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                line-height: 1.5;
            }
            .container {
                max-width: 900px;
                margin: 0 auto;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                overflow: hidden;
                border: 1px solid #e2e8f0;
            }
            .header {
                background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%);
                color: #fff;
                padding: 20px 15px 15px 15px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="80" cy="80" r="1" fill="rgba(255,255,255,0.05)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.03)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            }
            .header-content {
                position: relative;
                z-index: 1;
            }
            .clinic-logo {
                width: 60px;
                height: 60px;
                background: rgba(255,255,255,0.15);
                border-radius: 50%;
                margin: 0 auto 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                border: 2px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
            }
            .clinic-info {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 4px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                letter-spacing: -0.5px;
            }
            .clinic-subtitle {
                font-size: 13px;
                font-weight: 400;
                opacity: 0.9;
                margin-bottom: 12px;
                letter-spacing: 0.5px;
            }
            .report-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 6px;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .report-date {
                font-size: 11px;
                opacity: 0.85;
                background: rgba(255,255,255,0.12);
                padding: 4px 12px;
                border-radius: 12px;
                display: inline-block;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
            }
            .content {
                padding: 20px 15px 12px 15px;
            }
            .patient-summary {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-radius: 12px;
                padding: 16px 12px;
                margin-bottom: 16px;
                border: 1px solid #0ea5e9;
                position: relative;
                overflow: hidden;
                box-shadow: 0 2px 8px rgba(14, 165, 233, 0.08);
            }
            .patient-summary::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 3px;
                background: linear-gradient(90deg, #0ea5e9, #3b82f6, #6366f1);
            }
            .patient-name {
                font-size: 20px;
                font-weight: 700;
                color: #0c4a6e;
                margin-bottom: 4px;
                letter-spacing: -0.3px;
            }
            .patient-id {
                font-size: 11px;
                color: #0369a1;
                background: rgba(14, 165, 233, 0.12);
                padding: 3px 10px;
                border-radius: 12px;
                display: inline-block;
                margin-bottom: 10px;
                font-weight: 600;
                border: 1px solid rgba(14, 165, 233, 0.2);
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 10px;
            }
            .info-item {
                background: linear-gradient(135deg, #fff 0%, #fafbff 100%);
                padding: 10px 10px;
                border-radius: 8px;
                border-left: 3px solid #3b82f6;
                border: 1px solid #e2e8f0;
                transition: all 0.2s ease;
                position: relative;
                overflow: hidden;
            }
            .info-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 1px;
                background: linear-gradient(90deg, #3b82f6, transparent);
            }
            .info-label {
                font-weight: 600;
                color: #475569;
                font-size: 10px;
                margin-bottom: 3px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .info-value {
                color: #1e293b;
                font-size: 13px;
                font-weight: 500;
                line-height: 1.3;
            }
            .section {
                margin-bottom: 16px;
                background: #fff;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                border: 1px solid #e5e7eb;
                overflow: hidden;
                position: relative;
            }
            .section::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9);
            }
            .section-header {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                padding: 12px 12px;
                border-bottom: 1px solid #e2e8f0;
                position: relative;
            }
            .section-title {
                font-size: 16px;
                font-weight: 700;
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 8px;
                letter-spacing: -0.2px;
            }
            .section-title::before {
                content: '';
                width: 4px;
                height: 20px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border-radius: 2px;
                box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
            }
            .section-content {
                padding: 12px 12px 8px 12px;
            }
            .prescription-item {
                background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                border: 1px solid #bbf7d0;
                border-radius: 10px;
                padding: 12px 10px;
                margin-bottom: 10px;
                border-left: 4px solid #10b981;
                position: relative;
                overflow: hidden;
                box-shadow: 0 1px 4px rgba(16, 185, 129, 0.08);
            }
            .prescription-item::before {
                content: '💊';
                position: absolute;
                top: 10px;
                right: 12px;
                font-size: 16px;
                opacity: 0.4;
            }
            .prescription-item::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, #10b981, #059669, #047857);
            }
            .prescription-med {
                font-size: 16px;
                font-weight: 700;
                color: #047857;
                margin-bottom: 6px;
                letter-spacing: -0.2px;
            }
            .prescription-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
                gap: 8px;
                font-size: 11px;
            }
            .prescription-detail {
                background: linear-gradient(135deg, #fff 0%, #fafffe 100%);
                padding: 5px 7px;
                border-radius: 6px;
                border: 1px solid rgba(16, 185, 129, 0.15);
                box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            }
            .prescription-detail strong {
                color: #047857;
                font-weight: 700;
            }
            .footer {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                margin-top: 12px;
                padding: 14px 12px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                color: #64748b;
                font-size: 11px;
                position: relative;
            }
            .footer::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, #3b82f6, transparent);
            }
            .footer-content {
                max-width: 600px;
                margin: 0 auto;
            }
            .footer-branding {
                font-size: 14px;
                font-weight: 700;
                color: #374151;
                margin-bottom: 6px;
                letter-spacing: -0.2px;
            }
            .report-id {
                background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                color: #1d4ed8;
                padding: 4px 12px;
                border-radius: 12px;
                display: inline-block;
                margin: 6px 0;
                font-weight: 700;
                font-size: 10px;
                border: 1px solid rgba(29, 78, 216, 0.2);
                box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1);
            }
            .confidential-notice {
                background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                color: #dc2626;
                padding: 8px 12px;
                border-radius: 10px;
                margin-top: 8px;
                font-weight: 700;
                border: 1px solid #fca5a5;
                display: inline-block;
                font-size: 11px;
                box-shadow: 0 1px 3px rgba(220, 38, 38, 0.1);
            }
            .no-data {
                color: #9ca3af;
                font-style: italic;
                text-align: center;
                padding: 12px 8px;
                background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                border-radius: 10px;
                border: 2px dashed #d1d5db;
                font-size: 12px;
                margin: 8px 0;
            }
            .vitals-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 10px;
            }
            .vital-item {
                background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                padding: 10px;
                border-radius: 8px;
                border-left: 3px solid #f59e0b;
                border: 1px solid #f3d15a;
                text-align: center;
                box-shadow: 0 1px 3px rgba(245, 158, 11, 0.1);
            }
            .vital-label {
                font-weight: 700;
                color: #92400e;
                font-size: 9px;
                margin-bottom: 3px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .vital-value {
                color: #78350f;
                font-size: 14px;
                font-weight: 700;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="header-content">
                    <div class="clinic-logo">🏥</div>
                    <div class="clinic-info">MediOca Healthcare System</div>
                    <div class="clinic-subtitle">Advanced Medical Care & Patient Management</div>
                    <div class="report-title">Patient Prescription Report</div>
                    <div class="report-date">${currentDate} at ${currentTime}</div>
                </div>
            </div>
            <div class="content">
                <div class="patient-summary">
                    <div class="patient-name">${patientData.personalInfo.first_name} ${patientData.personalInfo.last_name}</div>
                    <div class="patient-id">Patient ID: ${patientData.personalInfo.id}</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Age</div>
                            <div class="info-value">${patientData.personalInfo.age} years</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${patientData.personalInfo.email}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone</div>
                            <div class="info-value">${patientData.personalInfo.phone}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">DOB</div>
                            <div class="info-value">${patientData.personalInfo.dateOfBirth}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Vital Signs Section -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Current Vital Signs</h2>
                    </div>
                    <div class="section-content">
                        ${patientData.medicalInfo.vitalSigns && Object.keys(patientData.medicalInfo.vitalSigns).length > 0
                            ? `<div class="vitals-grid">
                                ${Object.entries(patientData.medicalInfo.vitalSigns).map(([key, value]) => `
                                    <div class="vital-item">
                                        <div class="vital-label">${key.replace(/_/g, ' ')}</div>
                                        <div class="vital-value">${value || 'N/A'}</div>
                                    </div>
                                `).join('')}
                            </div>`
                            : '<div class="no-data">No vital signs recorded</div>'
                        }
                    </div>
                </div>
                
                <!-- Medical Information Section -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Medical Information</h2>
                    </div>
                    <div class="section-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Diagnosis</div>
                                <div class="info-value">${patientData.medicalInfo.diagnosis || 'Not specified'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Allergies</div>
                                <div class="info-value">${patientData.medicalInfo.allergies || 'None known'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Medical History</div>
                                <div class="info-value">${patientData.medicalInfo.medicalHistory || 'None recorded'}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Current Medications</div>
                                <div class="info-value">${patientData.medicalInfo.currentMedications || 'None'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Recent Prescriptions</h2>
                    </div>
                    <div class="section-content">
                        ${prescriptions.length > 0 
                            ? prescriptions.map((prescription: any) => `
                                <div class="prescription-item">
                                    <div class="prescription-med">${prescription.medication}</div>
                                    <div class="prescription-details">
                                        <div class="prescription-detail">
                                            <strong>Dosage:</strong> ${prescription.dosage}
                                        </div>
                                        <div class="prescription-detail">
                                            <strong>Frequency:</strong> ${prescription.frequency}
                                        </div>
                                        <div class="prescription-detail">
                                            <strong>Duration:</strong> ${prescription.duration}
                                        </div>
                                        <div class="prescription-detail">
                                            <strong>Prescribed:</strong> ${new Date(prescription.created_at).toLocaleDateString()}
                                        </div>
                                        <div class="prescription-detail">
                                            <strong>Doctor:</strong> ${prescription.doctors?.first_name} ${prescription.doctors?.last_name || 'Not specified'}
                                        </div>
                                    </div>
                                    ${prescription.instructions ? `<div style="margin-top: 7px; padding: 7px; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #06b6d4;"><strong>Instructions:</strong> ${prescription.instructions}</div>` : ''}
                                </div>
                            `).join('')
                            : '<div class="no-data">No prescriptions recorded</div>'
                        }
                    </div>
                </div>
            </div>
            <div class="footer">
                <div class="footer-content">
                    <div class="footer-branding">
                        MediOca Healthcare System
                    </div>
                    <div>Professional Medical Records Management</div>
                    <div class="report-id">Report ID: MR-${Date.now()}</div>
                    <div>Generated: ${currentDate} at ${currentTime}</div>
                    <div class="confidential-notice">
                        🔒 CONFIDENTIAL MEDICAL INFORMATION - Handle with care
                    </div>
                </div>
            </div>
        </div>
        <script>
            window.onload = function() {
                setTimeout(function() {
                    window.print();
                }, 1000);
            }
        </script>
    </body>
    </html>
    `
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prescription?")) return

    try {
      await apiService.deletePrescription(id)
      fetchPrescriptions()
    } catch (error: any) {
      console.error("Error deleting prescription:", error)
      alert(`Failed to delete prescription: ${error.message || "Unknown error"}`)
    }
  }

  const handleEdit = (prescription: Prescription) => {
    setEditingPrescription(prescription)
    setShowForm(true)
  }

  const handleUpdatePrescription = async (updatedPrescription: any) => {
    try {
      if (editingPrescription) {
        await apiService.updatePrescription(editingPrescription.id, updatedPrescription)
        fetchPrescriptions()
        setShowForm(false)
        setEditingPrescription(null)
      }
    } catch (error: any) {
      console.error("Error updating prescription:", error)
      alert(`Failed to update prescription: ${error.message || "Unknown error"}`)
    }
  }

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      prescription.medication?.toLowerCase().includes(searchLower) ||
      `${prescription.patients?.first_name} ${prescription.patients?.last_name}`.toLowerCase().includes(searchLower) ||
      `${prescription.doctors?.first_name} ${prescription.doctors?.last_name}`.toLowerCase().includes(searchLower) ||
      prescription.dosage?.toLowerCase().includes(searchLower) ||
      prescription.frequency?.toLowerCase().includes(searchLower)
    )
  })

  // Group prescriptions by patient
  const groupedPrescriptions = filteredPrescriptions.reduce((acc, prescription) => {
    const patientKey = `${prescription.patient_id}-${prescription.patients?.first_name || 'Unknown'} ${prescription.patients?.last_name || 'Unknown'}`
    
    if (!acc[patientKey]) {
      acc[patientKey] = {
        patient: {
          id: prescription.patient_id,
          first_name: prescription.patients?.first_name || 'Unknown',
          last_name: prescription.patients?.last_name || 'Unknown',
          email: prescription.patients?.email || '',
        },
        medications: [],
        latestDate: prescription.created_at || '',
        totalMedications: 0
      }
    }
    
    acc[patientKey].medications.push({
      id: prescription.id,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      doctor: `${prescription.doctors?.first_name} ${prescription.doctors?.last_name || 'Not specified'}`,
      doctorSpecialization: prescription.doctors?.specialization || '',
      created_at: prescription.created_at,
      is_ai_generated: prescription.is_ai_generated || prescription.instructions?.includes("AI Generated")
    })
    
    acc[patientKey].totalMedications = acc[patientKey].medications.length
    
    // Keep track of the latest prescription date
    if (prescription.created_at && prescription.created_at > acc[patientKey].latestDate) {
      acc[patientKey].latestDate = prescription.created_at
    }
    
    return acc
  }, {} as Record<string, any>)

  const patientPrescriptionGroups = Object.values(groupedPrescriptions)

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6 mt-8"> {/* Use margin top instead of padding for better spacing */}
      {/* Modern Header with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <div className="inline-flex items-center justify-center p-2 bg-white/10 backdrop-blur-sm rounded-lg mb-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Prescription Management</h1>
            <p className="text-blue-100 mt-2 max-w-xl">
              Streamlined medication tracking with AI-powered prescription generation and patient context analysis
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => setCurrentView("prescriptions")}
              className={`${currentView === "prescriptions" 
                ? "bg-white text-blue-700" 
                : "bg-white/20 text-white hover:bg-white hover:text-blue-700"} 
                px-4 py-2 h-auto rounded-lg transition-all duration-200 font-medium`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Prescriptions
            </Button>
            <Button
              variant="secondary"
              onClick={() => setCurrentView("patients")}
              className={`${currentView === "patients" 
                ? "bg-white text-purple-700" 
                : "bg-white/20 text-white hover:bg-white hover:text-purple-700"} 
                px-4 py-2 h-auto rounded-lg transition-all duration-200 font-medium`}
            >
              <Brain className="h-4 w-4 mr-2" />
              AI Workflow
            </Button>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 h-auto rounded-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </div>
        </div>
      </div>

      {/* AI Workflow Steps - Modern Design */}
      {currentView === "patients" && (
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-xl p-6 border border-indigo-100 shadow-md mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-indigo-900">AI-Powered Prescription Workflow</h2>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Step 1 */}
            <div className="flex-1 relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">Select Patient</h3>
                  <p className="text-sm text-indigo-700">Choose from your patient list</p>
                </div>
              </div>
              <div className="hidden md:block absolute top-7 right-0 w-full h-0.5 bg-gradient-to-r from-indigo-300 to-transparent -z-10"></div>
            </div>
            
            {/* Step 2 */}
            <div className="flex-1 relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">Review Details</h3>
                  <p className="text-sm text-indigo-700">Verify patient information</p>
                </div>
              </div>
              <div className="hidden md:block absolute top-7 right-0 w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent -z-10"></div>
            </div>
            
            {/* Step 3 */}
            <div className="flex-1 relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-purple-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">AI Analysis</h3>
                  <p className="text-sm text-indigo-700">Input symptoms & diagnosis</p>
                </div>
              </div>
              <div className="hidden md:block absolute top-7 right-0 w-full h-0.5 bg-gradient-to-r from-cyan-300 to-transparent -z-10"></div>
            </div>
            
            {/* Step 4 */}
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl flex items-center justify-center text-xl font-bold shadow-md">
                  4
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900">Review & Save</h3>
                  <p className="text-sm text-indigo-700">Approve AI recommendations</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Benefits */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-100 rounded-md">
                  <Brain className="h-4 w-4 text-blue-700" />
                </div>
                <h4 className="font-medium text-blue-900">AI-Powered</h4>
              </div>
              <p className="text-xs text-gray-600">Leverages advanced medical AI models to suggest appropriate medications</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-100 rounded-md">
                  <Stethoscope className="h-4 w-4 text-green-700" />
                </div>
                <h4 className="font-medium text-green-900">Context-Aware</h4>
              </div>
              <p className="text-xs text-gray-600">Considers patient history, allergies, and current medications</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-purple-100 rounded-md">
                  <FileText className="h-4 w-4 text-purple-700" />
                </div>
                <h4 className="font-medium text-purple-900">Comprehensive</h4>
              </div>
              <p className="text-xs text-gray-600">Generates complete prescription details with dosage and instructions</p>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Search Bar with Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-blue-500" />
            </div>
            <input
              type="text"
              placeholder={currentView === "prescriptions" 
                ? "Search medications, patients, or doctors..." 
                : "Search patients by name, email or ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white w-full transition-all duration-200"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 self-end">
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer px-3 py-1">
              All
            </Badge>
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer px-3 py-1">
              Recent
            </Badge>
            <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer px-3 py-1">
              AI Generated
            </Badge>
          </div>
        </div>
      </div>

      {/* Content based on current view */}
      {currentView === "prescriptions" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {patientPrescriptionGroups.map((group) => (
                <Card key={group.patient.id} className="bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    {/* Patient Medications Panel */}
                    <div className="mb-4">
                      {/* Patient Banner */}
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl text-white">{group.patient.first_name} {group.patient.last_name}</h3>
                            <p className="text-blue-100 text-sm">Patient ID: {group.patient.id?.slice(0, 8) || "N/A"}</p>
                          </div>
                        </div>
                        <Badge className="bg-white text-blue-700 text-sm px-3 py-1 font-medium">
                          {group.totalMedications} medication{group.totalMedications !== 1 ? 's' : ''}
                        </Badge>
                      </div>

                      {/* Medication Cards Container */}

                      {/* Active Medication Details */}
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-2">

                        {/* Medication Cards in Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {group.medications.map((medication: any) => (
                            <div 
                              key={medication.id} 
                              className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-bold text-gray-900 flex items-center">
                                  {medication.medication}
                                  {medication.is_ai_generated && (
                                    <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">
                                      <Brain className="h-3 w-3 mr-1" />
                                      AI
                                    </Badge>
                                  )}
                                </h4>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <span className="font-medium text-blue-700 block mb-1">Dosage</span>
                                  <p className="text-gray-900 font-semibold">{medication.dosage}</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <span className="font-medium text-blue-700 block mb-1">Frequency</span>
                                  <p className="text-gray-900 font-semibold">{medication.frequency}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded-lg">
                                <div className="flex items-center">
                                  <Stethoscope className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>{medication.doctor}</span>
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                  <span>{medication.duration}</span>
                                </div>
                              </div>
                              
                              {medication.instructions && (
                                <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400 mb-4">
                                  <p className="text-sm text-yellow-800">
                                    <strong className="block mb-1">Instructions:</strong> 
                                    {medication.instructions.substring(0, 80)}
                                    {medication.instructions.length > 80 && "..."}
                                  </p>
                                </div>
                              )}
                              
                              {/* Individual Medication Actions */}
                              <div className="flex space-x-2 pt-2 border-t border-gray-100">
                                <Button
                                  onClick={() => {
                                    // Find the full prescription object for editing
                                    const fullPrescription = prescriptions.find(p => p.id === medication.id)
                                    if (fullPrescription) {
                                      handleEdit(fullPrescription)
                                    }
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 text-blue-600 hover:bg-blue-50 text-sm px-3 py-1 h-8 flex-1"
                                >
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button
                                  onClick={() => handleDelete(medication.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50 text-sm px-3 py-1 h-8 flex-1"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            // Add new medication to this patient using the new form
                            setSelectedPatientForForm(group.patient.id)
                            setShowForm(true)
                          }}
                          size="sm"
                          variant="outline"
                          className="border-green-300 text-green-600 hover:bg-green-50 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Medication
                        </Button>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            // Find the first patient details from medications
                            const firstMedication = group.medications[0]
                            if (firstMedication) {
                              // Create a PatientDetails object for compatibility
                              const patientDetails = patients.find(p => p.id === group.patient.id)
                              if (patientDetails) {
                                const enhancedPatient: PatientDetails = {
                                  ...patientDetails,
                                  age: calculateAge(patientDetails.date_of_birth),
                                  gender: patientDetails.gender || "Not specified",
                                  diagnosis: ["Current medications as prescribed"],
                                  current_medications: group.medications.map((med: any) => `${med.medication} ${med.dosage}`),
                                  allergies: patientDetails.allergies || [],
                                  vital_signs: {
                                    blood_pressure: patientDetails.vital_signs?.blood_pressure || "N/A",
                                    heart_rate: patientDetails.vital_signs?.heart_rate ? parseInt(patientDetails.vital_signs.heart_rate) || 0 : 0,
                                    temperature: patientDetails.vital_signs?.temperature ? parseFloat(patientDetails.vital_signs.temperature) || 0 : 0,
                                    weight: patientDetails.vital_signs?.weight ? parseFloat(patientDetails.vital_signs.weight) || 0 : 0,
                                    height: patientDetails.vital_signs?.height ? parseFloat(patientDetails.vital_signs.height) || 0 : 0,
                                    bmi: patientDetails.vital_signs?.bmi ? parseFloat(patientDetails.vital_signs.bmi) || 0 : 0,
                                  },
                                  lab_results: [],
                                  visit_history: [],
                                  insurance_info: {
                                    provider: "Not specified",
                                    policy_number: "N/A",
                                    group_number: "N/A",
                                    coverage_type: "N/A"
                                  },
                                  emergency_contact: {
                                    first_name: "Not specified",
                                    last_name: "Not specified",
                                    relationship: "N/A",
                                    phone: "N/A"
                                  }
                                }
                                setA4ModalPatient(enhancedPatient)
                                setShowA4Modal(true)
                              }
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            const patientDetails = patients.find(p => p.id === group.patient.id)
                            if (patientDetails) {
                              const enhancedPatient: PatientDetails = {
                                ...patientDetails,
                                age: calculateAge(patientDetails.date_of_birth),
                                gender: patientDetails.gender || "Not specified",
                                diagnosis: ["Current medications as prescribed"],
                                current_medications: group.medications.map((med: any) => `${med.medication} ${med.dosage}`),
                                allergies: patientDetails.allergies || [],
                                vital_signs: {
                                  blood_pressure: patientDetails.vital_signs?.blood_pressure || "N/A",
                                  heart_rate: patientDetails.vital_signs?.heart_rate ? parseInt(patientDetails.vital_signs.heart_rate) || 0 : 0,
                                  temperature: patientDetails.vital_signs?.temperature ? parseFloat(patientDetails.vital_signs.temperature) || 0 : 0,
                                  weight: patientDetails.vital_signs?.weight ? parseFloat(patientDetails.vital_signs.weight) || 0 : 0,
                                  height: patientDetails.vital_signs?.height ? parseFloat(patientDetails.vital_signs.height) || 0 : 0,
                                  bmi: patientDetails.vital_signs?.bmi ? parseFloat(patientDetails.vital_signs.bmi) || 0 : 0,
                                },
                                lab_results: [],
                                visit_history: [],
                                insurance_info: {
                                  provider: "Not specified",
                                  policy_number: "N/A",
                                  group_number: "N/A",
                                  coverage_type: "N/A"
                                },
                                emergency_contact: {
                                  first_name: "Not specified",
                                  last_name: "Not specified",
                                  relationship: "N/A",
                                  phone: "N/A"
                                }
                              }
                              setSelectedPatient(enhancedPatient)
                              setShowAIPrescription(true)
                            }
                          }}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm"
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          AI Prescription
                        </Button>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 text-center">
                        Last updated: {group.latestDate ? formatDate(group.latestDate) : 'N/A'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {currentView === "patients" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <div 
                  key={patient.id} 
                  className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                  onClick={() => handlePatientSelect(patient)}
                >
                  {/* Patient Card Header */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 backdrop-blur-sm"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8 backdrop-blur-sm"></div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-inner">
                        <User className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{`${patient.first_name} ${patient.last_name}`}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-white/20 text-white backdrop-blur-sm border border-white/10">
                            Age: {calculateAge(patient.date_of_birth)}
                          </Badge>
                          <Badge className="bg-white/20 text-white backdrop-blur-sm border border-white/10">
                            ID: {patient.id.slice(0, 8)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Patient Card Content */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-xs text-indigo-600 font-medium mb-1">Email</p>
                        <p className="text-sm text-gray-800 truncate">{patient.email}</p>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-lg">
                        <p className="text-xs text-indigo-600 font-medium mb-1">Phone</p>
                        <p className="text-sm text-gray-800">{patient.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mb-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>DOB: {formatDate(patient.date_of_birth)}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                    
                    {/* Action Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md group-hover:shadow-lg transition-all duration-300 mt-2"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Prescription
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showForm && (
        <PrescriptionForm
          prescription={editingPrescription}
          selectedPatientId={selectedPatientForForm}
          onClose={() => {
            setShowForm(false)
            setEditingPrescription(null)
            setSelectedPatientForForm("")
          }}
          onSuccess={(prescription) => {
            if (editingPrescription) {
              handleUpdatePrescription(prescription)
            } else {
              setShowForm(false)
              fetchPrescriptions()
            }
            setSelectedPatientForForm("")
          }}
        />
      )}

      {showPatientDetails && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[85vh] overflow-y-auto mt-8">
            <PatientDetailsViewer patient={selectedPatient} onGeneratePrescription={handleGeneratePrescription} />
            <div className="p-4 border-t flex justify-end items-center">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPatientDetails(false)
                  setCurrentView("patients")
                }}
              >
                Back to Patients
              </Button>
            </div>
          </div>
        </div>
      )}

      {showAIPrescription && selectedPatient && (
        <AIPrescriptionGenerator
          patient={selectedPatient}
          onClose={() => {
            setShowAIPrescription(false)
            setCurrentView("patients")
          }}
          onSavePrescription={handleSavePrescription}
        />
      )}

      {/* A4 Patient Details Modal */}
      {showA4Modal && a4ModalPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-[210mm] h-[297mm] max-w-full max-h-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Complete Patient Medical Record</h2>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleDownloadPatientData(a4ModalPatient)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setShowA4Modal(false)}
                  variant="outline"
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  ✕ Close
                </Button>
              </div>
            </div>

            {/* A4 Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {/* Patient Header */}
              <div className="border-b-2 border-blue-200 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{`${a4ModalPatient.first_name} ${a4ModalPatient.last_name}`}</h1>
                      <p className="text-gray-600">Patient ID: {a4ModalPatient.id}</p>
                      <p className="text-gray-600">Age: {`${a4ModalPatient.age} years • ${a4ModalPatient.gender}`}</p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>Generated: {currentDate ? currentDate.toLocaleDateString() : "--/--/----"}</p>
                    <p>Report #: MR-{currentDate ? currentDate.getTime().toString().slice(-6) : "------"}</p>
                  </div>
                </div>
              </div>

              {/* Contact & Insurance Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Contact Information
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Email:</span> {a4ModalPatient.email}</p>
                    <p><span className="font-medium">Phone:</span> {a4ModalPatient.phone}</p>
                    <p><span className="font-medium">DOB:</span> {formatDate(a4ModalPatient.date_of_birth)}</p>
                    <p><span className="font-medium">Address:</span> {a4ModalPatient.address}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Insurance Information
                  </h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Provider:</span> {a4ModalPatient.insurance_info.provider}</p>
                    <p><span className="font-medium">Policy:</span> {a4ModalPatient.insurance_info.policy_number}</p>
                    <p><span className="font-medium">Group:</span> {a4ModalPatient.insurance_info.group_number}</p>
                    <p><span className="font-medium">Type:</span> {a4ModalPatient.insurance_info.coverage_type}</p>
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Current Vital Signs
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(a4ModalPatient.vital_signs).map(([key, value]) => (
                    <div key={key} className="bg-red-50 p-3 rounded-lg text-center">
                      <p className="text-xs font-medium text-gray-600 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-lg font-bold text-red-600">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnoses & Medications */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                    <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                    Current Diagnoses
                  </h3>
                  <div className="space-y-2">
                    {a4ModalPatient.diagnosis.map((diagnosis, index) => (
                      <div key={index} className="bg-blue-50 p-2 rounded text-sm">
                        {diagnosis}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                    <Pill className="h-5 w-5 mr-2 text-purple-600" />
                    Current Medications
                  </h3>
                  <div className="space-y-2">
                    {a4ModalPatient.current_medications.map((medication, index) => (
                      <div key={index} className="bg-purple-50 p-2 rounded text-sm">
                        {medication}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Prescriptions */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  <FileText className="h-5 w-5 mr-2 text-green-600" />
                  Recent Prescriptions
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {prescriptions
                    .filter(p => p.patients?.first_name === a4ModalPatient.first_name && p.patients?.last_name === a4ModalPatient.last_name)
                    .slice(0, 4)
                    .map((prescription, index) => (
                      <div key={index} className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-green-900">{prescription.medication}</p>
                            <p className="text-sm text-green-700">{prescription.dosage}, {prescription.frequency}</p>
                            <p className="text-xs text-green-600">{prescription.instructions?.substring(0, 60)}...</p>
                          </div>
                          <div className="text-right text-xs text-green-600">
                            <p>{formatDate(prescription.created_at || new Date())}</p>
                            <p>{prescription.doctors?.first_name} {prescription.doctors?.last_name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Lab Results */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  <Activity className="h-5 w-5 mr-2 text-orange-600" />
                  Recent Lab Results
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-2">Test</th>
                        <th className="text-left p-2">Value</th>
                        <th className="text-left p-2">Normal Range</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a4ModalPatient.lab_results.map((result, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{result.test_name}</td>
                          <td className="p-2">{result.value}</td>
                          <td className="p-2 text-gray-600">{result.normal_range}</td>
                          <td className="p-2">
                            <Badge 
                              className={
                                result.status === "normal" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {result.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-2">{formatDate(result.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Allergies & Emergency Contact */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ Allergies</h3>
                  <div className="space-y-1">
                    {a4ModalPatient.allergies.map((allergy, index) => (
                      <div key={index} className="bg-red-100 p-2 rounded text-sm text-red-800">
                        {allergy}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">📞 Emergency Contact</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {a4ModalPatient.emergency_contact.first_name} {a4ModalPatient.emergency_contact.last_name}</p>
                    <p><span className="font-medium">Relationship:</span> {a4ModalPatient.emergency_contact.relationship}</p>
                    <p><span className="font-medium">Phone:</span> {a4ModalPatient.emergency_contact.phone}</p>
                  </div>
                </div>
              </div>

              {/* Medical History */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center border-b border-gray-200 pb-2">
                  📋 Medical History Summary
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 leading-relaxed">{a4ModalPatient.medical_history}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                <p>This is a comprehensive medical record generated on {currentDate ? currentDate.toLocaleDateString() : "--/--/----"} at {currentDate ? currentDate.toLocaleTimeString() : "--:--:--"}</p>
                <p>For medical use only • Confidential Patient Information</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
