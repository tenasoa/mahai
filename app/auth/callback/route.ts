import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncAppUserWithAuthUser } from "@/lib/auth-user-sync";
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const EMAIL_VERIFIED_COOKIE = "mahai-email-verified";
const ONBOARDING_PENDING_COOKIE = "mahai-onboarding-pending";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const CALLBACK_OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
];

function sanitizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/auth/onboarding";
  }

  return nextPath;
}

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

function parseOtpType(value: string | null): EmailOtpType | null {
  if (!value) {
    return null;
  }

  return CALLBACK_OTP_TYPES.includes(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = parseOtpType(requestUrl.searchParams.get("type"));

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Erreur auth callback (code):", error);
    }
  } else if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });

    if (error) {
      console.error("Erreur auth callback (otp):", error);
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(
      new URL("/auth/login?error=confirmation_invalide", request.url),
    );
  }

  if (!user.email_confirmed_at) {
    const verifyUrl = new URL("/auth/verify-email", request.url);
    if (user.email) {
      verifyUrl.searchParams.set("email", user.email);
    }
    return NextResponse.redirect(verifyUrl);
  }

  const syncResult = await syncAppUserWithAuthUser(user);
  if (syncResult.error || !syncResult.appUser) {
    const verifyUrl = new URL("/auth/verify-email", request.url);
    if (user.email) {
      verifyUrl.searchParams.set("email", user.email);
    }
    verifyUrl.searchParams.set("error", "profile_sync_failed");
    return NextResponse.redirect(verifyUrl);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(EMAIL_VERIFIED_COOKIE, "1", getCookieOptions());
  if (syncResult.created || syncResult.welcomeCreditsGranted) {
    response.cookies.set(ONBOARDING_PENDING_COOKIE, "1", getCookieOptions());
  }
  return response;
}
