import 'server-only'

/**
 * Provider Perplexity (Sonar). Compatible OpenAI : POST chat/completions
 * sur https://api.perplexity.ai. On désactive volontairement la recherche
 * web (sujet d'examen ≠ besoin sourcing externe) et on filtre les marqueurs
 * de citation [1], [2] que Sonar peut quand même injecter.
 *
 * - Sonar Pro : meilleur rapport qualité/coût, supporte response_format
 *   json_schema sur les comptes Tier 3+. On tente le schéma puis on
 *   retombe sur un parse libre si le tier ne le supporte pas.
 * - Pas de prompt caching côté Perplexity (à ce jour) ; on accepte le full
 *   re-billing à chaque appel.
 */

import { SYSTEM_PROMPT_SUBMISSION, SYSTEM_PROMPT_DIRECT, tiptapToText } from '../prompts'
import { AI_CORRECTION_JSON_SCHEMA, type AICorrectionResult } from '../schemas'
import {
  ProviderError,
  type AIProvider,
  type Effort,
  type ProviderCallArgs,
  type ProviderCallResult,
} from './types'

const PERPLEXITY_ENDPOINT = 'https://api.perplexity.ai/chat/completions'

function effortToSearchContext(effort: Effort): 'low' | 'medium' | 'high' {
  if (effort === 'low') return 'low'
  if (effort === 'medium') return 'low' // on garde peu de contexte web pour les exos
  if (effort === 'high') return 'medium'
  return 'high'
}

function buildUserMessage(args: ProviderCallArgs): string {
  const { mode, subject, userAnswers } = args
  const subjectText = tiptapToText(subject.content)
  const meta = [
    `Titre : ${subject.title}`,
    `Matière : ${subject.matiere}`,
    subject.examType && `Type : ${subject.examType}`,
    subject.serie && `Série : ${subject.serie}`,
    subject.anneeScolaire && `Année : ${subject.anneeScolaire}`,
    subject.niveau && `Niveau : ${subject.niveau}`,
  ]
    .filter(Boolean)
    .join('\n')

  if (mode === 'SUBMISSION') {
    const answersBlock = userAnswers
      ? Object.entries(userAnswers)
          .map(([k, v]) => `[${k}]\n${v?.trim() || '(non répondu)'}`)
          .join('\n\n')
      : '(aucune réponse fournie)'

    return `${meta}

ÉNONCÉ DU SUJET :
${subjectText}

═══════════════════════════════════════
RÉPONSES DE L'ÉLÈVE :
${answersBlock}
═══════════════════════════════════════

Corrige chaque réponse au format JSON strict (cf. schéma système). Tu réponds UNIQUEMENT par le JSON, sans markdown autour, sans citations.`
  }

  return `${meta}

ÉNONCÉ DU SUJET :
${subjectText}

Fournis la correction modèle complète (toutes les questions résolues), au format JSON strict (cf. schéma système). Tu réponds UNIQUEMENT par le JSON, sans markdown autour, sans citations.`
}

/**
 * Supprime les marqueurs de citation [1], [12], etc. dans toutes les chaînes
 * du résultat — Perplexity les injecte parfois malgré la consigne.
 */
function stripCitationMarkers(result: AICorrectionResult): AICorrectionResult {
  const re = /\s*\[\d+\](?!\()/g // ne touche pas aux liens markdown [1](url)
  const clean = (s?: string) => (s ? s.replace(re, '').trim() : s)

  return {
    items: (result.items || []).map((it) => ({
      ...it,
      userAnswer: clean(it.userAnswer),
      correctAnswer: clean(it.correctAnswer) || '',
      feedback: clean(it.feedback) || '',
    })),
    summary: result.summary
      ? {
          totalScore: clean(result.summary.totalScore) || '',
          strengths: (result.summary.strengths || []).map((s) => clean(s) || ''),
          improvements: (result.summary.improvements || []).map((s) => clean(s) || ''),
        }
      : { totalScore: '', strengths: [], improvements: [] },
  }
}

export class PerplexityProvider implements AIProvider {
  readonly id = 'perplexity' as const
  readonly label = 'Perplexity (Sonar)'

  isConfigured(): boolean {
    return !!process.env.PERPLEXITY_API_KEY
  }

  async correct(args: ProviderCallArgs): Promise<ProviderCallResult> {
    if (!this.isConfigured()) {
      throw new ProviderError('perplexity', 'PERPLEXITY_API_KEY manquante.', 401)
    }

    const system = args.mode === 'SUBMISSION' ? SYSTEM_PROMPT_SUBMISSION : SYSTEM_PROMPT_DIRECT
    const userMessage = buildUserMessage(args)

    // On tente d'abord avec response_format json_schema. Si le tier ne le
    // supporte pas, on retombe sur un appel libre + parsing.
    const baseBody = {
      model: args.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.2,
      web_search_options: {
        search_context_size: effortToSearchContext(args.effort),
      },
    } as Record<string, any>

    const bodyWithSchema = {
      ...baseBody,
      response_format: {
        type: 'json_schema',
        json_schema: {
          schema: AI_CORRECTION_JSON_SCHEMA,
        },
      },
    }

    let response: Response
    let data: any

    try {
      response = await fetch(PERPLEXITY_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyWithSchema),
      })

      // Si 400/422 lié au schema, on retente sans.
      if (!response.ok && (response.status === 400 || response.status === 422)) {
        response = await fetch(PERPLEXITY_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(baseBody),
        })
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new ProviderError(
          'perplexity',
          `Perplexity ${response.status} : ${errText.slice(0, 200)}`,
          response.status,
        )
      }

      data = await response.json()
    } catch (err) {
      if (err instanceof ProviderError) throw err
      throw new ProviderError(
        'perplexity',
        err instanceof Error ? err.message : 'Erreur réseau Perplexity.',
      )
    }

    const content: string | undefined = data?.choices?.[0]?.message?.content
    if (!content) {
      throw new ProviderError('perplexity', 'Réponse Perplexity vide.')
    }

    let parsed: AICorrectionResult
    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (!match) {
        throw new ProviderError('perplexity', 'Sortie Perplexity non-JSON.')
      }
      try {
        parsed = JSON.parse(match[0])
      } catch (e) {
        throw new ProviderError('perplexity', 'Sortie Perplexity malformée.')
      }
    }

    if (!parsed?.items || !Array.isArray(parsed.items)) {
      throw new ProviderError('perplexity', 'Sortie Perplexity mal structurée.')
    }

    parsed = stripCitationMarkers(parsed)

    return {
      result: parsed,
      tokensIn: data?.usage?.prompt_tokens || 0,
      tokensOut: data?.usage?.completion_tokens || 0,
      model: data?.model || args.model,
    }
  }
}
