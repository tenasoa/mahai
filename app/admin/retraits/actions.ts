'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return false

  const result = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]

  return user?.role === 'ADMIN' ? user : null
}

export async function getAdminWithdrawals() {
  const admin = await checkAdmin()
  if (!admin) {
    return {
      withdrawals: [],
      stats: {
        pending: 0,
        pendingAmount: 0,
        completed: 0,
        completedAmount: 0,
        failed: 0,
        totalAmount: 0
      },
      cycle: {
        current: 'Mars 2026',
        period: '1 fév. → 28 fév. 2026',
        threshold: 500,
        daysLeft: 17
      }
    }
  }

  try {
    // Stats globales
    const statsResult = await query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) as pendingAmount,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed,
        COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) as completedAmount,
        COUNT(*) FILTER (WHERE status = 'FAILED') as failed,
        COALESCE(SUM(amount), 0) as totalAmount
      FROM "Withdrawal"
      WHERE EXTRACT(MONTH FROM "createdAt") = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM "createdAt") = EXTRACT(YEAR FROM NOW())
    `)

    // Liste des retraits du mois
    const withdrawalsResult = await query(`
      SELECT w.*, u.prenom, u.nom, u.email, u.credits
      FROM "Withdrawal" w
      JOIN "User" u ON w."userId" = u.id
      WHERE EXTRACT(MONTH FROM w."createdAt") = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM w."createdAt") = EXTRACT(YEAR FROM NOW())
      ORDER BY w."createdAt" DESC
      LIMIT 100
    `)

    const stats = statsResult.rows[0]

    return {
      withdrawals: withdrawalsResult.rows || [],
      stats: {
        pending: stats?.pending || 0,
        pendingAmount: stats?.pendingAmount || 0,
        completed: stats?.completed || 0,
        completedAmount: stats?.completedAmount || 0,
        failed: stats?.failed || 0,
        totalAmount: stats?.totalAmount || 0
      },
      cycle: {
        current: 'Mars 2026',
        period: '1 fév. → 28 fév. 2026',
        threshold: 500,
        daysLeft: 17
      }
    }
  } catch (error) {
    console.error('Erreur getAdminWithdrawals:', error)
    return {
      withdrawals: [],
      stats: {
        pending: 0,
        pendingAmount: 0,
        completed: 0,
        completedAmount: 0,
        failed: 0,
        totalAmount: 0
      },
      cycle: {
        current: 'Mars 2026',
        period: '1 fév. → 28 fév. 2026',
        threshold: 500,
        daysLeft: 17
      }
    }
  }
}

export async function processWithdrawal(id: string, action: 'approve' | 'reject' | 'send', reason?: string) {
  const admin = await checkAdmin()
  if (!admin) {
    return { success: false, error: 'Non autorisé' }
  }

  try {
    if (action === 'approve') {
      await query(`
        UPDATE "Withdrawal" 
        SET status = 'PROCESSING', "processedAt" = NOW()
        WHERE id = $1
      `, [id])
    } else if (action === 'reject') {
      await query(`
        UPDATE "Withdrawal" 
        SET status = 'FAILED', "rejectionReason" = $2, "processedAt" = NOW()
        WHERE id = $1
      `, [id, reason || ''])
    } else if (action === 'send') {
      await query(`
        UPDATE "Withdrawal" 
        SET status = 'COMPLETED', "transactionId" = $2, "processedAt" = NOW()
        WHERE id = $1
      `, [id, `TXN-${Date.now()}`])
    }

    return { success: true }
  } catch (error) {
    console.error('Erreur processWithdrawal:', error)
    return { success: false, error: 'Erreur lors du traitement' }
  }
}

export async function runBulkPayments(withdrawalIds: string[]) {
  const admin = await checkAdmin()
  if (!admin) {
    return { success: false, error: 'Non autorisé' }
  }

  try {
    const placeholders = withdrawalIds.map((_, i) => `$${i + 1}`).join(',')
    await query(`
      UPDATE "Withdrawal" 
      SET status = 'COMPLETED', 
          "transactionId" = 'BULK-' || EXTRACT(EPOCH FROM NOW())::TEXT,
          "processedAt" = NOW()
      WHERE id IN (${placeholders})
        AND status IN ('PENDING', 'PROCESSING')
    `, withdrawalIds)

    return { success: true, message: `${withdrawalIds.length} paiements envoyés` }
  } catch (error) {
    console.error('Erreur runBulkPayments:', error)
    return { success: false, error: 'Erreur lors des paiements groupés' }
  }
}
