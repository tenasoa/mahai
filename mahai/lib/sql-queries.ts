import { query } from '@/lib/db'

export interface User {
  id: string
  email: string
  prenom: string
  nom?: string
  role: string
  credits: number
  phone?: string
  phoneVerified: boolean
  schoolLevel?: string
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Subject {
  id: string
  titre: string
  type: string
  matiere: string
  annee: string
  serie?: string
  description?: string
  pages: number
  credits: number
  difficulte: string
  langue: string
  format: string
  badge: string
  glyph: string
  featured: boolean
  rating: number
  reviewsCount: number
  hasCorrectionIa: boolean
  hasCorrectionProf: boolean
  authorId: string
  createdAt: Date
}

export interface Purchase {
  id: string
  userId: string
  subjectId?: string
  creditsAmount: number
  amount: number
  paymentMethod?: string
  status: string
  createdAt: Date
}

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: string
  description?: string
  paymentMethod?: string
  transactionId?: string
  status: string
  createdAt: Date
}

// User queries
export async function getUserById(id: string): Promise<User | null> {
  const result = await query('SELECT * FROM "User" WHERE id = $1', [id])
  return result.rows[0] || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query('SELECT * FROM "User" WHERE email = $1', [email])
  return result.rows[0] || null
}

export async function updateUserCredits(userId: string, credits: number): Promise<void> {
  await query('UPDATE "User" SET credits = $1, "updatedAt" = NOW() WHERE id = $2', [credits, userId])
}

export async function createUser(userData: Partial<User>): Promise<User> {
  const fields = Object.keys(userData).join(', ')
  const placeholders = Object.keys(userData).map((_, i) => `$${i + 1}`).join(', ')
  const values = Object.values(userData)
  
  const result = await query(
    `INSERT INTO "User" (${fields}) VALUES (${placeholders}) RETURNING *`,
    values
  )
  return result.rows[0]
}

// Subject queries
export async function getSubjects(filters: any = {}, userId?: string) {
  let whereClause = 'WHERE 1=1'
  const params: any[] = []
  let paramIndex = 1

  // Build WHERE clause based on filters
  if (filters.search) {
    whereClause += ` AND (titre ILIKE $${paramIndex} OR matiere ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters.types && filters.types.length > 0) {
    whereClause += ` AND type = ANY($${paramIndex})`
    params.push(filters.types)
    paramIndex++
  }

  if (filters.matiere) {
    whereClause += ` AND matiere = $${paramIndex}`
    params.push(filters.matiere)
    paramIndex++
  }

  if (filters.minRating) {
    whereClause += ` AND rating >= $${paramIndex}`
    params.push(filters.minRating)
    paramIndex++
  }

  if (filters.maxPrice !== undefined) {
    whereClause += ` AND credits <= $${paramIndex}`
    params.push(filters.maxPrice)
    paramIndex++
  }

  // Ordering
  let orderBy = 'ORDER BY featured DESC, "createdAt" DESC'
  if (filters.sortBy === 'rating') orderBy = 'ORDER BY rating DESC'
  if (filters.sortBy === 'price_asc') orderBy = 'ORDER BY credits ASC'
  if (filters.sortBy === 'price_desc') orderBy = 'ORDER BY credits DESC'

  // Pagination
  const limit = filters.limit || 9
  const offset = ((filters.page || 1) - 1) * limit

  const queryText = `
    SELECT 
      s.*,
      CASE WHEN p.id IS NOT NULL THEN true ELSE false END as "isUnlocked"
    FROM "Subject" s
    LEFT JOIN "Purchase" p ON s.id = p."subjectId" AND p."userId" = $${paramIndex} AND p.status = 'COMPLETED'
    ${whereClause}
    ${orderBy}
    LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}
  `

  params.push(userId || null, limit, offset)

  const result = await query(queryText, params)
  
  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM "Subject" s 
    ${whereClause}
  `
  const countParams = params.slice(0, -2) // Remove limit and offset
  const countResult = await query(countQuery, countParams)
  const total = parseInt(countResult.rows[0].total)

  return {
    subjects: result.rows,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: filters.page || 1
  }
}

export async function getSubjectById(id: string, userId?: string) {
  const queryText = userId ? `
    SELECT 
      s.*,
      u.prenom || ' ' || COALESCE(u.nom, '') as "authorName",
      CASE WHEN p.id IS NOT NULL THEN true ELSE false END as "isUnlocked"
    FROM "Subject" s
    LEFT JOIN "User" u ON s."authorId" = u.id
    LEFT JOIN "Purchase" p ON s.id = p."subjectId" AND p."userId" = $2 AND p.status = 'COMPLETED'
    WHERE s.id = $1
  ` : `
    SELECT 
      s.*,
      u.prenom || ' ' || COALESCE(u.nom, '') as "authorName"
    FROM "Subject" s
    LEFT JOIN "User" u ON s."authorId" = u.id
    WHERE s.id = $1
  `

  const params = userId ? [id, userId] : [id]
  const result = await query(queryText, params)
  return result.rows[0] || null
}

// Purchase queries
export async function createPurchase(purchaseData: Partial<Purchase>): Promise<Purchase> {
  const fields = Object.keys(purchaseData).join(', ')
  const placeholders = Object.keys(purchaseData).map((_, i) => `$${i + 1}`).join(', ')
  const values = Object.values(purchaseData)
  
  const result = await query(
    `INSERT INTO "Purchase" (${fields}) VALUES (${placeholders}) RETURNING *`,
    values
  )
  return result.rows[0]
}

export async function findExistingPurchase(userId: string, subjectId: string): Promise<Purchase | null> {
  const result = await query(
    'SELECT * FROM "Purchase" WHERE "userId" = $1 AND "subjectId" = $2 AND status = $3',
    [userId, subjectId, 'COMPLETED']
  )
  return result.rows[0] || null
}

// Credit transaction queries
export async function createCreditTransaction(transactionData: Partial<CreditTransaction>): Promise<CreditTransaction> {
  const fields = Object.keys(transactionData).join(', ')
  const placeholders = Object.keys(transactionData).map((_, i) => `$${i + 1}`).join(', ')
  const values = Object.values(transactionData)
  
  const result = await query(
    `INSERT INTO "CreditTransaction" (${fields}) VALUES (${placeholders}) RETURNING *`,
    values
  )
  return result.rows[0]
}

// Email verification
export async function createEmailVerification(email: string, token: string, expiresAt: Date) {
  await query(
    'INSERT INTO "EmailVerification" (id, email, token, "expiresAt") VALUES ($1, $2, $3, $4)',
    [crypto.randomUUID(), email, token, expiresAt]
  )
}

export async function findValidEmailVerification(token: string) {
  const result = await query(
    'SELECT * FROM "EmailVerification" WHERE token = $1 AND used = false AND "expiresAt" > NOW()',
    [token]
  )
  return result.rows[0] || null
}

export async function markEmailAsVerified(userId: string) {
  await query(
    'UPDATE "User" SET "emailVerified" = true, "updatedAt" = NOW() WHERE id = $1',
    [userId]
  )
}

export async function markEmailVerificationAsUsed(token: string) {
  await query(
    'UPDATE "EmailVerification" SET used = true WHERE token = $1',
    [token]
  )
}

// Password reset
export async function createPasswordReset(email: string, token: string, expiresAt: Date) {
  await query(
    'INSERT INTO "PasswordReset" (id, email, token, "expiresAt") VALUES ($1, $2, $3, $4)',
    [crypto.randomUUID(), email, token, expiresAt]
  )
}

export async function findValidPasswordReset(token: string) {
  const result = await query(
    'SELECT * FROM "PasswordReset" WHERE token = $1 AND used = false AND "expiresAt" > NOW()',
    [token]
  )
  return result.rows[0] || null
}

export async function markPasswordResetAsUsed(token: string) {
  await query(
    'UPDATE "PasswordReset" SET used = true WHERE token = $1',
    [token]
  )
}
