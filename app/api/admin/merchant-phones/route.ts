import { NextResponse } from 'next/server'
import { verifyCsrf } from '@/lib/csrf'
import { query } from '@/lib/db'
import { requireAdmin, isAuthFailure } from '@/lib/auth-guards'

// Garde admin centralisée (cf. lib/auth-guards.ts)
async function checkAdmin() {
  const guard = await requireAdmin()
  if (isAuthFailure(guard)) return { error: guard.error, status: guard.status }
  return { userId: guard.userId }
}

// GET /api/admin/merchant-phones - Lister tous les numéros
export async function GET(request: Request) {
  const auth = await checkAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const result = await query(
      `SELECT * FROM "MerchantPhone" ORDER BY "operator", "createdAt" DESC`,
      []
    )
    return NextResponse.json({ phones: result.rows })
  } catch (err) {
    console.error('Admin GET merchant-phones error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/merchant-phones - Créer un numéro
export async function POST(request: Request) {
  const csrf = verifyCsrf(request)
  if (csrf.error) return NextResponse.json(csrf.error, { status: 403 })
  const auth = await checkAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { operator, phone, label, isActive = true, isDefault = false } = body

    if (!operator || !phone) {
      return NextResponse.json({ error: 'Opérateur et numéro requis' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO "MerchantPhone" ("operator", "phone", "label", "isActive", "isDefault") 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [operator, phone, label, isActive, isDefault]
    )

    return NextResponse.json({ phone: result.rows[0] })
  } catch (err) {
    console.error('Admin POST merchant-phones error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/admin/merchant-phones - Mettre à jour
export async function PATCH(request: Request) {
  const csrf = verifyCsrf(request)
  if (csrf.error) return NextResponse.json(csrf.error, { status: 403 })
  const auth = await checkAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const ALLOWED_COLUMNS = new Set(['operator', 'phone', 'label', 'isActive', 'isDefault'])
    const filteredKeys = Object.keys(updates).filter(k => ALLOWED_COLUMNS.has(k))

    if (filteredKeys.length === 0) {
      return NextResponse.json({ error: 'Aucun champ valide à mettre à jour' }, { status: 400 })
    }

    const setClause = filteredKeys.map((key, i) => `"${key}" = $${i + 2}`).join(', ')

    const result = await query(
      `UPDATE "MerchantPhone" SET ${setClause}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
      [id, ...filteredKeys.map(k => updates[k])]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ phone: result.rows[0] })
  } catch (err) {
    console.error('Admin PATCH merchant-phones error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/merchant-phones?id=xxx - Supprimer
export async function DELETE(request: Request) {
  const csrf = verifyCsrf(request)
  if (csrf.error) return NextResponse.json(csrf.error, { status: 403 })
  const auth = await checkAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await query('DELETE FROM "MerchantPhone" WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin DELETE merchant-phones error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}