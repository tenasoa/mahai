"use server";

import { revalidatePath } from "next/cache";
import { query, transaction } from "@/lib/db";
import { findExistingPurchase } from "@/lib/sql-queries";
import { db } from "@/lib/db-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSystemSetting } from "@/lib/settings";
import { logger } from "@/lib/logger";
import { notifyStreakMilestone } from "@/lib/notifications";

export interface UpcomingExam {
  id: string;
  title: string;
  date: string;
  slot: string;
  center: string;
  readiness: number;
}

export interface WeeklyProgress {
  day: string;
  solved: number;
}

export interface DashboardData {
  upcomingExams: UpcomingExam[];
  weeklyProgress: WeeklyProgress[];
  totalSolved: number;
  examCount: number;
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

async function grantReferrerBonusOnFirstPurchase(
  client: any,
  referredUserId: string,
  defaultBonusAr: number = 1000,
) {
  const referralResult = await client.query(
    `SELECT id, "referrerUserId"
     FROM "UserReferral"
     WHERE "referredUserId" = $1
       AND status = 'PENDING'
       AND "referrerBonusGrantedAt" IS NULL
     LIMIT 1`,
    [referredUserId],
  );

  const referral = referralResult.rows[0];
  if (!referral) {
    return;
  }

  const bonusAr = defaultBonusAr;

  await client.query(
    `UPDATE "User"
     SET "balanceAr" = "balanceAr" + $1,
         "updatedAt" = NOW()
     WHERE id = $2`,
    [bonusAr, referral.referrerUserId],
  );

  await client.query(
    `INSERT INTO "Transaction" ("id", "userId", "amountAr", type, description, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      crypto.randomUUID(),
      referral.referrerUserId,
      bonusAr,
      "EARN",
      "Bonus parrainage parrain",
      "COMPLETED",
    ],
  );

  await client.query(
    `UPDATE "UserReferral"
     SET status = 'COMPLETED',
         "activatedAt" = NOW(),
         "referrerBonusGrantedAt" = NOW(),
         "updatedAt" = NOW()
     WHERE id = $1`,
    [referral.id],
  );
}

export async function getCurrentUserBalanceAr() {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return 0;
    }

    const result = await query('SELECT "balanceAr" FROM "User" WHERE id = $1', [
      userId,
    ]);
    return result.rows[0]?.balanceAr || 0;
  } catch (error) {
    logger.apiError("getUserBalance", error);
    return 0;
  }
}

export async function purchaseCurrentUserSubject(subjectId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return {
        success: false,
        error: "Vous devez être connecté pour acheter un sujet",
      };
    }

    const [subjectResult, userResult] = await Promise.all([
      query('SELECT id, titre, prix FROM "Subject" WHERE id = $1', [subjectId]),
      query('SELECT id, "balanceAr" FROM "User" WHERE id = $1', [userId]),
    ]);

    const subject = subjectResult.rows[0];
    const user = userResult.rows[0];

    if (!subject || !user) {
      return { success: false, error: "Sujet ou utilisateur introuvable" };
    }

    const existingPurchase = await findExistingPurchase(userId, subjectId);
    if (existingPurchase) {
      return {
        success: true,
        alreadyOwned: true,
        remainingBalance: user.balanceAr,
      };
    }

    if (user.balanceAr < subject.prix) {
      return { success: false, error: "Solde insuffisant" };
    }

    const remainingBalance = user.balanceAr - subject.prix;
    // Lit le bonus parrain en Ariary (valeur DB en Ar, default 1000 Ar = 20 cr × 50).
    const referrerBonusDefault = await getSystemSetting(
      "REFERRER_BONUS_AR",
      1000,
    );

    await transaction(async (client) => {
      await client.query(
        'UPDATE "User" SET "balanceAr" = "balanceAr" - $1, "updatedAt" = NOW() WHERE id = $2',
        [subject.prix, userId],
      );

      await client.query(
        `INSERT INTO "Purchase" ("id", "userId", "subjectId", "amountAr", status)
         VALUES ($1, $2, $3, $4, $5)`,
        [crypto.randomUUID(), userId, subjectId, subject.prix, "COMPLETED"],
      );

      await client.query(
        `INSERT INTO "Transaction" ("id", "userId", "amountAr", type, description, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          crypto.randomUUID(),
          userId,
          -subject.prix,
          "SPEND",
          `Achat du sujet: ${subject.titre}`,
          "COMPLETED",
        ],
      );

      await grantReferrerBonusOnFirstPurchase(
        client,
        userId,
        referrerBonusDefault,
      );
    });

    revalidatePath("/catalogue");
    revalidatePath(`/sujet/${subjectId}`);
    revalidatePath("/profil");
    revalidatePath("/dashboard");

    return {
      success: true,
      remainingBalance,
    };
  } catch (error) {
    logger.apiError("purchaseSubject", error);
    return { success: false, error: "Erreur lors de la transaction" };
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return {
        upcomingExams: [],
        weeklyProgress: [],
        totalSolved: 0,
        examCount: 0,
      };
    }

    // Récupérer les examens blancs de l'utilisateur (limit 3).
    // L'enum "ExamenStatus" en DB est : NOT_STARTED | IN_PROGRESS | SUBMITTED |
    // GRADED. Les états terminaux (SUBMITTED + GRADED) correspondent à ce
    // qu'on appelait par erreur "COMPLETED" — corrigé pour éviter
    // « invalid input value for enum ExamenStatus: COMPLETED ».
    const examsResult = await query(
      `SELECT id, titre, "typeExamen", matiere, annee, "dureeSecondes",
              status, "startedAt", "submittedAt", score, "scoreMax"
       FROM "ExamenBlanc"
       WHERE "userId" = $1 AND status IN ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED')
       ORDER BY "createdAt" DESC
       LIMIT 3`,
      [userId],
    );

    const upcomingExams: UpcomingExam[] = examsResult.rows.map((exam: any) => ({
      id: exam.id,
      title: exam.titre || `${exam.typeExamen} ${exam.matiere}`,
      date: exam.startedAt || new Date().toISOString().split("T")[0],
      slot: formatDuration(exam.dureeSecondes || 10800),
      center: "Session personnelle",
      readiness:
        exam.score && exam.scoreMax
          ? Math.round((exam.score / exam.scoreMax) * 100)
          : 0,
    }));

    // Récupérer les sujets résolus cette semaine (simulé à partir des achats récents)
    const weekResult = await query(
      `SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
       FROM "Purchase"
       WHERE "userId" = $1
         AND status = 'COMPLETED'
         AND "createdAt" >= NOW() - INTERVAL '7 days'
       GROUP BY DATE_TRUNC('day', "createdAt")
       ORDER BY day`,
      [userId],
    );

    // Construire la progression hebdomadaire
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const weeklyProgress: WeeklyProgress[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = dayNames[date.getDay()];
      const dayStr = date.toISOString().split("T")[0];

      const dayData = weekResult.rows.find((r: any) =>
        r.day?.toISOString().startsWith(dayStr),
      );
      weeklyProgress.push({
        day: dayName,
        solved: parseInt(dayData?.count || "0"),
      });
    }

    // Total résolu = nombre d'achats complétés
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM "Purchase" WHERE "userId" = $1 AND status = 'COMPLETED'`,
      [userId],
    );

    return {
      upcomingExams,
      weeklyProgress,
      totalSolved: parseInt(totalResult.rows[0]?.total || "0"),
      examCount: examsResult.rowCount || 0,
    };
  } catch (error) {
    logger.apiError("getDashboardData", error);
    return {
      upcomingExams: [],
      weeklyProgress: [],
      totalSolved: 0,
      examCount: 0,
    };
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0 && mins > 0) return `${hours}h${mins}`;
  if (hours > 0) return `${hours}h`;
  return `${mins}min`;
}

export interface StreakWeekDay {
  date: string;
  count: number;
  isToday: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  weekDays: StreakWeekDay[];
  todayDone: boolean;
}

/**
 * Récupère les données de streak de l'utilisateur connecté.
 * Calcule le streak actuel, le record, l'activité des 7 jours de la semaine en cours.
 */
export async function getStreakDataAction(): Promise<StreakData | null> {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return null;

    // Récupérer toutes les dates distinctes avec activité, triées par date décroissante
    const dateRows = await query(
      `SELECT DISTINCT date
       FROM "DailyActivity"
       WHERE "userId" = $1
       ORDER BY date DESC`,
      [userId],
    );

    const activeDates: string[] = dateRows.rows.map((r: any) => {
      const d = r.date instanceof Date ? r.date : new Date(r.date);
      return d.toISOString().split("T")[0];
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const todayDone = activeDates.length > 0 && activeDates[0] === todayStr;

    // --- Calcul du streak actuel ---
    // On part de la date la plus récente (aujourd'hui si todayDone, sinon hier)
    // et on remonte tant que les jours sont consécutifs.
    let currentStreak = 0;
    if (activeDates.length > 0) {
      const cursor = new Date(
        todayDone
          ? todayStr + "T00:00:00"
          : new Date(Date.now() - 86400000).toISOString().split("T")[0] +
              "T00:00:00",
      );
      const activeSet = new Set(activeDates);
      while (true) {
        const cursorStr = cursor.toISOString().split("T")[0];
        if (activeSet.has(cursorStr)) {
          currentStreak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // --- Calcul du record (plus long streak historique) ---
    let longestStreak = 0;
    if (activeDates.length > 0) {
      const sorted = [...activeDates].sort(); // ordre chronologique
      let run = 1;
      for (let i = 1; i < sorted.length; i++) {
        const prev = new Date(sorted[i - 1] + "T00:00:00");
        const curr = new Date(sorted[i] + "T00:00:00");
        const diffDays = Math.round(
          (curr.getTime() - prev.getTime()) / 86400000,
        );
        if (diffDays === 1) {
          run++;
        } else {
          longestStreak = Math.max(longestStreak, run);
          run = 1;
        }
      }
      longestStreak = Math.max(longestStreak, run);
    }

    // --- Activité sur les 7 jours de la semaine en cours (lundi → dimanche) ---
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0=Dim, 1=Lun, ..., 6=Sam
    const mondayOffset = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    // Requête des comptes par jour sur la semaine
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    const mondayStr = monday.toISOString().split("T")[0];

    const weekResult = await query(
      `SELECT date, COUNT(*) as count
       FROM "DailyActivity"
       WHERE "userId" = $1
         AND date >= $2::date
         AND date <= $3::date
       GROUP BY date
       ORDER BY date`,
      [userId, mondayStr, todayStr],
    );

    const countMap = new Map<string, number>();
    for (const r of weekResult.rows) {
      const d =
        r.date instanceof Date
          ? r.date.toISOString().split("T")[0]
          : String(r.date).split("T")[0];
      countMap.set(d, parseInt(r.count || "0"));
    }

    const weekDays: StreakWeekDay[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      weekDays.push({
        date: dateStr,
        count: countMap.get(dateStr) || 0,
        isToday: dateStr === todayStr,
      });
    }

    return { currentStreak, longestStreak, weekDays, todayDone };
  } catch (error) {
    logger.apiError("getStreakDataAction", error);
    return null;
  }
}

export async function recordDailyActivityAction(
  type: string,
  metadata?: Record<string, unknown>,
) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return { success: false, error: "Non authentifié" };

    await db.dailyActivity.record(userId, type, metadata);
    return { success: true };
  } catch (error) {
    logger.apiError("recordDailyActivity", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Server action appelée par le StreakWidget quand un milestone est atteint.
 * Vérifie l'authentification puis délègue à notifyStreakMilestone().
 */
export async function notifyStreakMilestoneAction(streakDays: number) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) return;
    await notifyStreakMilestone(userId, streakDays);
  } catch (error) {
    // Best-effort : ne pas bloquer l'UI
    console.error("notifyStreakMilestoneAction error:", error);
  }
}
