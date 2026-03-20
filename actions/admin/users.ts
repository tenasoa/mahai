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
  
  return user?.role === 'ADMIN'
}

export async function getUsersAdmin(searchTerm?: string) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Non autorisé")

  let sql = 'SELECT id, email, prenom, nom, telephone, role, "createdAt" FROM "User"'
  const params: any[] = []

  if (searchTerm) {
    sql += ' WHERE (email ILIKE $1 OR prenom ILIKE $1 OR nom ILIKE $1)'
    params.push(`%${searchTerm}%`)
  }

  sql += ' ORDER BY "createdAt" DESC'

  const result = await query(sql, params)
  return result.rows
}

export async function getUserDetailAdmin(userId: string) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Non autorisé")

  // Récupérer l'utilisateur
  const userResult = await query('SELECT * FROM "User" WHERE id = $1', [userId])
  const user = userResult.rows[0]
  if (!user) return null

  // Récupérer les achats de sujets
  const purchasesResult = await query(`
    SELECT p.*, s.titre as title, s.difficulte as grade, s.annee as year 
    FROM "Purchase" p
    JOIN "Subject" s ON p."subjectId" = s.id
    WHERE p."userId" = $1
    ORDER BY p."createdAt" DESC
  `, [userId])

  // Récupérer les transactions de crédits
  const creditsResult = await query('SELECT * FROM "CreditTransaction" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [userId])

  // Récupérer les soumissions de sujets si c'est un contributeur ou prof
  const submissionsResult = await query('SELECT * FROM "SubjectSubmission" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [userId])

  return {
    ...user,
    purchases: purchasesResult.rows,
    creditHistory: creditsResult.rows,
    submissions: submissionsResult.rows
  }
}

export async function updateUserRoleAdmin(userId: string, newRole: string) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Non autorisé")

  const allowedRoles = ['ETUDIANT', 'CONTRIBUTEUR', 'PROFESSEUR', 'VERIFICATEUR', 'VALIDATEUR', 'ADMIN']
  if (!allowedRoles.includes(newRole)) throw new Error("Rôle invalide")

  await query('UPDATE "User" SET role = $1, "updatedAt" = NOW() WHERE id = $2', [newRole, userId])
  
  revalidatePath('/admin/utilisateurs')
  revalidatePath(`/admin/utilisateurs/${userId}`)
  
  return { success: true }
}
