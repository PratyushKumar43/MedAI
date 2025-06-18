"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Brain, ImageIcon, Sparkles, Zap, Activity } from "lucide-react"
import { aiService } from "@/lib/ai-service"

export default function AIDiagnosticsPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [symptoms, setSymptoms] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (file: File) => {
    setUploadedFile(file)
    analyzeWithAI(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  const analyzeWithAI = async (file: File) => {
    setAnalyzing(true)
    try {
      const analysis = await aiService.analyzeMedicalImage(file, symptoms)
      setResults(analysis)
    } catch (error) {
      console.error("Analysis failed:", error)
      setResults({
        diagnosis: "Analysis Error",
        confidence: 0,
        findings: [{ finding: "Unable to analyze image. Please try again.", severity: "low", confidence: 0 }],
        recommendations: ["Please upload a clear medical image", "Ensure image is in supported format"],
        riskLevel: "low",
        urgency: "routine",
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "from-red-600 to-red-700"
      case "high":
        return "from-orange-500 to-red-500"
      case "medium":
        return "from-yellow-500 to-orange-500"
      case "low":
        return "from-green-500 to-green-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="glass-morphism rounded-3xl p-8 border border-white/30 shadow-2xl">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
            <Brain className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-poppins">
              AI Diagnostics
            </h1>
            <p className="text-xl text-gray-600 font-medium">Advanced medical image analysis powered by AI</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
            <span className="text-purple-700 font-semibold">98.5% Accuracy</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-700 font-semibold">Real-time Analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span className="text-green-700 font-semibold">Multi-modal AI</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 font-poppins">Upload Medical Image</h3>
              <p className="text-gray-600">X-rays, CT scans, MRIs, and more supported</p>
            </div>
          </div>

          {/* Symptoms Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Symptoms (Optional)</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe patient symptoms to enhance AI analysis..."
              className="w-full px-4 py-3 glass-morphism border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? "border-purple-400 bg-purple-50 scale-105"
                : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
                <ImageIcon className="h-10 w-10 text-white" />
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-2">Drop your medical image here</p>
              <p className="text-gray-600">or click to browse files</p>
              <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, DICOM formats</p>
            </label>
          </div>

          {uploadedFile && (
            <div className="mt-6 glass-morphism p-4 rounded-xl border border-white/30">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Results */}
        <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 font-poppins">AI Analysis Results</h3>
              <p className="text-gray-600">Real-time diagnostic insights</p>
            </div>
          </div>

          {analyzing && (
            <div className="text-center py-12">
              <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-xl font-semibold text-gray-900 mb-2">Analyzing image...</p>
              <p className="text-gray-600">Our AI is processing your medical image</p>
              <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse"
                  style={{ width: "70%" }}
                ></div>
              </div>
            </div>
          )}

          {results && !analyzing && (
            <div className="space-y-6">
              <div
                className={`glass-morphism rounded-xl p-6 border border-white/30 bg-gradient-to-r from-${getRiskColor(results.riskLevel)}/10 to-transparent`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-2xl font-bold text-gray-900">{results.diagnosis}</h4>
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg">
                    {results.confidence}% Confidence
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600"
                    style={{ width: `${results.confidence}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="glass-morphism rounded-lg p-3 border border-white/30">
                    <p className="text-sm text-gray-600 mb-1">Risk Level</p>
                    <p
                      className={`text-lg font-semibold capitalize ${
                        results.riskLevel === "critical"
                          ? "text-red-600"
                          : results.riskLevel === "high"
                            ? "text-orange-600"
                            : results.riskLevel === "medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                      }`}
                    >
                      {results.riskLevel}
                    </p>
                  </div>
                  <div className="glass-morphism rounded-lg p-3 border border-white/30">
                    <p className="text-sm text-gray-600 mb-1">Urgency</p>
                    <p
                      className={`text-lg font-semibold capitalize ${
                        results.urgency === "emergency"
                          ? "text-red-600"
                          : results.urgency === "urgent"
                            ? "text-orange-600"
                            : "text-blue-600"
                      }`}
                    >
                      {results.urgency}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3">Key Findings</h5>
                  <div className="space-y-3">
                    {results.findings.map((finding: any, index: number) => (
                      <div key={index} className="glass-morphism rounded-lg p-4 border border-white/30">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800">{finding.finding}</span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              finding.severity === "severe"
                                ? "bg-red-100 text-red-700"
                                : finding.severity === "moderate"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {finding.confidence}% • {finding.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">Recommendations</h5>
                  <div className="space-y-2">
                    {results.recommendations.map((rec: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 glass-morphism rounded-lg border border-white/30"
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                          {index + 1}
                        </div>
                        <span className="text-gray-800">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold">
                  Save Analysis
                </button>
                <button className="flex-1 glass-morphism border border-white/30 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold">
                  Print Report
                </button>
              </div>
            </div>
          )}

          {!analyzing && !results && (
            <div className="text-center py-16">
              <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl font-semibold text-gray-700 mb-2">No Analysis Yet</p>
              <p className="text-gray-500">Upload a medical image to start AI analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Models Info */}
      <div className="glass-morphism rounded-3xl shadow-2xl border border-white/30 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Available AI Models</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Chest X-Ray Analysis", accuracy: "94.2%", specialty: "Pulmonology", cases: "250,000+" },
            { name: "CT Scan Diagnostics", accuracy: "91.8%", specialty: "Radiology", cases: "180,000+" },
            { name: "MRI Brain Analysis", accuracy: "96.5%", specialty: "Neurology", cases: "120,000+" },
          ].map((model, index) => (
            <div
              key={index}
              className="glass-morphism rounded-xl p-6 border border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-1">{model.name}</h4>
              <p className="text-sm text-gray-600 mb-4">
                {model.specialty} • Trained on {model.cases} cases
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Accuracy:</span>
                <span className="font-semibold text-green-600">{model.accuracy}</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-green-600"
                  style={{ width: model.accuracy }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
