'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

async function getAuthenticatedContributor() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  const result = await query('SELECT id, role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]

  if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR'].includes(user.role)) {
    return null
  }

  return { userId: user.id, role: user.role }
}

/**
 * Demande la suppression d'un sujet par le contributeur.
 * Comportement :
 *  - Vérifie que le sujet appartient bien au contributeur.
 *  - Si le sujet n'a pas de ventes → retire-le immédiatement du catalogue public en le passant en DRAFT.
 *  - Sinon → log la demande pour validation admin (les gains restent protégés).
 *  - Dans tous les cas : insert un log SubjectLog action='DELETION_REQUESTED'.
 */
export async function requestSubjectDeletion(subjectId: string, reason?: string) {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) return { success: false, error: 'Non autorisé' }

  try {
    // Vérifier appartenance
    const subjectRes = await query(
      'SELECT id, status, titre, "authorId" FROM "Subject" WHERE id = $1',
      [subjectId]
    )
    const subject = subjectRes.rows[0]
    if (!subject) return { success: false, error: 'Sujet introuvable' }
    if (subject.authorId !== contributor.userId) {
      return { success: false, error: 'Ce sujet ne vous appartient pas' }
    }

    // Compter les ventes
    const salesRes = await query(
      'SELECT COUNT(*) FROM "Purchase" WHERE "subjectId" = $1',
      [subjectId]
    )
    const salesCount = parseInt(salesRes.rows[0]?.count || '0', 10)

    const oldStatus = subject.status
    let newStatus = oldStatus
    let message = ''

    if (salesCount === 0) {
      // Pas de ventes : on passe direct en DRAFT (retiré du catalogue public)
      newStatus = 'DRAFT'
      await query(
        'UPDATE "Subject" SET status = $1, "updatedAt" = NOW() WHERE id = $2',
        [newStatus, subjectId]
      )
      message = 'Sujet retiré du catalogue.'
    } else {
      // Avec ventes : log seulement, admin doit valider pour ne pas casser les achats
      message = `Demande envoyée à l'administration (${salesCount} vente(s) à préserver).`
    }

    // Log dans SubjectLog (best-effort, si table absente → silencieux)
    try {
      await query(
        `INSERT INTO "SubjectLog" (id, "subjectId", "userId", action, "oldStatus", "newStatus", notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          crypto.randomUUID(),
          subjectId,
          contributor.userId,
          'DELETION_REQUESTED',
          oldStatus,
          newStatus,
          reason || null
        ]
      )
    } catch (e) {
      console.warn('SubjectLog insert failed:', e)
    }

    revalidatePath('/contributeur/sujets')
    revalidatePath('/contributeur')
    revalidatePath('/catalogue')

    return { success: true, message, immediatelyRemoved: salesCount === 0 }
  } catch (error) {
    console.error('Erreur requestSubjectDeletion:', error)
    return { success: false, error: 'Erreur lors de la demande de suppression' }
  }
}
