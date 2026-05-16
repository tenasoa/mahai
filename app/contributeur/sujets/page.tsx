import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import { requireAuth, isAuthFailure } from '@/lib/auth-guards'
import ContributorSubjectsClient from './SubjectsClient'

async function getContributorSubjects() {
  const auth = await requireAuth()
  if (isAuthFailure(auth)) redirect('/auth/login')

  // Récupérer l'utilisateur
  const userResult = await query('SELECT role, prenom, nom FROM "User" WHERE id = $1', [auth.userId])
  const user = userResult.rows[0]

  if (!user || !['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Récupérer tous les sujets de l'utilisateur — inclut les métadonnées
  // enrichies copiées depuis SubjectSubmission lors de la publication.
  const subjectsResult = await query(
    `SELECT s.id, s.titre, s.matiere, s.difficulte as grade, s.annee as year,
            s.serie as series, s.format, s.prix, s.prix as credits, s.status, s."createdAt",
            s.duree, s.coefficient, s.filiere, s.niveau,
            s."examType", s."anneeScolaire", s."dateOfficielle",
            s."customMeta",
            COUNT(p.id) as ventes,
            s.prix * COUNT(p.id) as revenus
     FROM "Subject" s
     LEFT JOIN "Purchase" p ON s.id = p."subjectId"
     WHERE s."authorId" = $1
     GROUP BY s.id
     ORDER BY s."createdAt" DESC`,
    [auth.userId]
  )

  // Compter par statut
  const statsResult = await query(
    `SELECT status, COUNT(*) as count
     FROM "Subject"
     WHERE "authorId" = $1
     GROUP BY status`,
    [auth.userId]
  )

  const stats = {
    published: 0,
    pending: 0,
    rejected: 0,
    draft: 0
  }
  statsResult.rows.forEach((row: any) => {
    stats[row.status.toLowerCase() === 'published' ? 'published' : row.status.toLowerCase() === 'pending' ? 'pending' : row.status.toLowerCase() === 'rejected' ? 'rejected' : 'draft'] = parseInt(row.count)
  })

  // Récupérer les soumissions (SubjectSubmission) — tous statuts
  const submissionsResult = await query(
    `SELECT id, title, matiere, "examType", "anneeScolaire", serie,
            prix, status, "createdAt",
            'SUBMISSION' as source
     FROM "SubjectSubmission"
     WHERE "authorId" = $1
     ORDER BY "createdAt" DESC`,
    [auth.userId]
  )

  // Compter les soumissions par statut
  const submissionStats = { submitted: 0, draft: 0, revision: 0 }
  submissionsResult.rows.forEach((row: any) => {
    if (row.status === 'SUBMITTED') submissionStats.submitted++
    else if (row.status === 'DRAFT') submissionStats.draft++
    else if (row.status === 'REVISION_REQUESTED') submissionStats.revision++
  })

  return {
    user,
    subjects: subjectsResult.rows,
    submissions: submissionsResult.rows,
    stats: {
      ...stats,
      submitted: submissionStats.submitted,
      submissionDrafts: submissionStats.draft,
      revisionRequested: submissionStats.revision
    }
  }
}

export default async function ContributorSubjectsPage() {
  const data = await getContributorSubjects()

  return <ContributorSubjectsClient {...data} />
}
