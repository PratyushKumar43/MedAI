import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { Prescription } from '@/types/prescription'

export interface PrescriptionPDFData extends Prescription {
  doctor_name?: string
  patient_name?: string
  patient_age?: string
  patient_phone?: string
  clinic_name?: string
  clinic_address?: string
  doctor_license?: string
}

export class PrescriptionPDFGenerator {
  private pdf: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number

  constructor() {
    this.pdf = new jsPDF()
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.margin = 20
  }

  async generatePrescriptionPDF(prescription: PrescriptionPDFData): Promise<void> {
    // Reset PDF
    this.pdf = new jsPDF()
    
    // Header Section
    this.addHeader(prescription)
    
    // Doctor Information
    this.addDoctorInfo(prescription)
    
    // Patient Information
    this.addPatientInfo(prescription)
    
    // Prescription Details
    this.addPrescriptionDetails(prescription)
    
    // Footer
    this.addFooter()
    
    // Download the PDF
    const fileName = `prescription_${prescription.patient_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    this.pdf.save(fileName)
  }

  private addHeader(prescription: PrescriptionPDFData) {
    let yPosition = this.margin

    // Clinic/Hospital Header
    this.pdf.setFontSize(20)
    this.pdf.setFont('helvetica', 'bold')
    const clinicName = prescription.clinic_name || 'MediOca Healthcare Platform'
    this.pdf.text(clinicName, this.pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 8
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'normal')
    const clinicAddress = prescription.clinic_address || 'Digital Healthcare Solutions'
    this.pdf.text(clinicAddress, this.pageWidth / 2, yPosition, { align: 'center' })
    
    yPosition += 15
    // Prescription Title
    this.pdf.setFontSize(18)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('PRESCRIPTION', this.pageWidth / 2, yPosition, { align: 'center' })
    
    // Prescription ID and Date
    yPosition += 10
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    const prescriptionId = `Prescription ID: ${prescription.id.slice(0, 8).toUpperCase()}`
    const prescriptionDate = `Date: ${new Date(prescription.created_at || new Date()).toLocaleDateString()}`
    
    this.pdf.text(prescriptionId, this.margin, yPosition)
    this.pdf.text(prescriptionDate, this.pageWidth - this.margin, yPosition, { align: 'right' })
    
    // Add line separator
    yPosition += 8
    this.pdf.line(this.margin, yPosition, this.pageWidth - this.margin, yPosition)
  }

  private addDoctorInfo(prescription: PrescriptionPDFData) {
    let yPosition = 70

    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('DOCTOR INFORMATION', this.margin, yPosition)
    
    yPosition += 8
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')
    
    const doctorName = prescription.doctors ? `${prescription.doctors.first_name} ${prescription.doctors.last_name}` : prescription.doctor_name || 'Dr. Unknown'
    const specialization = prescription.doctors?.specialization || 'General Practitioner'
    const license = prescription.doctor_license || 'License: Available on request'
    
    this.pdf.text(`Dr. ${doctorName}`, this.margin, yPosition)
    yPosition += 6
    this.pdf.text(`Specialization: ${specialization}`, this.margin, yPosition)
    yPosition += 6
    this.pdf.text(license, this.margin, yPosition)
  }

  private addPatientInfo(prescription: PrescriptionPDFData) {
    let yPosition = 110

    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('PATIENT INFORMATION', this.margin, yPosition)
    
    yPosition += 8
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')
    
    const patientName = prescription.patients ? `${prescription.patients.first_name} ${prescription.patients.last_name}` : prescription.patient_name || 'Unknown Patient'
    const patientEmail = prescription.patients?.email || 'Email not provided'
    const patientAge = prescription.patient_age || 'Age not specified'
    const patientPhone = prescription.patient_phone || 'Phone not provided'
    
    this.pdf.text(`Name: ${patientName}`, this.margin, yPosition)
    yPosition += 6
    this.pdf.text(`Email: ${patientEmail}`, this.margin, yPosition)
    yPosition += 6
    this.pdf.text(`Age: ${patientAge}`, this.margin, yPosition)
    yPosition += 6
    this.pdf.text(`Phone: ${patientPhone}`, this.margin, yPosition)
  }

  private addPrescriptionDetails(prescription: PrescriptionPDFData) {
    let yPosition = 160

    // Prescription Details Header
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('PRESCRIPTION DETAILS', this.margin, yPosition)
    
    yPosition += 10
    
    // Create a box for the prescription
    const boxHeight = 80
    this.pdf.rect(this.margin, yPosition, this.pageWidth - 2 * this.margin, boxHeight)
    
    yPosition += 10
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'bold')
    
    // Medication name
    this.pdf.text(`Medication: ${prescription.medication}`, this.margin + 5, yPosition)
    
    yPosition += 8
    this.pdf.setFont('helvetica', 'normal')
    
    // Dosage
    this.pdf.text(`Dosage: ${prescription.dosage}`, this.margin + 5, yPosition)
    
    yPosition += 6
    // Frequency
    this.pdf.text(`Frequency: ${prescription.frequency}`, this.margin + 5, yPosition)
    
    yPosition += 6
    // Duration
    this.pdf.text(`Duration: ${prescription.duration}`, this.margin + 5, yPosition)
    
    // Instructions
    if (prescription.instructions) {
      yPosition += 8
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Instructions:', this.margin + 5, yPosition)
      
      yPosition += 6
      this.pdf.setFont('helvetica', 'normal')
      // Split long instructions into multiple lines
      const instructions = prescription.instructions
      const maxWidth = this.pageWidth - 2 * this.margin - 10
      const lines = this.pdf.splitTextToSize(instructions, maxWidth)
      
      lines.forEach((line: string) => {
        this.pdf.text(line, this.margin + 5, yPosition)
        yPosition += 5
      })
    }
    
    // Medication Details (if available)
    if (prescription.medication_details) {
      yPosition += 10
      
      if (prescription.medication_details.warnings && prescription.medication_details.warnings.length > 0) {
        this.pdf.setFont('helvetica', 'bold')
        this.pdf.setTextColor(200, 0, 0) // Red color for warnings
        this.pdf.text('⚠ WARNINGS:', this.margin, yPosition)
        
        yPosition += 6
        this.pdf.setFont('helvetica', 'normal')
        prescription.medication_details.warnings.forEach((warning) => {
          const warningLines = this.pdf.splitTextToSize(`• ${warning}`, this.pageWidth - 2 * this.margin)
          warningLines.forEach((line: string) => {
            this.pdf.text(line, this.margin + 5, yPosition)
            yPosition += 5
          })
        })
        
        this.pdf.setTextColor(0, 0, 0) // Reset to black
      }
    }
    
    // AI Generated Badge
    if (prescription.is_ai_generated) {
      yPosition += 10
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'italic')
      this.pdf.setTextColor(0, 0, 255) // Blue color
      this.pdf.text('* This prescription was generated with AI assistance', this.margin, yPosition)
      this.pdf.setTextColor(0, 0, 0) // Reset to black
    }
  }

  private addFooter() {
    const footerY = this.pageHeight - 30

    // Add line separator
    this.pdf.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10)
    
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    
    // Doctor signature area
    this.pdf.text('Doctor Signature: ____________________', this.margin, footerY)
    this.pdf.text('Date: ____________________', this.pageWidth - this.margin - 60, footerY)
    
    // Disclaimer
    const disclaimer = 'This is a computer-generated prescription. Please verify all details before dispensing medication.'
    this.pdf.text(disclaimer, this.pageWidth / 2, footerY + 10, { align: 'center' })
  }
}

// Utility function to download prescription as PDF
export const downloadPrescriptionPDF = async (prescription: PrescriptionPDFData) => {
  const generator = new PrescriptionPDFGenerator()
  await generator.generatePrescriptionPDF(prescription)
}

// Alternative method using HTML to PDF conversion (for more complex layouts)
export const downloadPrescriptionFromHTML = async (
  prescription: PrescriptionPDFData,
  elementId: string
) => {
  const element = document.getElementById(elementId)
  if (!element) {
    console.error('Element not found for PDF generation')
    return
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const fileName = `prescription_${prescription.patient_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    pdf.save(fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
