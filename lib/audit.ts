import 'server-only'

import { query } from './db'

/**
 * Logue une action admin sensible dans `AdminAuditLog`.
 *
 * Best-effort : si l'écriture échoue (DB momentanément indispo, table pas
 * encore migrée, etc.) on log l'erreur en console mais on n'interrompt PAS
 * l'action métier. La trace manquante est préférable à un blocage en prod.
 *
 * Pour des actions qui DOIVENT être tracées (légalement ou en preuve de
 * non-répudiation), insérer le log dans la même transaction que l'action :
 *
 *   await transaction(async (client) => {
 *     await client.query(...)               // action métier
 *     await client.query(`INSERT INTO "AdminAuditLog" ...`) // log atomique
 *   })
 */
export async function logAdminAction(args: {
  adminId: string
  action: string
  targetType?: string
  targetId?: string
  details?: Record<string, unknown>
}): Promise<void> {
  try {
    await query(
      `INSERT INTO "AdminAuditLog"
         (id, "adminId", "action", "targetType", "targetId", details)
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5::jsonb)`,
      [
        args.adminId,
        args.action,
        args.targetType || null,
        args.targetId || null,
        JSON.stringify(args.details || {}),
      ],
    )
  } catch (err) {
    console.error('[AdminAuditLog] write failed:', err)
  }
}
