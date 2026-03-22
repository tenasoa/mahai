import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'

export async function getContributorDashboard() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  // Vérifier que l'utilisateur est contributeur
  const userResult = await query('SELECT role, prenom, nom FROM "User" WHERE id = $1', [session.user.id])
  const user = userResult.rows[0]

  if (!['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN'].includes(user.role)) {
    redirect('/dashboard')
  }

  // KPIs
  const subjectsPublishedRes = await query(
    'SELECT COUNT(*) FROM "Subject" WHERE "authorId" = $1 AND status = $2',
    [session.user.id, 'PUBLISHED']
  )
  const subjectsPendingRes = await query(
    'SELECT COUNT(*) FROM "Subject" WHERE "authorId" = $1 AND status = $2',
    [session.user.id, 'PENDING']
  )
  const salesRes = await query(
    'SELECT COUNT(*) FROM "Purchase" p JOIN "Subject" s ON p."subjectId" = s.id WHERE s."authorId" = $1',
    [session.user.id]
  )
  const revenueRes = await query(
    `SELECT COALESCE(SUM(s.credits), 0) as total 
     FROM "Purchase" p 
     JOIN "Subject" s ON p."subjectId" = s.id 
     WHERE s."authorId" = $1`,
    [session.user.id]
  )

  // Top sujets
  const topSubjectsRes = await query(
    `SELECT s.id, s.titre, s.credits, 
            COUNT(p.id) as ventes,
            s.credits * COUNT(p.id) as revenus
     FROM "Subject" s
     LEFT JOIN "Purchase" p ON s.id = p."subjectId"
     WHERE s."authorId" = $1 AND s.status = 'PUBLISHED'
     GROUP BY s.id
     ORDER BY revenus DESC
     LIMIT 5`,
    [session.user.id]
  )

  // Tous les sujets
  const allSubjectsRes = await query(
    `SELECT s.id, s.titre, s.difficulte as grade, s.annee as year, 
            s.serie as series, s.format, s.credits, s.status,
            COUNT(p.id) as ventes,
            s.credits * COUNT(p.id) as revenus
     FROM "Subject" s
     LEFT JOIN "Purchase" p ON s.id = p."subjectId"
     WHERE s."authorId" = $1
     GROUP BY s.id
     ORDER BY s."createdAt" DESC`,
    [session.user.id]
  )

  return {
    user,
    kpi: {
      published: parseInt(subjectsPublishedRes.rows[0].count),
      pending: parseInt(subjectsPendingRes.rows[0].count),
      sales: parseInt(salesRes.rows[0].count),
      revenue: parseInt(revenueRes.rows[0].total)
    },
    topSubjects: topSubjectsRes.rows,
    allSubjects: allSubjectsRes.rows
  }
}
