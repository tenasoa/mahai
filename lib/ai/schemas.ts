/**
 * JSON Schemas pour les sorties structurées Claude (`output_config.format`).
 *
 * Claude Sonnet 4.6 / Opus 4.7 supportent les structured outputs : on garantit
 * ainsi que la réponse est parsable côté serveur sans regex hasardeuse.
 *
 * Limitations rappelées par la skill claude-api :
 *  - `additionalProperties: false` est obligatoire sur tous les objets.
 *  - Pas de `minLength/maxLength`, `minimum/maximum`, etc. (validés côté client).
 *  - Récursivité non supportée — on aplatit en tableau d'items.
 */

/* ─────── Type TS qui mirror le schéma JSON (utilisé en front + actions) ──── */

export interface AICorrectionItem {
  questionLabel: string
  /** Réponse de l'élève (vide en mode DIRECT). */
  userAnswer?: string
  /** "correct" | "partial" | "incorrect" | "missing" (SUBMISSION) ou "model" (DIRECT). */
  verdict: 'correct' | 'partial' | 'incorrect' | 'missing' | 'model'
  /** Note proposée (ex: "1.5/2"). Vide en mode DIRECT. */
  score?: string
  /** Solution attendue, raisonnée, en markdown + LaTeX. */
  correctAnswer: string
  /** Commentaire pédagogique de l'IA (peut être markdown + LaTeX). */
  feedback: string
}

export interface AICorrectionSummary {
  totalScore: string
  strengths: string[]
  improvements: string[]
}

export interface AICorrectionResult {
  items: AICorrectionItem[]
  summary: AICorrectionSummary
}

/* ─────── Schéma JSON envoyé à output_config.format ─────────────────────── */

export const AI_CORRECTION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['items', 'summary'],
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['questionLabel', 'verdict', 'correctAnswer', 'feedback'],
        properties: {
          questionLabel: { type: 'string' },
          userAnswer: { type: 'string' },
          verdict: {
            type: 'string',
            enum: ['correct', 'partial', 'incorrect', 'missing', 'model'],
          },
          score: { type: 'string' },
          correctAnswer: { type: 'string' },
          feedback: { type: 'string' },
        },
      },
    },
    summary: {
      type: 'object',
      additionalProperties: false,
      required: ['totalScore', 'strengths', 'improvements'],
      properties: {
        totalScore: { type: 'string' },
        strengths: { type: 'array', items: { type: 'string' } },
        improvements: { type: 'array', items: { type: 'string' } },
      },
    },
  },
} as const
