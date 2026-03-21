'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'

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

export async function getContributorAnalytics() {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) {
    return {
      user: { prenom: 'Utilisateur', nom: '', role: 'CONTRIBUTEUR' },
      stats: {
        totalEarnings: 0,
        totalSales: 0,
        averageRating: 0,
        totalDownloads: 0
      },
      earningsHistory: [],
      topSubjects: [],
      subjectStats: []
    }
  }

  // Stats globales
  const statsResult = await query(`
    SELECT 
      COALESCE(SUM(p."creditsAmount" * 50), 0) as totalEarnings,
      COUNT(DISTINCT p.id) as totalSales,
      COALESCE(AVG(s.rating), 0) as averageRating,
      COALESCE(SUM(s.downloadCount), 0) as totalDownloads
    FROM "Subject" s
    LEFT JOIN "Purchase" p ON s.id = p."subjectId"
    WHERE s."authorId" = $1
  `, [contributor.userId])

  // Historique des revenus (6 derniers mois)
  const earningsHistoryResult = await query(`
    SELECT 
      TO_CHAR(p."createdAt", 'YYYY-MM') as month,
      COUNT(*) as sales,
      SUM(p."creditsAmount" * 50) as earnings
    FROM "Purchase" p
    JOIN "Subject" s ON p."subjectId" = s.id
    WHERE s."authorId" = $1
      AND p."createdAt" >= NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(p."createdAt", 'YYYY-MM')
    ORDER BY month ASC
  `, [contributor.userId])

  // Top sujets
  const topSubjectsResult = await query(`
    SELECT 
      s.id,
      s.titre,
      s.rating,
      s."reviewsCount",
      COUNT(p.id) as sales,
      SUM(p."creditsAmount") as revenue
    FROM "Subject" s
    LEFT JOIN "Purchase" p ON s.id = p."subjectId"
    WHERE s."authorId" = $1
    GROUP BY s.id
    ORDER BY revenue DESC NULLS LAST
    LIMIT 5
  `, [contributor.userId])

  // Stats par sujet
  const subjectStatsResult = await query(`
    SELECT 
      s.id,
      s.titre,
      s.type,
      s.matiere,
      s.annee,
      s.rating,
      s."reviewsCount",
      s."downloadCount",
      COUNT(p.id) as sales,
      COALESCE(SUM(p."creditsAmount"), 0) as revenue
    FROM "Subject" s
    LEFT JOIN "Purchase" p ON s.id = p."subjectId"
    WHERE s."authorId" = $1
    GROUP BY s.id
    ORDER BY s."createdAt" DESC
  `, [contributor.userId])

  return {
    user: { prenom: 'Contributeur', nom: '', role: 'CONTRIBUTEUR' },
    stats: {
      totalEarnings: statsResult.rows[0]?.totalEarnings || 0,
      totalSales: statsResult.rows[0]?.totalSales || 0,
      averageRating: statsResult.rows[0]?.averageRating || 0,
      totalDownloads: statsResult.rows[0]?.totalDownloads || 0
    },
    earningsHistory: earningsHistoryResult.rows || [],
    topSubjects: topSubjectsResult.rows || [],
    subjectStats: subjectStatsResult.rows || []
  }
}
