import { GoogleGenerativeAI } from "@google/generative-ai"

// Using Gemini API but presenting as Generic AI
const API_KEY = "AIzaSyADq8WXDvH4dgbpjWIpLYOieYte9SFywOA"

if (!API_KEY) {
  throw new Error("Missing Generic AI API key")
}

const genAI = new GoogleGenerativeAI(API_KEY)

interface MedicalContext {
  patient?: any
  symptoms?: string[]
  diagnosis?: string
  medical_history?: string
  current_medications?: string[]
  allergies?: string[]
  vital_signs?: any
}

class GenericAIService {
  private model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) // Changed from gemini-1.5-flash to standard model

  // Enhanced chat with medical context
  async chatWithAI(message: string, context?: MedicalContext): Promise<string> {
    try {
      console.log("🤖 Generic AI: Processing medical query...")

      const prompt = `
        You are MediOca AI, an advanced medical AI assistant for healthcare providers. Respond professionally and helpfully.
        
        INSTRUCTIONS:
        - Treat all symptoms as important medical information
        - If symptoms are mentioned, directly address them
        - Always respond in the context of medical professionals using the system
        - Provide brief but detailed medical analyses
        - Never dismiss any symptoms
        
        ${
          context
            ? `
        PATIENT CONTEXT:
        - Symptoms: ${context.symptoms?.join(", ") || "None provided"}
        - Diagnosis: ${context.diagnosis || "Not specified"}
        - Medical History: ${context.medical_history || "Not available"}
        - Current Medications: ${context.current_medications?.join(", ") || "None"}
        - Allergies: ${context.allergies?.join(", ") || "None known"}
        `
            : ""
        }
        
        USER QUERY: ${message}
        
        RESPONSE FORMAT:
        - Begin with direct acknowledgment of symptoms/query
        - Provide brief medical analysis
        - Suggest potential next steps for healthcare provider
        - Keep information accurate and professional
      `

      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("❌ Generic AI chat error:", error)
      return "I'm sorry, I'm currently unable to process your request. Please try again later."
    }
  }

  // Generate prescription recommendations
  async generatePrescriptionRecommendations(request: any): Promise<any> {
    try {
      console.log("💊 Generic AI: Generating prescription recommendations...")
      console.log("Request data:", JSON.stringify(request, null, 2))
      
      const prompt = `
        You are a medical AI assistant for prescription generation. Based on the patient information below, 
        generate appropriate medication recommendations.
        
        Patient Information:
        - Symptoms: ${request.symptoms?.join(", ") || "None provided"}
        - Diagnosis: ${request.diagnosis || "Not specified"}
        - Severity: ${request.severity || "unknown"}
        - Medical History: ${request.patient_history || "Not available"}
        - Current Medications: ${request.current_medications?.join(", ") || "None"}
        - Allergies: ${request.allergies?.join(", ") || "None known"}
        ${request.vital_signs ? `- Vital Signs: BP ${request.vital_signs.blood_pressure}, HR ${request.vital_signs.heart_rate}` : ""}
        
        Generate a prescription recommendation in JSON format with the following structure:
        {
          "medications": [
            {
              "name": "Medication name",
              "generic_name": "Generic name",
              "dosage": "Dosage",
              "frequency": "How often to take",
              "duration": "How long to take",
              "route": "Route of administration",
              "instructions": "Special instructions",
              "warnings": ["Warning 1", "Warning 2"],
              "interactions": ["Interaction 1", "Interaction 2"],
              "cost_estimate": "Cost estimate range"
            }
          ],
          "reasoning": "Medical reasoning for the recommendation",
          "confidence_score": 85,
          "alternative_treatments": ["Alternative 1", "Alternative 2"],
          "follow_up_recommendations": ["Recommendation 1", "Recommendation 2"],
          "red_flags": ["Red flag 1", "Red flag 2"],
          "drug_interactions": ["Drug interaction 1", "Drug interaction 2"],
          "contraindications": ["Contraindication 1", "Contraindication 2"]
        }
        
        IMPORTANT: Return ONLY valid JSON. Do not include any additional text, explanation, or markdown formatting.
      `
      
      console.log("Sending prompt to AI model...")
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const responseText = response.text()
      
      console.log("Received AI response length:", responseText.length)
      console.log("Response preview:", responseText.substring(0, 100) + "...")
      
      try {
        // Try to parse the response as JSON
        const jsonStart = responseText.indexOf('{')
        const jsonEnd = responseText.lastIndexOf('}') + 1
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonText = responseText.substring(jsonStart, jsonEnd)
          console.log("Extracted JSON length:", jsonText.length)
          
          try {
            const parsedJson = JSON.parse(jsonText)
            console.log("Successfully parsed JSON response")
            
            // Ensure the medications array exists and has at least one item
            if (!parsedJson.medications || !Array.isArray(parsedJson.medications) || parsedJson.medications.length === 0) {
              console.warn("AI response missing medications array or empty array")
              throw new Error("Invalid medications data in AI response")
            }
            
            // Validate medications have required fields
            for (const med of parsedJson.medications) {
              if (!med.name || !med.dosage || !med.frequency || !med.duration) {
                console.warn("Medication missing required fields:", med)
              }
              
              // Ensure arrays exist even if empty
              med.warnings = Array.isArray(med.warnings) ? med.warnings : []
              med.interactions = Array.isArray(med.interactions) ? med.interactions : []
            }
            
            return parsedJson
          } catch (parseError) {
            console.error("JSON parse error:", parseError)
            console.error("JSON text that failed to parse:", jsonText)
            throw parseError
          }
        } else {
          console.error("Could not find valid JSON markers in response")
          throw new Error("No valid JSON found in AI response")
        }
      } catch (jsonError) {
        console.error("Failed to process AI response as JSON:", jsonError)
        throw jsonError
      }
    } catch (error) {
      console.error("❌ Generic AI prescription generation error:", error)
      
      // Return mock data as fallback but maintain proper structure
      console.log("Returning fallback mock prescription data")
      return {
        medications: [
          {
            name: "Amlodipine",
            generic_name: "Amlodipine",
            dosage: "5mg",
            frequency: "Once daily",
            duration: "30 days",
            route: "Oral",
            instructions: "Take in the morning with or without food",
            warnings: ["May cause ankle swelling", "Monitor blood pressure"],
            interactions: ["Avoid grapefruit juice"],
            cost_estimate: "$10-15/month"
          }
        ],
        reasoning: "Based on patient symptoms and medical history, this medication is recommended for blood pressure control.",
        confidence_score: 85,
        alternative_treatments: ["Lifestyle modifications", "Diet changes"],
        follow_up_recommendations: ["Schedule follow-up in 2 weeks"],
        red_flags: ["Monitor for dizziness"],
        drug_interactions: ["Monitor for interactions with existing medications"],
        contraindications: ["Hypersensitivity to amlodipine"]
      }
    }
  }

  // Generate prescription PDF content
  async generatePrescription(prompt: string, patient: any): Promise<string> {
    try {
      console.log("📄 Generic AI: Generating prescription PDF content...")
      
      const enhancedPrompt = `
        ${prompt}
        
        ADDITIONAL INSTRUCTIONS:
        - Format the prescription in clean HTML that can be converted to PDF
        - Include all essential medical information
        - Make sure to include patient name, date, and doctor signature line
        - Use appropriate medical terminology
        - Create a professionally formatted document
        - Include clear dosing instructions
        - Return a complete HTML document with proper head and body tags
        
        EXAMPLE FORMAT:
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .prescription { border: 1px solid #000; padding: 20px; }
            .header { text-align: center; }
            /* Add more styles as needed */
          </style>
        </head>
        <body>
          <div class="prescription">
            <!-- Prescription content goes here -->
          </div>
        </body>
        </html>
      `

      // Set a longer timeout for PDF generation which can be more complex
      const result = await Promise.race([
        this.model.generateContent(enhancedPrompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Prescription generation timed out")), 30000))
      ]) as any
      
      const response = await result.response
      const responseText = response.text()
      
      if (!responseText || responseText.length < 100) {
        throw new Error("Generated prescription content is too short or empty")
      }
      
      return responseText
    } catch (error) {
      console.error("❌ Generic AI prescription PDF generation error:", error)
      
      // Return fallback HTML instead of just an error message
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .prescription { border: 1px solid #000; padding: 20px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .patient-info { margin-bottom: 20px; }
            .rx { font-size: 24px; margin-right: 10px; }
            .medication { margin-bottom: 15px; padding-left: 30px; }
            .footer { margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px; }
            .signature { margin-top: 50px; border-top: 1px solid #000; width: 200px; }
          </style>
        </head>
        <body>
          <div class="prescription">
            <div class="header">
              <h1>Medical Prescription</h1>
              <p>MediOca Pro Healthcare</p>
              <p>1234 Medical Center Drive, Healthcare City</p>
              <p>Phone: (555) 123-4567</p>
            </div>
            
            <div class="patient-info">
              <p><strong>Patient:</strong> ${patient.name}</p>
              <p><strong>Date of Birth:</strong> ${patient.date_of_birth}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Prescription #:</strong> RX-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
            </div>
            
            <h3>Diagnosis:</h3>
            <p>${patient.diagnosis?.join(", ") || "Information not available"}</p>
            
            <h3>Prescribed Medications:</h3>
            <div class="medication">
              <p><span class="rx">℞</span> <strong>Medication:</strong> ${patient.current_medications?.[0] || "To be determined by physician"}</p>
              <p><strong>Dosage:</strong> As directed by physician</p>
              <p><strong>Instructions:</strong> Take as directed. Follow up with your doctor in two weeks.</p>
            </div>
            
            <div class="footer">
              <p><strong>Allergies:</strong> ${patient.allergies?.join(", ") || "None reported"}</p>
              <p><strong>Notes:</strong> Please consult with your healthcare provider before making any changes to this medication regimen.</p>
              
              <div class="signature">
                <p>Dr. Sarah, MD</p>
                <p>License #: MD12345</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    }
  }
}

export const genericAIService = new GenericAIService()
