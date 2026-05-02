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
-- Note: Si vous avez un taux différent, modifiez le multiplicateur
UPDATE "User" 
  SET "balanceAr" = COALESCE(credits, 0) * 50
  WHERE "balanceAr" = 0 AND credits > 0;

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
    u."totalEarningsAr",
    u."pendingEarningsAr",
    u."withdrawnEarningsAr",
    COUNT(DISTINCT s.id) as "subjectsCount",
    COUNT(DISTINCT p.id) as "purchasesCount"
FROM "User" u
LEFT JOIN "Subject" s ON s."authorId" = u.id
LEFT JOIN "Purchase" p ON p."subjectId" = s.id
WHERE u.role = 'CONTRIBUTEUR'
GROUP BY u.id, u.nom, u.email, u.phone, u."balanceAr", u."totalEarningsAr", u."pendingEarningsAr", u."withdrawnEarningsAr"
ORDER BY u."withdrawnEarningsAr" DESC NULLS LAST;

-- Supprimer l'ancienne colonne credits
ALTER TABLE "User" DROP COLUMN IF EXISTS credits;

-- Mettre à jour le commentaire
COMMENT ON COLUMN "User"."balanceAr" IS 'Solde en Ariary (ancien système de crédits supprimé)';

-- ============================================================
-- 2. TABLE Subject - Supprimer credits, garder prix (Ariary)
-- ============================================================

-- La colonne prix existe déjà en Ariary, supprimer credits si existe
ALTER TABLE "Subject" DROP COLUMN IF EXISTS credits;

-- Vérifier que prix est bien en Ariary (normalement déjà le cas)
COMMENT ON COLUMN "Subject".credits IS NULL; -- Supprimer ancien commentaire si existant
COMMENT ON COLUMN "Subject".credits IS 'Prix en Ariary (unique devise)';

-- ============================================================
-- 3. TABLE Purchase - Remplacer credits par amountAr
-- ============================================================

-- Renommer/ajouter la colonne
ALTER TABLE "Purchase" 
  ADD COLUMN IF NOT EXISTS "amountAr" INTEGER;

-- Migrer les données
UPDATE "Purchase" 
  SET "amountAr" = COALESCE(credits, 1) * 50
  WHERE "amountAr" IS NULL;

-- Rendre NOT NULL après migration
ALTER TABLE "Purchase" 
  ALTER COLUMN "amountAr" SET NOT NULL;

-- Supprimer l'ancienne colonne
ALTER TABLE "Purchase" DROP COLUMN IF EXISTS credits;

COMMENT ON COLUMN "Purchase"."amountAr" IS 'Montant payé en Ariary';

-- ============================================================
-- 4. TABLE ReferralCommission - Convertir creditAmount en arAmount
-- ============================================================

ALTER TABLE "ReferralCommission" 
  ADD COLUMN IF NOT EXISTS "arAmount" INTEGER;

UPDATE "ReferralCommission" 
  SET "arAmount" = COALESCE("creditAmount", 0) * 50
  WHERE "arAmount" IS NULL;

ALTER TABLE "ReferralCommission" 
  ALTER COLUMN "arAmount" SET NOT NULL;

ALTER TABLE "ReferralCommission" DROP COLUMN IF EXISTS "creditAmount";

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
