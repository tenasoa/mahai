'use server'

import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import { logger } from '@/lib/logger'
import { requireAdmin, isAuthFailure } from '@/lib/auth-guards'

/** Garde admin centralisée. Retourne `{ id, role }` ou `null`. */
async function checkAdmin() {
  const guard = await requireAdmin()
  if (isAuthFailure(guard)) return null
  return { id: guard.userId, role: guard.role }
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
        s.serie as series, s.pages as "pagesCount", s.prix as credits, s.difficulte as grade, s.langue,
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
    logger.warn("SubjectLog table not available", { error: String(e) })
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
    logger.apiError("logSubjectAction", e)
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

/**
 * Supprime un sujet de la base de données.
 * Supprime aussi les achats, logs et autres données liées.
 */
export async function deleteSubject(subjectId: string) {
  const adminUser = await checkAdmin()
  if (!adminUser) throw new Error("Non autorisé")

  const currentResult = await query('SELECT id, titre, status FROM "Subject" WHERE id = $1', [subjectId])
  const subject = currentResult.rows[0]

  if (!subject) throw new Error("Sujet introuvable")

  try {
    // Supprimer les logs liés
    try {
      await query('DELETE FROM "SubjectLog" WHERE "subjectId" = $1', [subjectId])
    } catch {
      // Table peut ne pas exister
    }

    // Supprimer les achats liés
    await query('DELETE FROM "Purchase" WHERE "subjectId" = $1', [subjectId])

    // Supprimer le sujet
    await query('DELETE FROM "Subject" WHERE id = $1', [subjectId])

    revalidatePath('/admin/sujets')
    revalidatePath('/catalogue')

    return { success: true, deletedTitle: subject.titre }
  } catch (error) {
    logger.apiError("deleteSubject", error)
    throw error
  }
}
