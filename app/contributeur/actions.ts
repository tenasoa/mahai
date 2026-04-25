'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { redirect } from 'next/navigation'

export type DashboardPeriod = '7d' | '30d' | '90d' | '12m' | 'all'

function periodToInterval(period: DashboardPeriod): string | null {
  switch (period) {
    case '7d': return '7 days'
    case '30d': return '30 days'
    case '90d': return '90 days'
    case '12m': return '12 months'
    case 'all':
    default: return null
  }
}

export async function getContributorDashboard(period: DashboardPeriod = '30d') {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect('/auth/login')

  // Vérifier que l'utilisateur est contributeur
  const userResult = await query('SELECT role, prenom, nom FROM "User" WHERE id = $1', [session.user.id])
  const user = userResult.rows[0]

  if (!['CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN'].includes(user.role)) {
    redirect('/dashboard')
  }

  const userId = session.user.id
  const interval = periodToInterval(period)

  // Clause WHERE période (sur Purchase.createdAt)
  const periodClause = interval ? `AND p."createdAt" >= NOW() - INTERVAL '${interval}'` : ''
  const prevPeriodClause = interval
    ? `AND p."createdAt" >= NOW() - INTERVAL '${interval}' * 2 AND p."createdAt" < NOW() - INTERVAL '${interval}'`
    : ''

  // KPIs catalogue (indépendants de la période)
  const subjectsPublishedRes = await query(
    'SELECT COUNT(*) FROM "Subject" WHERE "authorId" = $1 AND status = $2',
    [userId, 'PUBLISHED']
  )
  // Sujets en attente dans Subject (ancien système)
  const subjectsPendingRes = await query(
    'SELECT COUNT(*) FROM "Subject" WHERE "authorId" = $1 AND status = $2',
    [userId, 'PENDING']
  )
  // Soumissions en attente de validation (nouveau système)
  const submissionsPendingRes = await query(
    'SELECT COUNT(*) FROM "SubjectSubmission" WHERE "authorId" = $1 AND status = $2',
    [userId, 'SUBMITTED']
  )

  // Ventes et revenus sur la période courante
  const currentRes = await query(
    `SELECT 
        COUNT(p.id) AS sales,
        COALESCE(SUM(s.credits), 0) AS revenue
     FROM "Purchase" p
     JOIN "Subject" s ON p."subjectId" = s.id
     WHERE s."authorId" = $1 ${periodClause}`,
    [userId]
  )

  // Période précédente (pour trend %)
  const prevRes = interval
    ? await query(
        `SELECT 
            COUNT(p.id) AS sales,
            COALESCE(SUM(s.credits), 0) AS revenue
         FROM "Purchase" p
         JOIN "Subject" s ON p."subjectId" = s.id
         WHERE s."authorId" = $1 ${prevPeriodClause}`,
        [userId]
      )
    : { rows: [{ sales: 0, revenue: 0 }] }

  // Note moyenne pondérée (U7)
  const ratingRes = await query(
    `SELECT 
        COALESCE(AVG(s.rating) FILTER (WHERE s.rating > 0), 0) AS avg_rating,
        COUNT(*) FILTER (WHERE s.rating > 0) AS rated_count
     FROM "Subject" s
     WHERE s."authorId" = $1`,
    [userId]
  )

  // Top sujets (période courante)
  const topSubjectsRes = await query(
    `SELECT s.id, s.titre, s.matiere, s.serie, s.credits, 
            COUNT(p.id) AS ventes,
            s.credits * COUNT(p.id) AS revenus
     FROM "Subject" s
     LEFT JOIN "Purchase" p ON s.id = p."subjectId" ${periodClause ? `AND TRUE ${periodClause}` : ''}
     WHERE s."authorId" = $1 AND s.status = 'PUBLISHED'
     GROUP BY s.id
     ORDER BY revenus DESC NULLS LAST, ventes DESC
     LIMIT 5`,
    [userId]
  )

  // Tous les sujets (pour status breakdown)
  const allSubjectsRes = await query(
    `SELECT s.id, s.titre, s.difficulte AS grade, s.annee AS year, 
            s.serie AS series, s.format, s.credits, s.status
     FROM "Subject" s
     WHERE s."authorId" = $1
     ORDER BY s."createdAt" DESC`,
    [userId]
  )

  // Soumissions de l'utilisateur (nouveau système)
  const mySubmissionsRes = await query(
    `SELECT id, title, matiere, "examType", "anneeScolaire", 
            serie, status, "createdAt", "updatedAt"
     FROM "SubjectSubmission"
     WHERE "authorId" = $1
     ORDER BY "createdAt" DESC`,
    [userId]
  )

  const currentSales = parseInt(currentRes.rows[0]?.sales || '0', 10)
  const currentRevenue = parseInt(currentRes.rows[0]?.revenue || '0', 10)
  const prevSales = parseInt(prevRes.rows[0]?.sales || '0', 10)
  const prevRevenue = parseInt(prevRes.rows[0]?.revenue || '0', 10)

  const computeTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 1000) / 10 // 1 décimale
  }

  const submissionsPendingCount = parseInt(submissionsPendingRes.rows[0].count)
  const subjectsPendingCount = parseInt(subjectsPendingRes.rows[0].count)

  return {
    user,
    period,
    kpi: {
      published: parseInt(subjectsPublishedRes.rows[0].count),
      pending: subjectsPendingCount,
      pendingSubmissions: submissionsPendingCount,
      totalPending: subjectsPendingCount + submissionsPendingCount,
      sales: currentSales,
      revenue: currentRevenue,
      averageRating: parseFloat(ratingRes.rows[0]?.avg_rating || '0'),
      ratedCount: parseInt(ratingRes.rows[0]?.rated_count || '0', 10),
      revenueTrend: computeTrend(currentRevenue, prevRevenue),
      salesTrend: computeTrend(currentSales, prevSales)
    },
    topSubjects: topSubjectsRes.rows,
    allSubjects: allSubjectsRes.rows,
    submissions: mySubmissionsRes.rows
  }
}
