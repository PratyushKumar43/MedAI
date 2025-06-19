'use client'

import { useAuth } from '@/providers/auth-provider'
import { usePathname } from 'next/navigation'
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BackgroundEffects } from "@/components/ui/background-effects"
import { ScrollToTop } from "@/components/ui/scroll-to-top"
import { Loader2 } from 'lucide-react'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  
  // Check if current path is an auth route
  const isAuthRoute = pathname?.startsWith('/auth')

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

  // If user is not authenticated and not on auth route, show auth layout
  if (!user && !isAuthRoute) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // If user is authenticated and on auth route, redirect will be handled by auth pages
  // If user is authenticated, show full dashboard layout
  if (user && !isAuthRoute) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <BackgroundEffects />
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10 ml-64">
          <div className="sticky top-0 w-full z-50 px-2">
            <Header />
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 pt-32 scroll-smooth" id="main-content">
            <div className="max-w-7xl mx-auto animate-fade-in-up mt-4">{children}</div>
          </main>
        </div>
        <ScrollToTop />
      </div>
    )
  }

  // For auth routes, show minimal layout
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
