-- ============================================================================
-- Badges / Achievements utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS "UserBadge" (
  "id"          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT        NOT NULL,
  "badgeId"     TEXT        NOT NULL,
  "earnedAt"    TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT "fk_user_badge_user"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,

  -- Un badge ne peut être gagné qu'une seule fois par utilisateur
  CONSTRAINT "uq_user_badge" UNIQUE ("userId", "badgeId")
);

CREATE INDEX IF NOT EXISTS "idx_user_badge_user"
  ON "UserBadge" ("userId");

COMMENT ON TABLE "UserBadge" IS
  'Badges et accomplissements débloqués par l''utilisateur.';
