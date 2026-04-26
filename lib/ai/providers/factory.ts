import 'server-only'

/**
 * Factory de providers IA. Lit `ai.provider` dans SystemSetting et retourne
 * l'instance correspondante. Les providers sont stateless donc on peut les
 * réinstancier à chaque appel sans coût notable.
 */

import { query } from '@/lib/db'
import { ClaudeProvider } from './claude'
import { PerplexityProvider } from './perplexity'
import type { AIProvider, AIProviderId, Effort } from './types'

const PROVIDERS: Record<AIProviderId, AIProvider> = {
  claude: new ClaudeProvider(),
  perplexity: new PerplexityProvider(),
}

export const ALL_PROVIDERS: AIProvider[] = Object.values(PROVIDERS)

export function getProviderById(id: string): AIProvider | undefined {
  return (PROVIDERS as Record<string, AIProvider>)[id]
}

export interface AIRuntimeConfig {
  providerId: AIProviderId
  provider: AIProvider
  /** Modèle pour ce provider, lu depuis ai.<provider>.model. */
  model: string
  /** Effort partagé entre providers. */
  effort: Effort
  /** Tarifs (mêmes pour tous les providers à ce stade). */
  priceSubmission: number
  priceDirect: number
}

const DEFAULT_MODEL_BY_PROVIDER: Record<AIProviderId, string> = {
  claude: 'claude-sonnet-4-6',
  perplexity: 'sonar-pro',
}

/**
 * Lit toute la config IA depuis SystemSetting (category='ai') et résout le
 * provider actif. Si la clé API manque, lève une erreur explicite.
 */
export async function loadAIRuntimeConfig(): Promise<AIRuntimeConfig> {
  const res = await query(`SELECT key, value FROM "SystemSetting" WHERE category = 'ai'`)
  const map: Record<string, string> = {}
  for (const row of res.rows) map[row.key] = row.value

  const requestedId = (map['ai.provider'] || 'claude') as string
  const provider = getProviderById(requestedId)
  if (!provider) {
    throw new Error(`Provider IA inconnu : "${requestedId}". Valeurs supportées : claude | perplexity.`)
  }
  if (!provider.isConfigured()) {
    throw new Error(
      `Le provider "${provider.label}" n'a pas de clé API configurée. Ajoutez ${
        provider.id === 'claude' ? 'ANTHROPIC_API_KEY' : 'PERPLEXITY_API_KEY'
      } dans .env.local ou changez le provider depuis /admin/configuration.`,
    )
  }

  const allowedEfforts: Effort[] = ['low', 'medium', 'high', 'max']
  const rawEffort = (map['ai.effort'] || 'medium') as Effort
  const effort = allowedEfforts.includes(rawEffort) ? rawEffort : 'medium'

  const modelKey = `ai.${provider.id}.model`
  const model =
    map[modelKey] ||
    // Fallback rétro-compat avec l'ancienne clé `ai.model`.
    map['ai.model'] ||
    DEFAULT_MODEL_BY_PROVIDER[provider.id]

  return {
    providerId: provider.id,
    provider,
    model,
    effort,
    priceSubmission: parseInt(map['ai.price.submission'] || '3', 10) || 3,
    priceDirect: parseInt(map['ai.price.direct'] || '8', 10) || 8,
  }
}

/**
 * Pour l'admin : retourne la liste des providers avec leur statut
 * (clé API présente ou non, modèle configuré, actif ou non).
 * Ne lève jamais — utilisé pour l'UI de bascule.
 */
export interface ProviderStatus {
  id: AIProviderId
  label: string
  isConfigured: boolean
  isActive: boolean
  model: string
  envVarName: string
}

export async function listProviderStatus(): Promise<ProviderStatus[]> {
  const res = await query(`SELECT key, value FROM "SystemSetting" WHERE category = 'ai'`)
  const map: Record<string, string> = {}
  for (const row of res.rows) map[row.key] = row.value

  const activeId = map['ai.provider'] || 'claude'
  return ALL_PROVIDERS.map((p) => ({
    id: p.id,
    label: p.label,
    isConfigured: p.isConfigured(),
    isActive: p.id === activeId,
    model: map[`ai.${p.id}.model`] || DEFAULT_MODEL_BY_PROVIDER[p.id],
    envVarName: p.id === 'claude' ? 'ANTHROPIC_API_KEY' : 'PERPLEXITY_API_KEY',
  }))
}
