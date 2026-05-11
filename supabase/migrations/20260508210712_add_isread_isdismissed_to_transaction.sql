-- Colonnes de notification sur la table Transaction
-- Permettent de marquer les transactions comme lues/ignorées dans le centre de notifications.

ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "isRead"      boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isDismissed" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "Transaction_userId_isRead_idx"
  ON "Transaction" ("userId", "isRead")
  WHERE "isRead" = false;

CREATE INDEX IF NOT EXISTS "Transaction_userId_isDismissed_idx"
  ON "Transaction" ("userId", "isDismissed")
  WHERE "isDismissed" = false;
