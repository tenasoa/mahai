'use server'

import { headers } from 'next/headers'
import crypto from 'crypto'
import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Enregistre un téléchargement PDF d'un sujet et renvoie les méta-infos
 * nécessaires pour générer le filigrane unique.
 *
 * - Vérifie l'authentification + qu'il existe un Purchase complété pour ce sujet
 *   (ou que l'auteur est lui-même contributeur du sujet ou admin).
 * - Génère un `watermarkCode` court de 8 caractères (ex: "A4F2-9C71") inscrit
 *   en filigrane visible sur chaque page du PDF.
 * - Capture l'IP + User-Agent côté serveur (best effort) pour la traçabilité.
 *
 * Retourne ce dont le client a besoin pour fabriquer le PDF localement.
 */
export async function recordSubjectDownload(subjectId: string): Promise<
  | {
      success: true
      data: {
        downloadId: string
        watermarkCode: string
        downloadedAt: string
        userEmail: string
        userName: string
      }
    }
  | { success: false; error: string }
> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const userId = session.user.id

    // Vérifier l'accès : achat complété OU rôle privilégié OU auteur.
    const accessRes = await query(
      `SELECT
         u.role,
         u.email,
         u.prenom,
         u.nom,
         (SELECT 1 FROM "Purchase"
            WHERE "userId" = u.id
              AND "subjectId" = $2
              AND status = 'COMPLETED'
            LIMIT 1) AS "hasPurchase",
         (SELECT 1 FROM "Subject"
            WHERE id = $2 AND "authorId" = u.id
            LIMIT 1) AS "isAuthor"
       FROM "User" u
       WHERE u.id = $1
       LIMIT 1`,
      [userId, subjectId]
    )

    const userRow = accessRes.rows[0]
    if (!userRow) {
      return { success: false, error: 'Utilisateur introuvable' }
    }

    const isPrivileged = ['ADMIN', 'VALIDATEUR', 'VERIFICATEUR'].includes(userRow.role)
    const hasAccess = userRow.hasPurchase || userRow.isAuthor || isPrivileged

    if (!hasAccess) {
      return { success: false, error: 'Vous devez acheter ce sujet avant de le télécharger.' }
    }

    // Génération d'un code unique court : 2 segments de 4 hex (16 millions de combinaisons par segment).
    // Boucle jusqu'à 5 essais en cas de collision (le UNIQUE en base nous protégera dans tous les cas).
    let watermarkCode = ''
    let attempts = 0
    while (attempts < 5) {
      const raw = crypto.randomBytes(4).toString('hex').toUpperCase()
      watermarkCode = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`
      const existing = await query(
        'SELECT 1 FROM "SubjectDownload" WHERE "watermarkCode" = $1 LIMIT 1',
        [watermarkCode]
      )
      if (existing.rows.length === 0) break
      attempts++
    }

    // Capture IP / User-Agent (best effort — Vercel proxie via x-forwarded-for).
    let ip = ''
    let userAgent = ''
    try {
      const h = await headers()
      ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || ''
      userAgent = h.get('user-agent') || ''
    } catch {
      /* hors contexte requête : on s'en passe */
    }

    const downloadId = crypto.randomUUID()
    await query(
      `INSERT INTO "SubjectDownload"
         (id, "userId", "subjectId", "watermarkCode", "ipAddress", "userAgent")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [downloadId, userId, subjectId, watermarkCode, ip || null, userAgent || null]
    )

    return {
      success: true,
      data: {
        downloadId,
        watermarkCode,
        downloadedAt: new Date().toISOString(),
        userEmail: userRow.email || '',
        userName: [userRow.prenom, userRow.nom].filter(Boolean).join(' ').trim() || userRow.email || 'Utilisateur',
      },
    }
  } catch (error) {
    console.error('recordSubjectDownload error:', error)
    return { success: false, error: 'Erreur serveur lors de l\'enregistrement du téléchargement.' }
  }
}
