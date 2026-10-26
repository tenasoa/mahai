/**
 * Accès à la base D1 (phase 3 : remplace progressivement lib/db.ts et Postgres).
 *
 * Le binding `DB` (wrangler.jsonc) existe sur Workers et dans `next dev` via
 * initOpenNextCloudflareForDev. Les modules passent sur D1 un par un ; tant qu'un
 * module n'est pas migré, il continue d'appeler query() de lib/db.ts.
 *
 * D1 n'a pas de BEGIN/COMMIT : une écriture qui touche plusieurs tables passe par
 * db.batch([...]), exécuté de façon atomique.
 */
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1'
import * as schema from '@/db/schema'

export type Database = DrizzleD1Database<typeof schema>

// Sous-ensemble de D1Database utilisé par drizzle (les types runtime de workerd ne sont pas chargés).
type D1DatabaseLike = Parameters<typeof drizzle>[0]

function getBinding(): D1DatabaseLike | null {
  // Même lecture que getCloudflareContext() d'OpenNext (voir lib/storage.ts).
  const context = (globalThis as Record<symbol, any>)[Symbol.for('__cloudflare-context__')]
  return (context?.env?.DB as D1DatabaseLike | undefined) ?? null
}

export function getDb(): Database {
  const binding = getBinding()
  if (!binding) {
    throw new Error('Base D1 indisponible : binding DB absent (Workers ou `next dev` requis)')
  }
  return drizzle(binding, { schema })
}

export { schema }
