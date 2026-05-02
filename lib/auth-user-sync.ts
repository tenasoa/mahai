import { REGISTER_ROLE_VALUES, type RegisterRole } from "@/lib/auth-flow";
import { query } from "@/lib/db";
import {
  createUser,
  getUserById,
  updateUserBalanceAr,
  type User as AppUser,
} from "@/lib/sql-queries";
import { getReferralSettings } from "./settings";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";


export type SyncAuthUserResult = {
  appUser: AppUser | null;
  created: boolean;
  emailVerified: boolean;
  welcomeBonusGranted: boolean;  // Renommé de welcomeCreditsGranted
  error?: string;
};

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeReferralCode(value: unknown): string | undefined {
  const normalized = toOptionalString(value)?.toUpperCase();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function generateReferralCode(authUser: SupabaseAuthUser): string {
  const baseRaw =
    toOptionalString(authUser.user_metadata?.prenom) ||
    authUser.email?.split("@")[0] ||
    "MAHAI";

  const base = baseRaw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);

  const suffix = authUser.id.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `${base || "MAHAI"}-${suffix}`;
}

async function resolveReferrerUserId(
  referralCode: string | undefined,
  currentUserId: string,
): Promise<string | undefined> {
  if (!referralCode) {
    return undefined;
  }

  const referrerResult = await query(
    `SELECT id
     FROM "User"
     WHERE UPPER("referralCode") = $1
       AND id <> $2
     LIMIT 1`,
    [referralCode.toUpperCase(), currentUserId],
  );

  return referrerResult.rows[0]?.id;
}

async function grantReferredBonusIfEligible(userId: string): Promise<boolean> {
  const referralResult = await query(
    `SELECT id, "referredBonusAr"
     FROM "UserReferral"
     WHERE "referredUserId" = $1
       AND status = 'PENDING'
       AND "referredBonusGrantedAt" IS NULL
     LIMIT 1`,
    [userId],
  );

  const referral = referralResult.rows[0];
  if (!referral) {
    return false;
  }

  const settings = await getReferralSettings();
  const defaultBonusAr = settings.referredBonusAr ?? settings.referredBonus * 50; // Conversion si ancienne valeur
  const bonusAr = Number(referral.referredBonusAr) || defaultBonusAr;

  await query(
    `UPDATE "User"
     SET "balanceAr" = "balanceAr" + $1,
         "updatedAt" = NOW()
     WHERE id = $2`,
    [bonusAr, userId],
  );

  await query(
    `INSERT INTO "Transaction" ("id", "userId", "amountAr", type, description, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      crypto.randomUUID(),
      userId,
      bonusAr,
      "EARN",
      "Bonus parrainage filleul",
      "COMPLETED",
    ],
  );

  await query(
    `UPDATE "UserReferral"
     SET "referredBonusGrantedAt" = NOW(),
         "updatedAt" = NOW()
     WHERE id = $1`,
    [referral.id],
  );

  return true;
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

async function addWelcomeBonusIfNeeded(
  userId: string,
  currentBalanceAr: number,
): Promise<boolean> {
  if (currentBalanceAr !== 0) {
    return false;
  }

  const { welcomeBonusAr } = await getReferralSettings();
  const bonusAr = welcomeBonusAr ?? 1000; // Valeur par défaut: 1000 Ar (anciennement 20 crédits * 50)
  await updateUserBalanceAr(userId, bonusAr);

  await query(
    `INSERT INTO "Transaction" ("id", "userId", "amountAr", type, description, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      crypto.randomUUID(),
      userId,
      bonusAr,
      "EARN",
      "Bonus de bienvenue",
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
        welcomeBonusGranted: false,
        error: "Adresse email manquante sur le compte Supabase",
      };
    }

    const { welcomeBonus, referrerBonus, referredBonus, welcomeBonusAr, referrerBonusAr, referredBonusAr } = await getReferralSettings();
    const emailVerified = Boolean(authUser.email_confirmed_at);
    const referralCode = generateReferralCode(authUser);
    const requestedReferralCode = normalizeReferralCode(
      authUser.user_metadata?.referralCode,
    );
    let appUser = await getUserById(authUser.id);
    let created = false;
    let welcomeBonusGranted = false;

    if (!appUser) {
      const startingBalanceAr = emailVerified ? (welcomeBonusAr ?? welcomeBonus * 50) : 0;

      const referredByUserId = await resolveReferrerUserId(
        requestedReferralCode,
        authUser.id,
      );

      appUser = await createUser({
        id: authUser.id,
        email: normalizedEmail,
        prenom: resolvePrenom(authUser),
        nom: toOptionalString(authUser.user_metadata?.nom),
        role: getRoleFromMetadata(authUser.user_metadata?.role),
        balanceAr: startingBalanceAr,
        referralCode,
        referredByUserId,
        emailVerified,
        updatedAt: new Date(),
      });

      created = true;

      if (referredByUserId) {
        await query(
          `INSERT INTO "UserReferral" (
             "id",
             "referrerUserId",
             "referredUserId",
             status,
             "referrerBonusAr",
             "referredBonusAr"
           )
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT ("referredUserId") DO NOTHING`,
          [
            crypto.randomUUID(),
            referredByUserId,
            authUser.id,
            "PENDING",
            referrerBonusAr ?? referrerBonus * 50,
            referredBonusAr ?? referredBonus * 50,
          ],
        );
      }

      if (emailVerified && startingBalanceAr > 0) {
        await query(
          `INSERT INTO "Transaction" ("id", "userId", "amountAr", type, description, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            crypto.randomUUID(),
            authUser.id,
            welcomeBonusAr ?? welcomeBonus * 50,
            "EARN",
            "Bonus de bienvenue",
            "COMPLETED",
          ],
        );
        welcomeBonusGranted = true;
      }

      if (emailVerified && referredByUserId) {
        await grantReferredBonusIfEligible(authUser.id);
      }
    } else {
      if (appUser.email !== normalizedEmail || appUser.emailVerified !== emailVerified) {
        await query(
          'UPDATE "User" SET email = $1, "emailVerified" = $2, "updatedAt" = NOW() WHERE id = $3',
          [normalizedEmail, emailVerified, authUser.id],
        );
      }

      if (!appUser.referralCode) {
        await query(
          'UPDATE "User" SET "referralCode" = $1, "updatedAt" = NOW() WHERE id = $2 AND "referralCode" IS NULL',
          [referralCode, authUser.id],
        );
      }

      if (emailVerified) {
        welcomeBonusGranted = await addWelcomeBonusIfNeeded(
          authUser.id,
          appUser.balanceAr,
        );

        await grantReferredBonusIfEligible(authUser.id);
      }

      appUser = await getUserById(authUser.id);
    }

    return {
      appUser,
      created,
      emailVerified,
      welcomeBonusGranted,
    };
  } catch (error) {
    console.error("Erreur synchronisation utilisateur auth:", error);

    return {
      appUser: null,
      created: false,
      emailVerified: false,
      welcomeBonusGranted: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
