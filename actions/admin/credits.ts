'use server'

import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return false
  
  const result = await query('SELECT role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]
  
  return user?.role === 'ADMIN' ? user : null
}

export async function getCreditTransactionsAdmin(status?: string) {
  const user = await checkAdmin()
  if (!user) throw new Error("Non autorisé")

  let sql = `
    SELECT c.*, u.prenom, u.nom, u.email, u.telephone as "userPhone" 
    FROM "CreditTransaction" c
    JOIN "User" u ON c."userId" = u.id
  `
  const params: any[] = []

  if (status && status !== 'ALL') {
    sql += ' WHERE c.status = $1'
    params.push(status)
  }

  sql += ' ORDER BY c."createdAt" DESC'

  const result = await query(sql, params)
  return result.rows
}

export async function getCreditTransactionDetail(id: string) {
  const user = await checkAdmin()
  if (!user) throw new Error("Non autorisé")

  const result = await query(`
    SELECT c.*, u.prenom, u.nom, u.email, u.telephone as "userPhone"
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
  
  // 1. Récupérer la transaction
  const txResult = await query('SELECT * FROM "CreditTransaction" WHERE id = $1 AND status = $2', [id, 'PENDING'])
  const tx = txResult.rows[0]
  
  if (!tx) throw new Error("Transaction introuvable ou déjà traitée")

  // 2. Mettre à jour la transaction
  await query(`
    UPDATE "CreditTransaction" 
    SET status = 'COMPLETED', "validatedAt" = NOW(), "validatedBy" = $1 
    WHERE id = $2
  `, [session!.user.id, id])

  // 3. Ajouter les crédits à l'utilisateur
  await query(`
    UPDATE "User" 
    SET credits = credits + $1 
    WHERE id = $2
  `, [tx.amount, tx.userId])

  revalidatePath('/admin/credits')
  revalidatePath('/admin/utilisateurs')
  
  return { success: true }
}

export async function rejectCreditTransaction(id: string, reason: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  const txResult = await query('SELECT * FROM "CreditTransaction" WHERE id = $1 AND status = $2', [id, 'PENDING'])
  if (txResult.rows.length === 0) throw new Error("Transaction introuvable ou déjà traitée")

  await query(`
    UPDATE "CreditTransaction" 
    SET status = 'FAILED', "rejectionReason" = $1, "validatedAt" = NOW(), "validatedBy" = $2 
    WHERE id = $3
  `, [reason, session!.user.id, id])

  revalidatePath('/admin/credits')
  
  return { success: true }
}
