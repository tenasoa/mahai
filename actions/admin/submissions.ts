'use server'

import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notify } from '@/lib/notifications'
import crypto from 'crypto'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return null
  
  const result = await query('SELECT id, role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]
  
  return user?.role === 'ADMIN' ? user : null
}

/**
 * Récupère toutes les soumissions en attente de validation
 */
export async function getPendingSubmissions() {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const result = await query(`
    SELECT 
      s.id,
      s.title,
      s.matiere,
      s."examType",
      s."anneeScolaire",
      s.serie,
      s.filiere,
      s.duree,
      s.coefficient,
      s.pages,
      s.difficulte,
      s.description,
      s.prix,
      s."prixMode",
      s.visibilite,
      s.status,
      s.content,
      s."createdAt",
      s."updatedAt",
      u.prenom as "authorPrenom",
      u.nom as "authorNom",
      u.email as "authorEmail",
      u.id as "authorId"
    FROM "SubjectSubmission" s
    JOIN "User" u ON s."authorId" = u.id
    WHERE s.status = 'SUBMITTED'
    ORDER BY s."createdAt" DESC
  `)
  
  return result.rows
}

/**
 * Récupère une soumission spécifique pour révision
 */
export async function getSubmissionForReview(submissionId: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const result = await query(`
    SELECT 
      s.*,
      u.prenom as "authorPrenom", 
      u.nom as "authorNom",
      u.email as "authorEmail",
      u.id as "authorId"
    FROM "SubjectSubmission" s
    JOIN "User" u ON s."authorId" = u.id
    WHERE s.id = $1
  `, [submissionId])
  
  return result.rows[0] || null
}

/**
 * Finalise et publie une soumission
 */
export async function finalizeAndPublish(
  submissionId: string,
  finalData: {
    titre: string
    matiere: string
    type: string
    annee: string
    serie?: string
    filiere?: string
    pages: number
    duree?: string
    coefficient?: number
    credits: number
    difficulte: 'FACILE' | 'MOYEN' | 'DIFFICILE'
    badge: 'GOLD' | 'AI' | 'FREE' | 'INTER'
    description?: string
    notes?: string
  }
) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  // Récupérer la soumission
  const subRes = await query(
    'SELECT * FROM "SubjectSubmission" WHERE id = $1',
    [submissionId]
  )
  const submission = subRes.rows[0]
  
  if (!submission) throw new Error("Soumission introuvable")
  if (submission.status !== 'SUBMITTED') throw new Error("Cette soumission n'est pas en attente")

  const newSubjectId = crypto.randomUUID()

  try {
    // Créer le sujet dans la table Subject — recopie l'intégralité des
    // métadonnées de la soumission (filiere, duree, coefficient,
    // dateOfficielle, customMeta, content…) pour ne rien perdre.
    await query(`
      INSERT INTO "Subject" (
        id, titre, matiere, type, annee, serie,
        pages, credits, difficulte, badge, description,
        "authorId", status, "createdAt",
        rating, "reviewsCount", "hasCorrectionIa", "hasCorrectionProf",
        duree, coefficient, filiere, niveau,
        "examType", "anneeScolaire", "dateOfficielle",
        "bepcOption", "baccType", "concoursType", "etablissement", "semestre",
        "customMeta", "submissionId", "content", "contentType", tags,
        "prixMode", visibilite, "reviewerId", "publishedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, NOW(),
        0, 0, false, false,
        $14, $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23, $24, $25,
        COALESCE($26::jsonb, '[]'::jsonb),
        $27, $28, $29, COALESCE($30::text[], '{}'::text[]),
        $31, $32, $33, NOW()
      )
    `, [
      newSubjectId,
      finalData.titre,
      finalData.matiere,
      finalData.type,
      finalData.annee,
      finalData.serie || submission.serie || null,
      finalData.pages,
      finalData.credits,
      finalData.difficulte,
      finalData.badge,
      finalData.description || null,
      submission.authorId,
      'PUBLISHED',
      // Métadonnées étendues — finalData prime sur submission
      finalData.duree ?? submission.duree ?? null,
      finalData.coefficient ?? submission.coefficient ?? null,
      finalData.filiere ?? submission.filiere ?? null,
      submission.niveau ?? null,
      finalData.type ?? submission.examType ?? null,
      finalData.annee ?? submission.anneeScolaire ?? null,
      submission.dateOfficielle ?? null,
      submission.bepcOption ?? null,
      submission.baccType ?? null,
      submission.concoursType ?? null,
      submission.etablissement ?? null,
      submission.semestre ?? null,
      submission.customMeta ?? null,
      submissionId,
      submission.content ?? null,
      submission.contentType ?? null,
      submission.tags ?? null,
      submission.prixMode ?? null,
      submission.visibilite ?? null,
      adminUser.id
    ])

    // Mettre à jour la soumission
    await query(`
      UPDATE "SubjectSubmission"
      SET status = 'VALIDATED',
          "validatedAt" = NOW(),
          "reviewerId" = $2,
          notes = $3
      WHERE id = $1
    `, [submissionId, adminUser.id, finalData.notes || null])

    // Notifier le contributeur que son sujet est en ligne
    await notify({
      userId: submission.authorId,
      type: 'SUBMISSION_PUBLISHED',
      title: 'Sujet publié',
      body: `« ${finalData.titre} » est désormais disponible dans le catalogue.`,
      link: '/contributeur/sujets',
      metadata: { submissionId, subjectId: newSubjectId },
    })

    revalidatePath('/admin/soumissions')
    revalidatePath('/admin/sujets')
    revalidatePath('/catalogue')
    revalidatePath('/contributeur/sujets')
    revalidatePath('/notifications')

    return { success: true as const, subjectId: newSubjectId }
  } catch (error) {
    console.error('finalizeAndPublish error:', error)
    throw error
  }
}

/**
 * Rejette une soumission
 */
export async function rejectSubmission(submissionId: string, reason: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  if (!reason || reason.trim().length < 10) {
    throw new Error("Veuillez fournir un motif détaillé (minimum 10 caractères)")
  }

  await query(`
    UPDATE "SubjectSubmission"
    SET status = 'REJECTED',
        "reviewerId" = $2,
        notes = $3,
        "reviewedAt" = NOW(),
        "updatedAt" = NOW()
    WHERE id = $1
  `, [submissionId, adminUser.id, reason])

  // Notifier le contributeur
  const subInfo = await query(
    `SELECT "authorId", title FROM "SubjectSubmission" WHERE id = $1`,
    [submissionId]
  )
  const sub = subInfo.rows[0]
  if (sub?.authorId) {
    await notify({
      userId: sub.authorId,
      type: 'SUBMISSION_REJECTED',
      title: 'Soumission refusée',
      body: `« ${sub.title || 'Votre sujet'} » a été refusée. Motif : ${reason}`,
      link: '/contributeur/sujets',
      metadata: { submissionId, reason },
    })
  }

  revalidatePath('/admin/soumissions')
  revalidatePath('/contributeur/sujets')
  revalidatePath('/notifications')

  return { success: true as const }
}

/**
 * Demande une révision au contributeur.
 * La soumission sort de la file de validation (status = REVISION_REQUESTED),
 * devient éditable par le contributeur, et le message admin est stocké
 * dans `notes` pour être lu côté contributeur.
 */
export async function requestRevision(submissionId: string, message: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  if (!message || message.trim().length < 10) {
    throw new Error(
      "Veuillez écrire un message détaillé (minimum 10 caractères) pour guider le contributeur."
    )
  }

  const subRes = await query(
    'SELECT status, "authorId", title FROM "SubjectSubmission" WHERE id = $1',
    [submissionId]
  )
  const submission = subRes.rows[0]
  if (!submission) throw new Error("Soumission introuvable")
  if (submission.status !== 'SUBMITTED') {
    throw new Error("Seule une soumission en attente de validation peut être renvoyée en révision")
  }

  await query(
    `UPDATE "SubjectSubmission"
     SET status = 'REVISION_REQUESTED',
         "reviewerId" = $2,
         notes = $3,
         "reviewedAt" = NOW(),
         "updatedAt" = NOW()
     WHERE id = $1`,
    [submissionId, adminUser.id, message.trim()]
  )

  // Notifier le contributeur de la demande de révision
  await notify({
    userId: submission.authorId,
    type: 'REVISION_REQUESTED',
    title: 'Révision demandée',
    body: `Pour « ${submission.title || 'votre sujet'} » : ${message.trim()}`,
    link: '/contributeur/sujets',
    metadata: { submissionId },
  })

  revalidatePath('/admin/soumissions')
  revalidatePath('/admin/sujets')
  revalidatePath('/contributeur/sujets')
  revalidatePath('/contributeur')
  revalidatePath('/notifications')

  return { success: true as const }
}

/**
 * Compte les soumissions en attente de validation (status = SUBMITTED).
 * Utilisé pour le badge de la sidebar admin.
 */
export async function getPendingSubmissionsCount(): Promise<number> {
  try {
    const adminUser = await checkAdmin()
    if (!adminUser) return 0
    const result = await query(
      `SELECT COUNT(*)::int as count FROM "SubjectSubmission" WHERE status = 'SUBMITTED'`
    )
    return Number(result.rows[0]?.count || 0)
  } catch (error) {
    console.warn('getPendingSubmissionsCount error:', error)
    return 0
  }
}

/**
 * Récupère les statistiques des soumissions
 */
export async function getSubmissionsStats() {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const result = await query(`
    SELECT 
      COUNT(*) FILTER (WHERE status = 'SUBMITTED') as pending,
      COUNT(*) FILTER (WHERE status = 'VALIDATED') as validated,
      COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
      COUNT(*) as total
    FROM "SubjectSubmission"
  `)
  
  return result.rows[0]
}
