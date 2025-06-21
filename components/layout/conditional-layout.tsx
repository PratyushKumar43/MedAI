'use client'

import { useAuth } from '@/providers/auth-provider'
import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BackgroundEffects } from "@/components/ui/background-effects"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { FloatingHomeButton } from "@/components/layout/floating-home-button"
import { Loader2, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobile, sidebarOpen])
  
  // Check if current path is an auth route or landing page
  const isAuthRoute = pathname?.startsWith('/auth')
  const isLandingPage = pathname === '/'

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If on landing page or auth routes, show minimal layout (no sidebar)
  if (isLandingPage || isAuthRoute) {
    return (
      <div className="min-h-screen">
        {children}
        {!isAuthRoute && <FloatingHomeButton />}
      </div>
    )
  }
  
  // If user is authenticated, show full dashboard layout
  if (user) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <BackgroundEffects />
        
        {/* Mobile Menu Button - Fixed positioning with proper z-index */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-[60] p-3 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-lg shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 active:scale-95"
            aria-label={sidebarOpen ? "Close Menu" : "Open Menu"}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}

        {/* Mobile Sidebar Backdrop */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        
        {/* Sidebar - Enhanced mobile responsiveness */}
        <div className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'relative w-64'
          }
        `}>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main Content - Improved mobile spacing */}
        <div className={`flex-1 flex flex-col overflow-hidden relative z-10 ${
          !isMobile ? 'ml-0' : 'ml-0'
        }`}>
          {/* Header with proper mobile spacing */}
          <div className={`sticky top-0 w-full z-30 ${
            isMobile ? 'pl-16 pr-4 py-2' : 'px-4 py-2'
          }`}>
            <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-sm border border-white/20">
              <Header />
            </div>
          </div>
          
          {/* Main Content Area */}
          <main className={`
            flex-1 overflow-x-hidden overflow-y-auto scroll-smooth
            ${isMobile ? 'p-4 pt-2' : 'p-4 sm:p-6 pt-4'}
          `} id="main-content">
            <div className="max-w-7xl mx-auto animate-fade-in-up">
              {children}
            </div>
          </main>
        </div>
        
        <ScrollToTop />
        <FloatingHomeButton />
      </div>
    )
  }

  // Default: show minimal layout
  return (
    <div className="min-h-screen">
      {children}
      <FloatingHomeButton />
    </div>
  )
}