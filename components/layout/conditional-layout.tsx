'use client'

import { useAuth } from '@/providers/auth-provider'
import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BackgroundEffects } from "@/components/ui/background-effects"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { FloatingHomeButton } from "@/components/layout/floating-home-button"
import { Loader2, Menu } from 'lucide-react'
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
        
        {/* Mobile Menu Button */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-full shadow-lg"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>
        )}
        
        {/* Sidebar - responsive */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* Main Content - responsive */}
        <div className={`flex-1 flex flex-col overflow-hidden relative z-10 ${!isMobile ? 'ml-64' : 'ml-0'}`}>
          <div className="sticky top-0 w-full z-50 px-2">
            <Header />
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-2 sm:p-4 pt-4 scroll-smooth" id="main-content">
            <div className="max-w-7xl mx-auto animate-fade-in-up">{children}</div>
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
