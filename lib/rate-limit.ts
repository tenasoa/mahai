/**
 * Rate limiting distribué via Upstash Redis.
 *
 * Remplace l'ancien stockage en mémoire (Map) par Redis pour :
 * - Survivre aux redémarrages serverless (Vercel)
 * - Partager l'état entre toutes les instances
 * - Éviter le contournement par changement d'instance
 *
 * Prérequis :
 *   pnpm add @upstash/redis
 *   UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=your-token
 *
 * Fallback : si Redis n'est pas configuré, on utilise l'ancien
 * stockage en mémoire (Map) pour le développement local.
 */

import { logger } from './logger'

// ── Redis client (lazy init pour éviter les erreurs si absent) ──────────

// Type `any` volontaire : `@upstash/redis` est une dependance optionnelle non
// listee dans package.json, chargee dynamiquement (cf. getRedis ci-dessous).
let redisClient: any = null

async function getRedis() {
  if (redisClient) return redisClient

  try {
    // @ts-ignore - `@upstash/redis` est une dependance optionnelle non listee dans package.json
    const { Redis } = await import('@upstash/redis')
    redisClient = Redis.fromEnv()
    // Test de connexion
    await redisClient.ping()
    return redisClient
  } catch {
    return null
  }
}

// ── Fallback in-memory (dev local sans Redis) ────────────────────────────

type RateLimitEntry = {
  count: number
  resetTime: number
}

const memoryStore = new Map<string, RateLimitEntry>()

// ── Interface publique ──────────────────────────────────────────────────

export interface RateLimitOptions {
  windowMs: number
  maxRequests: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000,
  maxRequests: 60,
}

/**
 * Vérifie si une requête dépasse la limite de rate.
 * Utilise Redis en production, fallback mémoire en dev.
 */
export async function checkRateLimit(
  identifier: string,
  options: Partial<RateLimitOptions> = {}
): Promise<RateLimitResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const redis = await getRedis()

  if (redis) {
    return checkRateLimitRedis(redis, identifier, opts)
  }

  return checkRateLimitMemory(identifier, opts)
}

// ── Implémentation Redis ─────────────────────────────────────────────────

async function checkRateLimitRedis(
  redis: NonNullable<Awaited<ReturnType<typeof getRedis>>>,
  identifier: string,
  opts: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `ratelimit:${identifier}`
  const now = Date.now()
  const windowSeconds = Math.ceil(opts.windowMs / 1000)

  try {
    // Script Lua atomique : ZSET avec sliding window
    const script = `
      local key = KEYS[1]
      local maxRequests = tonumber(ARGV[1])
      local windowSeconds = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])

      redis.call('ZREMRANGEBYSCORE', key, 0, now - windowSeconds * 1000)
      local count = redis.call('ZCARD', key)

      if count >= maxRequests then
        local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
        local resetTime = tonumber(oldest[2]) + windowSeconds * 1000
        return {0, 0, resetTime}
      end

      redis.call('ZADD', key, now, now .. '-' .. count)
      redis.call('EXPIRE', key, windowSeconds)
      local remaining = maxRequests - count - 1
      return {1, remaining, now + windowSeconds * 1000}
    `

    const result = (await redis.eval(script, [key], [
      String(opts.maxRequests),
      String(windowSeconds),
      String(now),
    ])) as [number, number, number]

    const [allowed, remaining, resetTime] = result

    if (allowed === 1) {
      return { allowed: true, remaining, resetTime }
    }

    return {
      allowed: false,
      remaining: 0,
      resetTime,
      retryAfter: Math.ceil((resetTime - now) / 1000),
    }
  } catch (error) {
    logger.error('Redis rate-limit error', error)
    // Fallback : autoriser en cas d'erreur Redis pour ne pas bloquer les users
    return {
      allowed: true,
      remaining: opts.maxRequests - 1,
      resetTime: now + opts.windowMs,
    }
  }
}

// ── Implémentation mémoire (fallback) ────────────────────────────────────

function checkRateLimitMemory(
  identifier: string,
  opts: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(identifier)

  if (!entry || now > entry.resetTime) {
    memoryStore.set(identifier, { count: 1, resetTime: now + opts.windowMs })
    return { allowed: true, remaining: opts.maxRequests - 1, resetTime: now + opts.windowMs }
  }

  if (entry.count >= opts.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter: Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  entry.count++
  return { allowed: true, remaining: opts.maxRequests - entry.count, resetTime: entry.resetTime }
}

// ── Rate-limiters spécialisés (async pour compat Redis) ──────────────────

export async function checkAuthRateLimit(identifier: string) {
  return checkRateLimit(`auth:${identifier}`, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  })
}

export async function checkPaymentRateLimit(identifier: string) {
  return checkRateLimit(`payment:${identifier}`, {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  })
}

export function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetTime) memoryStore.delete(key)
  }
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000)
}
