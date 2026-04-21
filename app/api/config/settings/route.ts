import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

// GET /api/config/settings - Récupérer les paramètres système publics
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const keys = searchParams.get('keys')?.split(',')

  try {
    let sql = `SELECT "key", "value", "type", "label", "description", "category" FROM "SystemSetting" WHERE 1=1`
    const params: any[] = []

    if (category) {
      sql += ` AND "category" = $${params.length + 1}`
      params.push(category)
    }

    if (keys && keys.length > 0) {
      sql += ` AND "key" = ANY($${params.length + 1})`
      params.push(keys)
    }

    sql += ` ORDER BY "category", "key"`

    const result = await query(sql, params)

    // Parser les valeurs selon leur type
    const settings: Record<string, any> = {}
    for (const row of result.rows) {
      let value: any = row.value
      
      if (row.type === 'number') {
        value = parseFloat(row.value)
      } else if (row.type === 'boolean') {
        value = row.value === 'true'
      } else if (row.type === 'json') {
        try {
          value = JSON.parse(row.value)
        } catch {
          value = row.value
        }
      }

      settings[row.key] = {
        value,
        label: row.label,
        description: row.description,
        category: row.category
      }
    }

    return NextResponse.json({ settings })
  } catch (err) {
    console.error('GET /api/config/settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
