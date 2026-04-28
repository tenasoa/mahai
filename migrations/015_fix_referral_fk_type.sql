-- Migration : Correction du type de la colonne referredByUserId
-- Date : 2026-04-28
-- Description : User.id est TEXT, donc referredByUserId doit être TEXT aussi

-- Supprimer la contrainte FK existante si présente
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_referredByUserId_fkey";

-- Supprimer la colonne si elle existe (pour la recréer proprement)
ALTER TABLE "User" DROP COLUMN IF EXISTS "referredByUserId";

-- Recréer la colonne avec le type TEXT (car User.id est TEXT)
ALTER TABLE "User"
ADD COLUMN "referredByUserId" TEXT REFERENCES "User"(id) ON DELETE SET NULL;

-- Recréer l'index
DROP INDEX IF EXISTS idx_user_referred_by;
CREATE INDEX IF NOT EXISTS idx_user_referred_by ON "User"("referredByUserId");

COMMENT ON COLUMN "User"."referredByUserId" IS 'Parrain ayant invité l utilisateur';

-- Correction de la table UserReferral (créée avec UUID mais User.id est TEXT)
-- Supprimer la table et la recréer avec les bons types
DROP TABLE IF EXISTS "UserReferral";

-- Recréer avec TEXT au lieu de UUID
CREATE TABLE "UserReferral" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "referrerUserId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "referredUserId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'COMPLETED', 'CANCELED')),
  "referrerBonusCredits" INTEGER NOT NULL DEFAULT 20,
  "referredBonusCredits" INTEGER NOT NULL DEFAULT 10,
  "referrerBonusGrantedAt" TIMESTAMPTZ,
  "referredBonusGrantedAt" TIMESTAMPTZ,
  "activatedAt" TIMESTAMPTZ,
  "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "UserReferral_referrer_not_referred" CHECK ("referrerUserId" <> "referredUserId")
);

-- Recréer les index
CREATE UNIQUE INDEX idx_user_referral_referred_unique ON "UserReferral"("referredUserId");
CREATE INDEX idx_user_referral_referrer ON "UserReferral"("referrerUserId", "createdAt" DESC);

-- Recréer le trigger
CREATE OR REPLACE FUNCTION set_user_referral_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_referral_updated_at ON "UserReferral";

CREATE TRIGGER trg_user_referral_updated_at
BEFORE UPDATE ON "UserReferral"
FOR EACH ROW
EXECUTE FUNCTION set_user_referral_updated_at();

COMMENT ON TABLE "UserReferral" IS 'Suivi des parrainages entre utilisateurs';
