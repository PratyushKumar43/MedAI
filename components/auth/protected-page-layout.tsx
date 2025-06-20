'use client'

import { useRequireAuth } from '@/components/auth/with-auth'
import { Loader2 } from 'lucide-react'

interface ProtectedPageLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function ProtectedPageLayout({ 
  children, 
  title, 
  description 
}: ProtectedPageLayoutProps) {
  const { user, loading, isAuthenticated } = useRequireAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // useRequireAuth will handle the redirect
  }

  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="mb-8">
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
