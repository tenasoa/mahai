/**
 * Validation des variables d'environnement avec Zod
 */
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  DATABASE_URL: z.string().startsWith('postgresql://'),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
})

export type Env = z.infer<typeof envSchema>

let env: Env | null = null

export function getEnv(): Env {
  if (env) return env
  
  const result = envSchema.safeParse(process.env)
  
  if (!result.success) {
    console.error('❌ Variables d\'environnement invalides:')
    console.error(result.error.format())
    throw new Error('Variables d\'environnement invalides')
  }
  
  env = result.data
  return env
}

export function validateEnv() {
  return getEnv()
}
