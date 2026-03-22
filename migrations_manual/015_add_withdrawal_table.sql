-- Migration pour ajouter la table Withdrawal (retraits des contributeurs)
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer la table Withdrawal
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

-- 2. Index pour les performances
CREATE INDEX IF NOT EXISTS "Withdrawal_userId_idx" ON "Withdrawal"("userId");
CREATE INDEX IF NOT EXISTS "Withdrawal_status_idx" ON "Withdrawal"("status");
CREATE INDEX IF NOT EXISTS "Withdrawal_createdAt_idx" ON "Withdrawal"("createdAt");

-- 3. Trigger pour mettre à jour updatedAt
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
