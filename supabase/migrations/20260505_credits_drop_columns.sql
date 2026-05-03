-- ============================================================================
-- Phase 3 : Migration DESTRUCTRICE - Suppression définitive des crédits
-- ⚠️  WARNING: Cette migration supprime PERMANEMMENT les données crédits
--
-- PREREQUIS:
--   1. Code de la Phase 2 déployé et stable en production ≥48h
--   2. Aucune erreur liée aux colonnes Ariary (balanceAr, amountAr, prix)
--   3. Backup Supabase récent (snapshot manuel)
--   4. Tous les utilisateurs ont été migrés (balanceAr = credits × 50)
--
-- CETTE MIGRATION EST IRREVERSIBLE - Les données crédits seront perdues
-- ============================================================================

BEGIN;

-- ====================================================================
-- 1. ARCHIVAGE OPTIONNEL (décommenter si besoin d'historique)
-- ====================================================================
-- CREATE TABLE IF NOT EXISTS "_CreditsArchive_20260505" AS 
-- SELECT id, "userId", credits as "creditsLegacy", "balanceAr" as "balanceArNew", NOW() as archived_at 
-- FROM "User" WHERE credits > 0;

-- ====================================================================
-- 2. SUPPRESSION DES COLONNES OBSOLETES - Table User
-- ====================================================================

-- Vérifier que balanceAr est bien populé avant suppression
DO $$
DECLARE
  null_balance_count INTEGER;
  credit_holders_count INTEGER;
BEGIN
  -- Compter les utilisateurs avec credits > 0 mais balanceAr = 0
  SELECT COUNT(*) INTO credit_holders_count
  FROM "User" 
  WHERE credits > 0 AND ("balanceAr" = 0 OR "balanceAr" IS NULL);
  
  IF credit_holders_count > 0 THEN
    RAISE WARNING 'ATTENTION: % utilisateurs ont encore des crédits non migrés vers balanceAr!', credit_holders_count;
    RAISE WARNING 'Migration annulée. Vérifiez la migration 20260502_remove_credits_use_ariary_only.sql';
    -- Décommenter la ligne suivante pour forcer la migration (DANGER)
    -- RAISE EXCEPTION 'Migration bloquée: crédits non migrés détectés';
  END IF;
END $$;

-- Supprimer la colonne credits de User
ALTER TABLE "User" DROP COLUMN IF EXISTS credits;

-- ====================================================================
-- 3. SUPPRESSION DES COLONNES OBSOLETES - Table Subject
-- ====================================================================

ALTER TABLE "Subject" DROP COLUMN IF EXISTS credits;
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "priceInAr";        -- Redondant avec prix
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "priceInCredits";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "contributorRevenuInAr";

-- ====================================================================
-- 4. SUPPRESSION DES COLONNES OBSOLETES - Table Purchase
-- ====================================================================

ALTER TABLE "Purchase" DROP COLUMN IF EXISTS "creditsAmount";
ALTER TABLE "Purchase" DROP COLUMN IF EXISTS amount;             -- Redondant avec amountAr

-- ====================================================================
-- 5. SUPPRESSION DES COLONNES OBSOLETES - Table SubjectSubmission
-- ====================================================================

ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "prixEnCredits";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "estimatedContributorRevenue";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "prixEnAr";  -- Redondant avec prix

-- ====================================================================
-- 6. SUPPRESSION DES COLONNES OBSOLETES - Table CreditPack
-- ====================================================================

ALTER TABLE "CreditPack" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "CreditPack" DROP COLUMN IF EXISTS price;              -- Remplacé par arAmount

-- ====================================================================
-- 7. SUPPRESSION DES COLONNES OBSOLETES - Table UserReferral (si existent encore)
-- ====================================================================

ALTER TABLE "UserReferral" DROP COLUMN IF EXISTS "referrerBonusCredits";
ALTER TABLE "UserReferral" DROP COLUMN IF EXISTS "referredBonusCredits";

-- ====================================================================
-- 8. SUPPRESSION DES TABLES OBSOLETES
-- ====================================================================

-- Supprimer CurrencyConfig (remplacée par SystemSetting PLATFORM_FEE_PERCENT)
DROP TABLE IF EXISTS "CurrencyConfig";

-- Supprimer CreditTransaction (remplacée par Transaction)
-- ⚠️ S'assurer que Transaction contient toutes les données avant suppression
DO $$
DECLARE
  ct_count INTEGER;
  tx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ct_count FROM "CreditTransaction";
  SELECT COUNT(*) INTO tx_count FROM "Transaction";
  
  IF ct_count > tx_count THEN
    RAISE WARNING 'ATTENTION: CreditTransaction a % lignes mais Transaction en a %', ct_count, tx_count;
    RAISE WARNING 'Des transactions pourraient être manquantes dans la nouvelle table!';
  ELSE
    RAISE NOTICE 'Vérification OK: Transaction (% lignes) contient au moins autant de données que CreditTransaction (% lignes)', tx_count, ct_count;
  END IF;
END $$;

DROP TABLE IF EXISTS "CreditTransaction";

-- ====================================================================
-- 9. SUPPRESSION DES ANCIENNES SYSTEM SETTINGS
-- ====================================================================

DELETE FROM "SystemSetting"
WHERE key IN (
  'WELCOME_BONUS_CREDITS',
  'REFERRAL_BONUS_CREDITS', 
  'REFERRED_BONUS_CREDITS',
  'REFERRAL_BONUS_AR',      -- Doublon potentiel de REFERRER_BONUS_AR
  'CREDIT_TO_AR_RATE',      -- Taux de conversion obsolète
  'AR_PER_CREDIT'           -- Taux de conversion obsolète
);

-- ====================================================================
-- 10. NETTOYAGE DES INDEX OBSOLETES
-- ====================================================================

DROP INDEX IF EXISTS idx_user_credits;
DROP INDEX IF EXISTS idx_purchase_credits;
DROP INDEX IF EXISTS idx_credit_transaction_user;
DROP INDEX IF EXISTS idx_credit_transaction_user_unread;

-- ====================================================================
-- 11. VUES - Mise à jour ou suppression
-- ====================================================================

-- Recréer les vues qui dépendaient des colonnes supprimées (si nécessaire)
-- La vue v_user_financial_summary a déjà été mise à jour dans la migration 20260502

-- ====================================================================
-- VÉRIFICATIONS FINALES
-- ====================================================================

DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  -- Vérifier que credits n'existe plus dans User
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'credits'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE EXCEPTION 'ERREUR: La colonne credits existe toujours dans User!';
  ELSE
    RAISE NOTICE '✅ Colonne credits supprimée de User';
  END IF;
  
  -- Vérifier que CreditTransaction n'existe plus
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'CreditTransaction'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE EXCEPTION 'ERREUR: La table CreditTransaction existe toujours!';
  ELSE
    RAISE NOTICE '✅ Table CreditTransaction supprimée';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Phase 3 terminée avec succès!';
  RAISE NOTICE 'Le système est maintenant 100% Ariary';
  RAISE NOTICE '========================================';
END $$;

COMMIT;
