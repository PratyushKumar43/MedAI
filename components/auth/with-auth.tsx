'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { Loader2 } from 'lucide-react'

interface WithAuthProps {
  redirectTo?: string
  fallback?: React.ReactNode
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  const { redirectTo = '/auth/sign-in', fallback } = options

  return function AuthenticatedComponent(props: P) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!loading && !user) {
        console.log('🔒 withAuth: User not authenticated, redirecting to:', redirectTo)
        router.push(redirectTo)
      }
    }, [user, loading, router])

    if (loading) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Authenticating...</p>
          </div>
        </div>
      )
    }

    if (!user) {
      return null // Will redirect via useEffect
    }

    return <WrappedComponent {...props} />
  }
}

// Hook for checking authentication status in components
export function useRequireAuth(redirectTo: string = '/auth/sign-in') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 useRequireAuth: User not authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading, isAuthenticated: !!user }
}
