'use server'

import { query } from '@/lib/db'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

async function checkAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) return false
  
  const result = await query('SELECT id, role FROM "User" WHERE id = $1', [session.user.id])
  const user = result.rows[0]
  
  return user?.role === 'ADMIN' ? user : null
}

export async function getSubjectsAdmin(status?: string, year?: string, page?: number, pageSize?: number, searchTerm?: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  let whereClause = 'WHERE 1=1'
  const params: any[] = []
  let paramIndex = 1

  const normalizedStatus = status?.toUpperCase().trim()
  if (normalizedStatus && normalizedStatus !== 'ALL') {
    whereClause += ` AND s.status = $${paramIndex}`
    params.push(normalizedStatus)
    paramIndex++
  }

  if (year && year !== 'ALL') {
    whereClause += ` AND CAST(s.annee AS TEXT) = $${paramIndex}`
    params.push(year)
    paramIndex++
  }

  const normalizedSearch = searchTerm?.trim()
  if (normalizedSearch) {
    const tokens = normalizedSearch.split(/\s+/).filter(Boolean).slice(0, 6)

    for (const token of tokens) {
      whereClause += ` AND (
        COALESCE(s.titre, '') ILIKE $${paramIndex}
        OR COALESCE(s.matiere, '') ILIKE $${paramIndex}
        OR COALESCE(s.type, '') ILIKE $${paramIndex}
        OR COALESCE(s.serie, '') ILIKE $${paramIndex}
        OR CAST(s.annee AS TEXT) ILIKE $${paramIndex}
        OR COALESCE(u.prenom, '') ILIKE $${paramIndex}
        OR COALESCE(u.nom, '') ILIKE $${paramIndex}
        OR COALESCE(u.email, '') ILIKE $${paramIndex}
      )`
      params.push(`%${token}%`)
      paramIndex++
    }
  }

  // Count total for pagination
  const countSql = `
    SELECT COUNT(*) FROM "Subject" s
    LEFT JOIN "User" u ON s."authorId" = u.id
    ${whereClause}
  `
  const countResult = await query(countSql, params)
  const total = parseInt(countResult.rows[0]?.count || '0', 10)

  // Main query
  let sql = `
    SELECT
        s.id, s.titre as title, s.type, s.matiere as motiere, s.annee as year,
        s.serie as series, s.pages as "pagesCount", s.credits, s.difficulte as grade, s.langue,
        s.format, s.badge, s.status, s."createdAt",
        u.prenom as "authorPrenom", u.nom as "authorNom", u.role as "authorRole",
        u."profilePicture" as "authorProfilePicture",
        u."profilePicture" as "authorAvatarUrl",
        u.id as "authorId"
    FROM "Subject" s
    LEFT JOIN "User" u ON s."authorId" = u.id
    ${whereClause}
  `

  // Add pagination
  if (page && pageSize) {
    const offset = (page - 1) * pageSize
    sql += ` ORDER BY s."createdAt" DESC, s.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(pageSize, offset)
  } else {
    sql += ' ORDER BY s."createdAt" DESC, s.id DESC'
  }

  const result = await query(sql, params)
  
  return {
    subjects: result.rows,
    pagination: {
      total,
      page: page || 1,
      pageSize: pageSize || 100,
      totalPages: pageSize ? Math.ceil(total / pageSize) : 1
    }
  }
}

export async function getSubjectDetailAdmin(id: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  // Récupérer le sujet avec l'auteur
  const result = await query(`
    SELECT s.*, u.prenom as "authorPrenom", u.nom as "authorNom", u.email as "authorEmail", u.role as "authorRole", u."profilePicture" as "authorAvatarUrl"
    FROM "Subject" s
    LEFT JOIN "User" u ON s."authorId" = u.id
    WHERE s.id = $1
  `, [id])

  const subject = result.rows[0]
  if (!subject) return null

  // Récupérer les logs
  let logs: any[] = []
  try {
    const logsResult = await query(`
      SELECT l.*, u.prenom as "actorPrenom", u.nom as "actorNom"
      FROM "SubjectLog" l
      LEFT JOIN "User" u ON l."userId" = u.id
      WHERE l."subjectId" = $1
      ORDER BY l."createdAt" DESC
    `, [id])
    logs = logsResult.rows
  } catch (e) {
    // La table n'existe peut-être pas encore (migration non passée)
    console.warn("Table SubjectLog not yet created or error:", e)
  }

  // Récupérer les achats liés à ce sujet
  const purchasesResult = await query(`
    SELECT p.id, p."createdAt", u.prenom, u.nom, u.email, u.id as "userId"
    FROM "Purchase" p
    JOIN "User" u ON p."userId" = u.id
    WHERE p."subjectId" = $1
    ORDER BY p."createdAt" DESC
    LIMIT 20
  `, [id])

  return {
    ...subject,
    logs,
    purchases: purchasesResult.rows
  }
}

async function logSubjectAction(subjectId: string, userId: string, action: string, oldStatus: string, newStatus: string, notes?: string) {
  try {
    const logId = crypto.randomUUID()
    await query(`
      INSERT INTO "SubjectLog" (id, "subjectId", "userId", action, "oldStatus", "newStatus", notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [logId, subjectId, userId, action, oldStatus, newStatus, notes || null])
  } catch (e) {
    console.error("Failed to log subject action:", e)
  }
}

export async function updateSubjectStatus(subjectId: string, newStatus: string, notes?: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const currentResult = await query('SELECT status FROM "Subject" WHERE id = $1', [subjectId])
  const current = currentResult.rows[0]
  
  if (!current) throw new Error("Sujet introuvable")
  
  const oldStatus = current.status

  await query('UPDATE "Subject" SET status = $1 WHERE id = $2', [newStatus, subjectId])
  
  let action = 'UPDATED'
  if (newStatus === 'PUBLISHED') action = 'PUBLISHED'
  if (newStatus === 'REJECTED') action = 'REJECTED'
  if (newStatus === 'DRAFT') action = 'DRAFTED'

  await logSubjectAction(subjectId, adminUser.id, action, oldStatus, newStatus, notes)

  revalidatePath('/admin/sujets')
  revalidatePath(`/admin/sujets/${subjectId}`)
  revalidatePath('/catalogue')
  
  return { success: true }
}
