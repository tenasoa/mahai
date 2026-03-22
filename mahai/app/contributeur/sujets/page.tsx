import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'
import ContributorSubjectsClient from './SubjectsClient'

async function getContributorSubjects() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  // Récupérer l'utilisateur
  const userResult = await query('SELECT role, prenom, nom FROM "User" WHERE id = $1', [session.user.id])
  const user = userResult.rows[0]

  if (!['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN'].includes(user.role)) {
    redirect('/dashboard')
  }

  // Récupérer tous les sujets de l'utilisateur
  const subjectsResult = await query(
    `SELECT s.id, s.titre, s.matiere, s.difficulte as grade, s.annee as year, 
            s.serie as series, s.format, s.credits, s.status, s."createdAt",
            COUNT(p.id) as ventes,
            s.credits * COUNT(p.id) as revenus
     FROM "Subject" s
     LEFT JOIN "Purchase" p ON s.id = p."subjectId"
     WHERE s."authorId" = $1
     GROUP BY s.id
     ORDER BY s."createdAt" DESC`,
    [session.user.id]
  )

  // Compter par statut
  const statsResult = await query(
    `SELECT status, COUNT(*) as count
     FROM "Subject"
     WHERE "authorId" = $1
     GROUP BY status`,
    [session.user.id]
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

  return {
    user,
    subjects: subjectsResult.rows,
    stats
  }
}

export default async function ContributorSubjectsPage() {
  const data = await getContributorSubjects()

  return <ContributorSubjectsClient {...data} />
}
