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

export type AnalyticsPeriod = '7d' | '30d' | '12m'

function getPeriodConfig(period: AnalyticsPeriod) {
  switch (period) {
    case '7d':
      return { interval: '7 days', grouping: "TO_CHAR(p.\"createdAt\", 'YYYY-MM-DD')", format: 'day' }
    case '30d':
      return { interval: '30 days', grouping: "TO_CHAR(p.\"createdAt\", 'YYYY-MM-DD')", format: 'day' }
    case '12m':
    default:
      return { interval: '12 months', grouping: "TO_CHAR(p.\"createdAt\", 'YYYY-MM')", format: 'month' }
  }
}

export async function getContributorAnalytics(period: AnalyticsPeriod = '12m') {
  const contributor = await getAuthenticatedContributor()
  const { interval, grouping, format } = getPeriodConfig(period)

  if (!contributor) {
    return {
      user: { prenom: 'Utilisateur', nom: '', role: 'CONTRIBUTEUR' },
      period,
      format,
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

  try {
    // Stats globales période - pondérées par filtrage temporel
    const statsResult = await query(`
      SELECT 
        COALESCE(SUM(p."creditsAmount" * 50), 0) as totalEarnings,
        COUNT(DISTINCT p.id) as totalSales,
        COALESCE((SELECT AVG(s2.rating) FROM "Subject" s2 WHERE s2."authorId" = $1 AND s2.rating > 0), 0) as averageRating
      FROM "Subject" s
      LEFT JOIN "Purchase" p ON s.id = p."subjectId" AND p."createdAt" >= NOW() - INTERVAL '${interval}'
      WHERE s."authorId" = $1
    `, [contributor.userId])

    // Historique des revenus (période demandée)
    const earningsHistoryResult = await query(`
      SELECT 
        ${grouping} as month,
        COUNT(*) as sales,
        SUM(p."creditsAmount" * 50) as earnings
      FROM "Purchase" p
      JOIN "Subject" s ON p."subjectId" = s.id
      WHERE s."authorId" = $1
        AND p."createdAt" >= NOW() - INTERVAL '${interval}'
      GROUP BY ${grouping}
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

    // Stats par sujet - sans downloadCount
    const subjectStatsResult = await query(`
      SELECT 
        s.id,
        s.titre,
        s.type,
        s.matiere,
        s.annee,
        s.rating,
        s."reviewsCount",
        0 as "downloadCount",
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
      period,
      format,
      stats: {
        totalEarnings: statsResult.rows[0]?.totalEarnings || 0,
        totalSales: statsResult.rows[0]?.totalSales || 0,
        averageRating: statsResult.rows[0]?.averageRating || 0,
        totalDownloads: 0
      },
      earningsHistory: earningsHistoryResult.rows || [],
      topSubjects: topSubjectsResult.rows || [],
      subjectStats: subjectStatsResult.rows || []
    }
  } catch (error) {
    console.error('Erreur getContributorAnalytics:', error)
    // Si certaines colonnes n'existent pas, retourner des données vides
    return {
      user: { prenom: 'Contributeur', nom: '', role: 'CONTRIBUTEUR' },
      period,
      format,
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
}
