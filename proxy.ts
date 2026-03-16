import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 1. Rediriger l'utilisateur connecté s'il tente d'accéder aux pages d'authentification
  if (user && request.nextUrl.pathname.startsWith('/auth')) {
    // Sauf pour verify-email qui peut être utile même connecté (pour re-déclencher l'envoi par ex)
    // Mais en général on redirige vers le dashboard
    if (request.nextUrl.pathname !== '/auth/verify-email') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // 2. Optionnel : Protéger les routes privées (redirection vers login si non connecté)
  const privateRoutes = ['/dashboard', '/profil', '/credits', '/examens']
  const isPrivateRoute = privateRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  
  if (!user && isPrivateRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
