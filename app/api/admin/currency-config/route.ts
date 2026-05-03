import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { CurrencyConverter } from '@/lib/currency-converter'
import { getPlatformFeePercent, setPlatformFeePercent } from '@/lib/settings'

/**
 * @deprecated Cette route ne gère plus que le pourcentage de frais plateforme.
 *   - La table CurrencyConfig a été supprimée (plus de conversion crédit↔Ar).
 *   - `arPerCredit` est figé à 1 dans la réponse pour compat des clients legacy.
 *   - À terme, utiliser /api/admin/platform-fee qui ne renvoie que le frais.
 */
async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.user) {
    return { error: 'Non authentifié', status: 401 as const }
  }

  const userResult = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const role = userResult.rows[0]?.role
  if (!role || String(role).toUpperCase() !== 'ADMIN') {
    return { error: 'Accès interdit', status: 403 as const }
  }

  return { userId: session.user.id }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const isHistory = url.searchParams.get('history') === '1' || url.pathname.endsWith('/history')

    if (isHistory) {
      // L'historique a été supprimé avec la table CurrencyConfig.
      return NextResponse.json({ history: [] })
    }

    const platformFeePercent = await getPlatformFeePercent(30)
    return NextResponse.json({
      config: {
        id: 'system-setting',
        arPerCredit: 1, // legacy field; système unifié en Ariary
        platformFeePercent,
        updatedAt: new Date().toISOString(),
        note: 'Système unifié en Ariary (plus de conversion).',
      },
    })
  } catch (err) {
    console.error('GET currency-config error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await checkAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { platformFeePercent, note } = body

    const validation = CurrencyConverter.validate(Number(platformFeePercent))
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join(', ') }, { status: 400 })
    }

    await setPlatformFeePercent(Number(platformFeePercent))

    return NextResponse.json({
      config: {
        id: 'system-setting',
        arPerCredit: 1,
        platformFeePercent: Number(platformFeePercent),
        updatedAt: new Date().toISOString(),
        note: note || null,
      },
    })
  } catch (err) {
    console.error('POST currency-config error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
