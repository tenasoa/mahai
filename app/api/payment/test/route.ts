import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/payment/test
 * Crée une transaction de test et simule immédiatement le webhook
 * Usage: curl -X POST http://localhost:3000/api/payment/test \
 *   -H "Cookie: ..." \
 *   -d '{"amount": 5000, "credits": 100, "status": "SUCCESS"}'
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Parser le body
    const body = await request.json();
    const { amount = 5000, credits = 100, status = "SUCCESS" } = body;

    // 1. Créer une transaction de test
    const transactionResult = await query(
      `INSERT INTO "CreditTransaction" (
        id, "userId", type, amount, "creditsCount", "phoneNumber", 
        "paymentMethod", status, "senderCode", metadata
      ) VALUES (
        gen_random_uuid()::TEXT, $1, 'RECHARGE', $2, $3, '+261340000000',
        'TEST', 'PENDING', '', $4::jsonb
      ) RETURNING id`,
      [user.id, amount, credits, JSON.stringify({ test: true, createdAt: new Date().toISOString() })]
    );

    const transactionId = transactionResult.rows[0].id;

    // 2. Simuler le webhook immédiatement
    if (status === "SUCCESS") {
      // Mettre à jour la transaction
      await query(
        `UPDATE "CreditTransaction" 
         SET status = 'COMPLETED', 
             "senderCode" = $1,
             metadata = metadata || $2::jsonb
         WHERE id = $3`,
        [
          `TEST-${Date.now()}`,
          JSON.stringify({ 
            webhookProcessed: true, 
            simulated: true,
            processedAt: new Date().toISOString(),
            paidAt: new Date().toISOString()
          }),
          transactionId,
        ]
      );

      // Créditer l'utilisateur
      await query(
        `UPDATE "User" 
         SET credits = COALESCE(credits, 0) + $1 
         WHERE id = $2`,
        [credits, user.id]
      );

      // Récupérer le nouveau solde
      const userResult = await query(
        `SELECT credits FROM "User" WHERE id = $1`,
        [user.id]
      );

      return NextResponse.json({
        success: true,
        transactionId,
        status: "COMPLETED",
        creditsAdded: credits,
        newBalance: userResult.rows[0]?.credits || null,
        message: `✅ Test réussi! ${credits} crédits ajoutés. Nouveau solde: ${userResult.rows[0]?.credits || 'N/A'}`,
      });
    } else {
      // Simuler un échec
      await query(
        `UPDATE "CreditTransaction" 
         SET status = 'FAILED',
             metadata = metadata || $1::jsonb
         WHERE id = $2`,
        [
          JSON.stringify({ 
            failureReason: "Test échec - Solde insuffisant",
            simulated: true,
            processedAt: new Date().toISOString()
          }),
          transactionId,
        ]
      );

      return NextResponse.json({
        success: true,
        transactionId,
        status: "FAILED",
        creditsAdded: 0,
        message: "❌ Test échec simulé - Aucun crédit ajouté",
      });
    }
  } catch (error) {
    console.error("Erreur test paiement:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/test
 * Info sur l'endpoint de test
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/payment/test",
    description: "Crée une transaction de test et simule le webhook",
    usage: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: {
        amount: "Montant en Ariary (défaut: 5000)",
        credits: "Nombre de crédits (défaut: 100)",
        status: "SUCCESS ou FAILED (défaut: SUCCESS)",
      },
    },
    examples: [
      "curl -X POST http://localhost:3000/api/payment/test -H \"Content-Type: application/json\" -d '{\"amount\":10000,\"credits\":200}'",
      "curl -X POST http://localhost:3000/api/payment/test -H \"Content-Type: application/json\" -d '{\"status\":\"FAILED\"}'",
    ],
  });
}
