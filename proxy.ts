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
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isVerifyRoute = pathname.startsWith("/auth/verify-email");
  const isOnboardingRoute = pathname.startsWith("/auth/onboarding");
  const isCallbackRoute = pathname.startsWith("/auth/callback");
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

  // Protéger les routes admin (vérification du rôle avec pg)
  if (isAdminRoute) {
    if (!user) {
      console.log(`[Admin Check] No user, redirecting to login from ${pathname}`);
      return NextResponse.redirect(
        new URL("/auth/login?next=" + encodeURIComponent(pathname), request.url)
      );
    }

    try {
      // Utiliser pg directement (contourne les RLS Supabase)
      const result = await query(
        `SELECT role FROM "User" WHERE id = $1`,
        [user.id]
      );

      const role = result.rows[0]?.role;
      console.log(`[Admin Check] User ${user.id} role: ${role}`);

      if (role !== "ADMIN") {
        console.log(`[Admin Check] Access denied for ${user.id}, role: ${role}`);
        return NextResponse.redirect(new URL("/", request.url));
      }

      console.log(`[Admin Check] Access granted for ${user.id}`);
    } catch (error) {
      console.error(`[Admin Check] Error checking role for ${user.id}:`, error);
      // En développement, autoriser l'accès même en cas d'erreur
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Admin Check] Dev mode: allowing access despite error`);
        // Continue without redirecting
      } else {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    }
  }

  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    return response;
  }

  const isEmailVerified =
    Boolean(user.email_confirmed_at) ||
    request.cookies.get(EMAIL_VERIFIED_COOKIE)?.value === "1";
  const isOnboardingPending =
    request.cookies.get(ONBOARDING_PENDING_COOKIE)?.value === "1";

  if (!isEmailVerified && !isVerifyRoute && !isCallbackRoute) {
    const verifyUrl = new URL("/auth/verify-email", request.url);
    if (user.email) {
      verifyUrl.searchParams.set("email", user.email);
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
      if (user.email) {
        verifyUrl.searchParams.set("email", user.email);
      }
      return NextResponse.redirect(verifyUrl);
    }

    if (isOnboardingPending) {
      return NextResponse.redirect(new URL("/auth/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isVerifyRoute && isEmailVerified) {
    if (isOnboardingPending) {
      return NextResponse.redirect(new URL("/auth/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ajouter les headers de sécurité
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
