import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/config/merchant-phones - Récupérer les numéros marchand actifs
export async function GET() {
  try {
    const result = await query(
      `SELECT "operator", "phone", "label", "isDefault" 
       FROM "MerchantPhone" 
       WHERE "isActive" = true 
       ORDER BY "operator", "isDefault" DESC`,
      []
    )

    // Formater la réponse par opérateur
    const phonesByOperator: Record<string, { phone: string; label: string; isDefault: boolean }> = {}
    
    for (const row of result.rows) {
      const operatorName = row.operator === 'mvola' ? 'MVola' 
        : row.operator === 'orange' ? 'Orange Money'
        : row.operator === 'airtel' ? 'Airtel Money'
        : row.operator
      
      phonesByOperator[operatorName] = {
        phone: row.phone,
        label: row.label,
        isDefault: row.isDefault
      }
    }

    return NextResponse.json({ phones: phonesByOperator })
  } catch (err) {
    console.error('GET /api/config/merchant-phones error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
