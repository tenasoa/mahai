-- ============================================================
-- Migration : Suppression des crédits - Unification en Ariary
-- Description : Remplace tous les systèmes de crédits par
--               l'Ariary comme unique devise
-- ============================================================

-- ============================================================
-- 1. TABLE User - Remplacer credits par balanceAr
-- ============================================================

-- Ajouter la nouvelle colonne balanceAr
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "balanceAr" INTEGER NOT NULL DEFAULT 0;

-- Migrer les données : credits * taux (utiliser 50 Ar/crédit comme valeur par défaut)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'credits'
  ) THEN
    UPDATE "User" 
      SET "balanceAr" = COALESCE(credits, 0) * 50
      WHERE "balanceAr" = 0 AND credits > 0;
  END IF;
END $$;

-- ============================================================
-- 1b. RECREER LES VUES DEPENDANTES (avec balanceAr)
-- ============================================================

-- Supprimer et recréer la vue TopWithdrawalsContributors avec balanceAr
DROP VIEW IF EXISTS "TopWithdrawalsContributors";

CREATE VIEW "TopWithdrawalsContributors" AS
SELECT 
    u.id,
    u.nom,
    u.email,
    u.phone,
    u."balanceAr",
    COUNT(DISTINCT s.id) as "subjectsCount",
    COUNT(DISTINCT p.id) as "purchasesCount"
FROM "User" u
LEFT JOIN "Subject" s ON s."authorId" = u.id
LEFT JOIN "Purchase" p ON p."subjectId" = s.id
WHERE u.role = 'CONTRIBUTEUR'
GROUP BY u.id, u.nom, u.email, u.phone, u."balanceAr"
ORDER BY u."balanceAr" DESC NULLS LAST;

-- Supprimer l'ancienne colonne credits
ALTER TABLE "User" DROP COLUMN IF EXISTS credits;

-- Mettre à jour le commentaire
COMMENT ON COLUMN "User"."balanceAr" IS 'Solde en Ariary (ancien système de crédits supprimé)';

-- ============================================================
-- 2. TABLE Subject - Supprimer credits, garder prix (Ariary)
-- ============================================================

-- Supprimer credits si existe
ALTER TABLE "Subject" DROP COLUMN IF EXISTS credits;

-- Ajouter la colonne prix si elle n'existe pas (pour stocker le prix en Ariary)
ALTER TABLE "Subject" 
  ADD COLUMN IF NOT EXISTS prix INTEGER NOT NULL DEFAULT 0;

-- Migrer les données si nécessaire (si une ancienne colonne price existe)
-- UPDATE "Subject" SET prix = COALESCE(price, 0) WHERE prix = 0;

COMMENT ON COLUMN "Subject".prix IS 'Prix en Ariary (unique devise)';

-- ============================================================
-- 3. TABLE Purchase - Remplacer credits par amountAr
-- ============================================================

-- Renommer/ajouter la colonne
ALTER TABLE "Purchase" 
  ADD COLUMN IF NOT EXISTS "amountAr" INTEGER;

-- Migrer les données (si la colonne credits existe encore)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Purchase' AND column_name = 'credits'
  ) THEN
    UPDATE "Purchase" 
      SET "amountAr" = COALESCE(credits, 1) * 50
      WHERE "amountAr" IS NULL;
  ELSE
    -- Si credits n'existe pas, mettre une valeur par défaut
    UPDATE "Purchase" SET "amountAr" = 0 WHERE "amountAr" IS NULL;
  END IF;
END $$;

-- Rendre NOT NULL après migration
ALTER TABLE "Purchase" 
  ALTER COLUMN "amountAr" SET NOT NULL;

-- Supprimer l'ancienne colonne
ALTER TABLE "Purchase" DROP COLUMN IF EXISTS credits;

COMMENT ON COLUMN "Purchase"."amountAr" IS 'Montant payé en Ariary';

-- ============================================================
-- 4. TABLE ReferralCommission - Convertir creditAmount en arAmount
-- ============================================================

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS "ReferralCommission" (
    id TEXT PRIMARY KEY,
    "referrerId" TEXT REFERENCES "User"(id),
    "referredId" TEXT REFERENCES "User"(id),
    "arAmount" INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Ajouter l'extension UUID si pas déjà présente (pour gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Migrer les données (si la colonne creditAmount existe encore)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ReferralCommission' AND column_name = 'creditAmount'
  ) THEN
    -- Ajouter la colonne arAmount si pas encore là
    ALTER TABLE "ReferralCommission" ADD COLUMN IF NOT EXISTS "arAmount" INTEGER;
    
    UPDATE "ReferralCommission" 
      SET "arAmount" = COALESCE("creditAmount", 0) * 50
      WHERE "arAmount" IS NULL;
    
    -- Rendre NOT NULL après migration
    ALTER TABLE "ReferralCommission" ALTER COLUMN "arAmount" SET NOT NULL;
    
    -- Supprimer l'ancienne colonne
    ALTER TABLE "ReferralCommission" DROP COLUMN IF EXISTS "creditAmount";
  END IF;
END $$;

COMMENT ON COLUMN "ReferralCommission"."arAmount" IS 'Commission en Ariary';

-- ============================================================
-- 5. Table SubjectSubmission - Déjà en Ariary (prix), vérifier cohérence
-- ============================================================

-- S'assurer que prix est bien en Ariary (pas de conversion nécessaire)
COMMENT ON COLUMN "SubjectSubmission".prix IS 'Prix en Ariary (unique devise)';

-- ============================================================
-- 6. Supprimer la table CurrencyConfig (plus nécessaire)
-- ============================================================

-- Archiver d'abord les données si besoin (optionnel)
-- CREATE TABLE IF NOT EXISTS "_CurrencyConfig_archive" AS SELECT * FROM "CurrencyConfig";

-- Supprimer la table de configuration de taux
DROP TABLE IF EXISTS "CurrencyConfig";

-- ============================================================
-- 7. Mise à jour des index
-- ============================================================

-- Index pour les recherches par solde
CREATE INDEX IF NOT EXISTS idx_user_balance_ar 
  ON "User" ("balanceAr") 
  WHERE "balanceAr" > 0;

-- Index pour l'historique d'achats
CREATE INDEX IF NOT EXISTS idx_purchase_amount_ar 
  ON "Purchase" ("amountAr", "createdAt" DESC);

-- ============================================================
-- 8. Vérification finale - Contraintes de check
-- ============================================================

-- Empêcher les soldes négatifs
ALTER TABLE "User" 
  ADD CONSTRAINT check_balance_ar_positive 
  CHECK ("balanceAr" >= 0);

-- Empêcher les prix négatifs sur Subject
ALTER TABLE "Subject" 
  ADD CONSTRAINT check_prix_positive 
  CHECK (credits >= 0);

-- Empêcher les montants négatifs sur Purchase
ALTER TABLE "Purchase" 
  ADD CONSTRAINT check_amount_ar_positive 
  CHECK ("amountAr" > 0);

-- ============================================================
-- 9. Vue récapitulative pour le dashboard
-- ============================================================

CREATE OR REPLACE VIEW v_user_financial_summary AS
SELECT 
  u.id,
  u.email,
  u."balanceAr",
  COALESCE(SUM(p."amountAr"), 0) as total_spent_ar,
  COUNT(p.id) as purchases_count,
  COALESCE(SUM(rc."arAmount"), 0) as total_commissions_ar
FROM "User" u
LEFT JOIN "Purchase" p ON p."buyerId" = u.id
LEFT JOIN "ReferralCommission" rc ON rc."beneficiaryId" = u.id
GROUP BY u.id, u.email, u."balanceAr";

-- Commentaire sur la migration
COMMENT ON VIEW v_user_financial_summary IS 'Vue récapitulative financière par utilisateur (tous montants en Ariary)';
