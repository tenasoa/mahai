import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Vérifier si l'utilisateur est admin
async function checkAdmin(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    return { error: 'Non authentifié', status: 401 }
  }

  const userResult = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const role = userResult.rows[0]?.role
  if (!role || String(role).toUpperCase() !== 'ADMIN') {
    return { error: 'Accès interdit', status: 403 }
  }

  return { userId: session.user.id }
}

// GET /api/admin/credit-packs - Lister tous les packs
export async function GET(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const result = await query(
      `SELECT * FROM "CreditPack" ORDER BY "sortOrder", "credits"`,
      []
    )
    return NextResponse.json({ packs: result.rows })
  } catch (err) {
    console.error('Admin GET credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/credit-packs - Créer un pack
export async function POST(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { name, credits, price, bonus = 0, isPopular = false, isActive = true, sortOrder = 0 } = body

    if (!name || credits === undefined || price === undefined) {
      return NextResponse.json({ error: 'Nom, crédits et prix requis' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO "CreditPack" ("name", "credits", "price", "bonus", "isPopular", "isActive", "sortOrder") 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, credits, price, bonus, isPopular, isActive, sortOrder]
    )

    return NextResponse.json({ pack: result.rows[0] })
  } catch (err) {
    console.error('Admin POST credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/admin/credit-packs - Mettre à jour
export async function PATCH(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const setClause = Object.keys(updates)
      .map((key, i) => `"${key}" = $${i + 2}`)
      .join(', ')

    const result = await query(
      `UPDATE "CreditPack" SET ${setClause}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ pack: result.rows[0] })
  } catch (err) {
    console.error('Admin PATCH credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/credit-packs?id=xxx - Supprimer
export async function DELETE(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await query('DELETE FROM "CreditPack" WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin DELETE credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
