import { Pool } from 'pg'
import { logger } from './logger'

// Prevent multiple instances of Pool in development (hot reload)
const globalForDb = global as unknown as { pool: Pool; txPool: Pool }

const ssl = process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false

// Pool principal pour les requêtes simples (autocommit).
// Utilise DATABASE_URL en priorité (pooler Transaction Mode, port 6543)
// pour éviter "(EMAXCONNSESSION) max clients reached in session mode".
const pool = globalForDb.pool || new Pool({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
  // Limiter le nombre max de connexions par instance serverless
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl,
})

// Pool dédié aux transactions (BEGIN/COMMIT multi-requêtes).
// Doit OBLIGATOIREMENT utiliser DIRECT_URL (connexion directe, port 5432) :
// le pooler en Transaction Mode (6543) ne garantit pas qu'un même client
// reste épinglé sur toute la durée d'une transaction → COMMIT/ROLLBACK
// peuvent s'appliquer à la mauvaise session. `max` réduit car les
// connexions directes sont une ressource limitée chez Supabase.
const txPool = globalForDb.txPool || new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl,
})

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pool = pool
  globalForDb.txPool = txPool
}

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
  const client = await txPool.connect()
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
