"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  User,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  HelpCircle,
  FileText
} from "lucide-react"

export default function LandingPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

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

  const handleGetStarted = () => {
    if (user) {
      router.push('/AI-dashboard')
    } else {
      router.push('/auth/sign-in')
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-purple-50">
        {/* Header/Navigation */}        <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 md:py-4">
              {/* Logo */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediOca Pro
                </span>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {loading ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                ) : user ? (
                  // User is logged in - show user info and logout
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="hidden xs:flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-2 sm:px-4 py-1.5 sm:py-2 rounded-full border border-blue-200">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      <span className="text-purple-700 font-medium text-xs sm:text-sm">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 font-medium sm:font-semibold text-xs sm:text-sm"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  // User is not logged in - show login button
                  <Link href="/auth/sign-in">
                    <button className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium sm:font-semibold text-xs sm:text-sm">
                      <LogIn className="h-3 w-3 sm:h-4 sm:w-4" />
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
                <h1 className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                Welcome to
                <br />
                <span className="text-5xl xs:text-6xl sm:text-7xl md:text-8xl lg:text-9xl">MediOca Pro</span>
              </h1>
                <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                Revolutionary healthcare management system powered by advanced AI technology. 
                Transform your medical practice with intelligent diagnostics, real-time analytics, and seamless patient care.
              </p>                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mt-8 sm:mt-12 w-full px-2">
                {user ? (
                  // Authenticated user - show dashboard and app buttons
                  <>
                    <Link href="/AI-dashboard" className="w-full sm:w-auto">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center space-x-2 sm:space-x-3 w-full">
                        <Brain className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        <span>Launch AI Dashboard</span>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </Link>
                    
                    <Link href="/patients" className="w-full sm:w-auto">
                      <button className="border-2 border-gray-300 text-gray-700 px-5 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl hover:border-purple-400 hover:text-purple-600 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center space-x-2 sm:space-x-3 w-full">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        <span>View Patients</span>
                      </button>
                    </Link>
                  </>
                ) : (
                  // Non-authenticated user - show login and signup buttons
                  <>
                    <Link href="/auth/sign-in" className="w-full sm:w-auto">
                      <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center space-x-2 sm:space-x-3 w-full">
                        <LogIn className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        <span>Login to Dashboard</span>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </Link>
                    
                    <Link href="/auth/sign-up" className="w-full sm:w-auto">
                      <button className="border-2 border-gray-300 text-gray-700 px-5 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl hover:border-purple-400 hover:text-purple-600 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center space-x-2 sm:space-x-3 w-full">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        <span>Create Account</span>
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>        {/* Features Section */}
        <section id="features" className="py-20 px-4 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">              <h2 className="text-3xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                Powered by Advanced AI
              </h2>
              <p className="text-base xs:text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
                Experience the future of healthcare with our comprehensive suite of AI-driven tools
              </p>
            </div>              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
              {/* Feature Cards */}
              {[
                {
                  icon: <Brain className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />,
                  gradient: "from-blue-500 to-cyan-500",
                  title: "AI Diagnostics",
                  description: "Advanced machine learning algorithms provide accurate diagnostic assistance and treatment recommendations.",
                  badge: "95%+ Accuracy Rate",
                  badgeColor: "text-blue-600",
                  badgeIcon: <CheckCircle className="h-4 w-4 xs:h-5 xs:w-5 mr-1 sm:mr-2" />
                },
                {
                  icon: <TrendingUp className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />,
                  gradient: "from-purple-500 to-pink-500",
                  title: "Real-time Analytics",
                  description: "Monitor patient vitals, track treatment progress, and get insights with live data visualization.",
                  badge: "Live Monitoring",
                  badgeColor: "text-purple-600",
                  badgeIcon: <Activity className="h-4 w-4 xs:h-5 xs:w-5 mr-1 sm:mr-2" />
                },
                {
                  icon: <Shield className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />,
                  gradient: "from-green-500 to-emerald-500",
                  title: "Secure & Compliant",
                  description: "Enterprise-grade security with full HIPAA compliance and encrypted data protection.",
                  badge: "HIPAA Compliant",
                  badgeColor: "text-green-600",
                  badgeIcon: <Shield className="h-4 w-4 xs:h-5 xs:w-5 mr-1 sm:mr-2" />
                },
                {
                  icon: <Zap className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />,
                  gradient: "from-orange-500 to-red-500",
                  title: "Emergency Response",
                  description: "Instant alerts and automated emergency protocols to ensure rapid response to critical situations.",
                  badge: "24/7 Monitoring",
                  badgeColor: "text-orange-600",
                  badgeIcon: <Zap className="h-4 w-4 xs:h-5 xs:w-5 mr-1 sm:mr-2" />
                },
                {
                  icon: <Users className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />,
                  gradient: "from-teal-500 to-blue-500",
                  title: "Patient Management",
                  description: "Comprehensive patient records, appointment scheduling, and care coordination in one platform.",
                  badge: "Unified Platform",
                  badgeColor: "text-teal-600",
                  badgeIcon: <Users className="h-4 w-4 xs:h-5 xs:w-5 mr-1 sm:mr-2" />
                },
                {
                  icon: <Heart className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />,
                  gradient: "from-pink-500 to-purple-500",
                  title: "Telemedicine",
                  description: "Virtual consultations with HD video, secure messaging, and remote patient monitoring capabilities.",
                  badge: "Remote Care",
                  badgeColor: "text-pink-600",
                  badgeIcon: <Heart className="h-4 w-4 xs:h-5 xs:w-5 mr-1 sm:mr-2" />
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white p-4 xs:p-6 sm:p-8 rounded-2xl xs:rounded-3xl shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex flex-col h-full">
                  <div className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.gradient} rounded-xl xs:rounded-2xl flex items-center justify-center mb-4 sm:mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl xs:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">{feature.title}</h3>
                  <p className="text-sm xs:text-base text-gray-600 mb-4 sm:mb-6 flex-grow">
                    {feature.description}
                  </p>
                  <div className={`flex items-center ${feature.badgeColor} font-semibold text-sm xs:text-base mt-auto`}>
                    {feature.badgeIcon}
                    <span>{feature.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-7xl mx-auto text-center">            <h2 className="text-3xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 md:mb-4">
              Trusted by Healthcare Professionals
            </h2>
            <p className="text-base xs:text-lg sm:text-xl text-blue-100 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
              Join thousands of medical professionals who trust MediOca Pro for their daily operations
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-3xl xs:text-4xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">1000+</div>
                <div className="text-blue-100 text-sm xs:text-base sm:text-lg">Healthcare Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xs:text-4xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">50K+</div>
                <div className="text-blue-100 text-sm xs:text-base sm:text-lg">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xs:text-4xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">95%</div>
                <div className="text-blue-100 text-sm xs:text-base sm:text-lg">AI Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl xs:text-4xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">24/7</div>
                <div className="text-blue-100 text-sm xs:text-base sm:text-lg">System Availability</div>
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
                <h2 className="text-3xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Ready to Transform Healthcare?
              </h2>
              
              <p className="text-base xs:text-lg sm:text-xl text-gray-600 mb-6 sm:mb-10 max-w-2xl mx-auto px-2">
                Experience the power of AI-driven healthcare management. Start your journey with MediOca Pro today.
              </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full px-4 sm:px-0">
                <button 
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-base sm:text-lg md:text-xl flex items-center justify-center space-x-2 sm:space-x-3"
                >
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span>{user ? 'Go to Dashboard' : 'Get Started Now'}</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                {user ? (
                  <Link href="/analytics" className="w-full sm:w-auto">
                    <button className="w-full border-2 border-purple-300 text-purple-700 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-2xl hover:bg-purple-50 transition-all duration-300 font-semibold text-base sm:text-lg md:text-xl flex items-center justify-center space-x-2 sm:space-x-3">
                      <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span>View Analytics</span>
                    </button>
                  </Link>
                ) : (
                  <Link href="/auth/sign-up" className="w-full sm:w-auto">
                    <button className="w-full border-2 border-purple-300 text-purple-700 px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-xl sm:rounded-2xl hover:bg-purple-50 transition-all duration-300 font-semibold text-base sm:text-lg md:text-xl flex items-center justify-center space-x-2 sm:space-x-3">
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span>Create Account</span>
                    </button>
                  </Link>
                )}
              </div>            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-slate-50 to-purple-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full border border-blue-200 mb-4">
                <HelpCircle className="h-5 w-5 text-purple-600" />
                <span className="text-purple-700 font-semibold">Frequently Asked Questions</span>
              </div>
              <h2 className="text-3xl xs:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Have Questions? We've Got Answers
              </h2>
              <p className="text-base xs:text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about MediOca Pro and our AI-powered healthcare solutions
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  question: "What is MediOca Pro?",
                  answer: "MediOca Pro is an advanced healthcare management platform powered by artificial intelligence. It provides healthcare professionals with tools for patient management, diagnostics assistance, prescription tracking, and advanced analytics."
                },
                {
                  question: "How does the AI diagnostic assistance work?",
                  answer: "Our AI diagnostic system analyzes patient symptoms, medical history, and test results using machine learning algorithms trained on vast medical datasets. It then suggests potential diagnoses and treatment options to assist healthcare providers in making more informed decisions."
                },
                {
                  question: "Is MediOca Pro HIPAA compliant?",
                  answer: "Yes, MediOca Pro is fully HIPAA compliant. We implement enterprise-grade security measures including end-to-end encryption, secure data storage, and strict access controls to ensure patient information is protected according to healthcare privacy standards."
                },
                {
                  question: "Can I integrate MediOca Pro with existing healthcare systems?",
                  answer: "Absolutely! MediOca Pro offers seamless integration with most electronic health record (EHR) systems, laboratory information systems, and other healthcare IT infrastructure through our secure API and integration tools."
                },
                {
                  question: "What support options are available for users?",
                  answer: "We offer 24/7 technical support via chat, email, and phone. Additionally, all subscribers get access to our comprehensive knowledge base, video tutorials, and regular training webinars to maximize the platform's benefits."
                },
                {
                  question: "How much does MediOca Pro cost?",
                  answer: "MediOca Pro offers flexible pricing plans based on practice size and feature requirements. We have options for solo practitioners, small clinics, and large healthcare organizations. Contact our sales team for a personalized quote."
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                  >
                    <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                    <div className={`transition-transform duration-300 ${openFAQ === index ? 'rotate-180 text-purple-600' : 'text-gray-500'}`}>
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </button>
                  {openFAQ === index && (
                    <div className="px-5 pb-5 pt-0 text-gray-600 bg-gray-50/50 animate-fade-in">
                      <p className="leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/support" className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium">
                <span>View all FAQ articles</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white">
          <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Company Info */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">MediOca Pro</span>
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Revolutionary AI-powered healthcare management platform helping professionals deliver better care through technology.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300" aria-label="Twitter">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300" aria-label="Instagram">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300" aria-label="LinkedIn">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white/90">Quick Links</h3>
                <ul className="space-y-2">
                  {[
                    { name: "Home", href: "/" },
                    { name: "Features", href: "/#features" },
                    { name: "Pricing", href: "/pricing" },
                    { name: "Testimonials", href: "/testimonials" },
                    { name: "Contact", href: "/contact" },
                    { name: "Blog", href: "/blog" }
                  ].map((link, i) => (
                    <li key={i}>
                      <a 
                        href={link.href} 
                        className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center" 
                      >
                        <ArrowRight className="h-3 w-3 mr-2" />
                        <span>{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white/90">Resources</h3>
                <ul className="space-y-2">
                  {[
                    { name: "Documentation", href: "/docs", icon: <FileText className="h-3 w-3 mr-2" /> },
                    { name: "API Reference", href: "/api-docs", icon: <FileText className="h-3 w-3 mr-2" /> },
                    { name: "Support Center", href: "/support", icon: <HelpCircle className="h-3 w-3 mr-2" /> },
                    { name: "Privacy Policy", href: "/privacy", icon: <Shield className="h-3 w-3 mr-2" /> },
                    { name: "Terms of Service", href: "/terms", icon: <FileText className="h-3 w-3 mr-2" /> }
                  ].map((link, i) => (
                    <li key={i}>
                      <a 
                        href={link.href} 
                        className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center" 
                      >
                        {link.icon}
                        <span>{link.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white/90">Contact Us</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3 text-blue-100">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>123 Healthcare Avenue, Medical District, CA 90210</span>
                  </li>
                  <li className="flex items-center space-x-3 text-blue-100">
                    <Phone className="h-5 w-5" />
                    <span>+1 (555) 123-4567</span>
                  </li>
                  <li className="flex items-center space-x-3 text-blue-100">
                    <Mail className="h-5 w-5" />
                    <span>contact@medioca.com</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-blue-200">© {new Date().getFullYear()} MediOca Pro. All rights reserved.</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-blue-200">
                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                <span className="hidden sm:inline">|</span>
                <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
                <span className="hidden sm:inline">|</span>
                <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
