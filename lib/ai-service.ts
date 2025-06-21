// Generic AI service for medical applications
import { GoogleGenerativeAI } from "@google/generative-ai"

// Using Gemini API for chat
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

// Initialize Google Generative AI
let genAI: any = null;
try {
  if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
  } else {
    // API key missing
  }
} catch (error) {
  // Initialization failed
}

export class AIService {
  async analyzeMedicalImage(imageFile: File, symptoms?: string): Promise<any> {
    try {
      // Simulate AI analysis with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Return simulated analysis results
      return {
        diagnosis: "Possible Pneumonia",
        confidence: 87,
        findings: [
          { finding: "Consolidation in right lower lobe", severity: "moderate", confidence: 92 },
          { finding: "Increased opacity", severity: "mild", confidence: 78 },
          { finding: "Air bronchograms present", severity: "moderate", confidence: 85 },
        ],
        recommendations: [
          "Immediate antibiotic treatment",
          "Follow-up chest X-ray in 48 hours",
          "Monitor oxygen saturation",
        ],
        riskLevel: "medium",
        urgency: "urgent",
      }
    } catch (error) {
      throw new Error("Failed to analyze medical image")
    }
  }

  async chatWithAI(message: string, context?: any): Promise<string> {
    try {
      // Check if Gemini AI is available
      if (!genAI) {
        return this.getMockResponse(message);
      }
      
      try {
        // Create model with appropriate settings
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.2,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          },
        });
        
        const prompt = `
          You are MediOca AI, a concise medical AI assistant for healthcare providers.

          INSTRUCTIONS:
          - Provide extremely concise, practical responses
          - Use simple, non-technical language when possible
          - Focus only on the exact question asked
          - Keep responses under 3-4 sentences when possible
          - Avoid lengthy introductions or conclusions
          - Prioritize actionable information over background details
          - Never include disclaimers or qualifiers unless medically necessary
          - Be direct and to the point
          
          USER QUERY: ${message}
          
          Remember: Your response should be brief, focused, and immediately useful to a healthcare professional.
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        return "I apologize, but I'm experiencing technical difficulties. Please try again later.";
      }
    } catch (error) {
      return "I'm sorry, I'm currently unable to process your request. Please try again later.";
    }
  }
  
  private getMockResponse(message: string): string {
    // Return simulated response
    if (message.toLowerCase().includes("headache")) {
      return "Likely causes: tension headache, migraine, or cluster headache. Track frequency, duration, and triggers. Seek immediate care if accompanied by fever, neck stiffness, or severe sudden onset.";
    } else if (message.toLowerCase().includes("prescription")) {
      return "For specific prescription recommendations, a licensed healthcare provider must evaluate the patient's complete medical history and current condition.";
    } else {
      return "I can provide concise medical information to support clinical decision-making. How can I assist you with a specific medical question?";
    }
  }

  async generatePrescriptionRecommendations(patientData: any): Promise<any> {
    try {
      // Simulate AI analysis with a delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Return simulated recommendations
      return {
        medications: [
          {
            name: "Amoxicillin",
            dosage: "500mg",
            frequency: "Every 8 hours",
            duration: "7 days",
            reason: "Bacterial infection",
          },
          {
            name: "Ibuprofen",
            dosage: "400mg",
            frequency: "Every 6 hours as needed",
            duration: "5 days",
            reason: "Pain and inflammation",
          },
        ],
        warnings: [
          "Take amoxicillin with food to reduce stomach upset",
          "Avoid alcohol while taking these medications",
        ],
        interactions: ["Potential interaction with blood thinners", "May reduce effectiveness of oral contraceptives"],
        alternatives: [
          "Cephalexin 500mg if allergic to penicillin",
          "Acetaminophen for pain if NSAIDs are contraindicated",
        ],
        followUp: "Schedule follow-up in 7 days to assess response to treatment",
      }
    } catch (error) {
      throw new Error("Failed to generate prescription recommendations")
    }
  }

  async predictHealthRisks(patientHistory: any): Promise<any> {
    try {
      // Simulate AI analysis with a delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Return simulated risk assessment
      return {
        riskFactors: [
          {
            risk: "Type 2 Diabetes",
            probability: 65,
            timeframe: "5-10 years",
          },
          {
            risk: "Hypertension",
            probability: 48,
            timeframe: "2-5 years",
          },
          {
            risk: "Coronary Heart Disease",
            probability: 35,
            timeframe: "10+ years",
          },
        ],
        preventiveMeasures: [
          "Regular exercise (150+ minutes/week)",
          "Mediterranean diet",
          "Weight management",
          "Regular blood pressure monitoring",
        ],
        monitoringRecommendations: [
          "Annual HbA1c testing",
          "Blood pressure check every 6 months",
          "Lipid panel annually",
        ],
        overallRiskScore: 42,
      }
    } catch (error) {
      throw new Error("Failed to predict health risks")
    }
  }
}

export const aiService = new AIService()
