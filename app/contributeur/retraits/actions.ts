'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { query } from '@/lib/db'
import { notifyAdmins } from '@/lib/notifications'

async function getAuthenticatedContributor() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  const result = await query('SELECT id, role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]

  // Seuls les contributeurs et admins peuvent accéder
  if (!user || !['CONTRIBUTEUR', 'ADMIN', 'PROFESSEUR'].includes(user.role)) {
    return null
  }

  return { userId: user.id, role: user.role }
}

export async function getContributorWithdrawals() {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) {
    return {
      user: { prenom: 'Utilisateur', nom: '', role: 'CONTRIBUTEUR' },
      withdrawals: [],
      stats: {
        totalWithdrawn: 0,
        pending: 0,
        thisMonth: 0,
        averageWithdrawal: 0
      },
      balance: {
        available: 0,
        pending: 0
      }
    }
  }

  // Calcul des revenus (Purchase + Subject existent toujours)
  const earningsResult = await query(`
    SELECT COALESCE(SUM("creditsAmount" * 50), 0) as totalEarnings
    FROM "Purchase" p
    JOIN "Subject" s ON p."subjectId" = s.id
    WHERE s."authorId" = $1
  `, [contributor.userId])

  const totalEarnings = Number(earningsResult.rows[0]?.totalEarnings) || 0

  // Queries sur la table Withdrawal (peut ne pas exister encore)
  let withdrawals: any[] = []
  let totalWithdrawn = 0
  let pending = 0
  let thisMonth = 0
  let withdrawalCount = 0

  try {
    const withdrawalsResult = await query(`
      SELECT w.*, u.prenom, u.nom, u.phone
      FROM "Withdrawal" w
      JOIN "User" u ON w."userId" = u.id
      WHERE w."userId" = $1
      ORDER BY w."createdAt" DESC
      LIMIT 50
    `, [contributor.userId])
    withdrawals = withdrawalsResult.rows || []

    const statsResult = await query(`
      SELECT
        COALESCE(SUM(amount), 0) as total,
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN EXTRACT(MONTH FROM "createdAt") = EXTRACT(MONTH FROM NOW()) THEN amount ELSE 0 END), 0) as thisMonth,
        COUNT(*) as count
      FROM "Withdrawal"
      WHERE "userId" = $1
    `, [contributor.userId])

    const withdrawnResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as totalWithdrawn
      FROM "Withdrawal"
      WHERE "userId" = $1 AND status = 'COMPLETED'
    `, [contributor.userId])

    totalWithdrawn = Number(withdrawnResult.rows[0]?.totalWithdrawn) || 0
    pending = Number(statsResult.rows[0]?.pending) || 0
    thisMonth = Number(statsResult.rows[0]?.thisMonth) || 0
    withdrawalCount = Number(statsResult.rows[0]?.count) || 0
  } catch (error) {
    // Table Withdrawal pas encore créée — solde = revenus bruts
    console.warn('Table Withdrawal non disponible:', error)
  }

  return {
    user: { prenom: 'Contributeur', nom: '', role: 'CONTRIBUTEUR' },
    withdrawals,
    stats: {
      totalWithdrawn,
      pending,
      thisMonth,
      averageWithdrawal: withdrawalCount > 0 ? totalWithdrawn / withdrawalCount : 0
    },
    balance: {
      available: totalEarnings - totalWithdrawn - pending,
      pending
    }
  }
}

export async function requestWithdrawal(amount: number, phoneNumber: string, paymentMethod: string = 'MVOLA') {
  const contributor = await getAuthenticatedContributor()
  if (!contributor) {
    return { success: false, error: 'Non autorisé' }
  }

  try {
    if (amount <= 0) {
      return { success: false, error: 'Le montant doit être supérieur à 0' }
    }

    if (amount < 5000) {
      return { success: false, error: 'Le montant minimum est de 5 000 Ar' }
    }

    // Vérifier le solde disponible
    const earningsResult = await query(`
      SELECT COALESCE(SUM("creditsAmount" * 50), 0) as totalEarnings
      FROM "Purchase" p
      JOIN "Subject" s ON p."subjectId" = s.id
      WHERE s."authorId" = $1
    `, [contributor.userId])

    const withdrawnResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as totalWithdrawn
      FROM "Withdrawal"
      WHERE "userId" = $1 AND status = 'COMPLETED'
    `, [contributor.userId])

    const pendingResult = await query(`
      SELECT COALESCE(SUM(amount), 0) as pending
      FROM "Withdrawal"
      WHERE "userId" = $1 AND status IN ('PENDING', 'PROCESSING')
    `, [contributor.userId])

    const totalEarnings = earningsResult.rows[0]?.totalEarnings || 0
    const totalWithdrawn = withdrawnResult.rows[0]?.totalWithdrawn || 0
    const pending = pendingResult.rows[0]?.pending || 0
    const available = totalEarnings - totalWithdrawn - pending

    if (amount > available) {
      return { success: false, error: 'Solde insuffisant' }
    }

    // Créer la demande de retrait
    const withdrawalId = crypto.randomUUID()
    await query(`
      INSERT INTO "Withdrawal" ("id", "userId", "amount", "phoneNumber", "status", "paymentMethod")
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      withdrawalId,
      contributor.userId,
      amount,
      phoneNumber,
      'PENDING',
      paymentMethod
    ])

    await notifyAdmins({
      type: 'WITHDRAWAL_REQUESTED',
      title: 'Nouvelle demande de retrait',
      body: `${amount.toLocaleString('fr-FR')} Ar à traiter (${paymentMethod})`,
      link: '/admin/retraits',
      metadata: { withdrawalId, amount, paymentMethod },
    })

    return { success: true, message: 'Demande de retrait envoyée' }
  } catch (error) {
    console.error('Erreur requestWithdrawal:', error)
    return { success: false, error: 'Erreur lors de la demande de retrait' }
  }
}
