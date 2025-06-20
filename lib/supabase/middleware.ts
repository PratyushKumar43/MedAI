import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/callback',
    '/auth/auth-code-error'
  ]

  // Define all protected routes
  const protectedRoutes = [
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

  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )

  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  const isApiRoute = pathname.startsWith('/api')

  // Skip API routes - they should handle their own authentication
  if (isApiRoute) {
    return supabaseResponse
  }

  // If user is not authenticated and trying to access protected route
  if (!user && (isProtectedRoute || (!isPublicRoute && !isApiRoute))) {
    console.log(`🔒 Middleware: Access denied to ${pathname} - redirecting to sign-in`)
    const redirectUrl = new URL('/auth/sign-in', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
