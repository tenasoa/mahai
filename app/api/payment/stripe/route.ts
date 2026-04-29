import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
 * POST /api/payment/stripe
 * Crée une session de paiement Stripe Checkout
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { packId, credits, amount } = body;

    if (!packId || !credits || !amount) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    // Créer une transaction en base (statut PENDING)
    const transactionResult = await query(
      `INSERT INTO "CreditTransaction" (
        id, "userId", type, amount, "creditsCount", 
        "paymentMethod", status, metadata
      ) VALUES (
        gen_random_uuid()::TEXT, $1, 'RECHARGE', $2, $3,
        'STRIPE', 'PENDING', $4::jsonb
      ) RETURNING id`,
      [
        user.id,
        amount,
        credits,
        JSON.stringify({ 
          packId, 
          stripe: true,
          createdAt: new Date().toISOString() 
        }),
      ]
    );

    const transactionId = transactionResult.rows[0].id;

    // Créer la session Stripe Checkout
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur", // ou "usd" selon ta préférence
            product_data: {
              name: `Pack ${credits} Crédits`,
              description: `Recharge de ${credits} crédits pour Mah.AI`,
            },
            unit_amount: amount, // en centimes (ex: 5000 = 50.00 EUR)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/recharge/success?session_id={CHECKOUT_SESSION_ID}&tx=${transactionId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/recharge/cancel?tx=${transactionId}`,
      metadata: {
        transactionId,
        userId: user.id,
        credits: credits.toString(),
      },
    });

    // Mettre à jour la transaction avec l'ID Stripe
    await query(
      `UPDATE "CreditTransaction" 
       SET "senderCode" = $1,
           metadata = metadata || $2::jsonb
       WHERE id = $3`,
      [
        session.id,
        JSON.stringify({ stripeSessionId: session.id }),
        transactionId,
      ]
    );

    return NextResponse.json({
      success: true,
      transactionId,
      sessionId: session.id,
      url: session.url, // URL à rediriger pour payer
    });
  } catch (error) {
    console.error("Erreur Stripe checkout:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/stripe
 * Vérifier le statut d'une session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json({ error: "session_id requis" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      id: session.id,
      status: session.payment_status,
      amount_total: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
    });
  } catch (error) {
    console.error("Erreur récupération session:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur serveur" },
      { status: 500 }
    );
  }
}
