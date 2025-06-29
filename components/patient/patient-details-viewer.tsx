"use client"

import { useState, useEffect } from "react"
import {
  User,
  Heart,
  Activity,
  FileText,
  AlertTriangle,
  Phone,
  Shield,
  Calendar,
  Pill,
  Brain,
  Stethoscope,
  TrendingUp,
  MapPin,
  Loader2,
  Download,
  Edit,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PatientDetails } from "@/types/patient-details"
import type { VitalSigns } from "@/types/patient"
import { formatDate } from "@/lib/utils"
import { apiService } from "@/lib/api"
import { MCPDashboard } from "@/components/mcp/real-mcp-dashboard"
import { VitalsEditDialog } from "@/components/patient/vitals-edit-dialog"

interface PatientDetailsViewerProps {
  patientId?: string
  patient?: PatientDetails
  onGeneratePrescription: (patient?: PatientDetails) => void
}

export function PatientDetailsViewer({
  patientId,
  patient: initialPatient,
  onGeneratePrescription,
}: PatientDetailsViewerProps) {
  const [patient, setPatient] = useState<PatientDetails | null>(initialPatient || null)
  const [loading, setLoading] = useState(!initialPatient && !!patientId)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false)
  const [editVitalsOpen, setEditVitalsOpen] = useState(false)

  const handleVitalsUpdated = (updatedVitals: VitalSigns) => {
    if (patient) {
      // Convert string values to appropriate types for PatientDetails
      const convertedVitals = {
        blood_pressure: updatedVitals.blood_pressure,
        heart_rate: parseFloat(updatedVitals.heart_rate) || 0,
        temperature: parseFloat(updatedVitals.temperature) || 0,
        weight: parseFloat(updatedVitals.weight) || 0,
        height: parseFloat(updatedVitals.height) || 0,
        bmi: parseFloat(updatedVitals.bmi) || 0,
      }
      
      setPatient({
        ...patient,
        vital_signs: convertedVitals,
      })
    }
  }

  useEffect(() => {
    if (!initialPatient && patientId) {
      fetchPatientDetails()
    }
  }, [patientId, initialPatient])

  useEffect(() => {
    if (patient) {
      fetchPatientPrescriptions()
    }
  }, [patient])

  const fetchPatientDetails = async () => {
    if (!patientId) return

    try {
      setLoading(true)
      setError(null)
      const response = await apiService.getPatient(patientId)

      // Enhance with comprehensive medical data for hackathon demo
      const enhancedPatient: PatientDetails = {
        ...response.data,
        age: calculateAge(response.data.date_of_birth),
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
          {
            test_name: "Total Cholesterol",
            value: "220 mg/dL",
            normal_range: "<200 mg/dL",
            date: "2024-01-15",
            status: "abnormal",
          },
          {
            test_name: "Creatinine",
            value: "1.1 mg/dL",
            normal_range: "0.6-1.2 mg/dL",
            date: "2024-01-15",
            status: "normal",
          },
          {
            test_name: "LDL Cholesterol",
            value: "140 mg/dL",
            normal_range: "<100 mg/dL",
            date: "2024-01-15",
            status: "abnormal",
          },
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
          {
            date: "2023-10-05",
            reason: "Lab Results Review",
            diagnosis: "Hyperlipidemia",
            treatment: "Started statin therapy",
            doctor: "Dr. Sarah Smith",
          },
        ],
        insurance_info: {
          provider: "Blue Cross Blue Shield",
          policy_number: "BC123456789",
          group_number: "GRP001",
          coverage_type: "PPO",
        },
        emergency_contact: {
          name: "Jane Doe",
          relationship: "Spouse",
          phone: "(555) 123-4567",
        },
        medical_history:
          "Patient has a 10-year history of Type 2 diabetes and hypertension. Recently diagnosed with hyperlipidemia. Family history of cardiovascular disease. Non-smoker, occasional alcohol use. Sedentary lifestyle.",
      }

      setPatient(enhancedPatient)
    } catch (error: any) {
      console.error("Error fetching patient details:", error)
      setError("Failed to load patient details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientPrescriptions = async () => {
    if (!patient?.id) return

    try {
      setLoadingPrescriptions(true)
      // In a real application, you would fetch prescriptions from the API
      // For demo purposes, we'll use mock data
      const mockPrescriptions = [
        {
          id: "presc-001",
          medication: "Lisinopril",
          dosage: "10mg",
          frequency: "once daily",
          duration: "30 days",
          instructions: "Take in the morning with food",
          created_at: "2024-01-20",
          doctor: "Dr. Sarah Smith",
        },
        {
          id: "presc-002",
          medication: "Metformin",
          dosage: "500mg",
          frequency: "twice daily",
          duration: "90 days",
          instructions: "Take with meals morning and evening",
          created_at: "2024-01-15",
          doctor: "Dr. Michael Johnson",
        },
        {
          id: "presc-003",
          medication: "Atorvastatin",
          dosage: "20mg",
          frequency: "once daily",
          duration: "30 days",
          instructions: "Take in the evening",
          created_at: "2024-01-10",
          doctor: "Dr. Sarah Smith",
        },
      ]

      setPrescriptions(mockPrescriptions)
    } catch (error) {
      console.error("Error fetching prescriptions:", error)
    } finally {
      setLoadingPrescriptions(false)
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

  const downloadPatientData = async () => {
    if (!patient) return

    try {
      // Generate comprehensive patient data for PDF
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
        prescriptions: prescriptions,
        downloadDate: new Date().toISOString(),
      }

      // Generate HTML content for PDF
      const htmlContent = generatePatientReportHTML(patientData)
      
      // Convert HTML to PDF using browser's print functionality
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
        // Fallback: create a downloadable HTML file
        const dataBlob = new Blob([htmlContent], { type: "text/html" })
        const url = URL.createObjectURL(dataBlob)
        
        const a = document.createElement("a")
        a.href = url
        a.download = `${patient.first_name}_${patient.last_name}_medical_records.html`
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

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Patient Medical Report - ${patientData.personalInfo.first_name} ${patientData.personalInfo.last_name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            @media print {
                body { 
                    margin: 0; 
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
                .no-print { display: none; }
                .page-break { page-break-before: always; }
                .section { break-inside: avoid; }
            }
            
            * {
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 30px;
                color: #1f2937;
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                min-height: 100vh;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
                color: white;
                padding: 40px;
                text-align: center;
                position: relative;
                overflow: hidden;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 10px,
                    rgba(255,255,255,0.03) 10px,
                    rgba(255,255,255,0.03) 20px
                );
                animation: shimmer 20s linear infinite;
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
                100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }
            
            .header-content {
                position: relative;
                z-index: 1;
            }
            
            .clinic-logo {
                width: 80px;
                height: 80px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .clinic-logo::before {
                content: '🏥';
                font-size: 36px;
            }
            
            .clinic-info {
                font-size: 32px;
                font-weight: 700;
                margin-bottom: 8px;
                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .clinic-subtitle {
                font-size: 16px;
                font-weight: 300;
                opacity: 0.9;
                margin-bottom: 30px;
            }
            
            .report-title {
                font-size: 28px;
                font-weight: 600;
                margin-bottom: 15px;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
            }
            
            .report-date {
                font-size: 14px;
                font-weight: 400;
                opacity: 0.8;
                background: rgba(255, 255, 255, 0.1);
                padding: 8px 16px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                display: inline-block;
            }
            
            .content {
                padding: 40px;
            }
            
            .patient-summary {
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-radius: 16px;
                padding: 30px;
                margin-bottom: 30px;
                border: 1px solid #0ea5e9;
                position: relative;
                overflow: hidden;
            }
            
            .patient-summary::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #0ea5e9, #3b82f6, #6366f1);
            }
            
            .patient-name {
                font-size: 32px;
                font-weight: 700;
                color: #0c4a6e;
                margin-bottom: 10px;
            }
            
            .patient-id {
                font-size: 14px;
                color: #0369a1;
                background: rgba(14, 165, 233, 0.1);
                padding: 4px 12px;
                border-radius: 20px;
                display: inline-block;
                margin-bottom: 20px;
                font-weight: 500;
            }
            
            .section {
                margin-bottom: 35px;
                background: white;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border: 1px solid #e5e7eb;
            }
            
            .section-header {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                padding: 20px 30px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .section-title {
                font-size: 22px;
                font-weight: 600;
                color: #1e293b;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .section-title::before {
                content: '';
                width: 4px;
                height: 24px;
                background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                border-radius: 2px;
            }
            
            .section-content {
                padding: 30px;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 20px;
            }
            
            .info-item {
                background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
                padding: 20px;
                border-radius: 12px;
                border-left: 4px solid #3b82f6;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }
            
            .info-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 2px;
                background: linear-gradient(90deg, #3b82f6, transparent);
            }
            
            .info-label {
                font-weight: 600;
                color: #475569;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            
            .info-value {
                color: #1e293b;
                font-size: 16px;
                font-weight: 500;
                line-height: 1.4;
            }
            
            .vital-signs {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 20px;
            }
            
            .vital-item {
                background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
                padding: 25px 20px;
                border-radius: 16px;
                text-align: center;
                border: 2px solid #e2e8f0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                position: relative;
                overflow: hidden;
            }
            
            .vital-item::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #10b981, #059669);
            }
            
            .vital-value {
                font-size: 28px;
                font-weight: 700;
                color: #065f46;
                margin-bottom: 8px;
                line-height: 1;
            }
            
            .vital-label {
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            
            .prescription-item {
                background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
                border: 1px solid #bbf7d0;
                border-radius: 12px;
                padding: 25px;
                margin-bottom: 20px;
                border-left: 6px solid #10b981;
                position: relative;
                overflow: hidden;
            }
            
            .prescription-item::before {
                content: '💊';
                position: absolute;
                top: 20px;
                right: 20px;
                font-size: 24px;
                opacity: 0.3;
            }
            
            .prescription-med {
                font-size: 20px;
                font-weight: 700;
                color: #065f46;
                margin-bottom: 15px;
            }
            
            .prescription-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 15px;
                font-size: 14px;
            }
            
            .prescription-detail {
                background: rgba(255, 255, 255, 0.6);
                padding: 10px 15px;
                border-radius: 8px;
                border: 1px solid rgba(16, 185, 129, 0.2);
            }
            
            .prescription-detail strong {
                color: #047857;
                font-weight: 600;
            }
            
            .medications-list {
                background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
                padding: 25px;
                border-radius: 12px;
                border-left: 6px solid #8b5cf6;
            }
            
            .medication-item {
                padding: 12px 0;
                border-bottom: 1px solid rgba(139, 92, 246, 0.1);
                font-size: 16px;
                color: #581c87;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .medication-item::before {
                content: '•';
                color: #8b5cf6;
                font-weight: bold;
                font-size: 18px;
            }
            
            .medication-item:last-child {
                border-bottom: none;
            }
            
            .emergency-contact {
                background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                border: 1px solid #fecaca;
                border-left: 6px solid #ef4444;
                padding: 25px;
                border-radius: 12px;
                position: relative;
                overflow: hidden;
            }
            
            .emergency-contact::before {
                content: '🚨';
                position: absolute;
                top: 20px;
                right: 20px;
                font-size: 24px;
                opacity: 0.5;
            }
            
            .footer {
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                margin-top: 50px;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
                color: #64748b;
                font-size: 13px;
            }
            
            .footer-content {
                max-width: 600px;
                margin: 0 auto;
            }
            
            .report-id {
                background: rgba(59, 130, 246, 0.1);
                color: #1d4ed8;
                padding: 8px 16px;
                border-radius: 20px;
                display: inline-block;
                margin: 10px 0;
                font-weight: 500;
                font-size: 12px;
            }
            
            .confidential-notice {
                background: rgba(239, 68, 68, 0.1);
                color: #dc2626;
                padding: 12px 20px;
                border-radius: 12px;
                margin-top: 15px;
                font-weight: 500;
                border: 1px solid rgba(239, 68, 68, 0.2);
                display: inline-block;
            }
            
            .no-data {
                color: #9ca3af;
                font-style: italic;
                text-align: center;
                padding: 40px 20px;
                background: #f9fafb;
                border-radius: 12px;
                border: 2px dashed #d1d5db;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            
            .status-normal {
                background: #dcfce7;
                color: #166534;
            }
            
            .status-abnormal {
                background: #fef3c7;
                color: #92400e;
            }
            
            .status-critical {
                background: #fee2e2;
                color: #991b1b;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="header-content">
                    <div class="clinic-logo"></div>
                    <div class="clinic-info">MediOca Healthcare System</div>
                    <div class="clinic-subtitle">Advanced Medical Care & Patient Management</div>
                    <div class="report-title">Comprehensive Patient Medical Report</div>
                    <div class="report-date">Generated on ${currentDate} at ${currentTime}</div>
                </div>
            </div>

            <div class="content">
                <!-- Patient Summary -->
                <div class="patient-summary">
                    <div class="patient-name">${patientData.personalInfo.first_name} ${patientData.personalInfo.last_name}</div>
                    <div class="patient-id">Patient ID: ${patientData.personalInfo.id}</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">👤 Age</div>
                            <div class="info-value">${patientData.personalInfo.age} years old</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">📧 Email</div>
                            <div class="info-value">${patientData.personalInfo.email}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">📞 Phone</div>
                            <div class="info-value">${patientData.personalInfo.phone}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">🎂 Date of Birth</div>
                            <div class="info-value">${patientData.personalInfo.dateOfBirth}</div>
                        </div>
                    </div>
                </div>

                <!-- Patient Personal Information -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Patient Information</h2>
                    </div>
                    <div class="section-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">👤 Full Name</div>
                                <div class="info-value">${patientData.personalInfo.first_name} ${patientData.personalInfo.last_name}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">🆔 Patient ID</div>
                                <div class="info-value">${patientData.personalInfo.id}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">🎯 Gender</div>
                                <div class="info-value">${patientData.personalInfo.gender}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">📍 Address</div>
                                <div class="info-value">${patientData.personalInfo.address || 'Not provided'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Current Vital Signs -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Current Vital Signs</h2>
                    </div>
                    <div class="section-content">
                        <div class="vital-signs">
                            <div class="vital-item">
                                <div class="vital-value">${patientData.medicalInfo.vitalSigns?.blood_pressure || 'N/A'}</div>
                                <div class="vital-label">Blood Pressure</div>
                            </div>
                            <div class="vital-item">
                                <div class="vital-value">${patientData.medicalInfo.vitalSigns?.heart_rate || 'N/A'}</div>
                                <div class="vital-label">Heart Rate (bpm)</div>
                            </div>
                            <div class="vital-item">
                                <div class="vital-value">${patientData.medicalInfo.vitalSigns?.temperature || 'N/A'}</div>
                                <div class="vital-label">Temperature (°F)</div>
                            </div>
                            <div class="vital-item">
                                <div class="vital-value">${patientData.medicalInfo.vitalSigns?.bmi || 'N/A'}</div>
                                <div class="vital-label">BMI</div>
                            </div>
                            <div class="vital-item">
                                <div class="vital-value">${patientData.medicalInfo.vitalSigns?.height || 'N/A'}</div>
                                <div class="vital-label">Height (in)</div>
                            </div>
                            <div class="vital-item">
                                <div class="vital-value">${patientData.medicalInfo.vitalSigns?.weight || 'N/A'}</div>
                                <div class="vital-label">Weight (lbs)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Medical Information -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Medical Information</h2>
                    </div>
                    <div class="section-content">
                        <div class="info-item" style="margin-bottom: 20px;">
                            <div class="info-label">🩺 Current Diagnoses</div>
                            <div class="info-value">${Array.isArray(patientData.medicalInfo.diagnosis) ? patientData.medicalInfo.diagnosis.join(', ') : patientData.medicalInfo.diagnosis || 'None recorded'}</div>
                        </div>
                        
                        <div class="info-item" style="margin-bottom: 20px;">
                            <div class="info-label">⚠️ Known Allergies</div>
                            <div class="info-value">${Array.isArray(patientData.medicalInfo.allergies) ? patientData.medicalInfo.allergies.join(', ') : patientData.medicalInfo.allergies || 'No known allergies'}</div>
                        </div>
                        
                        <div class="info-item">
                            <div class="info-label">📋 Medical History</div>
                            <div class="info-value">${patientData.medicalInfo.medicalHistory || 'No medical history recorded'}</div>
                        </div>
                    </div>
                </div>

                <!-- Current Medications -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Current Medications</h2>
                    </div>
                    <div class="section-content">
                        <div class="medications-list">
                            ${Array.isArray(patientData.medicalInfo.currentMedications) && patientData.medicalInfo.currentMedications.length > 0 
                                ? patientData.medicalInfo.currentMedications.map((med: string) => 
                                    `<div class="medication-item">${med}</div>`
                                ).join('')
                                : '<div class="no-data">No current medications recorded</div>'
                            }
                        </div>
                    </div>
                </div>

                <!-- Recent Prescriptions -->
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Recent Prescriptions</h2>
                    </div>
                    <div class="section-content">
                        ${Array.isArray(patientData.prescriptions) && patientData.prescriptions.length > 0 
                            ? patientData.prescriptions.map((prescription: any) => `
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
                                            <strong>Doctor:</strong> ${prescription.doctor || 'Dr. Smith'}
                                        </div>
                                    </div>
                                    ${prescription.instructions ? `<div style="margin-top: 15px; padding: 15px; background: rgba(255,255,255,0.8); border-radius: 8px; border-left: 4px solid #06b6d4;"><strong>Special Instructions:</strong> ${prescription.instructions}</div>` : ''}
                                </div>
                            `).join('')
                            : '<div class="no-data">📋 No prescriptions recorded</div>'
                        }
                    </div>
                </div>

                <!-- Emergency Contact -->
                ${patientData.emergencyContact ? `
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Emergency Contact</h2>
                    </div>
                    <div class="section-content">
                        <div class="emergency-contact">
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">👤 Name</div>
                                    <div class="info-value">${patientData.emergencyContact.name}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">👨‍👩‍👧‍👦 Relationship</div>
                                    <div class="info-value">${patientData.emergencyContact.relationship}</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">📞 Phone</div>
                                    <div class="info-value">${patientData.emergencyContact.phone}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Insurance Information -->
                ${patientData.insuranceInfo ? `
                <div class="section">
                    <div class="section-header">
                        <h2 class="section-title">Insurance Information</h2>
                    </div>
                    <div class="section-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">🏢 Provider</div>
                                <div class="info-value">${patientData.insuranceInfo.provider}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">📋 Policy Number</div>
                                <div class="info-value">${patientData.insuranceInfo.policy_number}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">👥 Group Number</div>
                                <div class="info-value">${patientData.insuranceInfo.group_number}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">🛡️ Coverage Type</div>
                                <div class="info-value">${patientData.insuranceInfo.coverage_type}</div>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="footer">
                <div class="footer-content">
                    <div style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 10px;">
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
            // Auto-trigger print dialog when opened in new window
            window.onload = function() {
                // Small delay to ensure all styles are loaded
                setTimeout(function() {
                    window.print();
                }, 1500);
            }
        </script>
    </body>
    </html>
    `
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "text-blue-600" }
    if (bmi < 25) return { status: "Normal", color: "text-green-600" }
    if (bmi < 30) return { status: "Overweight", color: "text-yellow-600" }
    return { status: "Obese", color: "text-red-600" }
  }

  const getLabStatus = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-100 text-green-800"
      case "abnormal":
        return "bg-yellow-100 text-yellow-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Loading Patient Details</h3>
          <p className="text-gray-500">Please wait while we fetch the patient information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error Loading Patient</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={fetchPatientDetails} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Patient Selected</h3>
        <p className="text-gray-500">Please select a patient to view their details.</p>
      </div>
    )
  }

  const bmiStatus = getBMIStatus(patient.vital_signs.bmi)

  return (
    <div className="max-w-7xl mx-auto p-6 pt-24 space-y-6">
      {/* Patient Header - Enhanced for Hackathon */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{`${patient.first_name} ${patient.last_name}`}</h1>
              <div className="grid grid-cols-2 gap-4 text-blue-100">
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Age: {patient.age} years
                </p>
                <p className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {patient.phone}
                </p>
                <p className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  ID: {patient.id.slice(0, 8)}
                </p>
                <p className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  {patient.insurance_info.coverage_type}
                </p>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end space-y-3">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setEditVitalsOpen(true)}
                size="lg"
                variant="outline"
                className="bg-white/90 border-white/50 text-red-600 hover:bg-red-50 hover:border-red-200 font-semibold px-6 py-3 text-lg shadow-lg transition-all duration-200"
              >
                <Edit className="h-5 w-5 mr-2" />
                Edit Vitals
              </Button>
              <Button
                onClick={() => onGeneratePrescription(patient)}
                size="lg"
                className="bg-white text-purple-600 hover:bg-blue-50 font-semibold px-8 py-3 text-lg shadow-lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Generate AI Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blood Pressure</p>
                <p className="text-2xl font-bold text-red-600">{patient.vital_signs.blood_pressure}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Heart Rate</p>
                <p className="text-2xl font-bold text-blue-600">{patient.vital_signs.heart_rate} bpm</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">BMI</p>
                <p className={`text-2xl font-bold ${bmiStatus.color}`}>{patient.vital_signs.bmi}</p>
                <p className={`text-xs ${bmiStatus.color}`}>{bmiStatus.status}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Medications</p>
                <p className="text-2xl font-bold text-purple-600">{patient.current_medications.length}</p>
              </div>
              <Pill className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white rounded-lg shadow-sm">
        <nav className="flex space-x-8 px-6">
          {[
            { id: "overview", label: "Medical Overview", icon: Stethoscope },
            { id: "combined", label: "Vitals & Prescriptions ✨", icon: Heart },
            { id: "mcp", label: "AI Assistant 🤖", icon: Brain },
            { id: "labs", label: "Lab Results", icon: Activity },
            { id: "history", label: "Visit History", icon: Calendar },
            { id: "insurance", label: "Insurance Info", icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Diagnoses */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>Current Diagnoses</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patient.diagnosis.map((diagnosis, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-900">{diagnosis}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Medical History Summary</h4>
                  <p className="text-sm text-gray-700">{patient.medical_history}</p>
                </div>
              </CardContent>
            </Card>

            {/* Critical Alerts */}
            <div className="space-y-4">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Allergy Alerts</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patient.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="font-medium text-red-800">{allergy}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    <span>Emergency Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium">{`${patient.emergency_contact.first_name} ${patient.emergency_contact.last_name}`}</p>
                    <p className="text-sm text-gray-600">{patient.emergency_contact.relationship}</p>
                    <p className="text-sm font-medium text-blue-600">{patient.emergency_contact.phone}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "combined" && (
          <div className="space-y-6">
            {/* Enhanced Combined View with Better Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Vital Signs Section - Expanded */}
              <Card className="xl:col-span-2 bg-gradient-to-br from-red-50 to-pink-50 border-red-100">
                <CardHeader className="border-b border-red-200 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <span>Current Vital Signs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setEditVitalsOpen(true)}
                        size="sm"
                        variant="outline"
                        className="bg-white/80 hover:bg-white border-red-200 text-red-600 hover:text-red-700"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit Vitals
                      </Button>
                      <Badge className="bg-red-100 text-red-700">Live Data</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(patient.vital_signs).map(([key, value]) => (
                      <div key={key} className="p-4 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-600 capitalize mb-1">
                              {key.replace("_", " ")}
                            </p>
                            <p className="text-xl font-bold text-gray-900">{value}</p>
                            {key === "bmi" && (
                              <p className={`text-sm font-medium mt-1 ${bmiStatus.color}`}>{bmiStatus.status}</p>
                            )}
                            {key === "blood_pressure" && (
                              <p className="text-xs text-gray-500 mt-1">mmHg</p>
                            )}
                            {key === "heart_rate" && (
                              <p className="text-xs text-gray-500 mt-1">beats/min</p>
                            )}
                            {key === "temperature" && (
                              <p className="text-xs text-gray-500 mt-1">°F</p>
                            )}
                          </div>
                          <div className="ml-3">
                            {key === "blood_pressure" && <Heart className="h-7 w-7 text-red-500 opacity-70" />}
                            {key === "heart_rate" && <Activity className="h-7 w-7 text-blue-500 opacity-70" />}
                            {key === "bmi" && <TrendingUp className="h-7 w-7 text-green-500 opacity-70" />}
                            {key === "temperature" && <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center"><span className="text-orange-600 text-xs font-bold">°F</span></div>}
                            {key === "weight" && <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center"><span className="text-purple-600 text-xs font-bold">lb</span></div>}
                            {key === "height" && <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center"><span className="text-indigo-600 text-xs font-bold">in</span></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Prescriptions Section */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                <CardHeader className="border-b border-purple-200 bg-white/50 backdrop-blur-sm">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-purple-600" />
                      <span>Recent Prescriptions</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700">Active</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {loadingPrescriptions ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                  ) : prescriptions.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {prescriptions.map((prescription, index) => (
                        <div key={index} className="p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:shadow-md transition-all duration-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg text-gray-900 mb-1">{prescription.medication}</h4>
                              <p className="text-purple-700 font-medium">
                                {prescription.dosage}, {prescription.frequency}
                              </p>
                              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{prescription.instructions}</p>
                              <div className="flex items-center mt-3 text-xs text-gray-500">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(prescription.created_at)} • {prescription.doctor}</span>
                              </div>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 ml-4">{prescription.duration}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-purple-300 mx-auto mb-3" />
                      <p className="text-gray-600 mb-4">No active prescriptions</p>
                      <Button
                        onClick={() => onGeneratePrescription(patient)}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        Create First Prescription
                      </Button>
                    </div>
                  )}
                  <div className="mt-6 pt-4 border-t border-purple-200">
                    <Button
                      onClick={() => onGeneratePrescription(patient)}
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate New AI Prescription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Current Medications - Full Width */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-100">
              <CardHeader className="border-b border-blue-200 bg-white/50 backdrop-blur-sm">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Pill className="h-5 w-5 text-blue-600" />
                    <span>Current Medications ({patient.current_medications.length})</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Long-term</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.current_medications.map((medication, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Pill className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-blue-900 block">{medication}</span>
                        <span className="text-xs text-blue-600">Ongoing treatment</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Medication Safety Notice */}
                <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-yellow-800 mb-1">Medication Safety Notes</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Always verify medication list with patient at each visit</li>
                        <li>• Check for potential drug interactions before prescribing</li>
                        <li>• Review allergies: {patient.allergies.join(", ")}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "mcp" && (
          <MCPDashboard 
            patient={patient} 
            doctorId="dr-current-session" 
            onPrescriptionGenerated={(prescription) => {
              console.log("MCP Generated Prescription:", prescription)
              // Handle the generated prescription
              onGeneratePrescription(patient)
            }}
          />
        )}

        {activeTab === "labs" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Lab Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Test Name</th>
                      <th className="text-left py-3 px-4 font-medium">Value</th>
                      <th className="text-left py-3 px-4 font-medium">Normal Range</th>
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patient.lab_results.map((result, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{result.test_name}</td>
                        <td className="py-3 px-4">{result.value}</td>
                        <td className="py-3 px-4 text-gray-600">{result.normal_range}</td>
                        <td className="py-3 px-4">{formatDate(result.date)}</td>
                        <td className="py-3 px-4">
                          <Badge className={getLabStatus(result.status)}>{result.status.toUpperCase()}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Visit History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {patient.visit_history.map((visit, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-6 py-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-lg">{visit.reason}</h4>
                      <span className="text-sm text-gray-500">{formatDate(visit.date)}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Diagnosis:</strong> {visit.diagnosis}
                      </p>
                      <p>
                        <strong>Treatment:</strong> {visit.treatment}
                      </p>
                      <p>
                        <strong>Provider:</strong> {visit.doctor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "insurance" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Insurance Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Insurance Provider</label>
                  <p className="text-lg font-medium">{patient.insurance_info.provider}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Coverage Type</label>
                  <p className="text-lg font-medium">{patient.insurance_info.coverage_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Policy Number</label>
                  <p className="text-lg font-mono">{patient.insurance_info.policy_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Group Number</label>
                  <p className="text-lg font-mono">{patient.insurance_info.group_number}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Vitals Edit Dialog */}
      {patient && (
        <VitalsEditDialog
          open={editVitalsOpen}
          onOpenChange={setEditVitalsOpen}
          patientId={patient.id}
          currentVitals={{
            blood_pressure: patient.vital_signs.blood_pressure,
            heart_rate: patient.vital_signs.heart_rate.toString(),
            temperature: patient.vital_signs.temperature.toString(),
            weight: patient.vital_signs.weight.toString(),
            height: patient.vital_signs.height.toString(),
            bmi: patient.vital_signs.bmi.toString(),
          }}
          onVitalsUpdated={handleVitalsUpdated}
        />
      )}
    </div>
  )
}
