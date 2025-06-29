// Data validation utilities for secure patient data handling

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export class DataValidator {
  // Validate patient data
  static validatePatientData(data: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields validation
    if (!data.first_name || typeof data.first_name !== "string" || data.first_name.trim().length < 2) {
      errors.push("Patient first name is required and must be at least 2 characters")
    }

    if (!data.last_name || typeof data.last_name !== "string" || data.last_name.trim().length < 2) {
      errors.push("Patient last name is required and must be at least 2 characters")
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push("Valid email address is required")
    }

    if (!data.phone || !this.isValidPhone(data.phone)) {
      errors.push("Valid phone number is required")
    }

    if (!data.date_of_birth || !this.isValidDate(data.date_of_birth)) {
      errors.push("Valid date of birth is required")
    }

    // Age validation
    if (data.date_of_birth) {
      const age = this.calculateAge(data.date_of_birth)
      if (age < 0 || age > 150) {
        errors.push("Invalid age calculated from date of birth")
      }
      if (age < 18) {
        warnings.push("Patient is a minor - additional consent may be required")
      }
    }

    // Data sanitization warnings
    if (data.first_name && this.containsSpecialCharacters(data.first_name)) {
      warnings.push("Patient first name contains special characters")
    }

    if (data.last_name && this.containsSpecialCharacters(data.last_name)) {
      warnings.push("Patient last name contains special characters")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Validate prescription data
  static validatePrescriptionData(data: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Required fields
    if (!data.patient_id) {
      errors.push("Patient ID is required")
    }

    if (!data.doctor_id) {
      errors.push("Doctor ID is required")
    }

    if (!data.medication || typeof data.medication !== "string" || data.medication.trim().length < 2) {
      errors.push("Medication name is required")
    }

    if (!data.dosage || typeof data.dosage !== "string") {
      errors.push("Dosage is required")
    }

    if (!data.frequency || typeof data.frequency !== "string") {
      errors.push("Frequency is required")
    }

    if (!data.duration || typeof data.duration !== "string") {
      errors.push("Duration is required")
    }

    // Dosage validation
    if (data.dosage && !this.isValidDosage(data.dosage)) {
      warnings.push("Dosage format may be invalid - please verify")
    }

    // Medication name validation
    if (data.medication && this.containsDangerousPatterns(data.medication)) {
      errors.push("Medication name contains invalid characters")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Validate symptoms input
  static validateSymptomsInput(symptoms: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!symptoms || symptoms.trim().length === 0) {
      errors.push("Symptoms are required for prescription generation")
    }

    if (symptoms && symptoms.length < 5) {
      warnings.push("Very brief symptom description - consider adding more detail")
    }

    if (symptoms && symptoms.length > 1000) {
      warnings.push("Very long symptom description - consider summarizing")
    }

    if (symptoms && this.containsDangerousPatterns(symptoms)) {
      errors.push("Symptoms contain invalid characters")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Sanitize user input
  static sanitizeInput(input: string): string {
    if (!input) return ""

    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential HTML tags
      .replace(/['"]/g, "") // Remove quotes that could cause SQL issues
      .substring(0, 1000) // Limit length
  }

  // Validate medical data integrity
  static validateMedicalData(data: any): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Vital signs validation
    if (data.vital_signs) {
      const vitals = data.vital_signs

      if (vitals.heart_rate && (vitals.heart_rate < 30 || vitals.heart_rate > 200)) {
        warnings.push("Heart rate appears to be outside normal range")
      }

      if (vitals.temperature && (vitals.temperature < 95 || vitals.temperature > 110)) {
        warnings.push("Temperature appears to be outside normal range")
      }

      if (vitals.weight && (vitals.weight < 50 || vitals.weight > 500)) {
        warnings.push("Weight appears to be outside normal range")
      }
    }

    // Lab results validation
    if (data.lab_results && Array.isArray(data.lab_results)) {
      data.lab_results.forEach((result: any, index: number) => {
        if (!result.test_name || !result.value || !result.date) {
          errors.push(`Lab result ${index + 1} is missing required fields`)
        }

        if (result.date && !this.isValidDate(result.date)) {
          errors.push(`Lab result ${index + 1} has invalid date`)
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  // Helper methods
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/
    const cleanPhone = phone.replace(/[\s\-$$$$]/g, "")
    return phoneRegex.test(cleanPhone) && cleanPhone.length >= 10
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  private static calculateAge(dateOfBirth: string): number {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  private static containsSpecialCharacters(text: string): boolean {
    const specialChars = /[<>{}[\]\\/]/
    return specialChars.test(text)
  }

  private static containsDangerousPatterns(text: string): boolean {
    const dangerousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /data:text\/html/i, /vbscript:/i]

    return dangerousPatterns.some((pattern) => pattern.test(text))
  }

  private static isValidDosage(dosage: string): boolean {
    // Basic dosage format validation (e.g., "10mg", "5ml", "1 tablet")
    const dosageRegex =
      /^\d+(\.\d+)?\s*(mg|ml|g|tablet|capsule|unit)s?(\s+(once|twice|three times|four times)\s+(daily|weekly|monthly))?$/i
    return dosageRegex.test(dosage.trim())
  }
}

// Secure data storage utilities
export class SecureDataHandler {
  // Encrypt sensitive data before storage
  static encryptSensitiveData(data: any): any {
    // In a real implementation, this would use proper encryption
    // For demo purposes, we'll just mark it as processed
    return {
      ...data,
      _encrypted: true,
      _timestamp: new Date().toISOString(),
    }
  }

  // Audit log for data access
  static logDataAccess(action: string, userId: string, patientId: string): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      patientId,
      ip: "127.0.0.1", // In real app, get actual IP
    }

    console.log("🔒 Data Access Log:", logEntry)
    // In production, this would be sent to a secure logging service
  }

  // Validate data access permissions
  static validateAccess(userId: string, patientId: string, action: string): boolean {
    // In a real implementation, this would check user permissions
    // For demo, we'll allow all access but log it
    this.logDataAccess(action, userId, patientId)
    return true
  }
}
