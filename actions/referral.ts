"use server";

import { query } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getReferralSettings } from "@/lib/settings";

export type ReferralItem = {
  id: string;
  referredUserId: string;
  referredName: string;
  referredEmail: string;
  createdAt: string;
  status: "PENDING" | "COMPLETED" | "CANCELED";
  bonusCredits: number;
};

export type ReferralDashboardData = {
  referralCode: string;
  referralLink: string;
  invitedCount: number;
  activeCount: number;
  creditsGained: number;
  referrals: ReferralItem[];
  settings: {
    welcomeBonus: number;
    referrerBonus: number;
    referredBonus: number;
  };
};

const DEFAULT_SITE_URL = "http://localhost:3000";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || DEFAULT_SITE_URL;
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user.id;
}

function buildFallbackReferralCode(userId: string) {
  const suffix = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
  return `MAHAI-${suffix}`;
}

export async function getReferralDashboardAction(): Promise<{
  success: boolean;
  data?: ReferralDashboardData;
  error?: string;
}> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return { success: false, error: "Utilisateur non authentifié" };
    }

    const userResult = await query(
      'SELECT "referralCode" FROM "User" WHERE id = $1 LIMIT 1',
      [userId],
    );

    let referralCode: string | null = userResult.rows[0]?.referralCode || null;

    if (!referralCode) {
      referralCode = buildFallbackReferralCode(userId);
      await query(
        'UPDATE "User" SET "referralCode" = $1, "updatedAt" = NOW() WHERE id = $2 AND "referralCode" IS NULL',
        [referralCode, userId],
      );
    }

    const statsResult = await query(
      `SELECT
         COUNT(*)::int AS "invitedCount",
         COUNT(*) FILTER (WHERE ur.status = 'COMPLETED')::int AS "activeCount",
         COALESCE(SUM(ur."referrerBonusCredits") FILTER (WHERE ur."referrerBonusGrantedAt" IS NOT NULL), 0)::int AS "creditsGained"
       FROM "UserReferral" ur
       WHERE ur."referrerUserId" = $1`,
      [userId],
    );

    const referralsResult = await query(
      `SELECT
         ur.id,
         ur."referredUserId",
         ur.status,
         ur."referrerBonusCredits",
         ur."createdAt",
         u.prenom,
         u.nom,
         u.email
       FROM "UserReferral" ur
       JOIN "User" u ON u.id = ur."referredUserId"
       WHERE ur."referrerUserId" = $1
       ORDER BY ur."createdAt" DESC
       LIMIT 100`,
      [userId],
    );

    const stats = statsResult.rows[0] || {
      invitedCount: 0,
      activeCount: 0,
      creditsGained: 0,
    };

    const referrals: ReferralItem[] = referralsResult.rows.map((row: any) => ({
      id: row.id,
      referredUserId: row.referredUserId,
      referredName: [row.prenom, row.nom].filter(Boolean).join(" ") || "Utilisateur",
      referredEmail: row.email || "",
      createdAt: row.createdAt,
      status: row.status,
      bonusCredits: Number(row.referrerBonusCredits) || 20,
    }));

    const referralLink = `${getSiteUrl()}/auth/register?ref=${encodeURIComponent(referralCode || "")}`;

    return {
      success: true,
      data: {
        referralCode: referralCode || "",
        referralLink,
        invitedCount: Number(stats.invitedCount) || 0,
        activeCount: Number(stats.activeCount) || 0,
        creditsGained: Number(stats.creditsGained) || 0,
        referrals,
        settings: await getReferralSettings(),
      },
    };
  } catch (error) {
    console.error("Erreur getReferralDashboardAction:", error);
    return { success: false, error: "Impossible de charger vos données de parrainage" };
  }
}
