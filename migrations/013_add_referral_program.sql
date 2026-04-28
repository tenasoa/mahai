-- Migration : Ajout du programme de parrainage
-- Date : 2026-04-28
-- Description : Gestion des codes de parrainage, filleuls et bonus de crédits

-- 1) Colonnes de parrainage sur User
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "referralCode" TEXT,
ADD COLUMN IF NOT EXISTS "referredByUserId" UUID REFERENCES "User"(id) ON DELETE SET NULL;

-- 2) Unicité du code de parrainage
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_referral_code_unique
ON "User"("referralCode")
WHERE "referralCode" IS NOT NULL;

-- 3) Accélération des recherches de filleuls
CREATE INDEX IF NOT EXISTS idx_user_referred_by
ON "User"("referredByUserId");

-- 4) Table de suivi des parrainages
CREATE TABLE IF NOT EXISTS "UserReferral" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "referrerUserId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "referredUserId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
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

-- Un utilisateur ne peut avoir qu'un seul parrain effectif
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_referral_referred_unique
ON "UserReferral"("referredUserId");

-- Statistiques rapides côté parrain
CREATE INDEX IF NOT EXISTS idx_user_referral_referrer
ON "UserReferral"("referrerUserId", "createdAt" DESC);

-- Mise à jour automatique de updatedAt
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
COMMENT ON COLUMN "User"."referralCode" IS 'Code de parrainage unique partageable';
COMMENT ON COLUMN "User"."referredByUserId" IS 'Parrain ayant invité l utilisateur';
