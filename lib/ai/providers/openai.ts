import 'server-only'

/**
 * Provider OpenAI via Responses API.
 * Utilise les Structured Outputs (`text.format`) pour garantir un JSON
 * conforme au schéma commun Mah.AI.
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

const OPENAI_RESPONSES_ENDPOINT = 'https://api.openai.com/v1/responses'

function effortToOpenAIReasoning(effort: Effort): 'low' | 'medium' | 'high' {
  if (effort === 'low') return 'low'
  if (effort === 'medium') return 'medium'
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

Corrige chaque réponse selon le format JSON demandé. Sois précis sur ce qui est correct/incorrect, propose la solution attendue et donne un retour pédagogique.`
  }

  return `${meta}

ÉNONCÉ DU SUJET :
${subjectText}

Fournis la correction modèle complète (toutes les questions résolues), au format JSON demandé.`
}

function extractOutputText(data: any): string | undefined {
  if (typeof data?.output_text === 'string') return data.output_text

  const parts: string[] = []
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content.text === 'string') {
        parts.push(content.text)
      }
    }
  }

  return parts.length > 0 ? parts.join('\n') : undefined
}

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai' as const
  readonly label = 'OpenAI (GPT)'

  isConfigured(): boolean {
    return !!process.env.OPENAI_API_KEY
  }

  async correct(args: ProviderCallArgs): Promise<ProviderCallResult> {
    if (!this.isConfigured()) {
      throw new ProviderError('openai', 'OPENAI_API_KEY manquante.', 401)
    }

    const system = args.mode === 'SUBMISSION' ? SYSTEM_PROMPT_SUBMISSION : SYSTEM_PROMPT_DIRECT
    const userMessage = buildUserMessage(args)

    const body: Record<string, any> = {
      model: args.model,
      input: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
      max_output_tokens: 16000,
      text: {
        format: {
          type: 'json_schema',
          name: 'ai_correction',
          strict: true,
          schema: AI_CORRECTION_JSON_SCHEMA,
        },
      },
    }

    if (args.model.startsWith('gpt-5')) {
      body.reasoning = { effort: effortToOpenAIReasoning(args.effort) }
    }

    let data: any
    try {
      const response = await fetch(OPENAI_RESPONSES_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      data = await response.json().catch(async () => ({ error: { message: await response.text() } }))

      if (!response.ok) {
        throw new ProviderError(
          'openai',
          `OpenAI ${response.status} : ${(data?.error?.message || '').slice(0, 220)}`,
          response.status,
        )
      }
    } catch (err) {
      if (err instanceof ProviderError) throw err
      throw new ProviderError('openai', err instanceof Error ? err.message : 'Erreur réseau OpenAI.')
    }

    const content = extractOutputText(data)
    if (!content) {
      throw new ProviderError('openai', 'Réponse OpenAI vide.')
    }

    let parsed: AICorrectionResult
    try {
      parsed = JSON.parse(content)
    } catch {
      const match = content.match(/\{[\s\S]*\}/)
      if (!match) throw new ProviderError('openai', 'Sortie OpenAI non-JSON.')
      parsed = JSON.parse(match[0])
    }

    if (!parsed?.items || !Array.isArray(parsed.items)) {
      throw new ProviderError('openai', 'Sortie OpenAI mal structurée.')
    }

    return {
      result: parsed,
      tokensIn: data?.usage?.input_tokens || 0,
      tokensOut: data?.usage?.output_tokens || 0,
      model: data?.model || args.model,
    }
  }
}
