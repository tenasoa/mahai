'use server'

import { transaction, query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { type AICorrectionResult } from '@/lib/ai/schemas'
import {
  loadAIRuntimeConfig,
  listProviderStatus,
  getProviderById,
  type ProviderStatus,
} from '@/lib/ai/providers/factory'
import { ProviderError } from '@/lib/ai/providers/types'

/* ─────────────────── Helpers ─────────────────────────────────────────── */

type Mode = 'SUBMISSION' | 'DIRECT'

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

/**
 * Tarifs IA exposés au client (tarification + provider actif). Pas de fuite
 * de clé API ; juste le bool « configuré » et le label.
 */
export async function getAIPrices(): Promise<{
  priceSubmission: number
  priceDirect: number
  providerLabel: string
}> {
  // On ne lève pas si la clé API manque pour le provider actif — on veut
  // toujours afficher les tarifs sur le UI étudiant.
  const res = await query(`SELECT key, value FROM "SystemSetting" WHERE category = 'ai'`)
  const map: Record<string, string> = {}
  for (const row of res.rows) map[row.key] = row.value
  const providerId = map['ai.provider'] || 'claude'
  const providerLabel = getProviderById(providerId)?.label || 'IA'
  return {
    priceSubmission: parseInt(map['ai.price.submission'] || '3', 10) || 3,
    priceDirect: parseInt(map['ai.price.direct'] || '8', 10) || 8,
    providerLabel,
  }
}

async function loadSubjectAndAccess(
  userId: string,
  subjectId: string
): Promise<{ subject: SubjectRow; userRole: string; credits: number } | { error: string }> {
  const res = await query(
    `SELECT
       s.id, s.titre AS title, s.matiere, s.niveau, s."examType", s.serie,
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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user?.id) {
      return { success: false, error: 'Non authentifié.' }
    }

    const userId = user.id

    const accessRes = await loadSubjectAndAccess(userId, subjectId)
    if ('error' in accessRes) {
      return { success: false, error: accessRes.error }
    }

    const { subject, credits } = accessRes

    // Résout le provider actif (Claude / Perplexity / …) + tarifs.
    let runtime: Awaited<ReturnType<typeof loadAIRuntimeConfig>>
    try {
      runtime = await loadAIRuntimeConfig()
    } catch (err) {
      // Provider mal configuré ou clé API absente — message lisible côté UI.
      console.error('AI runtime config error:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Configuration IA indisponible.',
      }
    }

    const cost = mode === 'SUBMISSION' ? runtime.priceSubmission : runtime.priceDirect

    if (credits < cost) {
      return {
        success: false,
        error: `Crédits insuffisants. Il vous manque ${cost - credits} crédits.`,
      }
    }

    if (mode === 'SUBMISSION' && (!userAnswers || Object.keys(userAnswers).length === 0)) {
      return { success: false, error: 'Aucune réponse à corriger.' }
    }

    // Appel IA AVANT de débiter — si l'IA échoue, l'utilisateur ne paie rien.
    // La fenêtre de race (l'utilisateur lance deux corrections en parallèle
    // avec exactement le solde nécessaire) est acceptée : la 2e sera rejetée
    // par la transaction qui suit (UPDATE conditionnel).
    let aiOutput: Awaited<ReturnType<typeof runtime.provider.correct>>
    try {
      aiOutput = await runtime.provider.correct({
        mode,
        subject,
        userAnswers,
        model: runtime.model,
        effort: runtime.effort,
      })
    } catch (err) {
      console.error('AI call error:', err)
      if (err instanceof ProviderError) {
        const rawMessage = (err.message || '').toLowerCase()
        const isQuotaError =
          rawMessage.includes('insufficient_quota') ||
          rawMessage.includes('exceeded your current quota') ||
          rawMessage.includes('quota')

        if (isQuotaError) {
          return {
            success: false,
            error:
              'Le quota API du provider IA actif est épuisé. Réessayez plus tard ou demandez à un administrateur de basculer vers un autre provider (ex: Claude).',
          }
        }

        if (err.status === 429) {
          return { success: false, error: 'Service IA saturé, réessayez dans quelques secondes.' }
        }
        if (err.status === 401) {
          return { success: false, error: `Clé API ${runtime.providerId} invalide ou manquante.` }
        }
        return {
          success: false,
          error: `Erreur ${runtime.provider.label}${err.status ? ` (${err.status})` : ''}. Réessayez plus tard.`,
        }
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
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user?.id) return { success: false, error: 'Non authentifié.' }

    const res = await query(
      `SELECT id, mode, "aiResult", "createdAt"
       FROM "AICorrection"
       WHERE "userId" = $1 AND "subjectId" = $2
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      [user.id, subjectId]
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

/* ─────────────────── Admin : multi-provider ──────────────────────────── */

async function ensureAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user?.id) return { ok: false, error: 'Non authentifié.' }

  const res = await query(`SELECT role FROM "User" WHERE id = $1`, [user.id])
  if (!res.rows[0] || res.rows[0].role !== 'ADMIN') {
    return { ok: false, error: 'Réservé aux administrateurs.' }
  }
  return { ok: true, userId: user.id }
}

/**
 * Renvoie l'état de chaque provider IA (clé API présente, modèle, actif ou
 * non) — sert à l'UI de bascule dans /admin/configuration.
 */
export async function getAIProviderStatus(): Promise<
  | { success: true; data: { providers: ProviderStatus[]; activeId: string } }
  | { success: false; error: string }
> {
  const adm = await ensureAdmin()
  if (!adm.ok) return { success: false, error: adm.error }
  try {
    const providers = await listProviderStatus()
    const active = providers.find((p) => p.isActive)
    return {
      success: true,
      data: { providers, activeId: active?.id || 'claude' },
    }
  } catch (err) {
    console.error('getAIProviderStatus error:', err)
    return { success: false, error: 'Impossible de charger l\'état des providers.' }
  }
}

/**
 * Change le provider IA actif. Refuse si la clé API du nouveau provider
 * n'est pas configurée — évite que l'admin se tire une balle dans le pied.
 */
export async function setAIProvider(
  providerId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const adm = await ensureAdmin()
  if (!adm.ok) return { success: false, error: adm.error }

  const provider = getProviderById(providerId)
  if (!provider) {
    return { success: false, error: `Provider inconnu : "${providerId}".` }
  }
  if (!provider.isConfigured()) {
    return {
      success: false,
      error: `Le provider ${provider.label} n'a pas de clé API configurée. Ajoutez ${
        provider.id === 'claude' ? 'ANTHROPIC_API_KEY' : 'PERPLEXITY_API_KEY'
      } dans .env.local avant de l'activer.`,
    }
  }

  await query(
    `UPDATE "SystemSetting" SET value = $1, "updatedAt" = NOW() WHERE key = 'ai.provider'`,
    [provider.id]
  )

  return { success: true }
}
