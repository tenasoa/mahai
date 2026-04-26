/**
 * Interface commune à tous les providers IA Mah.AI.
 *
 * Chaque provider implémente `correct(args)` qui prend l'énoncé du sujet,
 * éventuellement les réponses de l'élève (mode SUBMISSION) et renvoie un
 * AICorrectionResult déjà structuré + les compteurs de tokens pour la
 * traçabilité du coût en DB.
 */

import type { AICorrectionResult } from '../schemas'

export type AIProviderId = 'claude' | 'perplexity'
export type AIMode = 'SUBMISSION' | 'DIRECT'
export type Effort = 'low' | 'medium' | 'high' | 'max'

export interface ProviderSubject {
  id: string
  title: string
  matiere: string
  niveau?: string | null
  examType?: string | null
  serie?: string | null
  anneeScolaire?: string | null
  content: any
}

export interface ProviderCallArgs {
  mode: AIMode
  subject: ProviderSubject
  /** Réponses de l'élève (clé = label question, valeur = texte). Vide en DIRECT. */
  userAnswers?: Record<string, string>
  /** Modèle à utiliser, propre au provider (ex: 'sonar-pro' / 'claude-sonnet-4-6'). */
  model: string
  /** Effort de raisonnement — interprété différemment selon le provider. */
  effort: Effort
}

export interface ProviderCallResult {
  result: AICorrectionResult
  tokensIn: number
  tokensOut: number
  /** Modèle réellement utilisé (renvoyé par l'API, peut différer si alias). */
  model: string
}

export interface AIProvider {
  /** Identifiant lisible — sert aussi comme valeur de `ai.provider`. */
  readonly id: AIProviderId
  /** Le label affiché à l'admin. */
  readonly label: string
  /** Indique si la clé API est présente dans l'env. Lecture seule. */
  isConfigured(): boolean
  /** Appel principal, renvoie une AICorrectionResult ou jette. */
  correct(args: ProviderCallArgs): Promise<ProviderCallResult>
}

/**
 * Erreur spécifique au provider — sert à mapper en messages user-friendly
 * dans le server action (429, 401, etc.).
 */
export class ProviderError extends Error {
  status?: number
  provider: AIProviderId
  constructor(provider: AIProviderId, message: string, status?: number) {
    super(message)
    this.name = 'ProviderError'
    this.provider = provider
    this.status = status
  }
}
