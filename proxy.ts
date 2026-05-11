import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { query } from "@/lib/db";

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

function debugLog(message: string) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(message);
  }
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Quand getUser() échoue par une erreur transiente (race condition de refresh
  // de token, timeout réseau Supabase), on tombe sur getSession() qui lit les
  // cookies sans appel réseau — jamais sujette à cette race condition.
  // Cela évite les faux-positifs de déconnexion qui causent la redirection
  // involontaire vers /dashboard.
  let effectiveUser = user;
  if (!user && authError) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        effectiveUser = session.user;
        debugLog(`[Auth] getUser() failed (${authError.message}), fell back to session cookie`);
      }
    } catch {
      // Si getSession échoue aussi, l'utilisateur est vraiment déconnecté
    }
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

    try {
      // Utiliser pg directement (contourne les RLS Supabase)
      const result = await query(
        `SELECT role FROM "User" WHERE id = $1`,
        [effectiveUser.id]
      );

      const role = result.rows[0]?.role;
      debugLog(`[Admin Check] Role checked for ${effectiveUser.id}: ${role}`);

      if (role !== "ADMIN") {
        debugLog(`[Admin Check] Access denied for ${effectiveUser.id}, role: ${role}`);
        return NextResponse.redirect(new URL("/", request.url));
      }

      debugLog(`[Admin Check] Access granted for ${effectiveUser.id}`);
    } catch (error) {
      console.error(`[Admin Check] Error checking role for ${effectiveUser.id}:`, error);
      // En cas d'erreur DB transiente, laisser passer (la page vérifiera le rôle
      // via ses propres server actions). Évite la redirection vers /dashboard.
      debugLog(`[Admin Check] DB error, allowing through — page will re-verify`);
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
