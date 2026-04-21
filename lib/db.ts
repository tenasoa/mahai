import { Pool } from 'pg'

// Prevent multiple instances of Pool in development (hot reload)
const globalForDb = global as unknown as { pool: Pool }

const pool = globalForDb.pool || new Pool({
  connectionString: process.env.DIRECT_URL,
  // Add resilience for serverless/high-concurrency environments
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool

const LOG_DB_QUERIES = process.env.LOG_DB_QUERIES === 'true'

function getSqlKind(text: string) {
  return text.trim().split(/\s+/)[0]?.toUpperCase() || 'UNKNOWN'
}

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    if (LOG_DB_QUERIES) {
      console.log('Executed query', { kind: getSqlKind(text), duration, rows: res.rowCount })
    }
    return res
  } catch (error) {
    const dbError = error as { message?: string; code?: string; detail?: string }
    console.error('Database query error:', {
      code: dbError.code,
      message: dbError.message,
      detail: dbError.detail
    })
    throw error
  }
}

export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export default pool
