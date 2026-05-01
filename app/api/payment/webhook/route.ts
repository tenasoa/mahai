import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { query } from "@/lib/db";

function verifyWebhookSignature(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const normalizedSignature = signature.startsWith("sha256=")
    ? signature.slice("sha256=".length)
    : signature;

  const actualBuffer = Buffer.from(normalizedSignature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

/**
 * POST /api/payment/webhook
 * Webhook pour recevoir les confirmations de paiement Mobile Money
 * Cette route est appelée par le service de paiement externe
 */
export async function POST(request: NextRequest) {
  try {
    if (process.env.ENABLE_MOBILE_MONEY_WEBHOOK !== "true") {
      return NextResponse.json(
        { error: "Webhook Mobile Money désactivé" },
        { status: 404 }
      );
    }

    const isSimulation = request.headers.get("x-simulation-mode") === "true" || 
                         process.env.NODE_ENV === "development";

    const payload = await request.text();

    // Vérifier la signature du webhook hors simulation/dev.
    const signature = request.headers.get("x-webhook-signature");
    const webhookSecret = process.env.MOBILE_MONEY_WEBHOOK_SECRET;
    if (!isSimulation && (!signature || !webhookSecret)) {
      return NextResponse.json(
        { error: "Signature webhook non configurée" },
        { status: 401 }
      );
    }

    if (!isSimulation && !verifyWebhookSignature(payload, signature!, webhookSecret!)) {
      return NextResponse.json(
        { error: "Signature invalide" },
        { status: 401 }
      );
    }

    const body = JSON.parse(payload);
    const {
      transactionId,
      status,
      operatorTransactionId,
      paidAt,
    } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: "Données manquantes" },
        { status: 400 }
      );
    }

    // Vérifier que la transaction existe
    const checkResult = await query(
      `SELECT id, status, "creditsCount", "userId" 
       FROM "CreditTransaction" 
       WHERE id = $1`,
      [transactionId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Transaction introuvable" },
        { status: 404 }
      );
    }

    const transaction = checkResult.rows[0];

    // Si déjà complétée, ignorer
    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ status: "already_processed" });
    }

    // Mettre à jour le statut de la transaction
    if (status === "SUCCESS") {
      await query(
        `UPDATE "CreditTransaction" 
         SET status = 'COMPLETED', 
             "senderCode" = $1,
             metadata = metadata || $2::jsonb
         WHERE id = $3`,
        [
          operatorTransactionId || "",
          JSON.stringify({ 
            webhookProcessed: true, 
            processedAt: new Date().toISOString(),
            paidAt: paidAt || new Date().toISOString()
          }),
          transactionId,
        ]
      );

      // Créditer l'utilisateur
      await query(
        `UPDATE "User" 
         SET credits = COALESCE(credits, 0) + $1 
         WHERE id = $2`,
        [transaction.creditsCount, transaction.userId]
      );

      return NextResponse.json({
        status: "completed",
        creditsAdded: transaction.creditsCount,
      });
    } else if (status === "FAILED") {
      await query(
        `UPDATE "CreditTransaction" 
         SET status = 'FAILED',
             metadata = metadata || $1::jsonb
         WHERE id = $2`,
        [
          JSON.stringify({ 
            failureReason: body.failureReason || "unknown",
            webhookProcessed: true,
            processedAt: new Date().toISOString()
          }),
          transactionId,
        ]
      );

      return NextResponse.json({ status: "marked_failed" });
    }

    return NextResponse.json({ status: "ignored", receivedStatus: status });
  } catch (error) {
    console.error("Webhook payment error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/webhook
 * Health check pour le webhook
 */
export async function GET() {
  if (process.env.ENABLE_MOBILE_MONEY_WEBHOOK !== "true") {
    return NextResponse.json({
      status: "disabled",
      endpoint: "/api/payment/webhook",
    });
  }

  return NextResponse.json({
    status: "active",
    endpoint: "/api/payment/webhook",
    methods: ["POST"],
    timestamp: new Date().toISOString(),
  });
}
