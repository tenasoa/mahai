import 'server-only'

/**
 * Provider OpenRouter — agrégateur de modèles IA avec tier gratuit.
 * Compatible OpenAI (chat/completions). Les modèles gratuits portent le
 * suffixe `:free` (ex: `deepseek/deepseek-r1:free`).
 *
 * Docs : https://openrouter.ai/docs
 * Modèles gratuits : https://openrouter.ai/models?q=free
 *
 * On tente d'abord avec json_schema response_format, puis fallback sur
 * un appel libre + parse JSON si le modèle ne le supporte pas.
 */

import { SYSTEM_PROMPT_SUBMISSION, SYSTEM_PROMPT_DIRECT, tiptapToText } from '../prompts'
import { AI_CORRECTION_JSON_SCHEMA, type AICorrectionResult } from '../schemas'
import {
  ProviderError,
  type AIProvider,
  type ProviderCallArgs,
  type ProviderCallResult,
} from './types'

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'

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

Corrige chaque réponse au format JSON strict (cf. schéma système). Tu réponds UNIQUEMENT par le JSON, sans markdown autour.`
  }

  return `${meta}

ÉNONCÉ DU SUJET :
${subjectText}

Fournis la correction modèle complète (toutes les questions résolues), au format JSON strict (cf. schéma système). Tu réponds UNIQUEMENT par le JSON, sans markdown autour.`
}

function buildHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://mahai.mg',
    'X-Title': 'Mah.AI',
  }
}

export class OpenRouterProvider implements AIProvider {
  readonly id = 'openrouter' as const
  readonly label = 'OpenRouter (gratuit)'

  isConfigured(): boolean {
    return !!process.env.OPENROUTER_API_KEY
  }

  async correct(args: ProviderCallArgs): Promise<ProviderCallResult> {
    if (!this.isConfigured()) {
      throw new ProviderError('openrouter', 'OPENROUTER_API_KEY manquante.', 401)
    }

    const system = args.mode === 'SUBMISSION' ? SYSTEM_PROMPT_SUBMISSION : SYSTEM_PROMPT_DIRECT
    const userMessage = buildUserMessage(args)
    const headers = buildHeaders()

    const baseBody: Record<string, any> = {
      model: args.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
      max_tokens: 4096,
      temperature: 0.2,
    }

    const bodyWithSchema = {
      ...baseBody,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'ai_correction',
          strict: true,
          schema: AI_CORRECTION_JSON_SCHEMA,
        },
      },
    }

    let response: Response
    let data: any

    const TIMEOUT_MS = 60_000
    try {
      const ctrl1 = new AbortController()
      const t1 = setTimeout(() => ctrl1.abort(), TIMEOUT_MS)
      response = await fetch(OPENROUTER_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyWithSchema),
        signal: ctrl1.signal,
      }).finally(() => clearTimeout(t1))

      // Certains modèles gratuits ne supportent pas json_schema — fallback sans.
      if (!response.ok && (response.status === 400 || response.status === 422)) {
        const ctrl2 = new AbortController()
        const t2 = setTimeout(() => ctrl2.abort(), TIMEOUT_MS)
        response = await fetch(OPENROUTER_ENDPOINT, {
          method: 'POST',
          headers,
          body: JSON.stringify(baseBody),
          signal: ctrl2.signal,
        }).finally(() => clearTimeout(t2))
      }

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new ProviderError(
          'openrouter',
          `OpenRouter ${response.status} : ${errText.slice(0, 200)}`,
          response.status,
        )
      }

      data = await response.json()
    } catch (err) {
      if (err instanceof ProviderError) throw err
      if (err instanceof Error && err.name === 'AbortError') {
        throw new ProviderError('openrouter', 'OpenRouter timeout (60s dépassé).', 408)
      }
      throw new ProviderError(
        'openrouter',
        err instanceof Error ? err.message : 'Erreur réseau OpenRouter.',
      )
    }

    const content: string | undefined = data?.choices?.[0]?.message?.content
    if (!content) {
      throw new ProviderError('openrouter', 'Réponse OpenRouter vide.')
    }

    let parsed: AICorrectionResult
    try {
      parsed = JSON.parse(content)
    } catch {
      // Certains modèles enveloppent le JSON dans un bloc ```json ... ```
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/) || content.match(/\{[\s\S]*\}/)
      const raw = match ? (match[1] ?? match[0]) : null
      if (!raw) {
        throw new ProviderError('openrouter', 'Sortie OpenRouter non-JSON.')
      }
      try {
        parsed = JSON.parse(raw)
      } catch {
        throw new ProviderError('openrouter', 'Sortie OpenRouter malformée.')
      }
    }

    if (!parsed?.items || !Array.isArray(parsed.items)) {
      throw new ProviderError('openrouter', 'Sortie OpenRouter mal structurée.')
    }

    return {
      result: parsed,
      tokensIn: data?.usage?.prompt_tokens || 0,
      tokensOut: data?.usage?.completion_tokens || 0,
      model: data?.model || args.model,
    }
  }
}
