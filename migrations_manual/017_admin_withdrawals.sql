-- Migration pour la gestion Admin des Retraits Mobile Money
-- À exécuter dans le SQL Editor de Supabase
-- PRÉREQUIS : La table "Withdrawal" doit déjà exister (migration 015)

-- ═══════════════════════════════════════════════════════════════
-- 1. INDEX SUPPLÉMENTAIRES POUR L'ADMIN
-- ═══════════════════════════════════════════════════════════════

-- Index pour les requêtes par mois (utilisé dans getAdminWithdrawals)
CREATE INDEX IF NOT EXISTS "Withdrawal_createdAt_month_idx" 
ON "Withdrawal" (EXTRACT(MONTH FROM "createdAt"), EXTRACT(YEAR FROM "createdAt"));

-- Index composite pour les statistiques admin
CREATE INDEX IF NOT EXISTS "Withdrawal_status_createdAt_idx" 
ON "Withdrawal"("status", "createdAt");

-- ═══════════════════════════════════════════════════════════════
-- 2. VUES POUR L'ADMIN
-- ═══════════════════════════════════════════════════════════════

-- Vue pour les statistiques mensuelles de retraits
CREATE OR REPLACE VIEW "AdminWithdrawalStats" AS
SELECT 
  EXTRACT(YEAR FROM "createdAt") as year,
  EXTRACT(MONTH FROM "createdAt") as month,
  TO_CHAR("createdAt", 'YYYY-MM') as month_label,
  COUNT(*) as totalWithdrawals,
  COUNT(*) FILTER (WHERE status = 'PENDING') as pendingCount,
  COUNT(*) FILTER (WHERE status = 'PROCESSING') as processingCount,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completedCount,
  COUNT(*) FILTER (WHERE status = 'FAILED') as failedCount,
  COALESCE(SUM(amount), 0) as totalAmount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) as pendingAmount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) as completedAmount,
  COALESCE(AVG(amount) FILTER (WHERE status = 'COMPLETED'), 0) as averageAmount,
  COUNT(DISTINCT "userId") as uniqueUsers,
  COUNT(DISTINCT "userId") FILTER (WHERE status = 'COMPLETED') as paidUsers
FROM "Withdrawal"
GROUP BY EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt"), TO_CHAR("createdAt", 'YYYY-MM')
ORDER BY year DESC, month DESC;

-- Vue pour le cycle actuel (mois en cours)
CREATE OR REPLACE VIEW "CurrentCycleWithdrawals" AS
SELECT 
  COUNT(*) as totalWithdrawals,
  COUNT(*) FILTER (WHERE status = 'PENDING') as pendingCount,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completedCount,
  COUNT(*) FILTER (WHERE status = 'FAILED') as failedCount,
  COALESCE(SUM(amount), 0) as totalAmount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) as pendingAmount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) as completedAmount,
  COALESCE(AVG(amount) FILTER (WHERE status = 'COMPLETED'), 0) as averageAmount
FROM "Withdrawal"
WHERE EXTRACT(MONTH FROM "createdAt") = EXTRACT(MONTH FROM NOW())
  AND EXTRACT(YEAR FROM "createdAt") = EXTRACT(YEAR FROM NOW());

-- Vue pour les retraits par opérateur
CREATE OR REPLACE VIEW "WithdrawalsByOperator" AS
SELECT 
  "paymentMethod" as operator,
  EXTRACT(YEAR FROM "createdAt") as year,
  EXTRACT(MONTH FROM "createdAt") as month,
  COUNT(*) as totalWithdrawals,
  COUNT(*) FILTER (WHERE status = 'COMPLETED') as completedWithdrawals,
  COALESCE(SUM(amount), 0) as totalAmount,
  COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) as completedAmount,
  COALESCE(AVG(amount), 0) as averageAmount
FROM "Withdrawal"
GROUP BY "paymentMethod", EXTRACT(YEAR FROM "createdAt"), EXTRACT(MONTH FROM "createdAt")
ORDER BY year DESC, month DESC, operator;

-- Vue pour le top 10 des contributeurs par retraits
CREATE OR REPLACE VIEW "TopWithdrawalsContributors" AS
SELECT 
  w."userId",
  u.prenom,
  u.nom,
  u.email,
  u.credits,
  COUNT(*) as totalWithdrawals,
  COUNT(*) FILTER (WHERE w.status = 'COMPLETED') as completedWithdrawals,
  COALESCE(SUM(w.amount), 0) as totalAmount,
  COALESCE(SUM(w.amount) FILTER (WHERE w.status = 'COMPLETED'), 0) as completedAmount,
  MAX(w."createdAt") as lastWithdrawal
FROM "Withdrawal" w
JOIN "User" u ON w."userId" = u.id
GROUP BY w."userId", u.prenom, u.nom, u.email, u.credits
ORDER BY completedAmount DESC
LIMIT 100;

-- ═══════════════════════════════════════════════════════════════
-- 3. FONCTIONS UTILITAIRES
-- ═══════════════════════════════════════════════════════════════

-- Fonction pour obtenir les statistiques d'un cycle spécifique
CREATE OR REPLACE FUNCTION getCycleStats(targetYear INT, targetMonth INT)
RETURNS TABLE (
  totalWithdrawals BIGINT,
  pendingCount BIGINT,
  completedCount BIGINT,
  failedCount BIGINT,
  totalAmount BIGINT,
  pendingAmount BIGINT,
  completedAmount BIGINT,
  averageAmount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'PENDING')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'COMPLETED')::BIGINT,
    COUNT(*) FILTER (WHERE status = 'FAILED')::BIGINT,
    COALESCE(SUM(amount), 0)::BIGINT,
    COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0)::BIGINT,
    COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0)::BIGINT,
    COALESCE(AVG(amount) FILTER (WHERE status = 'COMPLETED'), 0)::NUMERIC
  FROM "Withdrawal"
  WHERE EXTRACT(YEAR FROM "createdAt") = targetYear
    AND EXTRACT(MONTH FROM "createdAt") = targetMonth;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les retraits d'un mois spécifique
CREATE OR REPLACE FUNCTION getMonthWithdrawals(targetYear INT, targetMonth INT)
RETURNS TABLE (
  id TEXT,
  "userId" TEXT,
  amount INTEGER,
  phoneNumber TEXT,
  paymentMethod TEXT,
  status TEXT,
  prenom TEXT,
  nom TEXT,
  email TEXT,
  credits INTEGER,
  "createdAt" TIMESTAMP,
  "processedAt" TIMESTAMP,
  "rejectionReason" TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    w.id,
    w."userId",
    w.amount,
    w.phoneNumber,
    w.paymentMethod,
    w.status,
    u.prenom,
    u.nom,
    u.email,
    u.credits,
    w."createdAt",
    w."processedAt",
    w."rejectionReason"
  FROM "Withdrawal" w
  JOIN "User" u ON w."userId" = u.id
  WHERE EXTRACT(YEAR FROM w."createdAt") = targetYear
    AND EXTRACT(MONTH FROM w."createdAt") = targetMonth
  ORDER BY w."createdAt" DESC;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════════
-- 4. DONNÉES DE TEST (Optionnel - à commenter en production)
-- ═══════════════════════════════════════════════════════════════

-- Exemple de retraits de test pour l'admin (à commenter en production)
-- INSERT INTO "Withdrawal" ("id", "userId", "amount", "phoneNumber", "paymentMethod", "status")
-- VALUES 
--   (gen_random_uuid(), (SELECT id FROM "User" WHERE role = 'CONTRIBUTEUR' LIMIT 1), 50000, '034 01 000 01', 'MVOLA', 'PENDING'),
--   (gen_random_uuid(), (SELECT id FROM "User" WHERE role = 'CONTRIBUTEUR' LIMIT 1), 75000, '032 02 000 02', 'ORANGE', 'PENDING'),
--   (gen_random_uuid(), (SELECT id FROM "User" WHERE role = 'CONTRIBUTEUR' LIMIT 1), 100000, '033 03 000 03', 'AIRTEL', 'COMPLETED');

-- ═══════════════════════════════════════════════════════════════
-- 5. REQUÊTES EXEMPLES POUR TESTER
-- ═══════════════════════════════════════════════════════════════

-- Voir les statistiques du mois en cours
-- SELECT * FROM "CurrentCycleWithdrawals";

-- Voir l'historique mensuel
-- SELECT * FROM "AdminWithdrawalStats" LIMIT 12;

-- Voir les retraits par opérateur
-- SELECT * FROM "WithdrawalsByOperator" WHERE year = EXTRACT(YEAR FROM NOW()) AND month = EXTRACT(MONTH FROM NOW());

-- Voir le top des contributeurs
-- SELECT * FROM "TopWithdrawalsContributors" LIMIT 20;

-- Utiliser la fonction pour un cycle spécifique
-- SELECT * FROM getCycleStats(2026, 3);

-- ═══════════════════════════════════════════════════════════════
-- FIN DE LA MIGRATION ADMIN RETRAITS
-- ═══════════════════════════════════════════════════════════════
