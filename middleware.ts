import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// ============================================
// MAH.AI — Middleware Clerk
// ============================================
// Protection des routes avec Clerk
// ============================================

// Routes publiques (accessibles sans auth)
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/about',
  '/terms',
  '/privacy',
  '/faq',
  '/contact',
  '/catalogue',
  '/catalogue/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

// Routes admin (réservées aux admins)
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
])

// Routes professeur (réservées aux professeurs)
const isProfesseurRoute = createRouteMatcher([
  '/professeur(.*)',
])

// Routes vérificateur (réservées aux vérificateurs)
const isVerificateurRoute = createRouteMatcher([
  '/verificateur(.*)',
])

// Routes contributeur (réservées aux contributeurs)
const isContributeurRoute = createRouteMatcher([
  '/contributeur(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Routes publiques — pas de protection
  if (isPublicRoute(req)) {
    return
  }
  
  // Routes protégées — auth requise
  await auth.protect()
  
  const { userId, sessionClaims } = await auth()
  
  // Vérification des rôles pour les routes spécifiques
  if (isAdminRoute(req)) {
    const roles = (sessionClaims?.metadata as { roles?: string[] })?.roles || []
    if (!roles.includes('ADMIN')) {
      // Redirect vers dashboard ou 403
      return Response.redirect(new URL('/compte', req.url))
    }
  }
  
  if (isProfesseurRoute(req)) {
    const roles = (sessionClaims?.metadata as { roles?: string[] })?.roles || []
    if (!roles.includes('PROFESSEUR')) {
      return Response.redirect(new URL('/compte', req.url))
    }
  }
  
  if (isVerificateurRoute(req)) {
    const roles = (sessionClaims?.metadata as { roles?: string[] })?.roles || []
    if (!roles.includes('VERIFICATEUR')) {
      return Response.redirect(new URL('/compte', req.url))
    }
  }
  
  if (isContributeurRoute(req)) {
    const roles = (sessionClaims?.metadata as { roles?: string[] })?.roles || []
    if (!roles.includes('CONTRIBUTEUR')) {
      return Response.redirect(new URL('/compte', req.url))
    }
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
