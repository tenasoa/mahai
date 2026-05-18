import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * Liste blanche des clés `SystemSetting` réellement publiques.
 *
 * Sécurité : cet endpoint est NON authentifié. Il ne doit JAMAIS exposer la
 * table `SystemSetting` dans son intégralité — celle-ci contient de la config
 * sensible (provider/modèle IA, frais de plateforme, etc.). On renvoie donc
 * uniquement les clés explicitement listées ici. Pour rendre une nouvelle clé
 * publique, l'ajouter à cette liste après vérification qu'elle ne fuit aucune
 * information sensible.
 */
const PUBLIC_SETTING_KEYS = new Set<string>([
  'WELCOME_BONUS_AR',
  'REFERRER_BONUS_AR',
  'REFERRED_BONUS_AR',
])

// GET /api/config/settings?keys=KEY1,KEY2 - Paramètres système publics
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedKeys = searchParams.get('keys')?.split(',').map((k) => k.trim()).filter(Boolean)

  // On ne renvoie que des clés de la liste blanche. Si le client précise
  // `keys`, on intersecte avec la liste blanche ; sinon on renvoie toutes
  // les clés publiques. Le paramètre `category` n'est plus supporté : il
  // permettait de vider la table entière.
  const allowedKeys = requestedKeys && requestedKeys.length > 0
    ? requestedKeys.filter((k) => PUBLIC_SETTING_KEYS.has(k))
    : [...PUBLIC_SETTING_KEYS]

  if (allowedKeys.length === 0) {
    return NextResponse.json({ settings: {} })
  }

  try {
    const result = await query(
      `SELECT "key", "value", "type", "label", "description", "category"
         FROM "SystemSetting"
        WHERE "key" = ANY($1)
        ORDER BY "category", "key"`,
      [allowedKeys],
    )

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
        category: row.category,
      }
    }

    return NextResponse.json({ settings })
  } catch (err) {
    console.error('GET /api/config/settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
