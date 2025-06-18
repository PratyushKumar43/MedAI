import { EventEmitter } from 'events'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'
import { genericAIService } from './generic-ai'

// Real MCP Server with AI Integration
export interface MCPSession {
  id: string
  patientId: string
  doctorId: string
  startTime: Date
  symptoms: string[]
  currentDiagnosis?: string
  recommendations: MCPRecommendation[]
  isActive: boolean
  context: PatientContext
  aiProvider: 'openai' | 'anthropic' | 'gemini'
  confidence: number
}

export interface PatientContext {
  id: string
  name: string
  age: number
  gender: string
  medicalHistory: string[]
  currentMedications: string[]
  allergies: string[]
  vitals: {
    bloodPressure: string
    heartRate: number
    temperature: number
    oxygenSaturation: number
  }
}

export interface MCPRecommendation {
  id: string
  type: 'symptom_analysis' | 'diagnosis_validation' | 'prescription' | 'drug_interaction' | 'clinical_guideline'
  content: any
  confidence: number
  timestamp: Date
  aiProvider: string
  reasoning?: string
  warnings?: string[]
}

export interface MCPResponse {
  success: boolean
  data?: any
  error?: string
  confidence?: number
  reasoning?: string
  warnings?: string[]
}

export interface AIAnalysisResponse {
  analysis: string
  differential_diagnoses: Array<{
    condition: string
    probability: number
    reasoning: string
  }>
  recommendations: string[]
  warnings: string[]
  confidence: number
  next_steps: string[]
}

export interface AIPrescriptionResponse {
  medications: Array<{
    name: string
    dosage: string
    instructions: string
    duration: string
    monitoring: string
  }>
  interactions: string[]
  contraindications: string[]
  patient_education: string[]
  follow_up: string
  confidence: number
}

export class RealMCPServer extends EventEmitter {
  private sessions = new Map<string, MCPSession>()
  private openai: OpenAI | null = null
  private anthropic: Anthropic | null = null
  private isConnected = false
  private activeConnections = new Set<WebSocket>()

  constructor() {
    super()
    this.initializeAIProviders()
  }

  private initializeAIProviders() {
    try {
      // Initialize OpenAI
      const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
      if (openaiKey) {
        this.openai = new OpenAI({
          apiKey: openaiKey,
          dangerouslyAllowBrowser: true // Only for client-side usage
        })
        console.log('✅ OpenAI initialized')
      }

      // Initialize Anthropic
      const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY
      if (anthropicKey) {
        this.anthropic = new Anthropic({
          apiKey: anthropicKey,
          dangerouslyAllowBrowser: true // Only for client-side usage
        })
        console.log('✅ Anthropic initialized')
      }

      this.isConnected = !!(this.openai || this.anthropic)
      
      if (this.isConnected) {
        console.log('🚀 Real MCP Server initialized with AI providers')
        this.emit('connected')
      } else {
        console.warn('⚠️ No AI API keys found, falling back to mock mode')
        console.warn('Add OPENAI_API_KEY or ANTHROPIC_API_KEY to environment variables')
      }
    } catch (error) {
      console.error('❌ Failed to initialize AI providers:', error)
      this.isConnected = false
    }
  }

  async createSession(patientContext: PatientContext, aiProvider: 'openai' | 'anthropic' | 'gemini' = 'openai'): Promise<string> {
    const sessionId = uuidv4()
    
    const session: MCPSession = {
      id: sessionId,
      patientId: patientContext.id,
      doctorId: 'current-doctor', // This should come from auth context
      startTime: new Date(),
      symptoms: [],
      recommendations: [],
      isActive: true,
      context: patientContext,
      aiProvider,
      confidence: 0
    }

    this.sessions.set(sessionId, session)
    
    // Initialize session with AI
    await this.initializeSessionWithAI(session)
    
    this.emit('sessionCreated', { sessionId, patientId: patientContext.id })
    
    return sessionId
  }
  private async initializeSessionWithAI(session: MCPSession): Promise<void> {
    try {
      const systemPrompt = this.buildSystemPrompt(session.context)
      
      // Send initial context to AI
      const response = await this.callAIProvider(session.aiProvider, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Patient session initialized. Provide initial assessment and recommendations.' }
      ])

      const recommendation: MCPRecommendation = {
        id: uuidv4(),
        type: 'clinical_guideline',
        content: response.content,
        confidence: 0.9,
        timestamp: new Date(),
        aiProvider: session.aiProvider,
        reasoning: 'Initial AI assessment based on patient context'
      }

      session.recommendations.push(recommendation)
      this.emit('sessionInitialized', { sessionId: session.id, response })
    } catch (error) {
      console.error('Failed to initialize AI session:', error)
      this.emit('sessionError', { sessionId: session.id, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  private buildSystemPrompt(context: PatientContext): string {
    return `You are an advanced medical AI assistant integrated with an MCP (Model Context Protocol) server providing clinical decision support.

PATIENT CONTEXT:
- Name: ${context.name}
- Age: ${context.age}
- Gender: ${context.gender}
- Medical History: ${context.medicalHistory.length > 0 ? context.medicalHistory.join(', ') : 'None reported'}
- Current Medications: ${context.currentMedications.length > 0 ? context.currentMedications.join(', ') : 'None'}
- Known Allergies: ${context.allergies.length > 0 ? context.allergies.join(', ') : 'None reported'}
- Current Vitals:
  * Blood Pressure: ${context.vitals.bloodPressure}
  * Heart Rate: ${context.vitals.heartRate} bpm
  * Temperature: ${context.vitals.temperature}°F
  * Oxygen Saturation: ${context.vitals.oxygenSaturation}%

CLINICAL GUIDELINES:
1. Analyze symptoms in context of patient's complete medical history
2. Provide evidence-based differential diagnoses with confidence levels
3. Suggest appropriate diagnostic tests and procedures
4. Recommend treatment plans considering current medications and allergies
5. Flag critical warnings, drug interactions, and contraindications
6. Prioritize patient safety and evidence-based medicine
7. Provide clear clinical reasoning for all recommendations
8. Consider age-appropriate treatments and dosing

RESPONSE FORMAT:
Always respond with structured JSON containing:
{
  "analysis": "comprehensive symptom analysis",
  "differential_diagnoses": [
    {
      "condition": "condition name",
      "probability": 0.85,
      "reasoning": "clinical reasoning",
      "urgency": "low|medium|high|critical"
    }
  ],
  "recommendations": [
    {
      "category": "diagnostic|therapeutic|monitoring",
      "action": "specific recommendation",
      "priority": "low|medium|high|urgent"
    }
  ],
  "drug_interactions": ["interaction warnings if applicable"],
  "contraindications": ["contraindication warnings if applicable"],
  "red_flags": ["critical warnings requiring immediate attention"],
  "confidence": 0.85,
  "clinical_reasoning": "detailed explanation of analysis",
  "next_steps": ["prioritized next actions"]
}

IMPORTANT: You are assisting licensed healthcare professionals. Always emphasize that AI recommendations supplement but never replace clinical judgment.`
  }

  async addSymptoms(sessionId: string, symptoms: string[]): Promise<MCPResponse> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    try {
      session.symptoms.push(...symptoms)
      
      const analysisPrompt = `
SYMPTOM ANALYSIS REQUEST

New symptoms reported: ${symptoms.join(', ')}
All current symptoms: ${session.symptoms.join(', ')}

Please provide a comprehensive analysis including:
1. Symptom correlation and clustering
2. Differential diagnoses with probabilities
3. Clinical urgency assessment
4. Recommended diagnostic workup
5. Any red flags requiring immediate attention

Consider the patient's medical history, current medications, and vital signs in your analysis.`

      const messages = [
        { role: 'system', content: this.buildSystemPrompt(session.context) },
        { role: 'user', content: analysisPrompt }
      ]

      const response = await this.callAIProvider(session.aiProvider, messages)
      const analysis = this.parseAIResponse(response.content)

      const recommendation: MCPRecommendation = {
        id: uuidv4(),
        type: 'symptom_analysis',
        content: analysis,
        confidence: analysis.confidence || 0.8,
        timestamp: new Date(),
        aiProvider: session.aiProvider,
        reasoning: analysis.clinical_reasoning,
        warnings: analysis.red_flags
      }

      session.recommendations.push(recommendation)
      session.confidence = this.calculateSessionConfidence(session)
      
      this.emit('symptomsAdded', { 
        sessionId, 
        symptoms, 
        analysis: recommendation.content 
      })

      return {
        success: true,
        data: analysis,
        confidence: analysis.confidence,
        reasoning: analysis.clinical_reasoning,
        warnings: analysis.red_flags
      }

    } catch (error) {
      console.error('Error analyzing symptoms:', error)
      return { 
        success: false, 
        error: 'Failed to analyze symptoms with AI',
        data: this.getFallbackSymptomAnalysis(symptoms)
      }
    }
  }

  async setDiagnosis(sessionId: string, diagnosis: string): Promise<MCPResponse> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    try {
      session.currentDiagnosis = diagnosis

      const validationPrompt = `
DIAGNOSIS VALIDATION REQUEST

Proposed diagnosis: ${diagnosis}
Patient symptoms: ${session.symptoms.join(', ')}

Please validate this diagnosis by providing:
1. Diagnostic accuracy assessment based on symptoms
2. Supporting evidence from patient history and presentation
3. Alternative diagnoses to consider
4. Recommended confirmatory tests
5. Treatment plan recommendations
6. Prognosis and complications to monitor
7. Patient counseling points

Provide a thorough clinical evaluation of this diagnostic decision.`

      const messages = [
        { role: 'system', content: this.buildSystemPrompt(session.context) },
        { role: 'user', content: validationPrompt }
      ]

      const response = await this.callAIProvider(session.aiProvider, messages)
      const validation = this.parseAIResponse(response.content)

      const recommendation: MCPRecommendation = {
        id: uuidv4(),
        type: 'diagnosis_validation',
        content: validation,
        confidence: validation.confidence || 0.8,
        timestamp: new Date(),
        aiProvider: session.aiProvider,
        reasoning: validation.clinical_reasoning,
        warnings: validation.red_flags
      }

      session.recommendations.push(recommendation)
      session.confidence = this.calculateSessionConfidence(session)
      
      this.emit('diagnosisSet', { 
        sessionId, 
        diagnosis, 
        validation: recommendation.content 
      })

      return {
        success: true,
        data: validation,
        confidence: validation.confidence,
        reasoning: validation.clinical_reasoning,
        warnings: validation.red_flags
      }

    } catch (error) {
      console.error('Error validating diagnosis:', error)
      return { 
        success: false, 
        error: 'Failed to validate diagnosis with AI',
        data: this.getFallbackDiagnosisValidation(diagnosis)
      }
    }
  }

  async generatePrescription(sessionId: string): Promise<MCPResponse> {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { success: false, error: 'Session not found' }
    }

    try {
      const prescriptionPrompt = `
PRESCRIPTION GENERATION REQUEST

Clinical Context:
- Diagnosis: ${session.currentDiagnosis || 'Working diagnosis based on symptoms'}
- Symptoms: ${session.symptoms.join(', ')}
- Current medications: ${session.context.currentMedications.join(', ') || 'None'}
- Known allergies: ${session.context.allergies.join(', ') || 'None'}
- Patient age: ${session.context.age}
- Patient gender: ${session.context.gender}

Generate a comprehensive prescription plan including:
1. Primary medications with specific dosages, routes, and frequencies
2. Alternative medications for allergies/contraindications
3. Detailed drug interaction analysis
4. Contraindication warnings
5. Patient education and counseling points
6. Monitoring parameters and follow-up schedule
7. Duration of treatment and tapering instructions if applicable

Format as JSON with the structure specified in the system prompt.`

      const messages = [
        { role: 'system', content: this.buildSystemPrompt(session.context) },
        { role: 'user', content: prescriptionPrompt }
      ]

      const response = await this.callAIProvider(session.aiProvider, messages)
      const prescription = this.parseAIResponse(response.content)

      const recommendation: MCPRecommendation = {
        id: uuidv4(),
        type: 'prescription',
        content: prescription,
        confidence: prescription.confidence || 0.8,
        timestamp: new Date(),
        aiProvider: session.aiProvider,
        reasoning: prescription.clinical_reasoning,
        warnings: prescription.drug_interactions || []
      }

      session.recommendations.push(recommendation)
      session.confidence = this.calculateSessionConfidence(session)
      
      this.emit('prescriptionGenerated', { 
        sessionId, 
        prescription: recommendation.content 
      })

      return {
        success: true,
        data: prescription,
        confidence: prescription.confidence,
        reasoning: prescription.clinical_reasoning,
        warnings: prescription.drug_interactions
      }

    } catch (error) {
      console.error('Error generating prescription:', error)
      return { 
        success: false, 
        error: 'Failed to generate prescription with AI',
        data: this.getFallbackPrescription()
      }
    }
  }

  private async callAIProvider(provider: string, messages: any[]): Promise<any> {
    switch (provider) {
      case 'openai':
        return this.callOpenAI(messages)
      case 'anthropic':
        return this.callAnthropic(messages)
      case 'gemini':
        return this.callGemini(messages)
      default:
        throw new Error(`Unsupported AI provider: ${provider}`)
    }
  }

  private async callOpenAI(messages: any[]): Promise<any> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized - check API key')
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.2, // Lower temperature for medical accuracy
      max_tokens: 2500,
      top_p: 0.9
    })

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage,
      model: 'gpt-4'
    }
  }

  private async callAnthropic(messages: any[]): Promise<any> {
    if (!this.anthropic) {
      throw new Error('Anthropic not initialized - check API key')
    }    const systemMessage = messages.find(m => m.role === 'system')
    const userMessages = messages.filter(m => m.role !== 'system')

    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2500,
      temperature: 0.2,
      system: systemMessage?.content || '',
      messages: userMessages
    })

    return {
      content: response.content[0]?.type === 'text' ? response.content[0].text : '',
      usage: response.usage,
      model: 'claude-3-sonnet'
    }
  }  private async callGemini(messages: any[]): Promise<any> {
    try {
      const lastMessage = messages[messages.length - 1]
      const contextText = messages.slice(0, -1).map(m => m.content).join('\n\n')
      
      // Use the existing generic AI service with proper medical context
      const medicalContext = {
        patient: null,
        symptoms: [],
        diagnosis: '',
        medical_history: contextText,
        current_medications: [],
        allergies: [],
        vital_signs: null
      }
      
      const response = await genericAIService.chatWithAI(lastMessage.content, medicalContext)
      
      return {
        content: response,
        usage: { prompt_tokens: 0, completion_tokens: 0 },
        model: 'gemini-pro'
      }
    } catch (error) {
      console.error('Gemini API error:', error)
      throw new Error('Gemini API call failed')
    }
  }

  private parseAIResponse(content: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback: create structured response from text
      return {
        analysis: content,
        confidence: 0.7,
        clinical_reasoning: 'AI response parsing fallback - manual review recommended',
        recommendations: [
          {
            category: 'clinical_review',
            action: 'Manual review of AI response required',
            priority: 'medium'
          }
        ]
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return {
        analysis: content,
        confidence: 0.5,
        clinical_reasoning: 'Failed to parse structured response - manual interpretation required',
        recommendations: [
          {
            category: 'system_error',
            action: 'AI response parsing failed - clinical review required',
            priority: 'high'
          }
        ]
      }
    }
  }

  private calculateSessionConfidence(session: MCPSession): number {
    if (session.recommendations.length === 0) return 0
    
    const avgConfidence = session.recommendations.reduce((sum, rec) => sum + rec.confidence, 0) / session.recommendations.length
    return Math.round(avgConfidence * 100) / 100
  }

  // Fallback methods for when AI fails
  private getFallbackSymptomAnalysis(symptoms: string[]): any {
    return {
      analysis: `Clinical analysis required for symptoms: ${symptoms.join(', ')}`,
      differential_diagnoses: [
        {
          condition: 'Manual clinical evaluation needed',
          probability: 0.5,
          reasoning: 'AI analysis unavailable - clinical assessment required',
          urgency: 'medium'
        }
      ],
      recommendations: [
        {
          category: 'diagnostic',
          action: 'Comprehensive clinical evaluation',
          priority: 'high'
        },
        {
          category: 'monitoring',
          action: 'Monitor symptom progression',
          priority: 'medium'
        }
      ],
      red_flags: ['AI analysis failed - manual review required'],
      confidence: 0.3,
      clinical_reasoning: 'AI system unavailable - clinical judgment required',
      next_steps: ['Manual symptom assessment', 'Clinical examination', 'Consider diagnostic workup']
    }
  }

  private getFallbackDiagnosisValidation(diagnosis: string): any {
    return {
      analysis: `Manual validation required for diagnosis: ${diagnosis}`,
      validation: 'Clinical confirmation needed',
      supporting_evidence: ['AI validation unavailable'],
      recommendations: [
        {
          category: 'diagnostic',
          action: 'Clinical confirmation of diagnosis',
          priority: 'high'
        }
      ],
      confidence: 0.3,
      clinical_reasoning: 'AI validation failed - clinical review required'
    }
  }

  private getFallbackPrescription(): any {
    return {
      medications: [
        {
          name: 'Clinical prescription required',
          dosage: 'To be determined by physician',
          instructions: 'AI prescription generation failed - manual prescribing required',
          duration: 'As clinically indicated',
          monitoring: 'Standard clinical monitoring'
        }
      ],
      drug_interactions: ['Manual drug interaction check required'],
      contraindications: ['Review patient allergies and contraindications manually'],
      recommendations: [
        {
          category: 'prescription',
          action: 'Manual prescription generation required',
          priority: 'high'
        }
      ],
      confidence: 0.1,
      clinical_reasoning: 'AI prescription generation failed - clinical prescribing required'
    }
  }

  // Session management methods
  getSession(sessionId: string): MCPSession | undefined {
    return this.sessions.get(sessionId)
  }

  getAllSessions(): MCPSession[] {
    return Array.from(this.sessions.values())
  }

  getActiveSessions(): MCPSession[] {
    return Array.from(this.sessions.values()).filter(s => s.isActive)
  }

  async closeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isActive = false
      this.emit('sessionClosed', { sessionId, duration: Date.now() - session.startTime.getTime() })
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  getActiveSessionCount(): number {
    return this.getActiveSessions().length
  }

  getAIProviderStatus(): { [key: string]: boolean } {
    return {
      openai: !!this.openai,
      anthropic: !!this.anthropic,
      gemini: true // Gemini uses existing service
    }
  }

  // Get session statistics
  getSessionStats(sessionId: string): any {
    const session = this.sessions.get(sessionId)
    if (!session) return null

    return {
      id: session.id,
      duration: Date.now() - session.startTime.getTime(),
      symptomsAnalyzed: session.symptoms.length,
      recommendationsGenerated: session.recommendations.length,
      confidence: session.confidence,
      aiProvider: session.aiProvider,
      isActive: session.isActive
    }
  }
}

// Create singleton instance
export const realMCPServer = new RealMCPServer()

// Export for compatibility with existing code
export { realMCPServer as mcpServer }
