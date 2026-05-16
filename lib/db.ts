import { Pool } from 'pg'
import { logger } from './logger'

// Prevent multiple instances of Pool in development (hot reload)
const globalForDb = global as unknown as { pool: Pool }

const pool = globalForDb.pool || new Pool({
  // Utiliser DATABASE_URL en priorité (pooler Transaction Mode, port 6543) 
  // pour éviter "(EMAXCONNSESSION) max clients reached in session mode"
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
  // Limiter le nombre max de connexions par instance serverless
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool

const LOG_DB_QUERIES = process.env.LOG_DB_QUERIES === 'true'

function getSqlKind(text: string) {
  return text.trim().split(/\s+/)[0]?.toUpperCase() || 'UNKNOWN'
}

export async function query(text: string, params?: unknown[]) {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    if (LOG_DB_QUERIES) {
      logger.debug('Executed query', { kind: getSqlKind(text), duration, rows: res.rowCount })
    }
    return res
  } catch (error) {
    logger.dbError('query', error, text)
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

// ── Pool metrics ────────────────────────────────────────────────────────

export interface PoolMetrics {
  totalCount: number
  idleCount: number
  waitingCount: number
}

export function getPoolMetrics(): PoolMetrics {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  }
}

// Log les événements d'erreur du pool (connexion perdue, timeout, etc.)
pool.on('error', (err) => {
  logger.error('[DB Pool] Unexpected pool error', err.message)
})