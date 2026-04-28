import { NextResponse } from "next/server";
import { testReferralSystem } from "@/__tests__/referral-system.test";
import {
  initializeReferralSettings,
  getReferralSettingsForAdmin,
} from "@/actions/referral-settings";

/**
 * GET /api/referral/health
 * Test le système de parrainage et initialise les settings
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

    // 3. Exécuter les tests
    const testResult = await testReferralSystem();

    return NextResponse.json({
      status: "ok",
      initialization: initResult,
      settings: settingsResult,
      tests: testResult,
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
