"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthRedirect } from "@/components/auth/auth-redirect"
import { useAuth } from "@/providers/auth-provider"
import { 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Brain, 
  Users, 
  Shield, 
  Zap, 
  Heart,
  ArrowRight,
  CheckCircle,
  Star,
  LogIn,
  LogOut,
  User
} from "lucide-react"

export default function LandingPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }
  return (
    <>
      <AuthRedirect />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        {/* Header/Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediOca Pro
                </span>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-4">
                {loading ? (
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                ) : user ? (
                  // User is logged in - show user info and logout
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full border border-blue-200">
                      <User className="h-4 w-4 text-purple-600" />
                      <span className="text-purple-700 font-medium text-sm">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-semibold"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  // User is not logged in - show login button
                  <Link href="/auth/sign-in">
                    <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold">
                      <LogIn className="h-4 w-4" />
                      <span>Login</span>
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden pt-32">{/* Added pt-32 for header spacing */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full border border-blue-200">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-purple-700 font-semibold">AI-Powered Healthcare Platform</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                Welcome to
                <br />
                <span className="text-8xl md:text-9xl">MediOca Pro</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Revolutionary healthcare management system powered by advanced AI technology. 
                Transform your medical practice with intelligent diagnostics, real-time analytics, and seamless patient care.
              </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
                {user ? (
                  // Authenticated user - show dashboard and app buttons
                  <>
                    <Link href="/AI-dashboard">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg flex items-center space-x-3">
                        <Brain className="h-6 w-6" />
                        <span>Launch AI Dashboard</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </Link>
                    
                    <Link href="/patients">
                      <button className="border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-2xl hover:border-purple-400 hover:text-purple-600 transition-all duration-300 font-semibold text-lg flex items-center space-x-3">
                        <Users className="h-6 w-6" />
                        <span>View Patients</span>
                      </button>
                    </Link>
                  </>
                ) : (
                  // Non-authenticated user - show login and signup buttons
                  <>
                    <Link href="/auth/sign-in">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-5 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg flex items-center space-x-3">
                        <LogIn className="h-6 w-6" />
                        <span>Login to Dashboard</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </Link>
                    
                    <Link href="/auth/sign-up">
                      <button className="border-2 border-gray-300 text-gray-700 px-10 py-5 rounded-2xl hover:border-purple-400 hover:text-purple-600 transition-all duration-300 font-semibold text-lg flex items-center space-x-3">
                        <User className="h-6 w-6" />
                        <span>Create Account</span>
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Powered by Advanced AI
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Experience the future of healthcare with our comprehensive suite of AI-driven tools
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature Cards */}
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Diagnostics</h3>
                <p className="text-gray-600 mb-6">
                  Advanced machine learning algorithms provide accurate diagnostic assistance and treatment recommendations.
                </p>
                <div className="flex items-center text-blue-600 font-semibold">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>95%+ Accuracy Rate</span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Monitor patient vitals, track treatment progress, and get insights with live data visualization.
                </p>
                <div className="flex items-center text-purple-600 font-semibold">
                  <Activity className="h-5 w-5 mr-2" />
                  <span>Live Monitoring</span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Compliant</h3>
                <p className="text-gray-600 mb-6">
                  Enterprise-grade security with full HIPAA compliance and encrypted data protection.
                </p>
                <div className="flex items-center text-green-600 font-semibold">
                  <Shield className="h-5 w-5 mr-2" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Emergency Response</h3>
                <p className="text-gray-600 mb-6">
                  Instant alerts and automated emergency protocols to ensure rapid response to critical situations.
                </p>
                <div className="flex items-center text-orange-600 font-semibold">
                  <Zap className="h-5 w-5 mr-2" />
                  <span>24/7 Monitoring</span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Patient Management</h3>
                <p className="text-gray-600 mb-6">
                  Comprehensive patient records, appointment scheduling, and care coordination in one platform.
                </p>
                <div className="flex items-center text-teal-600 font-semibold">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Unified Platform</span>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Telemedicine</h3>
                <p className="text-gray-600 mb-6">
                  Virtual consultations with HD video, secure messaging, and remote patient monitoring capabilities.
                </p>
                <div className="flex items-center text-pink-600 font-semibold">
                  <Heart className="h-5 w-5 mr-2" />
                  <span>Remote Care</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Join thousands of medical professionals who trust MediOca Pro for their daily operations
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">1000+</div>
                <div className="text-blue-100 text-lg">Healthcare Providers</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">50K+</div>
                <div className="text-blue-100 text-lg">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">95%</div>
                <div className="text-blue-100 text-lg">AI Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">24/7</div>
                <div className="text-blue-100 text-lg">System Availability</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-12 border border-gray-200 shadow-xl">
              <div className="flex justify-center mb-6">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Ready to Transform Healthcare?
              </h2>
              
              <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                Experience the power of AI-driven healthcare management. Start your journey with MediOca Pro today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/AI-dashboard">
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-6 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-xl flex items-center space-x-3">
                    <Sparkles className="h-6 w-6" />
                    <span>Get Started Now</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                
                <Link href="/analytics">
                  <button className="border-2 border-purple-300 text-purple-700 px-12 py-6 rounded-2xl hover:bg-purple-50 transition-all duration-300 font-semibold text-xl flex items-center space-x-3">
                    <TrendingUp className="h-6 w-6" />
                    <span>View Analytics</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
