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

export async function getSubjectStats(subjectId: string) {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) {
    return {
      user: { prenom: 'Utilisateur', nom: '', role: 'CONTRIBUTEUR' },
      subject: null,
      stats: {
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalDownloads: 0
      },
      salesHistory: [],
      recentPurchases: []
    }
  }

  try {
    // Récupérer le sujet
    const subjectResult = await query(`
      SELECT * FROM "Subject" WHERE id = $1 AND "authorId" = $2
    `, [subjectId, contributor.userId])

    const subject = subjectResult.rows[0]
    if (!subject) {
      return {
        user: { prenom: 'Utilisateur', nom: '', role: 'CONTRIBUTEUR' },
        subject: null,
        stats: {
          totalSales: 0,
          totalRevenue: 0,
          averageRating: 0,
          totalDownloads: 0
        },
        salesHistory: [],
        recentPurchases: []
      }
    }

    // Stats du sujet
    const statsResult = await query(`
      SELECT 
        COUNT(p.id) as totalSales,
        COALESCE(SUM(p."creditsAmount" * 50), 0) as totalRevenue,
        COALESCE(s.rating, 0) as averageRating,
        COALESCE(s."downloadCount", 0) as totalDownloads
      FROM "Subject" s
      LEFT JOIN "Purchase" p ON s.id = p."subjectId"
      WHERE s.id = $1
      GROUP BY s.id
    `, [subjectId])

    // Historique des ventes (6 derniers mois)
    const salesHistoryResult = await query(`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*) as sales,
        SUM("creditsAmount" * 50) as revenue
      FROM "Purchase"
      WHERE "subjectId" = $1
        AND "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `, [subjectId])

    // Achats récents
    const recentPurchasesResult = await query(`
      SELECT 
        p.*,
        u.prenom,
        u.nom,
        u.email
      FROM "Purchase" p
      JOIN "User" u ON p."userId" = u.id
      WHERE p."subjectId" = $1
      ORDER BY p."createdAt" DESC
      LIMIT 10
    `, [subjectId])

    return {
      user: { prenom: 'Contributeur', nom: '', role: 'CONTRIBUTEUR' },
      subject,
      stats: {
        totalSales: statsResult.rows[0]?.totalSales || 0,
        totalRevenue: statsResult.rows[0]?.totalRevenue || 0,
        averageRating: statsResult.rows[0]?.averageRating || 0,
        totalDownloads: statsResult.rows[0]?.totalDownloads || 0
      },
      salesHistory: salesHistoryResult.rows || [],
      recentPurchases: recentPurchasesResult.rows || []
    }
  } catch (error) {
    console.error('Erreur getSubjectStats:', error)
    // Si certaines colonnes n'existent pas, retourner des données vides
    return {
      user: { prenom: 'Contributeur', nom: '', role: 'CONTRIBUTEUR' },
      subject: null,
      stats: {
        totalSales: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalDownloads: 0
      },
      salesHistory: [],
      recentPurchases: []
    }
  }
}
