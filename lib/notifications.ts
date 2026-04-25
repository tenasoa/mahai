import { query } from '@/lib/db'
import crypto from 'crypto'

/**
 * Types de notification reconnus dans toute l'application.
 * Garder cette liste alignée avec le commentaire SQL de la table
 * `Notification` (migration 20260425_notifications_unified.sql).
 */
export type NotificationType =
  | 'SUBMISSION_PENDING'
  | 'SUBMISSION_PUBLISHED'
  | 'SUBMISSION_REJECTED'
  | 'REVISION_REQUESTED'
  | 'WITHDRAWAL_REQUESTED'
  | 'WITHDRAWAL_APPROVED'
  | 'WITHDRAWAL_REJECTED'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'SYSTEM'

export interface CreateNotificationInput {
  userId: string
  type: NotificationType
  title: string
  body?: string | null
  link?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Crée une notification pour un utilisateur.
 * Best-effort : si la table n'existe pas encore (migration non passée),
 * on log et on continue plutôt que de bloquer le flux métier.
 */
export async function notify(input: CreateNotificationInput): Promise<{ id: string } | null> {
  try {
    const id = crypto.randomUUID()
    await query(
      `INSERT INTO "Notification"
         (id, "userId", type, title, body, link, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
      [
        id,
        input.userId,
        input.type,
        input.title,
        input.body ?? null,
        input.link ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    )
    return { id }
  } catch (error) {
    console.warn('notify() insert failed (non-bloquant):', error)
    return null
  }
}

/**
 * Notifie tous les administrateurs (ex: nouvelle soumission contributeur).
 */
export async function notifyAdmins(input: Omit<CreateNotificationInput, 'userId'>): Promise<number> {
  try {
    const admins = await query(
      `SELECT id FROM "User" WHERE UPPER(role) IN ('ADMIN', 'VALIDATEUR', 'VERIFICATEUR')`
    )
    let count = 0
    for (const row of admins.rows) {
      const res = await notify({ ...input, userId: row.id })
      if (res) count++
    }
    return count
  } catch (error) {
    console.warn('notifyAdmins() failed (non-bloquant):', error)
    return 0
  }
}
