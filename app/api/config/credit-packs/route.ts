import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/config/credit-packs - Récupérer les packs de crédits actifs
export async function GET() {
  try {
    const result = await query(
      `SELECT "id", "name", "credits", "price", "bonus", "isPopular"
       FROM "CreditPack" 
       WHERE "isActive" = true 
       ORDER BY "sortOrder", "credits`,
      []
    )

    const packs = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      credits: row.credits,
      price: row.price,
      bonus: row.bonus || 0,
      popular: row.isPopular || false
    }))

    return NextResponse.json({ packs })
  } catch (err) {
    console.error('GET /api/config/credit-packs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
