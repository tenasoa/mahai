'use server'

import { transaction, query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { type AICorrectionResult } from '@/lib/ai/schemas'
import {
  loadAIRuntimeConfig,
  listProviderStatus,
  getProviderById,
  type ProviderStatus,
} from '@/lib/ai/providers/factory'
import { ProviderError } from '@/lib/ai/providers/types'

/* ─────────────────── Types ───────────────────────────────────────────── */

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

export type AICorrectionResponse =
  | {
      success: true
      data: {
        correctionId: string
        result: AICorrectionResult
        costAr: number
        balanceArRemaining: number
        mode: Mode
        fromCache?: boolean
      }
    }
  | { success: false; error: string }

/* ─────────────────── Helpers ─────────────────────────────────────────── */

export async function getAIPrices(): Promise<{
  priceSubmission: number
  priceDirect: number
  providerLabel: string
}> {
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
): Promise<{ subject: SubjectRow; userRole: string; balanceAr: number } | { error: string }> {
  const res = await query(
    `SELECT
       s.id, s.titre AS title, s.matiere, s.niveau, s."examType", s.serie,
       s."anneeScolaire", s.content, s."authorId",
       u.role AS "viewerRole",
       u."balanceAr" AS "viewerBalanceAr",
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
    balanceAr: row.viewerBalanceAr ?? 0,
  }
}

function handleProviderError(err: unknown, providerId: string): AICorrectionResponse {
  if (err instanceof ProviderError) {
    const raw = (err.message || '').toLowerCase()
    if (raw.includes('insufficient_quota') || raw.includes('quota')) {
      return { success: false, error: 'Le quota API du provider IA actif est épuisé. Réessayez plus tard ou changez de provider dans /admin/configuration.' }
    }
    if (err.status === 408) {
      return { success: false, error: 'Le modèle IA a mis trop de temps à répondre (timeout 60s). Réessayez.' }
    }
    if (err.status === 429) {
      const isFree = err.message.includes(':free') || err.message.includes('rate-limited upstream')
      return { success: false, error: isFree
        ? 'Le modèle gratuit est temporairement surchargé. Réessayez dans 30 secondes.'
        : 'Service IA saturé, réessayez dans quelques secondes.' }
    }
    if (err.status === 401) {
      return { success: false, error: `Clé API ${providerId} invalide ou manquante.` }
    }
    return { success: false, error: `Erreur ${providerId}${err.status ? ` (${err.status})` : ''}. Réessayez plus tard.` }
  }
  return { success: false, error: "L'IA n'a pas pu produire une correction valide." }
}

/* ─────────────────── Pool cache (mode DIRECT) ────────────────────────── */

/**
 * Cherche une correction DIRECT non encore vue par cet utilisateur pour
 * ce sujet dans le pool partagé.
 * Retourne null si le pool est vide ou si toutes les corrections ont déjà
 * été montrées à cet utilisateur (→ déclencher un appel IA).
 */
async function getUnseenPoolEntry(
  subjectId: string,
  userId: string
): Promise<{ poolId: string; content: AICorrectionResult } | null> {
  const res = await query(
    `SELECT p.id AS "poolId", p.content
     FROM "DirectCorrectionPool" p
     WHERE p."subjectId" = $1
       AND NOT EXISTS (
         SELECT 1 FROM "DirectCorrectionSeen" s
         WHERE s."userId" = $2 AND s."poolId" = p.id
       )
     ORDER BY RANDOM()
     LIMIT 1`,
    [subjectId, userId]
  )
  if (res.rows.length === 0) return null
  return { poolId: res.rows[0].poolId, content: res.rows[0].content as AICorrectionResult }
}

/* ─────────────────── Logique principale ─────────────────────────────── */

async function processCorrection(
  mode: Mode,
  subjectId: string,
  userAnswers?: Record<string, string>
): Promise<AICorrectionResponse> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user?.id) return { success: false, error: 'Non authentifié.' }

    const userId = user.id
    const accessRes = await loadSubjectAndAccess(userId, subjectId)
    if ('error' in accessRes) return { success: false, error: accessRes.error }

    const { subject, balanceAr } = accessRes

    let runtime: Awaited<ReturnType<typeof loadAIRuntimeConfig>>
    try {
      runtime = await loadAIRuntimeConfig()
    } catch (err) {
      logger.apiError('AI runtime config', err)
      return { success: false, error: err instanceof Error ? err.message : 'Configuration IA indisponible.' }
    }

    const cost = mode === 'SUBMISSION' ? runtime.priceSubmission : runtime.priceDirect

    if (balanceAr < cost) {
      return { success: false, error: `Solde insuffisant. Il vous manque ${cost - balanceAr} Ar.` }
    }

    if (mode === 'SUBMISSION' && (!userAnswers || Object.keys(userAnswers).length === 0)) {
      return { success: false, error: 'Aucune réponse à corriger.' }
    }

    /* ── Mode DIRECT : essayer le pool avant d'appeler l'IA ── */
    if (mode === 'DIRECT') {
      const poolEntry = await getUnseenPoolEntry(subjectId, userId)

      if (poolEntry) {
        // Correction trouvée dans le pool — pas d'appel IA, on décompte quand même.
        const correctionId = crypto.randomUUID()
        const newBalance = await transaction(async (client) => {
          const dec = await client.query(
            `UPDATE "User" SET "balanceAr" = "balanceAr" - $1
             WHERE id = $2 AND "balanceAr" >= $1
             RETURNING "balanceAr"`,
            [cost, userId]
          )
          if (dec.rowCount === 0) throw new Error('Solde insuffisant au moment du débit.')

          await client.query(
            `INSERT INTO "DirectCorrectionSeen"("userId","poolId") VALUES($1,$2)
             ON CONFLICT DO NOTHING`,
            [userId, poolEntry.poolId]
          )

          await client.query(
            `UPDATE "DirectCorrectionPool" SET "timesServed" = "timesServed" + 1 WHERE id = $1`,
            [poolEntry.poolId]
          )

          await client.query(
            `INSERT INTO "AICorrection"
               (id,"userId","subjectId",mode,"userAnswers","aiResult","costAr",model,"tokensIn","tokensOut","cachedFromPoolId")
             VALUES($1,$2,$3,'DIRECT',$4::jsonb,$5::jsonb,$6,'cached',0,0,$7)`,
            [correctionId, userId, subjectId, '{}', JSON.stringify(poolEntry.content), cost, poolEntry.poolId]
          )

          await client.query(
            `INSERT INTO "Transaction"(id,"userId","amountAr",type,status,description,"createdAt")
             VALUES($1,$2,$3,'SPEND','COMPLETED',$4,NOW())`,
            [crypto.randomUUID(), userId, -cost, `Correction IA directe (${cost} Ar)`]
          )

          return dec.rows[0].balanceAr as number
        })

        return {
          success: true,
          data: { correctionId, result: poolEntry.content, costAr: cost, balanceArRemaining: newBalance, mode, fromCache: true },
        }
      }
      // Pool vide ou entièrement vu → on tombe dans le chemin normal (appel IA ↓)
    }

    /* ── Appel IA (SUBMISSION, ou DIRECT quand pool épuisé) ── */
    let aiOutput: Awaited<ReturnType<typeof runtime.provider.correct>>
    try {
      aiOutput = await runtime.provider.correct({ mode, subject, userAnswers, model: runtime.model, effort: runtime.effort })
    } catch (err) {
      logger.apiError('AI call', err)
      return handleProviderError(err, runtime.providerId)
    }

    const correctionId = crypto.randomUUID()

    const newBalance = await transaction(async (client) => {
      const dec = await client.query(
        `UPDATE "User" SET "balanceAr" = "balanceAr" - $1
         WHERE id = $2 AND "balanceAr" >= $1
         RETURNING "balanceAr"`,
        [cost, userId]
      )
      if (dec.rowCount === 0) throw new Error('Solde insuffisant au moment du débit.')
      const remaining: number = dec.rows[0].balanceAr

      let poolId: string | null = null

      if (mode === 'DIRECT') {
        // Sauvegarde dans le pool partagé pour les futurs utilisateurs.
        const poolRes = await client.query(
          `INSERT INTO "DirectCorrectionPool"
             ("subjectId","content","generatedByUserId","model","tokensIn","tokensOut")
           VALUES($1,$2::jsonb,$3,$4,$5,$6)
           RETURNING id`,
          [subjectId, JSON.stringify(aiOutput.result), userId, aiOutput.model, aiOutput.tokensIn, aiOutput.tokensOut]
        )
        poolId = poolRes.rows[0].id as string

        // Marque comme vue pour le générateur (il ne la reverra pas en random).
        await client.query(
          `INSERT INTO "DirectCorrectionSeen"("userId","poolId") VALUES($1,$2)`,
          [userId, poolId]
        )
      }

      await client.query(
        `INSERT INTO "AICorrection"
           (id,"userId","subjectId",mode,"userAnswers","aiResult","costAr",model,"tokensIn","tokensOut","cachedFromPoolId")
         VALUES($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,$10,$11)`,
        [
          correctionId, userId, subjectId, mode,
          JSON.stringify(userAnswers || {}),
          JSON.stringify(aiOutput.result),
          cost, aiOutput.model, aiOutput.tokensIn, aiOutput.tokensOut,
          poolId,
        ]
      )

      await client.query(
        `INSERT INTO "Transaction"(id,"userId","amountAr",type,status,description,"createdAt")
         VALUES($1,$2,$3,'SPEND','COMPLETED',$4,NOW())`,
        [
          crypto.randomUUID(), userId, -cost,
          mode === 'SUBMISSION'
            ? `Correction IA — soumission (${cost} Ar)`
            : `Correction IA directe (${cost} Ar)`,
        ]
      )

      return remaining
    })

    return {
      success: true,
      data: { correctionId, result: aiOutput.result, costAr: cost, balanceArRemaining: newBalance, mode, fromCache: false },
    }
  } catch (err) {
    logger.apiError('processCorrection', err)
    return { success: false, error: err instanceof Error ? err.message : 'Erreur serveur.' }
  }
}

/* ─────────────────── Actions exportées ──────────────────────────────── */

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
 * Récupère la dernière correction IA d'un utilisateur sur un sujet.
 * Utilisé pour réafficher la correction sans repayer après refresh.
 */
export async function getLatestAICorrection(
  subjectId: string
): Promise<
  | { success: true; data: { correctionId: string; result: AICorrectionResult; mode: Mode; createdAt: string; fromCache?: boolean } | null }
  | { success: false; error: string }
> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user?.id) return { success: false, error: 'Non authentifié.' }

    const res = await query(
      `SELECT id, mode, "aiResult", "createdAt", "cachedFromPoolId"
       FROM "AICorrection"
       WHERE "userId" = $1 AND "subjectId" = $2
       ORDER BY "createdAt" DESC
       LIMIT 1`,
      [user.id, subjectId]
    )

    if (res.rows.length === 0) return { success: true, data: null }

    const row = res.rows[0]
    return {
      success: true,
      data: {
        correctionId: row.id,
        mode: row.mode,
        result: row.aiResult,
        createdAt: new Date(row.createdAt).toISOString(),
        fromCache: !!row.cachedFromPoolId,
      },
    }
  } catch (err) {
    logger.apiError('getLatestAICorrection', err)
    return { success: false, error: 'Erreur serveur.' }
  }
}

/**
 * Statistiques admin du pool de corrections DIRECT :
 * nombre d'entrées par sujet, nombre total de distributions.
 */
export async function getDirectCorrectionPoolStats(): Promise<
  | { success: true; data: { totalEntries: number; totalServed: number; subjectsWithCache: number } }
  | { success: false; error: string }
> {
  const adm = await ensureAdmin()
  if (!adm.ok) return { success: false, error: adm.error }

  try {
    const res = await query(
      `SELECT
         COUNT(*)::int AS "totalEntries",
         COALESCE(SUM("timesServed"),0)::int AS "totalServed",
         COUNT(DISTINCT "subjectId")::int AS "subjectsWithCache"
       FROM "DirectCorrectionPool"`,
      []
    )
    return { success: true, data: res.rows[0] }
  } catch (err) {
    logger.apiError('getDirectCorrectionPoolStats', err)
    return { success: false, error: 'Erreur serveur.' }
  }
}

/* ─────────────────── Admin : multi-provider ──────────────────────────── */

async function ensureAdmin(): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user?.id) return { ok: false, error: 'Non authentifié.' }

  const res = await query(`SELECT role FROM "User" WHERE id = $1`, [user.id])
  if (!res.rows[0] || res.rows[0].role !== 'ADMIN') {
    return { ok: false, error: 'Réservé aux administrateurs.' }
  }
  return { ok: true, userId: user.id }
}

export async function getAIProviderStatus(): Promise<
  | { success: true; data: { providers: ProviderStatus[]; activeId: string } }
  | { success: false; error: string }
> {
  const adm = await ensureAdmin()
  if (!adm.ok) return { success: false, error: adm.error }
  try {
    const providers = await listProviderStatus()
    const active = providers.find((p) => p.isActive)
    return { success: true, data: { providers, activeId: active?.id || 'claude' } }
  } catch (err) {
    logger.apiError('getAIProviderStatus', err)
    return { success: false, error: "Impossible de charger l'état des providers." }
  }
}

export async function setAIProvider(
  providerId: string
): Promise<{ success: true } | { success: false; error: string }> {
  const adm = await ensureAdmin()
  if (!adm.ok) return { success: false, error: adm.error }

  const provider = getProviderById(providerId)
  if (!provider) return { success: false, error: `Provider inconnu : "${providerId}".` }
  if (!provider.isConfigured()) {
    return {
      success: false,
      error: `Le provider ${provider.label} n'a pas de clé API configurée. Ajoutez ${
        provider.id === 'claude' ? 'ANTHROPIC_API_KEY'
        : provider.id === 'perplexity' ? 'PERPLEXITY_API_KEY'
        : provider.id === 'openrouter' ? 'OPENROUTER_API_KEY'
        : 'OPENAI_API_KEY'
      } dans .env.local avant de l'activer.`,
    }
  }

  await query(
    `UPDATE "SystemSetting" SET value = $1, "updatedAt" = NOW() WHERE key = 'ai.provider'`,
    [provider.id]
  )
  return { success: true }
}
