'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

const PUBLIC_ROUTES = [
  '/',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/callback',
  '/auth/auth-code-error'
]

// All protected routes that require authentication
const PROTECTED_ROUTES = [
  '/AI-dashboard',
  '/analytics',
  '/chat',
  '/doctors',
  '/emergency',
  '/health-monitor',
  '/patients',
  '/patient-details',
  '/prescriptions',
  '/admin',
  '/debug'
]

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && pathname) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => 
        pathname === route || pathname.startsWith(route)
      )

      const isProtectedRoute = PROTECTED_ROUTES.some(route => 
        pathname.startsWith(route)
      )

      const isApiRoute = pathname.startsWith('/api')

      // Skip API routes as they handle their own auth
      if (isApiRoute) {
        return
      }

      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access a protected route
        console.log(`🔒 Access denied to ${pathname} - redirecting to sign-in`)
        router.push('/auth/sign-in')
        return
      }

      if (!user && isProtectedRoute) {
        // Extra check for protected routes
        console.log(`🔒 Protected route access denied: ${pathname}`)
        router.push('/auth/sign-in')
        return
      }

      // Allow authenticated users to visit any route
      // Allow unauthenticated users to visit public routes
    }
  }, [user, loading, router, pathname])

  return <>{children}</>
}
