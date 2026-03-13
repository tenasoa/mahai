import { NextResponse } from 'next/server'
import type { NextFetchEvent } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/credits',
  '/sujet',
  '/examens',
  '/profile',
]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth/login', '/auth/register', '/auth/role-selection']

/**
 * Proxy handler for authentication and route protection
 * 
 * This replaces the deprecated middleware.ts pattern in Next.js 16
 * 
 * @param request - The incoming request
 * @param event - The fetch event
 * @returns Response with redirects if needed
 */
export async function middleware(request: Request, event: NextFetchEvent) {
  const url = new URL(request.url)
  const { pathname } = url

  // Get session cookie (Supabase auth token)
  // Supabase SSR uses cookies like 'sb-token' or 'sb-auth-token'
  const cookieHeader = request.headers.get('cookie') || ''
  const authToken = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('sb-'))
    ?.split('=')[1]

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth route with auth
  if (isAuthRoute && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. files within /public)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
