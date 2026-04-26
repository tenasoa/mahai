'use server'

import { transaction, query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  getAnthropic,
  DEFAULT_AI_MODEL,
  DEFAULT_EFFORT,
  clampEffortForModel,
  isAnthropicError,
  type Effort,
} from '@/lib/ai/claude'
import {
  SYSTEM_PROMPT_SUBMISSION,
  SYSTEM_PROMPT_DIRECT,
  tiptapToText,
} from '@/lib/ai/prompts'
import {
  AI_CORRECTION_JSON_SCHEMA,
  type AICorrectionResult,
} from '@/lib/ai/schemas'

/* ─────────────────── Helpers ─────────────────────────────────────────── */

type Mode = 'SUBMISSION' | 'DIRECT'

interface AISettings {
  priceSubmission: number
  priceDirect: number
  model: string
  effort: Effort
}

async function loadAISettings(): Promise<AISettings> {
  const res = await query(
    `SELECT key, value FROM "SystemSetting" WHERE category = 'ai'`
  )
  const map: Record<string, string> = {}
  for (const row of res.rows) map[row.key] = row.value

  const allowedEfforts: Effort[] = ['low', 'medium', 'high', 'max']
  const rawEffort = (map['ai.effort'] || DEFAULT_EFFORT) as Effort
  const effort = allowedEfforts.includes(rawEffort) ? rawEffort : DEFAULT_EFFORT

  return {
    priceSubmission: parseInt(map['ai.price.submission'] || '3', 10) || 3,
    priceDirect: parseInt(map['ai.price.direct'] || '8', 10) || 8,
    model: map['ai.model'] || DEFAULT_AI_MODEL,
    effort,
  }
}

interface SubjectRow {
  id: string
  title: string
  matiere: string
  niveau: string | null
  examType: string | null
  serie: string | null
  anneeScolaire: string | null
  content: any
  authorId: string
}

async function loadSubjectAndAccess(
  userId: string,
  subjectId: string
): Promise<{ subject: SubjectRow; userRole: string; credits: number } | { error: string }> {
  const res = await query(
    `SELECT
       s.id, s.title, s.titre, s.matiere, s.niveau, s."examType", s.serie,
       s."anneeScolaire", s.content, s."authorId",
       u.role AS "viewerRole",
       u.credits AS "viewerCredits",
       (SELECT 1 FROM "Purchase"
          WHERE "userId" = $1 AND "subjectId" = s.id AND status = 'COMPLETED'
          LIMIT 1) AS "hasPurchase"
     FROM "Subject" s
     LEFT JOIN "User" u ON u.id = $1
     WHERE s.id = $2
     LIMIT 1`,
    [userId, subjectId]
  )

  const row = res.rows[0]
  if (!row) return { error: 'Sujet introuvable.' }

  const isPrivileged = ['ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(row.viewerRole)
  const isAuthor = row.authorId === userId
  const hasAccess = !!row.hasPurchase || isAuthor || isPrivileged

  if (!hasAccess) {
    return { error: 'Vous devez acheter ce sujet pour utiliser la correction IA.' }
  }

  return {
    subject: {
      id: row.id,
      title: row.title || row.titre,
      matiere: row.matiere,
      niveau: row.niveau,
      examType: row.examType,
      serie: row.serie,
      anneeScolaire: row.anneeScolaire,
      content: row.content,
      authorId: row.authorId,
    },
    userRole: row.viewerRole,
    credits: row.viewerCredits ?? 0,
  }
}

/* ─────────────────── Appel Claude ────────────────────────────────────── */

interface CallClaudeArgs {
  mode: Mode
  subject: SubjectRow
  userAnswers?: Record<string, string>
  settings: AISettings
}

async function callClaude({
  mode,
  subject,
  userAnswers,
  settings,
}: CallClaudeArgs): Promise<{
  result: AICorrectionResult
  tokensIn: number
  tokensOut: number
  model: string
}> {
  const anthropic = getAnthropic()

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

  let userMessage: string
  if (mode === 'SUBMISSION') {
    const answersBlock = userAnswers
      ? Object.entries(userAnswers)
          .map(([k, v]) => `[${k}]\n${v?.trim() || '(non répondu)'}`)
          .join('\n\n')
      : '(aucune réponse fournie)'

    userMessage = `${meta}

ÉNONCÉ DU SUJET :
${subjectText}

═══════════════════════════════════════
RÉPONSES DE L'ÉLÈVE :
${answersBlock}
═══════════════════════════════════════

Corrige chaque réponse selon le format JSON demandé. Sois précis sur ce qui est correct/incorrect, propose la solution attendue et donne un retour pédagogique.`
  } else {
    userMessage = `${meta}

ÉNONCÉ DU SUJET :
${subjectText}

Fournis la correction modèle complète (toutes les questions résolues), au format JSON demandé.`
  }

  const system = mode === 'SUBMISSION' ? SYSTEM_PROMPT_SUBMISSION : SYSTEM_PROMPT_DIRECT

  // Adaptive thinking + effort. Pas de prefill (interdit sur Sonnet 4.6).
  // output_config.format pour garantir la sortie JSON.
  // Cache : on cache le system prompt (stable) et le contenu du sujet (stable
  // pour un même sujet, varie entre sujets) — réutilisé entre soumission et
  // correction directe pour le même sujet pendant 5 min.
  const response = await anthropic.messages.create({
    model: settings.model,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: clampEffortForModel(settings.model, settings.effort),
      format: { type: 'json_schema', schema: AI_CORRECTION_JSON_SCHEMA },
    } as any, // SDK n'a pas encore typé output_config.format dans tous les cas
    system: [
      { type: 'text', text: system, cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: userMessage }],
      },
    ],
  })

  // Extraire le JSON depuis le content (premier bloc texte).
  const textBlock = response.content.find((b) => b.type === 'text') as
    | { type: 'text'; text: string }
    | undefined
  if (!textBlock) {
    throw new Error('Réponse IA vide ou inattendue.')
  }

  let parsed: AICorrectionResult
  try {
    parsed = JSON.parse(textBlock.text)
  } catch {
    // Fallback : essayer de récupérer le 1er bloc {...}
    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Sortie IA non-JSON.')
    parsed = JSON.parse(match[0])
  }

  if (!parsed?.items || !Array.isArray(parsed.items)) {
    throw new Error('Sortie IA mal structurée.')
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
}

/* ─────────────────── Server actions exportées ────────────────────────── */

export type AICorrectionResponse =
  | {
      success: true
      data: {
        correctionId: string
        result: AICorrectionResult
        creditsCost: number
        creditsRemaining: number
        mode: Mode
      }
    }
  | { success: false; error: string }

async function processCorrection(
  mode: Mode,
  subjectId: string,
  userAnswers?: Record<string, string>
): Promise<AICorrectionResponse> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié.' }
    }

    const userId = session.user.id

    const accessRes = await loadSubjectAndAccess(userId, subjectId)
    if ('error' in accessRes) {
      return { success: false, error: accessRes.error }
    }

    const { subject, credits } = accessRes
    const settings = await loadAISettings()
    const cost = mode === 'SUBMISSION' ? settings.priceSubmission : settings.priceDirect

    if (credits < cost) {
      return {
        success: false,
        error: `Crédits insuffisants. Il vous manque ${cost - credits} crédits.`,
      }
    }

    if (mode === 'SUBMISSION' && (!userAnswers || Object.keys(userAnswers).length === 0)) {
      return { success: false, error: 'Aucune réponse à corriger.' }
    }

    // Appel Claude AVANT de débiter — si l'IA échoue, l'utilisateur ne paie
    // rien. La fenêtre de race (l'utilisateur lance deux corrections en
    // parallèle avec exactement le solde nécessaire) est acceptée : la 2e
    // se fera rejeter par la transaction qui suit.
    let aiOutput: Awaited<ReturnType<typeof callClaude>>
    try {
      aiOutput = await callClaude({ mode, subject, userAnswers, settings })
    } catch (err) {
      console.error('AI call error:', err)
      if (isAnthropicError(err)) {
        if (err.status === 429) {
          return { success: false, error: 'Service IA saturé, réessayez dans quelques secondes.' }
        }
        if (err.status === 401) {
          return { success: false, error: 'Configuration serveur invalide (clé API).' }
        }
        return { success: false, error: `Erreur IA (${err.status}). Réessayez plus tard.` }
      }
      return { success: false, error: "L'IA n'a pas pu produire une correction valide." }
    }

    // Transaction : débit + insert + transaction crédit, atomiquement.
    const correctionId = crypto.randomUUID()

    const newBalance = await transaction(async (client) => {
      const dec = await client.query(
        `UPDATE "User" SET credits = credits - $1
         WHERE id = $2 AND credits >= $1
         RETURNING credits`,
        [cost, userId]
      )
      if (dec.rowCount === 0) {
        throw new Error('Solde insuffisant au moment du débit.')
      }
      const remaining: number = dec.rows[0].credits

      await client.query(
        `INSERT INTO "AICorrection"
           (id, "userId", "subjectId", mode, "userAnswers", "aiResult",
            "creditsCost", model, "tokensIn", "tokensOut")
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10)`,
        [
          correctionId,
          userId,
          subjectId,
          mode,
          JSON.stringify(userAnswers || {}),
          JSON.stringify(aiOutput.result),
          cost,
          aiOutput.model,
          aiOutput.tokensIn,
          aiOutput.tokensOut,
        ]
      )

      await client.query(
        `INSERT INTO "CreditTransaction"
           (id, "userId", amount, type, status, description, "createdAt")
         VALUES ($1, $2, $3, 'SPEND', 'COMPLETED', $4, NOW())`,
        [
          crypto.randomUUID(),
          userId,
          -cost,
          mode === 'SUBMISSION'
            ? `Correction IA — soumission (${cost} crédits)`
            : `Correction IA directe (${cost} crédits)`,
        ]
      )

      return remaining
    })

    return {
      success: true,
      data: {
        correctionId,
        result: aiOutput.result,
        creditsCost: cost,
        creditsRemaining: newBalance,
        mode,
      },
    }
  } catch (err) {
    console.error('processCorrection fatal:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Erreur serveur.',
    }
  }
}

export async function submitExerciseForCorrection(
  subjectId: string,
  userAnswers: Record<string, string>
): Promise<AICorrectionResponse> {
  return processCorrection('SUBMISSION', subjectId, userAnswers)
}

export async function requestDirectAICorrection(
  subjectId: string
): Promise<AICorrectionResponse> {
  return processCorrection('DIRECT', subjectId)
}

/**
 * Expose les tarifs IA (lecture seule) au client. Sert à afficher
 * dynamiquement le coût avant de débiter.
 */
export async function getAIPrices(): Promise<{
  priceSubmission: number
  priceDirect: number
}> {
  const settings = await loadAISettings()
  return {
    priceSubmission: settings.priceSubmission,
    priceDirect: settings.priceDirect,
  }
}

/**
 * Récupère la dernière correction IA d'un utilisateur sur un sujet (tous modes
 * confondus). Utilisé pour réafficher la correction sans repayer après refresh.
 */
export async function getLatestAICorrection(
  subjectId: string
): Promise<
  | {
      success: true
      data: { correctionId: string; result: AICorrectionResult; mode: Mode; createdAt: string } | null
    }
  | { success: false; error: string }
> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user?.id) return { success: false, error: 'Non authentifié.' }

    const res = await query(
      `SELECT id, mode, "aiResult", "createdAt"
       FROM "AICorrection"
       WHERE "userId" = $1 AND "subjectId" = $2
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      [session.user.id, subjectId]
    )

    if (res.rows.length === 0) {
      return { success: true, data: null }
    }

    const row = res.rows[0]
    return {
      success: true,
      data: {
        correctionId: row.id,
        mode: row.mode,
        result: row.aiResult,
        createdAt: new Date(row.createdAt).toISOString(),
      },
    }
  } catch (err) {
    console.error('getLatestAICorrection error:', err)
    return { success: false, error: 'Erreur serveur.' }
  }
}
