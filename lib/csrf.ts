import { type NextRequest } from 'next/server'
import { randomUUID } from 'crypto'

/**
 * Protection CSRF pour les routes API REST.
 *
 * Next.js Server Actions ont une protection native (header Next-Action),
 * mais les routes /api/* traditionnelles n'en bénéficient pas.
 *
 * Utilisation dans un route handler :
 *   import { verifyCsrf } from '@/lib/csrf'
 *   export async function POST(req: NextRequest) {
 *     const csrf = verifyCsrf(req)
 *     if (csrf.error) return NextResponse.json(csrf.error, { status: 403 })
 *     ...
 *   }
 *
 * Le client doit :
 * 1. Recevoir le cookie __Host-csrf (défini par le serveur au premier GET)
 * 2. Inclure le header X-CSRF-Token avec la même valeur dans les requêtes mutantes
 *
 * Protection double :
 * - Cookie SameSite=Strict → bloque les requêtes cross-site simples
 * - Token header → bloque les requêtes cross-site avancées (JSON CORS preflight)
 */

const CSRF_COOKIE = '__Host-csrf'
const CSRF_HEADER = 'X-CSRF-Token'

interface CsrfResult {
  error?: { message: string }
}

/**
 * Génère un token CSRF et le place dans un cookie Secure/HttpOnly/Strict.
 * À appeler une fois par session (ex: au login, ou au premier GET).
 */
export function generateAndSetCsrfCookie(
  response: { cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void } },
) {
  const token = randomUUID()
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  })
  return token
}

/**
 * Vérifie le token CSRF pour les requêtes mutantes (POST, PATCH, DELETE, PUT).
 * Les GET sont exonérés (pas d'effet de bord).
 */
export function verifyCsrf(request: NextRequest | Request): CsrfResult {
  const method = (request as Request).method?.toUpperCase() || 'GET'

  // GET / HEAD sont safe par définition
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return {}
  }

  const cookieToken = getCookie(request, CSRF_COOKIE)
  const headerToken = (request as Request).headers?.get(CSRF_HEADER)

  if (!cookieToken || !headerToken) {
    return { error: { message: 'CSRF token manquant' } }
  }

  if (cookieToken !== headerToken) {
    return { error: { message: 'CSRF token invalide' } }
  }

  return {}
}

/**
 * Extrait un cookie par nom depuis la requête.
 */
function getCookie(request: Request | NextRequest, name: string): string | undefined {
  // NextRequest a request.cookies
  const nextReq = request as NextRequest
  if (nextReq.cookies?.get) {
    return nextReq.cookies.get(name)?.value
  }

  // Fallback : parse manuellement le header Cookie
  const cookieHeader = (request as Request).headers?.get('cookie')
  if (!cookieHeader) return undefined

  for (const cookie of cookieHeader.split(';')) {
    const [key, ...val] = cookie.trim().split('=')
    if (key === name) return val.join('=')
  }

  return undefined
}
