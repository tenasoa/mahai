-- ============================================================
-- Migration : Notification — table unifiée
-- Description : Table de notifications applicatives (révision,
--               validation, rejet, soumission reçue, retrait,
--               candidature, etc.). Étend l'ancien système basé
--               sur CreditTransaction.isRead/isDismissed sans le
--               casser : la page /notifications fusionne les deux.
-- ============================================================

CREATE TABLE IF NOT EXISTS "Notification" (
  id            TEXT PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  type          TEXT NOT NULL,
  -- Types attendus :
  --   SUBMISSION_PENDING     (admin reçoit) une soumission contributeur
  --   SUBMISSION_PUBLISHED   (contributeur) son sujet est en ligne
  --   SUBMISSION_REJECTED    (contributeur) soumission refusée
  --   REVISION_REQUESTED     (contributeur) admin demande révision
  --   WITHDRAWAL_REQUESTED   (admin)
  --   WITHDRAWAL_APPROVED    (contributeur)
  --   APPLICATION_APPROVED   (étudiant → contributeur)
  --   SYSTEM                 message système générique
  title         TEXT NOT NULL,
  body          TEXT,
  link          TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,

  "isRead"      BOOLEAN NOT NULL DEFAULT false,
  "isDismissed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "readAt"      TIMESTAMPTZ
);

DO $$ BEGIN
  ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_notif_user_dismissed
  ON "Notification"("userId", "isDismissed", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread
  ON "Notification"("userId", "isRead")
  WHERE "isDismissed" = false;

CREATE INDEX IF NOT EXISTS idx_notif_type
  ON "Notification"(type, "createdAt" DESC);

COMMENT ON TABLE "Notification" IS
  'Notifications applicatives unifiées (révision sujet, paiement, '
  'candidature…). Le centre de notifications utilisateur fusionne '
  'cette table avec les CreditTransaction marquées non-dismiss.';
