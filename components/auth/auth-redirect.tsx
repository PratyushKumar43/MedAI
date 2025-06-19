'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'

export function AuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to sign-in
        router.push('/auth/sign-in')
      }
      // If user is authenticated, stay on current page (dashboard)
    }
  }, [user, loading, router])

  return null
}
