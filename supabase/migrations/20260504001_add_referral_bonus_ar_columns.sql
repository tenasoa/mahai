-- ============================================================================
-- Migration : Ajout des colonnes referrerBonusAr et referredBonusAr
-- Description : Ajoute les colonnes manquantes pour le système de parrainage
--               en Ariary (remplace referrerBonusCredits/referredBonusCredits)
-- ============================================================================

BEGIN;

-- Ajouter les colonnes Ariary si elles n'existent pas
ALTER TABLE "UserReferral"
  ADD COLUMN IF NOT EXISTS "referrerBonusAr" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "referredBonusAr" INTEGER NOT NULL DEFAULT 0;

-- Migrer les données depuis les anciennes colonnes credits si elles existent
DO $$
BEGIN
  -- Si referrerBonusCredits existe, migrer vers referrerBonusAr
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'UserReferral' AND column_name = 'referrerBonusCredits'
  ) THEN
    UPDATE "UserReferral" 
      SET "referrerBonusAr" = COALESCE("referrerBonusCredits", 0) * 50
      WHERE "referrerBonusAr" = 0 AND "referrerBonusCredits" > 0;
  END IF;

  -- Si referredBonusCredits existe, migrer vers referredBonusAr
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'UserReferral' AND column_name = 'referredBonusCredits'
  ) THEN
    UPDATE "UserReferral" 
      SET "referredBonusAr" = COALESCE("referredBonusCredits", 0) * 50
      WHERE "referredBonusAr" = 0 AND "referredBonusCredits" > 0;
  END IF;
END $$;

-- Supprimer les anciennes colonnes credits si elles existent
ALTER TABLE "UserReferral" 
  DROP COLUMN IF EXISTS "referrerBonusCredits",
  DROP COLUMN IF EXISTS "referredBonusCredits";

-- Commentaires
COMMENT ON COLUMN "UserReferral"."referrerBonusAr" IS 'Bonus Ariary offert au parrain';
COMMENT ON COLUMN "UserReferral"."referredBonusAr" IS 'Bonus Ariary offert au filleul';

COMMIT;
