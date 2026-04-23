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

export async function getUsersAdmin(searchTerm?: string, page?: number, pageSize?: number) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Non autorisé")

  let whereClause = ''
  const params: any[] = []

  if (searchTerm) {
    whereClause = 'WHERE (email ILIKE $1 OR prenom ILIKE $1 OR nom ILIKE $1)'
    params.push(`%${searchTerm}%`)
  }

  // Count total for pagination
  const countSql = `SELECT COUNT(*) FROM "User" ${whereClause}`
  const countResult = await query(countSql, params)
  const total = parseInt(countResult.rows[0]?.count || '0', 10)

  // Main query with pagination
  let sql = `SELECT id, email, prenom, nom, phone, role, "createdAt", "profilePicture" FROM "User" ${whereClause}`

  if (page && pageSize) {
    const offset = (page - 1) * pageSize
    sql += ` ORDER BY "createdAt" DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(pageSize, offset)
  } else {
    sql += ' ORDER BY "createdAt" DESC'
  }

  const result = await query(sql, params)
  
  return {
    users: result.rows,
    pagination: {
      total,
      page: page || 1,
      pageSize: pageSize || 100,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1
    }
  }
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

  // Récupérer les soumissions de sujets (schémas legacy + nouveau schéma).
  let submissions: any[] = []
  try {
    const submissionsResult = await query(
      'SELECT * FROM "SubjectSubmission" WHERE "authorId" = $1 ORDER BY "createdAt" DESC',
      [userId],
    )
    submissions = submissionsResult.rows
  } catch (error: any) {
    const message = String(error?.message || '')
    if (message.toLowerCase().includes('colonne') || message.toLowerCase().includes('column')) {
      try {
        const legacyResult = await query(
          'SELECT * FROM "SubjectSubmission" WHERE "userId" = $1 ORDER BY "createdAt" DESC',
          [userId],
        )
        submissions = legacyResult.rows
      } catch (legacyError) {
        console.warn('SubjectSubmission query failed on both schemas:', legacyError)
      }
    } else {
      console.warn('SubjectSubmission query failed:', error)
    }
  }

  return {
    ...user,
    purchases: purchasesResult.rows,
    creditHistory: creditsResult.rows,
    submissions
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

export async function adjustUserCreditsAdmin(
  userId: string,
  delta: number,
  reason: string,
) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Non autorisé")

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Session introuvable")

  if (!Number.isFinite(delta) || delta === 0) {
    throw new Error("Montant invalide")
  }
  if (!reason || !reason.trim()) {
    throw new Error("Un motif est requis")
  }

  const userResult = await query('SELECT credits FROM "User" WHERE id = $1', [userId])
  const current = userResult.rows[0]
  if (!current) throw new Error("Utilisateur introuvable")

  const currentCredits = Number(current.credits || 0)
  const newBalance = currentCredits + delta

  if (newBalance < 0) {
    throw new Error("Le solde ne peut pas être négatif")
  }

  await query(
    'UPDATE "User" SET credits = $1, "updatedAt" = NOW() WHERE id = $2',
    [newBalance, userId],
  )

  try {
    const crypto = await import('crypto')
    await query(
      `INSERT INTO "CreditTransaction" (
        id, "userId", type, amount, "creditsCount", status, "paymentMethod",
        description, "validatedAt", "validatedBy", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, NOW(), NOW())`,
      [
        crypto.randomUUID(),
        userId,
        delta > 0 ? 'EARN' : 'SPEND',
        0,
        Math.abs(delta),
        'COMPLETED',
        'ADMIN_ADJUSTMENT',
        `[Admin] ${reason.trim()}`,
        session.user.id,
      ],
    )
  } catch (e) {
    console.warn('Credit adjustment log failed:', e)
  }

  revalidatePath('/admin/utilisateurs')
  revalidatePath(`/admin/utilisateurs/${userId}`)

  return { success: true, newBalance }
}

export async function updateUserInfoAdmin(
  userId: string,
  data: {
    prenom?: string
    nom?: string
    email?: string
    phone?: string
    pseudo?: string
    schoolLevel?: string
    region?: string
    district?: string
    bio?: string
  },
) {
  const isAdmin = await checkAdmin()
  if (!isAdmin) throw new Error("Non autorisé")

  const updates: string[] = []
  const values: any[] = []
  let paramIndex = 1

  const allowedFields: Record<string, string> = {
    prenom: 'prenom',
    nom: 'nom',
    email: 'email',
    phone: 'phone',
    pseudo: 'pseudo',
    schoolLevel: 'schoolLevel',
    region: 'region',
    district: 'district',
    bio: 'bio',
  }

  for (const [key, column] of Object.entries(allowedFields)) {
    const value = (data as any)[key]
    if (value !== undefined) {
      updates.push(`"${column}" = $${paramIndex}`)
      values.push(value === '' ? null : value)
      paramIndex++
    }
  }

  if (updates.length === 0) {
    return { success: true }
  }

  updates.push(`"updatedAt" = NOW()`)
  values.push(userId)

  const sql = `UPDATE "User" SET ${updates.join(', ')} WHERE id = $${paramIndex}`
  await query(sql, values)

  revalidatePath('/admin/utilisateurs')
  revalidatePath(`/admin/utilisateurs/${userId}`)

  return { success: true }
}
