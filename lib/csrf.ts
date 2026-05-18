import { type NextRequest } from 'next/server'

/**
 * Protection CSRF pour les routes API REST (vérification d'origine).
 *
 * Next.js Server Actions ont une protection native (header Next-Action),
 * mais les routes /api/* traditionnelles n'en bénéficient pas.
 *
 * Approche : pour toute requête mutante (POST/PUT/PATCH/DELETE), on vérifie
 * que l'en-tête `Origin` (ou `Referer` en repli) correspond bien à l'hôte de
 * la requête. Les navigateurs envoient systématiquement `Origin` sur les
 * requêtes mutantes et le client JS ne peut pas le falsifier — une page
 * tierce malveillante aura donc une origine différente et sera rejetée.
 *
 * Avantage par rapport au schéma cookie + token : aucun cookie à émettre,
 * aucune dépendance à du code client, fonctionne immédiatement.
 *
 * Utilisation dans un route handler :
 *   import { verifyCsrf } from '@/lib/csrf'
 *   export async function POST(req: NextRequest) {
 *     const csrf = verifyCsrf(req)
 *     if (csrf.error) return NextResponse.json(csrf.error, { status: 403 })
 *     ...
 *   }
 */

interface CsrfResult {
  error?: { message: string }
}

/**
 * Vérifie l'origine pour les requêtes mutantes (POST, PATCH, DELETE, PUT).
 * Les GET / HEAD / OPTIONS sont exonérés (pas d'effet de bord).
 */
export function verifyCsrf(request: NextRequest | Request): CsrfResult {
  const method = (request as Request).method?.toUpperCase() || 'GET'

  // GET / HEAD / OPTIONS sont safe par définition.
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return {}
  }

  const headers = (request as Request).headers
  // Hôte réel servant la requête (domaine de déploiement).
  const host = headers.get('x-forwarded-host') || headers.get('host')
  if (!host) {
    return { error: { message: 'Hôte de la requête absent' } }
  }

  // Origin est envoyé par tous les navigateurs modernes sur les requêtes
  // mutantes ; Referer sert de repli défensif.
  const source = headers.get('origin') || headers.get('referer')
  if (!source) {
    return { error: { message: 'Origine de la requête absente' } }
  }

  let sourceHost: string
  try {
    sourceHost = new URL(source).host
  } catch {
    return { error: { message: 'Origine de la requête invalide' } }
  }

  if (sourceHost !== host) {
    return { error: { message: 'Origine de la requête non autorisée' } }
  }

  return {}
}
