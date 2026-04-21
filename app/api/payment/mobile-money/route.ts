import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { packId, phone, operator, amount, credits } = await req.json()

    if (!packId || !phone || !operator || !amount || !credits) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO "CreditTransaction" (id, "userId", type, amount, "creditsCount", "phoneNumber", "paymentMethod", status, "senderCode", metadata)
       VALUES (gen_random_uuid()::TEXT, $1, 'RECHARGE', $2, $3, $4, $5, 'PENDING', '', $6::jsonb)
       RETURNING id, status`,
      [
        session.user.id,
        amount,
        credits,
        phone,
        operator,
        JSON.stringify({ operator, packId }),
      ]
    )

    return NextResponse.json({
      transactionId: result.rows[0].id,
      status: result.rows[0].status,
    })
  } catch (err) {
    console.error('Erreur POST /api/payment/mobile-money', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
