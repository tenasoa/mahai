// middleware.ts - Middleware Clerk pour l'authentification

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Routes publiques (accessibles sans authentification)
 */
const isPublicRoute = createRouteMatcher([
  '/',
  '/catalogue(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/paiement/mvola/callback(.*)',
]);

/**
 * Middleware Clerk - protège toutes les routes sauf les publiques
 */
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
