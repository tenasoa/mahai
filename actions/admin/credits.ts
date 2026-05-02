'use server'

import { query, transaction } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/lib/audit'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return false
  
  const result = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]
  
  return user?.role === 'ADMIN' ? user : null
}

export async function getCreditTransactionsAdmin(status?: string, page?: number, pageSize?: number) {
  const user = await checkAdmin()
  if (!user) throw new Error("Non autorisé")

  let whereClause = ''
  const params: any[] = []

  if (status && status !== 'ALL') {
    whereClause = 'WHERE c.status = $1'
    params.push(status)
  }

  // Count total for pagination
  const countSql = `
    SELECT COUNT(*) FROM "CreditTransaction" c
    ${whereClause}
  `
  const countResult = await query(countSql, params)
  const total = parseInt(countResult.rows[0]?.count || '0', 10)

  // Main query with pagination
  let sql = `
    SELECT c.*, u.prenom, u.nom, u.email, u.phone as "userPhone"
    FROM "CreditTransaction" c
    JOIN "User" u ON c."userId" = u.id
    ${whereClause}
  `

  if (page && pageSize) {
    const offset = (page - 1) * pageSize
    sql += ` ORDER BY c."createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)
  } else {
    sql += ' ORDER BY c."createdAt" DESC'
  }

  const result = await query(sql, params)
  
  return {
    transactions: result.rows,
    pagination: {
      total,
      page: page || 1,
      pageSize: pageSize || 100,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1
    }
  }
}

export async function getCreditTransactionDetail(id: string) {
  const user = await checkAdmin()
  if (!user) throw new Error("Non autorisé")

  const result = await query(`
    SELECT c.*, u.prenom, u.nom, u.email, u.phone as "userPhone"
    FROM "CreditTransaction" c
    JOIN "User" u ON c."userId" = u.id
    WHERE c.id = $1
  `, [id])
  
  return result.rows[0] || null
}

export async function validateCreditTransaction(id: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const adminId = session!.user.id

  // ⚠ Race condition fix : on UPDATE atomiquement avec WHERE status='PENDING'
  // et RETURNING. Si rowCount = 0, c'est qu'un autre admin a déjà validé
  // entre temps — on rejette l'opération sans toucher au crédit user.
  // L'UPDATE de "User".credits + l'INSERT audit-log sont dans la même
  // transaction Postgres pour garantir l'atomicité (pas de double-crédit).
  const result = await transaction(async (client) => {
    const upd = await client.query(
      `UPDATE "CreditTransaction"
       SET status = 'COMPLETED', "validatedAt" = NOW(), "validatedBy" = $1
       WHERE id = $2 AND status = 'PENDING'
       RETURNING *`,
      [adminId, id],
    )

    if (upd.rowCount === 0) {
      return { ok: false as const, reason: 'Transaction introuvable ou déjà traitée' }
    }

    const tx = upd.rows[0]
    const creditsToAdd = tx.creditsCount || tx.amount

    await client.query(
      `UPDATE "User" SET credits = credits + $1 WHERE id = $2`,
      [creditsToAdd, tx.userId],
    )

    // Log atomique : si la transaction Postgres rollback, le log aussi.
    await client.query(
      `INSERT INTO "AdminAuditLog"
         (id, "adminId", "action", "targetType", "targetId", details)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::jsonb)`,
      [
        adminId,
        'CREDIT_TX_VALIDATE',
        'CreditTransaction',
        id,
        JSON.stringify({
          userId: tx.userId,
          creditsAdded: creditsToAdd,
          amount: tx.amount,
          paymentMethod: tx.paymentMethod,
          phoneNumber: tx.phoneNumber,
        }),
      ],
    )

    return { ok: true as const, tx }
  })

  if (!result.ok) {
    throw new Error(result.reason)
  }

  revalidatePath('/admin/credits')
  revalidatePath('/admin/utilisateurs')

  return { success: true }
}

export async function rejectCreditTransaction(id: string, reason: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  const adminId = session!.user.id

  // Atomique + idempotent (pas de double-rejet possible).
  const upd = await query(
    `UPDATE "CreditTransaction"
     SET status = 'FAILED', "rejectionReason" = $1, "validatedAt" = NOW(), "validatedBy" = $2
     WHERE id = $3 AND status = 'PENDING'
     RETURNING *`,
    [reason, adminId, id],
  )

  if (upd.rowCount === 0) {
    throw new Error('Transaction introuvable ou déjà traitée')
  }

  const tx = upd.rows[0]

  await logAdminAction({
    adminId,
    action: 'CREDIT_TX_REJECT',
    targetType: 'CreditTransaction',
    targetId: id,
    details: {
      userId: tx.userId,
      reason,
      amount: tx.amount,
      paymentMethod: tx.paymentMethod,
      phoneNumber: tx.phoneNumber,
    },
  })

  revalidatePath('/admin/credits')

  return { success: true }
}

export async function getPendingTransactionsCount() {
  const adminUser = await checkAdmin()
  if (!adminUser) return 0

  const result = await query('SELECT COUNT(*) FROM "CreditTransaction" WHERE status = $1', ['PENDING'])
  return parseInt(result.rows[0]?.count || '0', 10)
}
