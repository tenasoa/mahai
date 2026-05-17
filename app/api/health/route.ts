import { NextResponse } from 'next/server'
import { getPoolMetrics } from '@/lib/db'

/**
 * GET /api/health
 *
 * Endpoint de santé pour monitoring (UptimeRobot, Sentry, dashboards).
 * Expose les métriques du pool DB sans données sensibles.
 */
export async function GET() {
  try {
    const pool = getPoolMetrics()

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: {
        pool: {
          total: pool.totalCount,
          idle: pool.idleCount,
          waiting: pool.waitingCount,
        },
        healthy: pool.waitingCount < 5, // plus de 5 en attente = saturation
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
