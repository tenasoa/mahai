import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    // 1. Récupérer les numéros de la table UserPhone
    const phonesResult = await query(
      'SELECT id, phone, provider, label, "createdAt" FROM "UserPhone" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
      [session.user.id]
    )

    let phones = phonesResult.rows

    // 2. Si aucun numéro dans UserPhone, récupérer le numéro principal du profil
    if (phones.length === 0) {
      const userResult = await query(
        'SELECT phone FROM "User" WHERE id = $1 AND phone IS NOT NULL',
        [session.user.id]
      )

      if (userResult.rows.length > 0 && userResult.rows[0].phone) {
        const primaryPhone = userResult.rows[0].phone
        // Détecter l'opérateur automatiquement
        const p = primaryPhone.replace(/\s/g, '')
        const prefix3 = p.substring(0, 3)
        let provider = 'unknown'
        if (['034', '038'].includes(prefix3)) provider = 'mvola'
        else if (['032', '037'].includes(prefix3)) provider = 'orange'
        else if (prefix3 === '033') provider = 'airtel'

        phones = [{
          id: 'primary',
          phone: primaryPhone,
          provider: provider,
          label: 'Principal',
          createdAt: new Date().toISOString()
        }]
      }
    }

    return NextResponse.json(phones)
  } catch (err) {
    console.error('GET /api/user/phones error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { phone, provider, label } = await req.json()
    
    if (!phone || !provider) {
      return NextResponse.json({ error: 'Numéro et opérateur requis' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO "UserPhone" (id, "userId", phone, provider, label) 
       VALUES (gen_random_uuid()::TEXT, $1, $2, $3, $4) 
       RETURNING *`,
      [session.user.id, phone, provider, label || null]
    )
    
    return NextResponse.json(result.rows[0])
  } catch (err) {
    console.error('POST /api/user/phones error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user || !id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    await query(
      'DELETE FROM "UserPhone" WHERE id = $1 AND "userId" = $2',
      [id, session.user.id]
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/user/phones error', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
