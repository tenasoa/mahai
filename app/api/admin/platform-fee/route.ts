import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { getPlatformFeePercent, setPlatformFeePercent } from '@/lib/settings'

/**
 * Endpoint admin : gestion du pourcentage de frais plateforme.
 * Remplace l'ancien /api/admin/currency-config (la table CurrencyConfig
 * a été supprimée, plus de conversion crédit↔Ar).
 */
async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return { error: 'Non authentifié', status: 401 as const }

  const userResult = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const role = userResult.rows[0]?.role
  if (!role || String(role).toUpperCase() !== 'ADMIN') {
    return { error: 'Accès interdit', status: 403 as const }
  }
  return { userId: session.user.id }
}

export async function GET() {
  try {
    const platformFeePercent = await getPlatformFeePercent(30)
    return NextResponse.json({
      config: {
        platformFeePercent,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('GET /api/admin/platform-fee error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const auth = await checkAdmin()
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const platformFeePercent = Number(body.platformFeePercent)

    if (!Number.isFinite(platformFeePercent) || platformFeePercent < 0 || platformFeePercent > 100) {
      return NextResponse.json(
        { error: 'platformFeePercent doit être un nombre entre 0 et 100' },
        { status: 400 },
      )
    }

    await setPlatformFeePercent(platformFeePercent)

    return NextResponse.json({
      config: {
        platformFeePercent,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (err) {
    console.error('POST /api/admin/platform-fee error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
