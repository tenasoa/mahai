'use server'

import { revalidatePath } from 'next/cache'
import { query, transaction } from '@/lib/db'
import { findExistingPurchase } from '@/lib/sql-queries'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface UpcomingExam {
  id: string
  title: string
  date: string
  slot: string
  center: string
  readiness: number
}

export interface WeeklyProgress {
  day: string
  solved: number
}

export interface DashboardData {
  upcomingExams: UpcomingExam[]
  weeklyProgress: WeeklyProgress[]
  totalSolved: number
  examCount: number
}

async function getAuthenticatedUserId() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user.id
}

export async function getCurrentUserCredits() {
  try {
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return 0
    }

    const result = await query('SELECT credits FROM "User" WHERE id = $1', [userId])
    return result.rows[0]?.credits || 0
  } catch (error) {
    console.error('Error fetching current user credits:', error)
    return 0
  }
}

export async function purchaseCurrentUserSubject(subjectId: string) {
  try {
    const userId = await getAuthenticatedUserId()

    if (!userId) {
      return { success: false, error: 'Vous devez être connecté pour acheter un sujet' }
    }

    const [subjectResult, userResult] = await Promise.all([
      query('SELECT id, titre, credits FROM "Subject" WHERE id = $1', [subjectId]),
      query('SELECT id, credits FROM "User" WHERE id = $1', [userId]),
    ])

    const subject = subjectResult.rows[0]
    const user = userResult.rows[0]

    if (!subject || !user) {
      return { success: false, error: 'Sujet ou utilisateur introuvable' }
    }

    const existingPurchase = await findExistingPurchase(userId, subjectId)
    if (existingPurchase) {
      return {
        success: true,
        alreadyOwned: true,
        remainingCredits: user.credits,
      }
    }

    if (user.credits < subject.credits) {
      return { success: false, error: 'Crédits insuffisants' }
    }

    const remainingCredits = user.credits - subject.credits

    await transaction(async (client) => {
      await client.query(
        'UPDATE "User" SET credits = credits - $1, "updatedAt" = NOW() WHERE id = $2',
        [subject.credits, userId]
      )

      await client.query(
        `INSERT INTO "Purchase" ("id", "userId", "subjectId", "creditsAmount", amount, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [crypto.randomUUID(), userId, subjectId, subject.credits, 0, 'COMPLETED']
      )

      await client.query(
        `INSERT INTO "CreditTransaction" ("id", "userId", amount, type, description, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [crypto.randomUUID(), userId, -subject.credits, 'SPEND', `Achat du sujet: ${subject.titre}`, 'COMPLETED']
      )
    })

    revalidatePath('/catalogue')
    revalidatePath(`/sujet/${subjectId}`)
    revalidatePath('/profil')
    revalidatePath('/dashboard')

    return {
      success: true,
      remainingCredits,
    }
  } catch (error) {
    console.error('Error purchasing subject:', error)
    return { success: false, error: 'Erreur lors de la transaction' }
  }
}

export async function getDashboardData(): Promise<DashboardData> {
  try {
    const userId = await getAuthenticatedUserId()
    if (!userId) {
      return { upcomingExams: [], weeklyProgress: [], totalSolved: 0, examCount: 0 }
    }

    // Récupérer les examens blancs de l'utilisateur (limit 3)
    const examsResult = await query(
      `SELECT id, titre, "typeExamen", matiere, annee, "dureeSecondes", 
              status, "startedAt", "submittedAt", score, "scoreMax"
       FROM "ExamenBlanc"
       WHERE "userId" = $1 AND status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')
       ORDER BY "createdAt" DESC
       LIMIT 3`,
      [userId]
    )

    const upcomingExams: UpcomingExam[] = examsResult.rows.map((exam: any) => ({
      id: exam.id,
      title: exam.titre || `${exam.typeExamen} ${exam.matiere}`,
      date: exam.startedAt || new Date().toISOString().split('T')[0],
      slot: formatDuration(exam.dureeSecondes || 10800),
      center: 'Session personnelle',
      readiness: exam.score && exam.scoreMax ? Math.round((exam.score / exam.scoreMax) * 100) : 0,
    }))

    // Récupérer les sujets résolus cette semaine (simulé à partir des achats récents)
    const weekResult = await query(
      `SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as count
       FROM "Purchase"
       WHERE "userId" = $1 
         AND status = 'COMPLETED'
         AND "createdAt" >= NOW() - INTERVAL '7 days'
       GROUP BY DATE_TRUNC('day', "createdAt")
       ORDER BY day`,
      [userId]
    )

    // Construire la progression hebdomadaire
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const weeklyProgress: WeeklyProgress[] = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayName = dayNames[date.getDay()]
      const dayStr = date.toISOString().split('T')[0]
      
      const dayData = weekResult.rows.find((r: any) => r.day?.toISOString().startsWith(dayStr))
      weeklyProgress.push({
        day: dayName,
        solved: parseInt(dayData?.count || '0')
      })
    }

    // Total résolu = nombre d'achats complétés
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM "Purchase" WHERE "userId" = $1 AND status = 'COMPLETED'`,
      [userId]
    )

    return {
      upcomingExams,
      weeklyProgress,
      totalSolved: parseInt(totalResult.rows[0]?.total || '0'),
      examCount: examsResult.rowCount || 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return { upcomingExams: [], weeklyProgress: [], totalSolved: 0, examCount: 0 }
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0 && mins > 0) return `${hours}h${mins}`
  if (hours > 0) return `${hours}h`
  return `${mins}min`
}
