-- ============================================================================
-- Suivi de l'activité quotidienne (streak system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "DailyActivity" (
  "id"          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT        NOT NULL,
  "date"        DATE        NOT NULL DEFAULT CURRENT_DATE,
  "type"        TEXT        NOT NULL DEFAULT 'LOGIN',
  "metadata"    JSONB,
  "createdAt"   TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "fk_daily_activity_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Un seul enregistrement par utilisateur, jour et type d'activité
CREATE UNIQUE INDEX IF NOT EXISTS "idx_daily_activity_user_date_type"
  ON "DailyActivity" ("userId", "date", "type");

-- Index pour le calcul rapide du streak
CREATE INDEX IF NOT EXISTS "idx_daily_activity_user_date"
  ON "DailyActivity" ("userId", "date" DESC);

COMMENT ON TABLE "DailyActivity" IS
  'Enregistre une activité utilisateur par jour. Sert au calcul du streak quotidien.';

COMMENT ON COLUMN "DailyActivity"."date" IS
  'Jour de l''activité (date only). Une seule entrée par (userId, date, type).';
