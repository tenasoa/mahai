import 'server-only'

import Anthropic from '@anthropic-ai/sdk'

/**
 * Singleton Anthropic — survit au HMR Next.js.
 * Le SDK lit ANTHROPIC_API_KEY depuis l'env.
 */
const globalForClaude = globalThis as unknown as {
  __anthropic?: Anthropic
}

export function getAnthropic(): Anthropic {
  if (!globalForClaude.__anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY manquante dans .env.local')
    }
    globalForClaude.__anthropic = new Anthropic()
  }
  return globalForClaude.__anthropic
}

/**
 * Modèle par défaut. Surchargé via la SystemSetting `ai.model`.
 * Sonnet 4.6 = bon compromis qualité/coût pour le raisonnement scientifique
 * en français. Opus 4.7 disponible si on veut le ceiling.
 */
export const DEFAULT_AI_MODEL = 'claude-sonnet-4-6'

/**
 * Niveau d'effort par défaut. Sonnet 4.6 défaute à `high` ce qui peut
 * surcharger en tokens — on calibre à `medium` pour le BAC.
 */
export type Effort = 'low' | 'medium' | 'high' | 'max'
export const DEFAULT_EFFORT: Effort = 'medium'

/**
 * `max` n'est dispo que sur les modèles Opus. Si l'admin met `max` avec
 * un Sonnet/Haiku ça renvoie 400 — on borne ici par sécurité.
 */
export function clampEffortForModel(model: string, effort: Effort): Effort {
  if (effort === 'max' && !model.includes('opus')) return 'high'
  return effort
}

/**
 * Échec contrôlé : surface l'erreur Anthropic typée vers le caller pour
 * qu'il puisse rendre un message d'erreur utile à l'utilisateur.
 */
export class AICallError extends Error {
  status?: number
  type?: string
  constructor(message: string, opts?: { status?: number; type?: string }) {
    super(message)
    this.name = 'AICallError'
    this.status = opts?.status
    this.type = opts?.type
  }
}

export function isAnthropicError(e: unknown): e is InstanceType<typeof Anthropic.APIError> {
  return e instanceof Anthropic.APIError
}
