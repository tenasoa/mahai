import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import Stripe from "stripe";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY non configuré");
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
  });
}

/**
 * POST /api/payment/stripe/webhook
 * Webhook Stripe pour confirmer les paiements
 */
export async function POST(request: NextRequest) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur vérification signature";
    console.error("Webhook Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Event received: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    if (!metadata?.transactionId || !metadata?.userId || !metadata?.credits) {
      console.error("[Stripe Webhook] Metadata manquante:", metadata);
      return NextResponse.json({ received: true });
    }

    const { transactionId, userId, credits } = metadata;

    try {
      const existing = await query(
        `SELECT status FROM "CreditTransaction" WHERE id = $1`,
        [transactionId]
      );

      if (existing.rows[0]?.status === "COMPLETED") {
        console.log(`[Stripe Webhook] Transaction ${transactionId} déjà traitée`);
        return NextResponse.json({ received: true, status: "already_processed" });
      }

      await query(
        `UPDATE "CreditTransaction" 
         SET status = 'COMPLETED',
             metadata = metadata || $1::jsonb
         WHERE id = $2`,
        [
          JSON.stringify({
            stripePaymentIntent: session.payment_intent,
            stripeSessionId: session.id,
            processedAt: new Date().toISOString(),
          }),
          transactionId,
        ]
      );

      await query(
        `UPDATE "User" 
         SET credits = COALESCE(credits, 0) + $1 
         WHERE id = $2`,
        [parseInt(credits), userId]
      );

      console.log(`[Stripe Webhook] ${credits} crédits ajoutés à ${userId}`);
    } catch (error) {
      console.error("[Stripe Webhook] Erreur traitement:", error);
      return NextResponse.json({ error: "Erreur traitement" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
