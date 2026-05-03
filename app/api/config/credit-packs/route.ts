import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/config/credit-packs - Récupérer les packs de recharge actifs
// Système unifié en Ariary : `arAmount` est le prix payé, `bonusAr` le bonus offert.
// Le champ `credits` est conservé en DB comme compteur d'unités du pack mais
// n'a plus de sens monétaire (1 unité = 1 Ar côté solde).
export async function GET() {
  try {
    const result = await query(
      `SELECT "id", "name", "credits", "arAmount", "bonusAr", "isPopular"
       FROM "CreditPack"
       WHERE "isActive" = true
       ORDER BY "sortOrder", "arAmount"`,
      []
    )

    const packs = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      // Champ legacy `credits` exposé pour compat — désormais identique au montant Ar crédité.
      credits: row.arAmount,
      price: row.arAmount,
      bonus: row.bonusAr || 0,
      arAmount: row.arAmount,
      bonusAr: row.bonusAr || 0,
      popular: row.isPopular || false,
    }))

    // arPerCredit = 1 (legacy field) puisque tout est désormais en Ariary.
    return NextResponse.json({ packs, arPerCredit: 1 })
  } catch (err) {
    console.error('GET /api/config/credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
