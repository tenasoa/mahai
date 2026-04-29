import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import {
  initializeReferralSettings,
  getReferralSettingsForAdmin,
} from "@/actions/referral-settings";

/**
 * GET /api/referral/health
 * Vérifie la santé du système de parrainage (localhost uniquement)
 */
export async function GET(request: Request) {
  try {
    // Vérifier que c'est une demande locale ou authentifiée
    const host = request.headers.get("host");
    const isLocalhost =
      host?.includes("localhost") || host?.includes("127.0.0.1");

    if (!isLocalhost) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // 1. Initialiser les settings
    const initResult = await initializeReferralSettings();

    // 2. Récupérer les settings
    const settingsResult = await getReferralSettingsForAdmin();

    // 3. Vérifier la structure de la DB
    const dbChecks = await Promise.all([
      query(`SELECT COUNT(*) as count FROM "SystemSetting" WHERE key IN ('WELCOME_BONUS_CREDITS', 'REFERRAL_BONUS_CREDITS', 'REFERRED_BONUS_CREDITS')`),
      query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'UserReferral' LIMIT 1`),
      query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'User' AND column_name IN ('referralCode', 'referredByUserId') LIMIT 1`),
    ]);

    const healthStatus = {
      settingsExist: parseInt(dbChecks[0].rows[0]?.count || '0') === 3,
      userReferralTableExists: dbChecks[1].rows.length > 0,
      userReferralColumnsExist: dbChecks[2].rows.length > 0,
    };

    return NextResponse.json({
      status: "ok",
      initialization: initResult,
      settings: settingsResult,
      database: healthStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur /api/referral/health:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}
