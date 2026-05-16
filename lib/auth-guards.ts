/**
 * Gardes d'authentification et d'autorisation centralisées.
 *
 * Source unique pour vérifier l'identité et le rôle d'un utilisateur côté
 * serveur (server actions, routes API, layouts).
 *
 * ⚠ Sécurité : on utilise TOUJOURS `supabase.auth.getUser()` — qui revalide
 * le JWT auprès de Supabase — et JAMAIS `getSession()`, qui se contente de
 * lire le cookie sans le revalider et ne doit donc pas servir à prendre une
 * décision d'autorisation.
 */
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'

export type Role =
  | 'ETUDIANT'
  | 'CONTRIBUTEUR'
  | 'PROFESSEUR'
  | 'VERIFICATEUR'
  | 'VALIDATEUR'
  | 'ADMIN'

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>

export type AuthSuccess = {
  supabase: SupabaseServerClient
  userId: string
}

export type RoleSuccess = AuthSuccess & {
  role: Role
}

export type AuthFailure = {
  error: string
  status: 401 | 403
}

/**
 * Vérifie qu'un utilisateur est authentifié (JWT revalidé).
 * Retourne soit `{ supabase, userId }`, soit `{ error, status: 401 }`.
 */
export async function requireAuth(): Promise<AuthSuccess | AuthFailure> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Vous devez être connecté pour effectuer cette action', status: 401 }
  }

  return { supabase, userId: user.id }
}

/**
 * Vérifie qu'un utilisateur est authentifié ET possède l'un des rôles fournis.
 * Retourne soit `{ supabase, userId, role }`, soit `{ error, status }`.
 */
export async function requireRole(
  roles: Role[],
): Promise<RoleSuccess | AuthFailure> {
  const auth = await requireAuth()
  if ('error' in auth) return auth

  const result = await query('SELECT role FROM "User" WHERE id = $1', [auth.userId])
  const role = result.rows[0]?.role as Role | undefined

  if (!role || !roles.includes(role)) {
    return { error: 'Accès interdit', status: 403 }
  }

  return { ...auth, role }
}

/** Raccourci : exige le rôle ADMIN. */
export function requireAdmin(): Promise<RoleSuccess | AuthFailure> {
  return requireRole(['ADMIN'])
}

/** Type guard utilitaire pour discriminer un échec de garde. */
export function isAuthFailure(
  value: AuthSuccess | RoleSuccess | AuthFailure,
): value is AuthFailure {
  return 'error' in value
}
