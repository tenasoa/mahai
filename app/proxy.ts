import { NextResponse } from 'next/server'

const EMAIL_VERIFIED_COOKIE = 'mahai-email-verified'
const ONBOARDING_PENDING_COOKIE = 'mahai-onboarding-pending'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/credits',
  '/sujet',
  '/examens',
  '/profil',  // Corrigé: '/profile' -> '/profil'
  '/auth/onboarding',
]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth/login', '/auth/register']

function readCookieValue(cookieHeader: string, cookieName: string) {
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.split('=')[1]
}

/**
 * Proxy handler for authentication and route protection
 * 
 * This replaces the deprecated middleware.ts pattern in Next.js 16
 * 
 * @param request - The incoming request
 * @param event - The fetch event
 * @returns Response with redirects if needed
 */
export async function middleware(request: Request) {
  const url = new URL(request.url)
  const { pathname } = url

  // Get session cookie (Supabase auth token)
  // Supabase SSR uses cookies like 'sb-token' or 'sb-auth-token'
  const cookieHeader = request.headers.get('cookie') || ''
  const authToken = cookieHeader
    .split(';')
    .find(c => c.trim().startsWith('sb-'))
    ?.split('=')[1]
  const isEmailVerified = readCookieValue(cookieHeader, EMAIL_VERIFIED_COOKIE) === '1'
  const isOnboardingPending = readCookieValue(cookieHeader, ONBOARDING_PENDING_COOKIE) === '1'

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isVerifyRoute = pathname.startsWith('/auth/verify-email')
  const isOnboardingRoute = pathname.startsWith('/auth/onboarding')

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (authToken && !isEmailVerified && !isVerifyRoute) {
    return NextResponse.redirect(new URL('/auth/verify-email', request.url))
  }

  if (
    authToken &&
    isEmailVerified &&
    isOnboardingPending &&
    isProtectedRoute &&
    !isOnboardingRoute
  ) {
    return NextResponse.redirect(new URL('/auth/onboarding', request.url))
  }

  // Redirect to dashboard/onboarding if accessing auth routes with auth
  if (isAuthRoute && authToken) {
    if (!isEmailVerified) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url))
    }

    if (isOnboardingPending) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isVerifyRoute && authToken && isEmailVerified) {
    if (isOnboardingPending) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url))
    }

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
