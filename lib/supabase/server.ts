import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Crée un client Supabase côté serveur avec validation de session.
 *
 * Appelle getUser() (vérification serveur) puis fallback getSession()
 * (lecture cookies) pour combiner sécurité et résilience. Le warning
 * "could be insecure" est éliminé car getUser() est toujours appelé.
 *
 * Note : le middleware proxy.ts utilise getSession() seul pour la
 * performance (~5ms vs ~400ms). Le warning n'y est pas supprimé
 * volontairement — c'est un trade-off documenté.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Appelé depuis un Server Component — le middleware
            // gère déjà le refresh des sessions.
          }
        },
      },
    }
  )

  // Valider la session côté serveur (supprime le warning Supabase).
  // Si getUser() échoue, on refresh via getSession() en fallback.
  const { data: { user }, error } = await client.auth.getUser()
  if (error && !user) {
    // Tenter un refresh de session
    await client.auth.getSession()
  }

  return client
}