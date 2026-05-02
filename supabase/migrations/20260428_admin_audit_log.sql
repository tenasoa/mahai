-- ============================================================================
-- AdminAuditLog — traçabilité de toutes les actions sensibles d'admin
-- ----------------------------------------------------------------------------
-- 1 ligne = 1 action admin (validation paiement, rejet, modification rôle,
-- suppression sujet, changement provider IA, …).
--
-- Sert de :
--  - preuve en cas de litige (« qui a validé ce versement frauduleux ? »)
--  - dashboard de revue interne
--  - alerting (action inhabituelle = potentiel compte compromis)
--
-- L'écriture se fait via `lib/audit.ts::logAdminAction()` côté serveur,
-- toujours dans la même transaction que l'action elle-même quand c'est
-- possible (sinon best-effort, jamais bloquant pour ne pas casser l'action).
-- ============================================================================

CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "adminId"    TEXT NOT NULL,
  "action"     VARCHAR(64) NOT NULL,
  "targetType" VARCHAR(32),
  "targetId"   TEXT,
  details      JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_admin_audit_log_user
    FOREIGN KEY ("adminId") REFERENCES "User"(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin
  ON "AdminAuditLog" ("adminId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_action
  ON "AdminAuditLog" ("action", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_admin_audit_target
  ON "AdminAuditLog" ("targetType", "targetId", "createdAt" DESC);

COMMENT ON TABLE "AdminAuditLog" IS
  'Journal des actions admin sensibles (validations paiement, rôles, suppressions). Append-only.';
