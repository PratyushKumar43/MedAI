"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react"
import { aiService } from "@/lib/ai-service"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  loading?: boolean
}

export default function ChatPage() {
  const isMedicalQuery = (text: string) => {
    const medicalKeywords = [
      "symptom",
      "symptoms",
      "diagnosis",
      "diagnose",
      "treatment",
      "medicine",
      "medication",
      "drug",
      "disease",
      "condition",
      "patient",
      "therapy",
      "prescription",
      "side effect",
      "pathology",
      "clinic",
      "doctor",
      "nurse",
      "vital",
      "allergy",
      "infection",
      "injury",
      "blood",
      "scan",
      "x-ray",
      "mri",
      "ct",
    ]
    const lower = text.toLowerCase()
    return medicalKeywords.some((kw) => lower.includes(kw))
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI medical assistant. I can help you with diagnostics, patient analysis, prescription recommendations, and medical queries. How can I assist you today?",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])

    // Check medical relevance
    if (!isMedicalQuery(inputMessage)) {
      const rejectMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content:
          "I'm sorry, I can only assist with medical‐related questions. Please ask a health or medical question.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, rejectMessage])
      setInputMessage("")
      return
    }

    // Proceed with AI call
    setInputMessage("")
    setIsLoading(true)

    try {
      const aiResponse = await aiService.chatWithAI(inputMessage, {
        context: "medical_assistant",
        timestamp: new Date().toISOString(),
      })

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-morphism rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>            <h1 className="text-xl xs:text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent font-poppins">
              Smart Medical Chat
            </h1>
            <p className="text-sm xs:text-base md:text-lg text-gray-600 font-medium">
              AI-powered medical assistant for healthcare professionals
            </p>
          </div>
        </div>
      </div>

      <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>              <h3 className="text-lg xs:text-xl font-bold text-white font-poppins">Medical AI Assistant</h3>
              <p className="text-xs xs:text-sm text-blue-100 font-medium">Advanced healthcare intelligence</p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white/50 to-white/30">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                    : "glass-morphism border border-white/30 text-gray-800"
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === "ai" && <Bot className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.type === "user" && <User className="h-5 w-5 text-blue-100 mt-0.5 flex-shrink-0" />}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-morphism border border-white/30 px-4 py-3 rounded-2xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/20 bg-white/30">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about symptoms, diagnoses, treatments..."
                className="w-full px-4 py-3 glass-morphism border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-500"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-6 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "What are the symptoms of pneumonia?",
              "Drug interaction check",
              "Differential diagnosis help",
              "Treatment recommendations",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInputMessage(suggestion)}
                className="px-3 py-1 text-xs bg-white/60 hover:bg-white/80 text-gray-700 rounded-full border border-white/30 transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-morphism rounded-xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Medical Knowledge</h3>
          <p className="text-gray-600">
            Access comprehensive medical information from trusted sources and latest research.
          </p>
        </div>

        <div className="glass-morphism rounded-xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Symptom Analysis</h3>
          <p className="text-gray-600">Describe symptoms and receive potential diagnoses with confidence levels.</p>
        </div>

        <div className="glass-morphism rounded-xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Education</h3>
          <p className="text-gray-600">Generate clear explanations and educational content for patients.</p>
        </div>
      </div>
    </div>
  )
}
