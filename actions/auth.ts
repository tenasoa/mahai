"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { checkAuthRateLimit } from "@/lib/rate-limit";
import {
  getUserByEmail,
  createPasswordReset,
  findValidPasswordReset,
  markPasswordResetAsUsed,
} from "@/lib/sql-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { syncAppUserWithAuthUser } from "@/lib/auth-user-sync";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterFormData,
  type LoginFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";

const EMAIL_VERIFIED_COOKIE = "mahai-email-verified";
const ONBOARDING_PENDING_COOKIE = "mahai-onboarding-pending";
const FLOW_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const DEFAULT_SITE_URL = process.env.NODE_ENV === "production" 
  ? "https://mahai.mg" 
  : "http://localhost:3000";

/**
 * Extrait l'IP du client depuis les headers Vercel/Next.js.
 * Utilisée comme identifiant secondaire pour le rate-limit auth.
 */
async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

// Helper function to generate consistent 6-digit code
function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getFlowCookieOptions(maxAge = FLOW_COOKIE_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL;
}

function getSignupRedirectUrl(nextPath = "/auth/onboarding") {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

function isAuthEmailDeliveryEnabled() {
  return process.env.ENABLE_AUTH_EMAIL_DELIVERY === "true";
}

async function setVerificationCookie(isVerified: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(
    EMAIL_VERIFIED_COOKIE,
    isVerified ? "1" : "0",
    getFlowCookieOptions(),
  );
}

async function setOnboardingPendingCookie(isPending: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(
    ONBOARDING_PENDING_COOKIE,
    isPending ? "1" : "0",
    getFlowCookieOptions(),
  );
}

function isOnboardingPending(cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return cookieStore.get(ONBOARDING_PENDING_COOKIE)?.value === "1";
}

export async function registerUser(formData: RegisterFormData) {
  const validation = registerSchema.safeParse(formData);

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
    };
  }

  const {
    email,
    password,
    prenom,
    nom,
    role,
    etablissement,
    referralCode,
    newsletterOptIn,
  } =
    validation.data;

  // ⚠ Rate-limit anti-spam : 5 inscriptions / 15 min par IP. Empêche un
  // bot de créer 1000 comptes en boucle (et donc d'épuiser le bonus de
  // bienvenue, polluer la base, ou contourner ENABLE_REFERRAL_BONUS).
  const ip = await getClientIp();
  const limit = checkAuthRateLimit(`register:${ip}`);
  if (!limit.allowed) {
    return {
      error: `Trop de tentatives d'inscription. Réessayez dans ${Math.ceil(
        (limit.retryAfter || 60) / 60,
      )} minutes.`,
    };
  }

  const supabase = await createSupabaseServerClient();

  // Use signUp to trigger Supabase's native confirmation email
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        prenom,
        nom: nom || "",
        role,
        etablissement: etablissement || "",
        referralCode: referralCode || "",
        notifPromos: newsletterOptIn ?? false,
      },
      emailRedirectTo: getSignupRedirectUrl("/auth/onboarding"),
    },
  });

  if (authError) {
    console.error("❌ Erreur Supabase Auth:", {
      message: authError.message,
      status: authError.status,
      code: authError.code,
    });

    return {
      error:
        authError.message ===
          "A user with this email address has already been registered" ||
        authError.message.toLowerCase().includes("already registered")
          ? "Un compte existe déjà avec cette adresse email"
          : `Erreur Supabase: ${authError.message}`,
    };
  }

  if (!authData.user) {
    return {
      error: "Inscription impossible pour le moment. Veuillez réessayer.",
    };
  }

  if (authData.user.identities?.length === 0) {
    return {
      error: "Un compte existe déjà avec cette adresse email",
    };
  }

  await setVerificationCookie(false);
  await setOnboardingPendingCookie(true);

  redirect("/auth/verify-email?email=" + encodeURIComponent(email));
}

export type RoleFormData = {
  role: "ETUDIANT" | "CONTRIBUTEUR" | "PROFESSEUR";
  schoolLevel?: string;
  acceptCGU?: boolean;
};

export async function updateUserRole(formData: RoleFormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { error: "Vous devez être connecté pour effectuer cette action" };
  }

  const updateData: any = {
    role: formData.role,
  };

  if (formData.role === "ETUDIANT" && formData.schoolLevel) {
    updateData.schoolLevel = formData.schoolLevel;
  }

  try {
    await query(
      'UPDATE "User" SET role = $1, "schoolLevel" = $2, "updatedAt" = NOW() WHERE id = $3',
      [updateData.role, updateData.schoolLevel || null, session.user.id],
    );
  } catch (error) {
    console.error("Error updating role:", error);
    return { error: "Erreur lors de la mise à jour du rôle" };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function loginUser(formData: LoginFormData) {
  const supabase = await createSupabaseServerClient();

  const validation = loginSchema.safeParse(formData);

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
    };
  }

  const { email, password } = validation.data;

  // ⚠ Rate-limit anti-bruteforce : 5 essais / 15 min par couple email + IP.
  // Si l'attaquant change d'IP : limité par email. Si plusieurs comptes
  // attaqués depuis la même IP : limité par IP. Les deux compteurs
  // coexistent et c'est volontaire (défense en profondeur).
  const ip = await getClientIp();
  const limitByEmail = checkAuthRateLimit(`login:email:${email.toLowerCase()}`);
  const limitByIp = checkAuthRateLimit(`login:ip:${ip}`);
  if (!limitByEmail.allowed || !limitByIp.allowed) {
    const retry = Math.max(limitByEmail.retryAfter || 0, limitByIp.retryAfter || 0);
    return {
      error: `Trop de tentatives de connexion. Réessayez dans ${Math.ceil(retry / 60)} minutes.`,
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword(
    {
      email,
      password,
    },
  );

  if (authError) {
    if (authError.message.toLowerCase().includes("email not confirmed")) {
      await setVerificationCookie(false);
      redirect("/auth/verify-email?email=" + encodeURIComponent(email));
    }

    return {
      error: "Email ou mot de passe incorrect",
    };
  }

  if (!authData.user) {
    // Cas anormal (auth réussit mais pas de user) — message générique pour
    // ne pas confirmer/infirmer l'existence d'un compte.
    return {
      error: "Email ou mot de passe incorrect",
    };
  }

  const isEmailVerified = Boolean(authData.user.email_confirmed_at);
  await setVerificationCookie(isEmailVerified);

  if (!isEmailVerified) {
    redirect("/auth/verify-email?email=" + encodeURIComponent(email));
  }

  const syncResult = await syncAppUserWithAuthUser(authData.user);

  if (syncResult.error || !syncResult.appUser) {
    // Désynchro auth ↔ app : on logue côté serveur et on rend une erreur
    // générique côté client (pas de leak du fait que l'auth a marché mais
    // que la sync app a échoué).
    console.error("[loginUser] sync auth ↔ app failed:", syncResult.error);
    await supabase.auth.signOut();
    await setVerificationCookie(false);
    return {
      error: "Email ou mot de passe incorrect",
    };
  }

  if (syncResult.created) {
    await setOnboardingPendingCookie(true);
  }

  const cookieStore = await cookies();
  const onboardingPending = isOnboardingPending(cookieStore);
  revalidatePath("/dashboard", "layout");

  if (onboardingPending) {
    redirect("/auth/onboarding");
  }

  redirect("/dashboard");
}

export async function logoutUser() {
  const supabase = await createSupabaseServerClient();
  const cookieStore = await cookies();

  await supabase.auth.signOut();
  cookieStore.delete(EMAIL_VERIFIED_COOKIE);

  revalidatePath("/", "layout");
  redirect("/auth/login");
}

export async function requestPasswordReset(formData: ForgotPasswordFormData) {
  const validation = forgotPasswordSchema.safeParse(formData);

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
    };
  }

  // ⚠ Rate-limit anti-spam : empêche un attaquant d'envoyer 100 emails de
  // reset à la même adresse (DoS d'inbox + signal de phishing chez le
  // destinataire). Limité à 5 demandes / 15 min par email + IP.
  // On répond avec un message générique (pas d'erreur) pour ne pas
  // confirmer/infirmer l'existence du compte.
  const ip = await getClientIp();
  const emailLower = validation.data.email.toLowerCase();
  const limitByEmail = checkAuthRateLimit(`reset:email:${emailLower}`);
  const limitByIp = checkAuthRateLimit(`reset:ip:${ip}`);
  if (!limitByEmail.allowed || !limitByIp.allowed) {
    return {
      success:
        "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.",
    };
  }

  const { email } = validation.data;

  if (!isAuthEmailDeliveryEnabled()) {
    return {
      error: "La récupération par email est temporairement désactivée.",
    };
  }

  // Check if user exists
  const user = await getUserByEmail(email);

  if (!user) {
    // Don't reveal that user doesn't exist
    return {
      success: "Si cet email existe, un code de réinitialisation a été envoyé.",
    };
  }

  // Create password reset token (6 digits)
  const token = generate6DigitCode();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await createPasswordReset(email, token, expiresAt);

  // Use Supabase's native password reset email
  const supabase = await createSupabaseServerClient();
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    email,
    {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/reset-password`,
    },
  );

  if (resetError) {
    console.error("Error sending password reset email:", resetError);
    // Continue even if email fails - user can still use the OTP code from database
  }

  return {
    success: "Si cet email existe, un code de réinitialisation a été envoyé.",
  };
}

export async function resetPassword(formData: ResetPasswordFormData) {
  const validation = resetPasswordSchema.safeParse(formData);

  if (!validation.success) {
    return {
      error: validation.error.errors[0].message,
    };
  }

  const { token, password } = validation.data;

  // Find valid reset token
  const resetToken = await findValidPasswordReset(token);

  if (!resetToken) {
    return { error: "Token invalide ou expiré" };
  }

  // Find user by email
  const user = await getUserByEmail(resetToken.email);

  if (!user) {
    return { error: "Utilisateur non trouvé" };
  }

  // Update password in Supabase
  const supabase = await createSupabaseAdminClient();

  // Find Supabase Auth user by email to be 100% sure of the ID
  const {
    data: { users },
    error: listError,
  } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Erreur récupération utilisateurs auth:", listError);
    return { error: "Erreur lors de la récupération du compte" };
  }

  const supabaseUser = users.find((u) => u.email === resetToken.email);

  if (!supabaseUser) {
    return { error: "Compte non trouvé dans le système d'authentification" };
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    supabaseUser.id,
    { password },
  );

  if (updateError) {
    console.error("Erreur mise à jour mot de passe Supabase:", {
      message: updateError.message,
      status: updateError.status,
      code: updateError.code,
    });
    return { error: `Erreur Supabase: ${updateError.message}` };
  }

  // Update user timestamp in database
  await query('UPDATE "User" SET "updatedAt" = NOW() WHERE id = $1', [user.id]);

  // Mark token as used
  await markPasswordResetAsUsed(token);

  return { success: "Mot de passe réinitialisé avec succès" };
}

export async function refreshEmailVerificationStatus() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    await setVerificationCookie(false);
    return {
      verified: false,
      error:
        "Cliquez d'abord sur le lien de confirmation dans votre email, puis reconnectez-vous.",
    };
  }

  if (!user.email_confirmed_at) {
    await setVerificationCookie(false);
    return {
      verified: false,
      error: "Votre email n'est pas encore confirmé.",
    };
  }

  const syncResult = await syncAppUserWithAuthUser(user);

  if (syncResult.error) {
    return { verified: false, error: syncResult.error };
  }

  await setVerificationCookie(true);

  if (syncResult.created || syncResult.welcomeCreditsGranted) {
    await setOnboardingPendingCookie(true);
  }

  return {
    verified: true,
    success: "Email vérifié avec succès",
    nextUrl: "/auth/onboarding",
  };
}

export async function resendVerificationEmail(email: string) {
  try {
    if (!isAuthEmailDeliveryEnabled()) {
      return { error: "Le renvoi d'email est temporairement désactivé." };
    }

    if (!email) {
      return { error: "Adresse email invalide" };
    }

    const supabase = await createSupabaseServerClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getSignupRedirectUrl("/auth/onboarding"),
      },
    });

    if (resendError) {
      console.error("Error resending verification email:", resendError);
      return {
        error: "Impossible de renvoyer l'email pour le moment. Réessayez dans 1 minute.",
      };
    }

    return { success: "Lien de confirmation renvoyé avec succès." };
  } catch (error) {
    console.error("Erreur resend email:", error);
    return { error: "Erreur lors de l'envoi du lien de confirmation" };
  }
}

export async function completeOnboarding() {
  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_PENDING_COOKIE, "0", getFlowCookieOptions());

  revalidatePath("/dashboard", "layout");
  revalidatePath("/profil");

  return { success: true };
}

export async function skipOnboarding() {
  const cookieStore = await cookies();
  cookieStore.set(ONBOARDING_PENDING_COOKIE, "0", getFlowCookieOptions());

  return { success: true };
}

// Get current authenticated user data from the application database
export async function getCurrentUserData() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const result = await query('SELECT * FROM "User" WHERE id = $1 LIMIT 1', [
      user.id,
    ]);
    const data = result.rows[0] ?? null;

    if (data) {
      return data;
    }

    const syncResult = await syncAppUserWithAuthUser(user);
    return syncResult.appUser;
  } catch (error) {
    console.error("Error fetching current user data:", error);
    return null;
  }
}
