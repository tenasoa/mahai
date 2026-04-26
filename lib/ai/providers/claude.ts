import 'server-only'

/**
 * Provider Claude (Anthropic). Utilise l'output structuré (JSON schema) +
 * adaptive thinking. Les detales SDK vivent dans lib/ai/claude.ts.
 */

import { getAnthropic, clampEffortForModel, isAnthropicError } from '../claude'
import { SYSTEM_PROMPT_SUBMISSION, SYSTEM_PROMPT_DIRECT, tiptapToText } from '../prompts'
import { AI_CORRECTION_JSON_SCHEMA, type AICorrectionResult } from '../schemas'
import {
  ProviderError,
  type AIProvider,
  type ProviderCallArgs,
  type ProviderCallResult,
} from './types'

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

export class ClaudeProvider implements AIProvider {
  readonly id = 'claude' as const
  readonly label = 'Claude (Anthropic)'

  isConfigured(): boolean {
    return !!process.env.ANTHROPIC_API_KEY
  }

  async correct(args: ProviderCallArgs): Promise<ProviderCallResult> {
    if (!this.isConfigured()) {
      throw new ProviderError('claude', 'ANTHROPIC_API_KEY manquante.', 401)
    }

    const anthropic = getAnthropic()
    const system = args.mode === 'SUBMISSION' ? SYSTEM_PROMPT_SUBMISSION : SYSTEM_PROMPT_DIRECT
    const userMessage = buildUserMessage(args)

    try {
      const response = await anthropic.messages.create({
        model: args.model,
        max_tokens: 16000,
        thinking: { type: 'adaptive' },
        output_config: {
          effort: clampEffortForModel(args.model, args.effort),
          format: { type: 'json_schema', schema: AI_CORRECTION_JSON_SCHEMA },
        } as any,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: [{ type: 'text', text: userMessage }] }],
      })

      const textBlock = response.content.find((b) => b.type === 'text') as
        | { type: 'text'; text: string }
        | undefined
      if (!textBlock) {
        throw new ProviderError('claude', 'Réponse Claude vide ou inattendue.')
      }

      let parsed: AICorrectionResult
      try {
        parsed = JSON.parse(textBlock.text)
      } catch {
        const match = textBlock.text.match(/\{[\s\S]*\}/)
        if (!match) throw new ProviderError('claude', 'Sortie Claude non-JSON.')
        parsed = JSON.parse(match[0])
      }

      if (!parsed?.items || !Array.isArray(parsed.items)) {
        throw new ProviderError('claude', 'Sortie Claude mal structurée.')
      }

      return {
        result: parsed,
        tokensIn:
          (response.usage.input_tokens || 0) +
          (response.usage.cache_read_input_tokens || 0) +
          (response.usage.cache_creation_input_tokens || 0),
        tokensOut: response.usage.output_tokens || 0,
        model: response.model,
      }
    } catch (err) {
      if (err instanceof ProviderError) throw err
      if (isAnthropicError(err)) {
        throw new ProviderError('claude', err.message, err.status)
      }
      throw new ProviderError('claude', err instanceof Error ? err.message : 'Erreur Claude.')
    }
  }
}
