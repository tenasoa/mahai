-- ============================================================================
-- Phase 2 : Migration des paramètres SystemSetting vers Ariary
--
-- Décisions :
--   - 1 crédit historique = 50 Ar (taux figé pour la migration)
--   - Les paramètres « ai.price.* » étaient stockés en crédits → multiplier ×50
--   - Ajout d'un PLATFORM_FEE_PERCENT en SystemSetting (remplace
--     CurrencyConfig.platformFeePercent qui sera supprimée Phase 3)
--
-- Idempotente : peut être ré-exécutée sans dégât.
-- ============================================================================

BEGIN;

-- ====================================================================
-- 1. ai.price.submission / ai.price.direct : ×50 (crédits → Ariary)
--    Garde-fou : on ne convertit que si la valeur actuelle est petite
--    (< 100), sinon on suppose qu'elle est déjà en Ar.
-- ====================================================================
UPDATE "SystemSetting"
SET value       = (COALESCE(NULLIF(value, '')::INTEGER, 0) * 50)::TEXT,
    label       = 'Coût correction soumission (Ar)',
    description = 'Solde Ariary débité quand un élève fait corriger ses réponses par l''IA.'
WHERE key = 'ai.price.submission'
  AND COALESCE(NULLIF(value, '')::INTEGER, 0) BETWEEN 1 AND 100;

UPDATE "SystemSetting"
SET value       = (COALESCE(NULLIF(value, '')::INTEGER, 0) * 50)::TEXT,
    label       = 'Coût correction IA directe (Ar)',
    description = 'Solde Ariary débité quand un élève demande la correction complète sans rédiger ses réponses.'
WHERE key = 'ai.price.direct'
  AND COALESCE(NULLIF(value, '')::INTEGER, 0) BETWEEN 1 AND 100;

-- ====================================================================
-- 2. PLATFORM_FEE_PERCENT : remplace CurrencyConfig.platformFeePercent
--    Récupère la dernière valeur active depuis CurrencyConfig si elle
--    existe encore, sinon fixe la valeur par défaut (30 %).
-- ====================================================================
DO $$
DECLARE
  v_fee NUMERIC := 30;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'CurrencyConfig') THEN
    SELECT COALESCE("platformFeePercent", 30)
      INTO v_fee
      FROM "CurrencyConfig"
      WHERE "activeAt" <= NOW()
      ORDER BY "activeAt" DESC
      LIMIT 1;
  END IF;

  INSERT INTO "SystemSetting" (key, value, type, label, description, category, "isEditable")
  VALUES (
    'PLATFORM_FEE_PERCENT',
    v_fee::TEXT,
    'number',
    'Frais plateforme (%)',
    'Pourcentage prélevé sur chaque vente de sujet par la plateforme (0-100).',
    'finance',
    true
  )
  ON CONFLICT (key) DO NOTHING;
END $$;

-- ====================================================================
-- 3. Transaction : ajouter isRead / isDismissed pour préserver le flux
--    de notifications côté UI (les anciennes pages lisaient ces colonnes
--    sur CreditTransaction). Ces colonnes sont optionnelles côté finance.
-- ====================================================================
ALTER TABLE "Transaction"
  ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isDismissed" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_transaction_user_unread
  ON "Transaction" ("userId", "isRead")
  WHERE "isRead" = false AND "isDismissed" = false;

COMMIT;

-- ============================================================================
-- VÉRIFICATIONS
-- ============================================================================
-- SELECT key, value FROM "SystemSetting"
--  WHERE key IN ('ai.price.submission','ai.price.direct','PLATFORM_FEE_PERCENT')
--  ORDER BY key;
-- ============================================================================
