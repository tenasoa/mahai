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

// GET /api/admin/credit-packs - Lister tous les packs
export async function GET(request: Request) {
  const auth = await checkAdmin()
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
  const csrf = verifyCsrf(request)
  if (csrf.error) return NextResponse.json(csrf.error, { status: 403 })
  const auth = await checkAdmin()
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  // POST /api/admin/credit-packs - Créer un pack
  try {
    const body = await request.json()
    const {
      name,
      // arAmount = prix en Ariary, bonusAr = bonus en Ariary
      arAmount,
      bonusAr = 0,
      // Compat ascendante : on accepte encore les anciennes clés `price`/`bonus`
      price,
      bonus,
      // `credits` correspond désormais au compteur d'unités du pack (= arAmount)
      credits,
      isPopular = false,
      isActive = true,
      sortOrder = 0,
    } = body

    const finalArAmount = arAmount ?? price ?? credits
    const finalBonusAr = bonusAr ?? bonus ?? 0
    const finalCredits = credits ?? finalArAmount

    if (!name || finalArAmount === undefined || finalArAmount === null) {
      return NextResponse.json({ error: 'Nom et montant en Ar requis' }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO "CreditPack" ("name", "credits", "arAmount", "bonusAr", "isPopular", "isActive", "sortOrder")
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, finalCredits, finalArAmount, finalBonusAr, isPopular, isActive, sortOrder]
    )

    return NextResponse.json({ pack: result.rows[0] })
  } catch (err) {
    console.error('Admin POST credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH /api/admin/credit-packs - Mettre à jour
//
// ⚠ Sécurité : on whitelist strictement les colonnes éditables. Sans cette
// liste, un attaquant pouvant atteindre cette route (admin compromis ou
// CSRF rare via Server Action wrapper) pourrait injecter une clé arbitraire
// comme `id="; DROP TABLE`, ou modifier des colonnes sensibles non
// destinées à l'édition (createdAt, etc.).
const ALLOWED_PACK_COLUMNS = new Set([
  'name',
  'credits',
  'arAmount',
  'bonusAr',
  'isPopular',
  'isActive',
  'sortOrder',
])

// Mapping legacy → nouvelles colonnes pour les payloads encore au format ancien.
const LEGACY_COLUMN_MAP: Record<string, string> = {
  price: 'arAmount',
  bonus: 'bonusAr',
}

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

    // Normaliser les clés legacy (price/bonus) vers les nouvelles colonnes.
    const normalised: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(updates)) {
      const target = LEGACY_COLUMN_MAP[k] ?? k
      normalised[target] = v
    }

    // Filtre + reject : ignore les clés inconnues, refuse si toutes sont rejetées.
    const safeKeys = Object.keys(normalised).filter((k) => ALLOWED_PACK_COLUMNS.has(k))
    const rejectedKeys = Object.keys(normalised).filter((k) => !ALLOWED_PACK_COLUMNS.has(k))

    if (safeKeys.length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ valide à mettre à jour.', rejected: rejectedKeys },
        { status: 400 },
      )
    }

    if (rejectedKeys.length > 0) {
      console.warn(
        `[admin/credit-packs PATCH] Champs rejetés (non-whitelist): ${rejectedKeys.join(', ')}`,
      )
    }

    const setClause = safeKeys.map((key, i) => `"${key}" = $${i + 2}`).join(', ')
    const values = safeKeys.map((k) => normalised[k])

    const result = await query(
      `UPDATE "CreditPack" SET ${setClause}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values],
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

    await query('DELETE FROM "CreditPack" WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin DELETE credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}