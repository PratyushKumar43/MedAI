'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { apiService } from '@/lib/api'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Phone, Crown, AlertCircle, CheckCircle, UserPlus, Shield } from 'lucide-react'

export default function SignUpPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'patient',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [googleNotAvailable, setGoogleNotAvailable] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/AI-dashboard')
    }
  }, [user, router])

  // Don't render if user is authenticated
  if (user) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    if (!agreeToTerms) {
      setError('Please agree to the terms and conditions')
      setLoading(false)
      return
    }

    try {
      const { error, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            role: formData.role,
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        // If the user registered as a doctor, create a corresponding doctor record
        if (formData.role === 'doctor' && formData.firstName && formData.lastName) {
          try {
            await apiService.createDoctor({
              user_id: data?.user?.id,
              email: formData.email,
              phone: formData.phone,
              first_name: formData.firstName,
              last_name: formData.lastName,
              name: `${formData.firstName} ${formData.lastName}`,
              specialization: '',
            })
          } catch (doctorErr) {
            console.error('Error creating doctor record:', doctorErr)
          }
        }

        setSuccess('Please check your email for verification link!')
        setTimeout(() => {
          router.push('/auth/sign-in')
        }, 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setGoogleNotAvailable(true)
    setTimeout(() => setGoogleNotAvailable(false), 3000)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex">
      {/* Left side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Glassmorphism container */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 lg:p-10 transition-all duration-300 hover:shadow-3xl">
            {/* Header with animated logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl mb-6 shadow-lg transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                <img 
                  src="/favicon.ico" 
                  alt="MediOca Logo" 
                  className="h-8 w-8 sm:h-10 sm:w-10"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) {
                      fallback.style.display = 'block';
                    }
                  }}
                />
                <span className="text-2xl sm:text-3xl hidden">🏥</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent mb-2">
                Join MediOca
              </h1>
              <p className="text-slate-600 text-sm sm:text-base">Create your account to get started</p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50/80 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50/80 backdrop-blur-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">{success}</AlertDescription>
              </Alert>
            )}

            {/* Google Not Available Alert */}
            {googleNotAvailable && (
              <Alert className="mb-6 border-amber-200 bg-amber-50/80 backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800 font-medium">
                  Google Sign-Up is not available yet. Please use the form below.
                </AlertDescription>
              </Alert>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
                    First Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Enter first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-12 h-12 sm:h-14 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
                    Last Name
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Enter last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="pl-12 h-12 sm:h-14 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 h-12 sm:h-14 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-12 h-12 sm:h-14 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 h-12 sm:h-14 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-12 pr-12 h-12 sm:h-14 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-slate-700 placeholder:text-slate-400"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-50/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
                <p className="text-sm font-semibold text-slate-700 mb-2">Password Requirements:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span>At least 6 characters long</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${formData.password === formData.confirmPassword && formData.password.length > 0 ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                    <span>Passwords match</span>
                  </li>
                </ul>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-200">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={loading}
                  className="border-2 border-slate-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600 mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-slate-700 leading-relaxed">
                  I agree to the{' '}
                  <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200 hover:underline">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    <span>Creating your account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <UserPlus className="mr-2 h-5 w-5" />
                    <span>Create Account</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm uppercase">
                <span className="bg-white px-4 text-slate-500 font-semibold tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 sm:h-14 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 font-semibold text-slate-700 bg-white/50 backdrop-blur-sm"
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <svg className="mr-3 h-6 w-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Sign In Link */}
            <div className="text-center mt-8">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link 
                  href="/auth/sign-in" 
                  className="text-purple-600 hover:text-purple-700 font-bold transition-colors duration-200 hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Section */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 items-center justify-center p-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-pink-400 rounded-full opacity-20 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-400 rounded-full opacity-20 blur-3xl animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-yellow-400 rounded-full opacity-15 blur-2xl animate-bounce animation-delay-2000"></div>
          <div className="absolute top-1/3 right-1/3 w-28 h-28 bg-green-400 rounded-full opacity-15 blur-2xl animate-pulse animation-delay-3000"></div>
        </div>

        <div className="relative z-10 text-center text-white max-w-md">
          {/* Enhanced logo */}
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-10 backdrop-blur-lg border border-white/30 shadow-2xl transition-all duration-500 hover:scale-110 hover:rotate-6 cursor-pointer group">
            <img 
              src="/favicon.ico" 
              alt="MediOca Logo" 
              className="h-14 w-14 transition-all duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) {
                  fallback.style.display = 'block';
                }
              }}
            />
            <span className="text-4xl hidden">🏥</span>
          </div>
            
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Already a <span className="text-cyan-300">Member</span>?
          </h2>
          <p className="text-blue-100 mb-10 leading-relaxed text-lg">
            Sign in to access your medical dashboard and continue your healthcare journey with our AI-powered platform.
          </p>

          {/* Enhanced benefits list */}
          <div className="space-y-4 mb-10 text-left">
            {[
              { icon: '🏥', text: 'Access your medical dashboard' },
              { icon: '📋', text: 'View patient records & history' },
              { icon: '💊', text: 'Track prescriptions & medications' },
              { icon: '🤖', text: 'Get AI-powered health insights' },
              { icon: '👨‍⚕️', text: 'Connect with healthcare providers' },
              { icon: '📊', text: 'Monitor health analytics' }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 group transition-all duration-300 hover:translate-x-2"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg">{benefit.icon}</span>
                </div>
                <span className="text-blue-100 font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Enhanced CTA */}
          <Link href="/auth/sign-in">
            <Button className="w-full h-14 bg-white text-purple-700 hover:bg-blue-50 font-bold rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-3xl mb-6 text-lg">
              <Shield className="mr-2 h-5 w-5" />
              Sign In to Dashboard
            </Button>
          </Link>
          
          <p className="text-sm text-blue-200 font-medium">
            New to MediOca? You're in the right place! ✨
          </p>
        </div>
      </div>
    </div>
  )
}