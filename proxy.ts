import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const EMAIL_VERIFIED_COOKIE = "mahai-email-verified";
const ONBOARDING_PENDING_COOKIE = "mahai-onboarding-pending";

const protectedRoutes = [
  "/dashboard",
  "/profil",
  "/recharge",
  "/examens",
  "/auth/onboarding",
  "/catalogue/buy",
  "/contributeur",
  "/parrainage",
  "/notifications",
];

const ADMIN_ROUTES = ["/admin"];

const authRoutes = ["/auth/login", "/auth/register"];

// Le proxy tourne aussi sur Cloudflare Workers (OpenNext) : il ne doit importer
// ni `pg` (@/lib/db) ni @/lib/logger (qui charge Sentry), sinon le middleware
// plante au chargement dans workerd. Logs de debug via LOG_LEVEL=debug.
function debugLog(message: string) {
  if (process.env.LOG_LEVEL === "debug") console.warn(message);
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Utiliser getSession() UNIQUEMENT : lecture des cookies, 0 appel réseau.
  // getUser() fait un appel HTTP à Supabase qui prend 300-800ms et cause
  // des race conditions de refresh token → redirections involontaires.
  let effectiveUser = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      effectiveUser = session.user;
    }
  } catch {
    // getSession() échoue rarement ; si c'est le cas, pas de session.
  }

  // Vérification serveur en arrière-plan (non-bloquant, fire-and-forget).
  // getSession() lit les cookies locaux (~5ms), getUser() contacte Supabase
  // pour confirmer que le token n'a pas été révoqué côté serveur.
  // Si getUser() échoue, on log l'erreur mais on ne bloque ni ne redirige :
  // la décision d'auth est déjà prise via getSession(). Le prochain cycle
  // du middleware verra la session expirée naturellement.
  if (effectiveUser) {
    supabase.auth.getUser().then(({ error }) => {
      if (error) {
        debugLog(`[Auth] Background getUser() failed: ${error.message} - token may be revoked, session will expire naturally`);
      }
    }).catch(() => {
    });
  }

  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isVerifyRoute = pathname.startsWith("/auth/verify-email");
  const isOnboardingRoute = pathname.startsWith("/auth/onboarding");
  const isCallbackRoute = pathname.startsWith("/auth/callback");
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  // Protéger les routes admin (vérification du rôle avec pg)
  if (isAdminRoute) {
    if (!effectiveUser) {
      debugLog(`[Admin Check] No user, redirecting to login from ${pathname}`);
      return NextResponse.redirect(
        new URL("/auth/login?redirect=" + encodeURIComponent(pathname), request.url)
      );
    }

    // Le rôle ADMIN est vérifié en base par app/admin/layout.tsx (requête SQL),
    // qui englobe toutes les pages /admin. Ici on ne garde que la revalidation
    // du jeton, faisable sans accès à la base.
    //
    // Sécurité : pour les routes admin (et uniquement celles-ci, pour limiter
    // le surcoût réseau), on REVALIDE le JWT auprès de Supabase via getUser().
    // getSession() lit seulement le cookie local : un token révoqué (logout,
    // bannissement, session invalidée) y reste valide jusqu'à son expiration.
    // getUser() confirme côté serveur que la session est toujours active.
    try {
      const { data: { user: revalidatedUser }, error: revalidationError } =
        await supabase.auth.getUser();
      if (revalidationError || !revalidatedUser) {
        debugLog(`[Admin Check] getUser() revalidation failed for ${pathname} - access denied`);
        return NextResponse.redirect(
          new URL("/auth/login?redirect=" + encodeURIComponent(pathname), request.url)
        );
      }
    } catch (error) {
      console.error('[Admin Check] getUser() revalidation error', error instanceof Error ? error.message : String(error));
      return NextResponse.redirect(
        new URL("/auth/login?redirect=" + encodeURIComponent(pathname), request.url)
      );
    }
  }

  if (!effectiveUser && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!effectiveUser) {
    return response;
  }

  // Utilisateur connecté sur la landing page → dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isEmailVerified =
    Boolean(effectiveUser.email_confirmed_at) ||
    request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value === "1";
  const isOnboardingPending =
    request.cookies.get(ONBOARDING_PENDING_COOKIE)?.value === "1";

  if (!isEmailVerified && !isVerifyRoute && !isCallbackRoute) {
    const verifyUrl = new URL("/auth/verify-email", request.url);
    if (effectiveUser.email) {
      verifyUrl.searchParams.set("email", effectiveUser.email);
    }
    return NextResponse.redirect(verifyUrl);
  }

  if (
    isProtectedRoute &&
    isEmailVerified &&
    isOnboardingPending &&
    !isOnboardingRoute
  ) {
    return NextResponse.redirect(new URL("/auth/onboarding", request.url));
  }

  if (isAuthRoute) {
    if (!isEmailVerified) {
      const verifyUrl = new URL("/auth/verify-email", request.url);
      if (effectiveUser.email) {
        verifyUrl.searchParams.set("email", effectiveUser.email);
      }
      return NextResponse.redirect(verifyUrl);
    }

    if (isOnboardingPending) {
      return NextResponse.redirect(new URL("/auth/onboarding", request.url));
    }

    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const destination =
      redirectParam &&
      redirectParam.startsWith("/") &&
      !redirectParam.startsWith("//") &&
      !redirectParam.startsWith("/auth/login") &&
      !redirectParam.startsWith("/auth/register")
        ? redirectParam
        : "/dashboard";
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isVerifyRoute && isEmailVerified) {
    if (isOnboardingPending) {
      return NextResponse.redirect(new URL("/auth/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ajouter les headers de sécurité
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};