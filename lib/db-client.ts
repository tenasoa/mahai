/**
 * Implémentation SQL brute pour remplacer le client ORM.
 * Toutes les requêtes utilisent directement le pool 'pg'.
 */

import { query, transaction } from './db'

// Helper pour convertir snake_case en camelCase
function toCamelCase(row: any) {
  if (!row) return null
  const result: any = {}
  for (const key in row) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase())
    result[camelKey] = row[key]
  }
  return result
}

// Requêtes base de données
export const db = {
  user: {
    async findUnique({ where }: { where: { id?: string; email?: string } }) {
      let sql: string
      let params: any[]
      
      if (where.id) {
        sql = 'SELECT * FROM "User" WHERE id = $1'
        params = [where.id]
      } else if (where.email) {
        sql = 'SELECT * FROM "User" WHERE email = $1'
        params = [where.email]
      } else {
        return null
      }
      
      const result = await query(sql, params)
      return result.rows[0] || null
    },
    
    async update({ where, data }: { where: { id: string }; data: any }) {
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 2
      
      for (const [key, value] of Object.entries(data)) {
        const dbKey = key // Utiliser directement la clé camelCase
        if (typeof value === 'object' && value !== null && 'decrement' in value && value.decrement) {
          updates.push(`"${dbKey}" = "${dbKey}" - $${paramIndex}`)
          values.push((value as { decrement: number }).decrement)
        } else {
          updates.push(`"${dbKey}" = $${paramIndex}`)
          values.push(value)
        }
        paramIndex++
      }
      
      updates.push(`"updatedAt" = NOW()`)
      
      const sql = `UPDATE "User" SET ${updates.join(', ')} WHERE id = $1 RETURNING *`
      const result = await query(sql, [where.id, ...values])
      return result.rows[0]
    }
  },
  
  subject: {
    async findUnique({ where }: { where: { id: string } }) {
      const result = await query('SELECT * FROM "Subject" WHERE id = $1', [where.id])
      return result.rows[0] || null
    }
  },
  
  purchase: {
    async findFirst({ where, include }: { where: { userId: string; subjectId?: string; status?: string }; include?: { subject?: boolean } }) {
      let sql = 'SELECT * FROM "Purchase" WHERE "userId" = $1'
      const params: any[] = [where.userId]
      let paramIndex = 2
      
      if (where.subjectId) {
        sql += ` AND "subjectId" = $${paramIndex}`
        params.push(where.subjectId)
        paramIndex++
      }
      
      if (where.status) {
        sql += ` AND status = $${paramIndex}`
        params.push(where.status)
      }
      
      sql += ' LIMIT 1'
      
      const result = await query(sql, params)
      const purchase = result.rows[0] || null
      
      // Gérer include.subject
      if (purchase && include?.subject && purchase.subjectId) {
        const subjectResult = await query('SELECT * FROM "Subject" WHERE id = $1', [purchase.subjectId])
        purchase.subject = subjectResult.rows[0] || null
      }
      
      return purchase
    },
    
    async create({ data }: { data: any }) {
      const fields: string[] = []
      const values: any[] = []
      const placeholders: string[] = []
      
      let paramIndex = 1
      for (const [key, value] of Object.entries(data)) {
        const dbKey = key // Utiliser directement la clé camelCase
        fields.push(`"${dbKey}"`)
        placeholders.push(`$${paramIndex}`)
        values.push(value)
        paramIndex++
      }
      
      const sql = `INSERT INTO "Purchase" (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
      const result = await query(sql, values)
      return result.rows[0]
    }
  },
  
  wishlist: {
    async upsert({ where, update, create }: { where: { userId_subjectId: { userId: string; subjectId: string } }; update: any; create: any }) {
      const { userId, subjectId } = where.userId_subjectId
      
      // Vérifier si existe
      const existing = await query(
        'SELECT * FROM "Wishlist" WHERE "userId" = $1 AND "subjectId" = $2',
        [userId, subjectId]
      )
      
      if (existing.rows.length > 0) {
        // Mise à jour (pas d'action pour le moment)
        return existing.rows[0]
      } else {
        // Création
        const result = await query(
          'INSERT INTO "Wishlist" ("userId", "subjectId") VALUES ($1, $2) RETURNING *',
          [userId, subjectId]
        )
        return result.rows[0]
      }
    },
    
    async delete({ where }: { where: { userId_subjectId: { userId: string; subjectId: string } } }) {
      const { userId, subjectId } = where.userId_subjectId
      await query(
        'DELETE FROM "Wishlist" WHERE "userId" = $1 AND "subjectId" = $2',
        [userId, subjectId]
      )
      return { userId, subjectId }
    }
  },
  
  creditTransaction: {
    async create({ data }: { data: any }) {
      const fields: string[] = []
      const values: any[] = []
      const placeholders: string[] = []
      
      let paramIndex = 1
      for (const [key, value] of Object.entries(data)) {
        const dbKey = key
        fields.push(`"${dbKey}"`)
        placeholders.push(`$${paramIndex}`)
        values.push(value)
        paramIndex++
      }
      
      const sql = `INSERT INTO "CreditTransaction" (${fields.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
      const result = await query(sql, values)
      return result.rows[0]
    },
    
    async findUnique({ where }: { where: { id: string } }) {
      const result = await query('SELECT * FROM "CreditTransaction" WHERE id = $1', [where.id])
      return result.rows[0] || null
    }
  },
  
  emailVerification: {
    async deleteMany({ where }: { where: { email?: string } }) {
      if (where.email) {
        await query('DELETE FROM "EmailVerification" WHERE email = $1', [where.email])
      }
    },
    
    async create({ data }: { data: { email: string; token: string; expiresAt: Date } }) {
      await query(
        'INSERT INTO "EmailVerification" (email, token, "expiresAt") VALUES ($1, $2, $3)',
        [data.email, data.token, data.expiresAt]
      )
    }
  },
  
  examenBlanc: {
    async findUnique({ where }: { where: { id: string } }) {
      const result = await query('SELECT * FROM "ExamenBlanc" WHERE id = $1', [where.id])
      return result.rows[0] || null
    },
    
    async update({ where, data }: { where: { id: string }; data: any }) {
      const updates: string[] = []
      const values: any[] = []
      
      let paramIndex = 2
      for (const [key, value] of Object.entries(data)) {
        const dbKey = key
        updates.push(`"${dbKey}" = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
      
      const sql = `UPDATE "ExamenBlanc" SET ${updates.join(', ')} WHERE id = $1 RETURNING *`
      const result = await query(sql, [where.id, ...values])
      return result.rows[0]
    }
  },
  
  async $transaction(queries: Promise<any>[]) {
    return await transaction(async (client) => {
      const results = []
      for (const queryPromise of queries) {
        // Exécuter chaque requête - version simplifiée
        const result = await queryPromise
        results.push(result)
      }
      return results
    })
  }
}
