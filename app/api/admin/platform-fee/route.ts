import { NextResponse } from 'next/server'
import { getPlatformFeePercent, setPlatformFeePercent } from '@/lib/settings'
import { requireAdmin, isAuthFailure } from '@/lib/auth-guards'

/**
 * Endpoint admin : gestion du pourcentage de frais plateforme.
 * Remplace l'ancien /api/admin/currency-config (la table CurrencyConfig
 * a été supprimée, plus de conversion crédit↔Ar).
 */
async function checkAdmin() {
  const guard = await requireAdmin()
  if (isAuthFailure(guard)) return { error: guard.error, status: guard.status }
  return { userId: guard.userId }
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
