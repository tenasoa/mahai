import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CurrencyConverter } from '@/lib/currency-converter'

/**
 * Vérifier si l'utilisateur est admin
 */
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

/**
 * GET /api/admin/currency-config            → config actuelle
 * GET /api/admin/currency-config?history=1  → historique (20 dernières entrées)
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const isHistory = url.searchParams.get('history') === '1' || url.pathname.endsWith('/history')

    if (isHistory) {
      // Retourner l'historique
      const result = await query(
        `SELECT id, "arPerCredit", "platformFeePercent", "updatedAt", "updatedBy", note
         FROM "CurrencyConfig"
         ORDER BY "updatedAt" DESC
         LIMIT 20`,
        []
      )
      return NextResponse.json({ history: result.rows })
    } else {
      // Retourner la config actuelle
      const result = await query(
        `SELECT id, "arPerCredit", "platformFeePercent", "updatedAt", note 
         FROM "CurrencyConfig" 
         WHERE "activeAt" <= NOW() 
         ORDER BY "activeAt" DESC 
         LIMIT 1`,
        []
      )

      if (result.rows.length === 0) {
        // Config par défaut si pas de données
        return NextResponse.json({
          config: {
            id: 'default',
            arPerCredit: 50,
            platformFeePercent: 30,
            updatedAt: new Date().toISOString(),
            note: 'Configuration par défaut',
          },
        })
      }

      return NextResponse.json({ config: result.rows[0] })
    }
  } catch (err) {
    console.error('GET currency-config error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/admin/currency-config
 * Créer une nouvelle configuration de change (nécessite admin)
 */
export async function POST(request: Request) {
  const auth = await checkAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { arPerCredit, platformFeePercent, note } = body

    // Valider les paramètres
    const validation = CurrencyConverter.validate(arPerCredit, platformFeePercent)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 })
    }

    // Créer la nouvelle config
    const result = await query(
      `INSERT INTO "CurrencyConfig" (id, "arPerCredit", "platformFeePercent", "updatedBy", note)
       VALUES (gen_random_uuid(), $1, $2, $3, $4)
       RETURNING id, "arPerCredit", "platformFeePercent", "createdAt", "updatedAt", note`,
      [arPerCredit, platformFeePercent, auth.userId, note]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Impossible de créer la config' }, { status: 500 })
    }

    return NextResponse.json({ config: result.rows[0] })
  } catch (err) {
    console.error('POST currency-config error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
