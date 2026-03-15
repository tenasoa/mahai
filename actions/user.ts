'use server'

import { transaction } from '@/lib/db'
import { getUserById, updateUserCredits, createPurchase, findExistingPurchase, createCreditTransaction } from '@/lib/sql-queries'

export async function getUserCredits(userId: string) {
  try {
    const user = await getUserById(userId)
    return user?.credits || 0
  } catch (error) {
    console.error('Error fetching user credits:', error)
    return 0
  }
}

export async function purchaseSubject(subjectId: string, userId: string) {
  try {
    // Get subject and user in parallel using raw SQL
    const { query } = await import('@/lib/db')
    
    const [subjectResult, userResult] = await Promise.all([
      query('SELECT * FROM "Subject" WHERE id = $1', [subjectId]),
      query('SELECT * FROM "User" WHERE id = $1', [userId])
    ])

    const subject = subjectResult.rows[0]
    const user = userResult.rows[0]

    if (!subject || !user) {
      return { success: false, error: 'Sujet ou utilisateur introuvable' }
    }

    // Check if already purchased
    const existingPurchase = await findExistingPurchase(userId, subjectId)
    if (existingPurchase) {
      return { success: true, alreadyOwned: true }
    }

    // Check credits
    if (user.credits < subject.credits) {
      return { success: false, error: 'Crédits insuffisants' }
    }

    // Perform transaction
    await transaction(async (client) => {
      // Update user credits
      await client.query(
        'UPDATE "User" SET credits = credits - $1, "updatedAt" = NOW() WHERE id = $2',
        [subject.credits, userId]
      )

      // Create purchase
      await client.query(
        `INSERT INTO "Purchase" ("userId", "subjectId", "creditsAmount", amount, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, subjectId, subject.credits, 0, 'COMPLETED']
      )

      // Create credit transaction
      await client.query(
        `INSERT INTO "CreditTransaction" ("userId", amount, type, description, status) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, -subject.credits, 'SPEND', `Achat du sujet: ${subject.titre}`, 'COMPLETED']
      )
    })

    return { success: true }
  } catch (error) {
    console.error('Error purchasing subject:', error)
    return { success: false, error: 'Erreur lors de la transaction' }
  }
}
