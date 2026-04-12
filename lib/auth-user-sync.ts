import { REGISTER_ROLE_VALUES, type RegisterRole } from "@/lib/auth-flow";
import { query } from "@/lib/db";
import {
  createUser,
  getUserById,
  updateUserCredits,
  type User as AppUser,
} from "@/lib/sql-queries";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

const WELCOME_CREDITS = 10;

export type SyncAuthUserResult = {
  appUser: AppUser | null;
  created: boolean;
  emailVerified: boolean;
  welcomeCreditsGranted: boolean;
  error?: string;
};

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getRoleFromMetadata(value: unknown): RegisterRole {
  if (
    typeof value === "string" &&
    (REGISTER_ROLE_VALUES as readonly string[]).includes(value)
  ) {
    return value as RegisterRole;
  }

  return "ETUDIANT";
}

function resolvePrenom(authUser: SupabaseAuthUser): string {
  const metadataPrenom = toOptionalString(authUser.user_metadata?.prenom);

  if (metadataPrenom) {
    return metadataPrenom;
  }

  const emailPrefix = authUser.email?.split("@")[0]?.trim();
  return emailPrefix || "Utilisateur";
}

async function addWelcomeCreditsIfNeeded(
  userId: string,
  currentCredits: number,
): Promise<boolean> {
  if (currentCredits !== 0) {
    return false;
  }

  await updateUserCredits(userId, WELCOME_CREDITS);

  await query(
    `INSERT INTO "CreditTransaction" ("id", "userId", amount, type, description, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      crypto.randomUUID(),
      userId,
      WELCOME_CREDITS,
      "EARN",
      "Crédits de bienvenue",
      "COMPLETED",
    ],
  );

  return true;
}

export async function syncAppUserWithAuthUser(
  authUser: SupabaseAuthUser,
): Promise<SyncAuthUserResult> {
  try {
    const normalizedEmail = authUser.email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return {
        appUser: null,
        created: false,
        emailVerified: false,
        welcomeCreditsGranted: false,
        error: "Adresse email manquante sur le compte Supabase",
      };
    }

    const emailVerified = Boolean(authUser.email_confirmed_at);
    let appUser = await getUserById(authUser.id);
    let created = false;
    let welcomeCreditsGranted = false;

    if (!appUser) {
      const startingCredits = emailVerified ? WELCOME_CREDITS : 0;

      appUser = await createUser({
        id: authUser.id,
        email: normalizedEmail,
        prenom: resolvePrenom(authUser),
        nom: toOptionalString(authUser.user_metadata?.nom),
        role: getRoleFromMetadata(authUser.user_metadata?.role),
        credits: startingCredits,
        emailVerified,
        updatedAt: new Date(),
      });

      created = true;

      if (emailVerified && startingCredits === WELCOME_CREDITS) {
        await query(
          `INSERT INTO "CreditTransaction" ("id", "userId", amount, type, description, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            crypto.randomUUID(),
            authUser.id,
            WELCOME_CREDITS,
            "EARN",
            "Crédits de bienvenue",
            "COMPLETED",
          ],
        );
        welcomeCreditsGranted = true;
      }
    } else {
      if (appUser.email !== normalizedEmail || appUser.emailVerified !== emailVerified) {
        await query(
          'UPDATE "User" SET email = $1, "emailVerified" = $2, "updatedAt" = NOW() WHERE id = $3',
          [normalizedEmail, emailVerified, authUser.id],
        );
      }

      if (emailVerified) {
        welcomeCreditsGranted = await addWelcomeCreditsIfNeeded(
          authUser.id,
          appUser.credits,
        );
      }

      appUser = await getUserById(authUser.id);
    }

    return {
      appUser,
      created,
      emailVerified,
      welcomeCreditsGranted,
    };
  } catch (error) {
    console.error("Erreur synchronisation utilisateur auth:", error);

    return {
      appUser: null,
      created: false,
      emailVerified: false,
      welcomeCreditsGranted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
