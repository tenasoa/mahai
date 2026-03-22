-- Migration complète pour l'espace Contributeur
-- À exécuter dans le SQL Editor de Supabase

-- ═══════════════════════════════════════════════════════════════
-- 1. TABLE WITHDRAWAL (Retraits d'argent)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "Withdrawal" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "amount" INTEGER NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "paymentMethod" TEXT DEFAULT 'MVOLA' NOT NULL,
  "status" TEXT DEFAULT 'PENDING' NOT NULL,
  "transactionId" TEXT,
  "rejectionReason" TEXT,
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS "Withdrawal_userId_idx" ON "Withdrawal"("userId");
CREATE INDEX IF NOT EXISTS "Withdrawal_status_idx" ON "Withdrawal"("status");
CREATE INDEX IF NOT EXISTS "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");
CREATE INDEX IF NOT EXISTS "Withdrawal_paymentMethod_idx" ON "Withdrawal"("paymentMethod");

-- Trigger pour mettre à jour updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_withdrawal_updated_at ON "Withdrawal";
CREATE TRIGGER update_withdrawal_updated_at
  BEFORE UPDATE ON "Withdrawal"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- 2. TABLE NOTIFICATION (Notifications utilisateurs)
-- ═══════════════════════════════════════════════════════════════

-- Ajouter les colonnes isRead et isDismissed à CreditTransaction
ALTER TABLE "CreditTransaction" 
ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN DEFAULT false NOT NULL;

ALTER TABLE "CreditTransaction" 
ADD COLUMN IF NOT EXISTS "isDismissed" BOOLEAN DEFAULT false NOT NULL;

-- Index pour les notifications
CREATE INDEX IF NOT EXISTS "CreditTransaction_userId_isRead_idx" 
ON "CreditTransaction"("userId", "isRead");

CREATE INDEX IF NOT EXISTS "CreditTransaction_userId_isDismissed_idx" 
ON "CreditTransaction"("userId", "isDismissed");

-- ═══════════════════════════════════════════════════════════════
-- 3. TABLE SUBJECT LOG (Historique des modifications de sujets)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "SubjectLog" (
  "id" TEXT PRIMARY KEY,
  "subjectId" TEXT NOT NULL REFERENCES "Subject"("id") ON DELETE CASCADE,
  "userId" TEXT REFERENCES "User"("id"),
  "action" TEXT NOT NULL,
  "oldStatus" TEXT,
  "newStatus" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour SubjectLog
CREATE INDEX IF NOT EXISTS "SubjectLog_subjectId_idx" ON "SubjectLog"("subjectId");
CREATE INDEX IF NOT EXISTS "SubjectLog_userId_idx" ON "SubjectLog"("userId");
CREATE INDEX IF NOT EXISTS "SubjectLog_createdAt_idx" ON "SubjectLog"("createdAt");

-- ═══════════════════════════════════════════════════════════════
-- 4. COLONNES MANQUANTES
-- ═══════════════════════════════════════════════════════════════

-- Ajouter status à Subject si n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'Subject' AND column_name = 'status'
    ) THEN
        ALTER TABLE "Subject" ADD COLUMN "status" TEXT DEFAULT 'PUBLISHED' NOT NULL;
    END IF;
END $$;

-- Ajouter status à CreditTransaction si n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'CreditTransaction' AND column_name = 'status'
    ) THEN
        ALTER TABLE "CreditTransaction" ADD COLUMN "status" TEXT DEFAULT 'PENDING' NOT NULL;
    END IF;
END $$;

-- Ajouter downloadCount à Subject (optionnel, peut être calculé)
DO $$
BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'Subject' AND column_name = 'downloadCount'
    ) THEN
        ALTER TABLE "Subject" ADD COLUMN "downloadCount" INTEGER DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 5. DONNÉES DE TEST (Optionnel - à commenter en production)
-- ═══════════════════════════════════════════════════════════════

-- Exemple de retrait de test (à commenter en production)
-- INSERT INTO "Withdrawal" ("id", "userId", "amount", "phoneNumber", "paymentMethod", "status")
-- VALUES (
--   gen_random_uuid(),
--   (SELECT id FROM "User" LIMIT 1),
--   50000,
--   '034 01 000 00',
--   'MVOLA',
--   'PENDING'
-- );

-- ═══════════════════════════════════════════════════════════════
-- 6. VUES UTILES
-- ═══════════════════════════════════════════════════════════════

-- Vue pour les statistiques de retraits par utilisateur
CREATE OR REPLACE VIEW "WithdrawalStats" AS
SELECT 
  "userId",
  COUNT(*) as totalWithdrawals,
  SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END) as pendingAmount,
  SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) as completedAmount,
  SUM(CASE WHEN status = 'FAILED' THEN amount ELSE 0 END) as failedAmount,
  SUM(amount) as totalAmount
FROM "Withdrawal"
GROUP BY "userId";

-- ═══════════════════════════════════════════════════════════════
-- FIN DE LA MIGRATION
-- ═══════════════════════════════════════════════════════════════
