import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const result = await query(
      `SELECT id, status, amount, "creditsCount", "phoneNumber", "paymentMethod", "senderCode", "createdAt"
       FROM "CreditTransaction"
       WHERE id = $1 AND "userId" = $2`,
      [transactionId, session.user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    const tx = result.rows[0]
    return NextResponse.json({
      id: tx.id,
      status: tx.status,
      amount: tx.creditsCount || tx.amount,
      phoneNumber: tx.phoneNumber,
      paymentMethod: tx.paymentMethod,
      senderCode: tx.senderCode,
      createdAt: tx.createdAt,
    })
  } catch (err) {
    console.error('Erreur GET /api/payment/transaction', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { transactionCode } = await req.json()

    if (!transactionCode) {
      return NextResponse.json({ error: 'Code de transaction requis' }, { status: 400 })
    }

    // Vérifier que la transaction appartient à cet utilisateur et est encore en attente
    const checkResult = await query(
      `SELECT id, status FROM "CreditTransaction" WHERE id = $1 AND "userId" = $2`,
      [transactionId, session.user.id]
    )

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Transaction introuvable' }, { status: 404 })
    }

    if (checkResult.rows[0].status !== 'PENDING') {
      return NextResponse.json({ error: 'Transaction déjà traitée' }, { status: 400 })
    }

    // Mettre à jour le code de transaction
    const result = await query(
      `UPDATE "CreditTransaction" SET "senderCode" = $1 WHERE id = $2 AND "userId" = $3
       RETURNING id, status, amount, "creditsCount", "phoneNumber", "paymentMethod", "senderCode", "createdAt"`,
      [transactionCode, transactionId, session.user.id]
    )

    const tx = result.rows[0]
    return NextResponse.json({
      id: tx.id,
      status: tx.status,
      amount: tx.creditsCount || tx.amount,
      phoneNumber: tx.phoneNumber,
      paymentMethod: tx.paymentMethod,
      senderCode: tx.senderCode,
      createdAt: tx.createdAt,
    })
  } catch (err) {
    console.error('Erreur PATCH /api/payment/transaction', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
