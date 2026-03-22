'use server'

import { revalidatePath } from 'next/cache'
import { query, transaction } from '@/lib/db'
import { findExistingPurchase } from '@/lib/sql-queries'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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
