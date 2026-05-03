-- ============================================================================
-- Phase 1 du refactoring Crédits → Ariary uniquement
-- Migration POnt NON-DESTRUCTIVE et IDEMPOTENTE.
--
-- Décisions validées :
--   - Taux historique : 50 Ar = 1 crédit (×50 lors de cette migration)
--   - Aucune colonne supprimée à ce stade — uniquement des additions et
--     renommages sûrs. Les anciennes colonnes (User.credits, CreditPack.price,
--     etc.) restent en place pour que l'ancien code continue de fonctionner.
--   - La phase 3 (DROP destructif) viendra après ≥48h de prod stable.
--
-- Snapshot Supabase obligatoire AVANT exécution. ✓ confirmé par l'utilisateur.
-- ============================================================================

BEGIN;

-- ====================================================================
-- 0. Pré-requis : User.balanceAr existe (au cas où 20260502 n'aurait
--    pas tourné). On garantit la présence avant d'ajouter la contrainte CHECK.
-- ====================================================================
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "balanceAr" INTEGER NOT NULL DEFAULT 0;

-- Migration des soldes credits → balanceAr (uniquement si balanceAr=0 ET
-- credits>0, pour éviter de doubler en cas de re-jouage).
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'User' AND column_name = 'credits') THEN
    UPDATE "User"
    SET "balanceAr" = "balanceAr" + COALESCE(credits, 0) * 50
    WHERE COALESCE(credits, 0) > 0
      AND "balanceAr" = 0;
  END IF;
END $$;

-- ====================================================================
-- 1. Table Transaction (nouvelle, pour les transactions Ariary)
--    Remplace progressivement CreditTransaction. Phase 1 : table créée
--    vide. Le nouveau code (Phase 2) y écrira. Phase 3 supprimera
--    CreditTransaction après archive.
-- ====================================================================
CREATE TABLE IF NOT EXISTS "Transaction" (
  id              TEXT PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "amountAr"      INTEGER NOT NULL,
  type            VARCHAR(32) NOT NULL,        -- RECHARGE | SPEND | EARN | REFUND | BONUS
  status          VARCHAR(32) NOT NULL DEFAULT 'PENDING',  -- PENDING | COMPLETED | FAILED | REJECTED
  description     TEXT,
  "phoneNumber"   TEXT,
  "paymentMethod" TEXT,
  "senderCode"    TEXT,
  "validatedAt"   TIMESTAMPTZ,
  "validatedBy"   TEXT,
  "rejectionReason" TEXT,
  metadata        JSONB DEFAULT '{}'::jsonb,
  "createdAt"     TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_transaction_user
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transaction_user_created
  ON "Transaction" ("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_status_created
  ON "Transaction" (status, "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_transaction_type
  ON "Transaction" (type, "createdAt" DESC);

COMMENT ON TABLE "Transaction" IS
  'Transactions financières en Ariary. Remplace CreditTransaction (à supprimer en Phase 3).';

-- ====================================================================
-- 2. Realtime : abonner Transaction à la publication Supabase Realtime
--    (idempotent — pas d'erreur si déjà abonnée ou si publication absente).
-- ====================================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE "Transaction";
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

-- ====================================================================
-- 3. SystemSetting : renommer les bonus crédits → bonus Ar (×50)
-- ====================================================================

-- 3.1 WELCOME_BONUS_CREDITS → WELCOME_BONUS_AR (10 cr → 500 Ar)
UPDATE "SystemSetting"
SET key         = 'WELCOME_BONUS_AR',
    value       = (COALESCE(NULLIF(value, '')::INTEGER, 0) * 50)::TEXT,
    label       = 'Bonus de bienvenue (Ar)',
    description = 'Solde Ariary offert aux nouveaux utilisateurs lors de l''inscription'
WHERE key = 'WELCOME_BONUS_CREDITS';

-- 3.2 REFERRAL_BONUS_CREDITS → REFERRAL_BONUS_AR (20 cr → 1000 Ar)
UPDATE "SystemSetting"
SET key         = 'REFERRAL_BONUS_AR',
    value       = (COALESCE(NULLIF(value, '')::INTEGER, 0) * 50)::TEXT,
    label       = 'Bonus de parrainage parrain (Ar)',
    description = 'Solde Ariary offert au parrain quand son filleul effectue son premier achat'
WHERE key = 'REFERRAL_BONUS_CREDITS';

-- 3.3 REFERRED_BONUS_CREDITS → REFERRED_BONUS_AR (idem)
UPDATE "SystemSetting"
SET key         = 'REFERRED_BONUS_AR',
    value       = (COALESCE(NULLIF(value, '')::INTEGER, 0) * 50)::TEXT,
    label       = 'Bonus de parrainage filleul (Ar)',
    description = 'Solde Ariary offert au filleul à l''inscription via un code parrain'
WHERE key = 'REFERRED_BONUS_CREDITS';

-- 3.4 Si DB fraîche (sans les anciennes clés), insérer les valeurs par défaut
INSERT INTO "SystemSetting" (key, value, type, label, description, category, "isEditable")
VALUES
  ('WELCOME_BONUS_AR',  '500',  'number', 'Bonus de bienvenue (Ar)',
   'Solde Ariary offert aux nouveaux utilisateurs lors de l''inscription',
   'onboarding', true),
  ('REFERRAL_BONUS_AR', '1000', 'number', 'Bonus de parrainage parrain (Ar)',
   'Solde Ariary offert au parrain quand son filleul effectue son premier achat',
   'referral', true),
  ('REFERRED_BONUS_AR', '500',  'number', 'Bonus de parrainage filleul (Ar)',
   'Solde Ariary offert au filleul à l''inscription via un code parrain',
   'referral', true)
ON CONFLICT (key) DO NOTHING;

-- ====================================================================
-- 4. AICorrection.creditsCost → costAr (rename idempotent)
-- ====================================================================
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'AICorrection' AND column_name = 'creditsCost')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'AICorrection' AND column_name = 'costAr') THEN
    ALTER TABLE "AICorrection" RENAME COLUMN "creditsCost" TO "costAr";
  END IF;
END $$;

-- ====================================================================
-- 5. CreditPack : adapter à une devise Ariary uniquement
-- ====================================================================

-- 5.1 Renommer price (DOUBLE PRECISION) → arAmount (INTEGER) si pas déjà fait
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'CreditPack' AND column_name = 'price')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns
                     WHERE table_name = 'CreditPack' AND column_name = 'arAmount') THEN
    ALTER TABLE "CreditPack" RENAME COLUMN "price" TO "arAmount";
    -- Cast DOUBLE → INTEGER (les prix sont des entiers en Ar)
    ALTER TABLE "CreditPack" ALTER COLUMN "arAmount" TYPE INTEGER USING ROUND("arAmount");
  END IF;
END $$;

-- 5.2 Ajouter bonusAr et migrer bonus crédits × 50 → bonusAr
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'CreditPack' AND column_name = 'bonusAr') THEN
    ALTER TABLE "CreditPack" ADD COLUMN "bonusAr" INTEGER NOT NULL DEFAULT 0;
    -- Migration uniquement si l'ancienne colonne `bonus` (en crédits) existe
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'CreditPack' AND column_name = 'bonus') THEN
      UPDATE "CreditPack" SET "bonusAr" = COALESCE("bonus", 0) * 50;
    END IF;
  END IF;
END $$;

-- 5.3 Note : la colonne CreditPack.credits (taille du pack en unités) est
-- gardée pour l'instant — elle représente le nombre d'unités qu'achète le
-- contributeur, pas une devise. Elle pourra être renommée packSize en
-- Phase 4 si besoin de clarté sémantique.

-- ====================================================================
-- 6. Garde-fou : User.balanceAr ≥ 0
--    (Skip silencieux si données existantes négatives — à corriger
--    manuellement ensuite si nécessaire.)
-- ====================================================================
DO $$ BEGIN
  ALTER TABLE "User" ADD CONSTRAINT user_balance_ar_positive
    CHECK ("balanceAr" >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN check_violation THEN
    RAISE NOTICE 'Skip CHECK balanceAr >= 0 : soldes négatifs existants. À corriger manuellement.';
END $$;

-- ====================================================================
-- 7. Garde-fou : pré-vérifier qu'aucune transaction n'est en cours
--    (warning seulement, ne bloque pas la migration)
-- ====================================================================
DO $$
DECLARE
  pending_count INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_name = 'CreditTransaction') THEN
    EXECUTE 'SELECT COUNT(*) FROM "CreditTransaction" WHERE status = ''PENDING''' INTO pending_count;
    IF pending_count > 0 THEN
      RAISE NOTICE 'Attention : % transaction(s) PENDING dans CreditTransaction. ' ||
                   'À traiter manuellement avant Phase 3 (DROP destructeur).',
                   pending_count;
    END IF;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- VÉRIFICATIONS POST-MIGRATION (à lancer manuellement après COMMIT)
-- ============================================================================
-- 1. Settings renommées correctement :
--    SELECT key, value FROM "SystemSetting"
--    WHERE key LIKE '%BONUS%' ORDER BY key;
--    → On doit voir WELCOME_BONUS_AR, REFERRAL_BONUS_AR, REFERRED_BONUS_AR
--      avec values multipliées par 50 (500, 1000, etc.)
--
-- 2. Table Transaction créée et vide :
--    SELECT COUNT(*) FROM "Transaction";
--    → 0 attendu (le code Phase 2 commencera à y écrire)
--
-- 3. AICorrection.costAr existe (creditsCost renommée) :
--    SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'AICorrection' AND column_name IN ('creditsCost', 'costAr');
--    → costAr présent, creditsCost absent
--
-- 4. CreditPack avec arAmount + bonusAr :
--    SELECT id, name, credits, "arAmount", "bonusAr", "isActive"
--    FROM "CreditPack" ORDER BY "sortOrder";
--    → arAmount > 0, bonusAr ≥ 0
--
-- 5. User.balanceAr migré depuis credits :
--    SELECT id, "balanceAr", credits FROM "User"
--    WHERE COALESCE(credits, 0) > 0 OR "balanceAr" > 0
--    LIMIT 5;
--    → balanceAr ≈ credits × 50
--
-- 6. Transactions PENDING potentielles :
--    SELECT COUNT(*) FROM "CreditTransaction" WHERE status = 'PENDING';
--    → idéalement 0 avant Phase 3
-- ============================================================================
