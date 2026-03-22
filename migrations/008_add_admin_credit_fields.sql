-- =====================================================
-- Migration 008: Champs admin pour CreditTransaction
-- Date: 2026-03-20
-- Description: Ajoute les champs nécessaires pour la
--              validation manuelle des paiements Mobile Money
-- =====================================================

-- Numéro de téléphone de l'expéditeur
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;

-- Code de confirmation saisi par l'utilisateur pendant l'achat
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "senderCode" TEXT;

-- Méthode de paiement (MVola, Orange Money, Airtel Money)
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;

-- Nombre de crédits à ajouter (séparé du montant en Ar)
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "creditsCount" INTEGER DEFAULT 0;

-- Statut de la transaction (PENDING, COMPLETED, FAILED)
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED'));

-- Motif de refus (retourné à l'utilisateur)
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Date de validation/refus
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "validatedAt" TIMESTAMP(3);

-- ID de l'admin qui a traité la transaction
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "validatedBy" UUID REFERENCES "User"(id) ON DELETE SET NULL;

-- ID de transaction externe (pour suivi opérateur)
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "transactionId" TEXT;

-- Index pour lookup rapide par statut
CREATE INDEX IF NOT EXISTS "CreditTransaction_status_idx" ON "CreditTransaction"("status");

-- Index pour lookup par senderCode
CREATE INDEX IF NOT EXISTS "CreditTransaction_senderCode_idx" ON "CreditTransaction"("senderCode");

-- =====================================================
-- VÉRIFICATION
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'CreditTransaction' ORDER BY ordinal_position;
-- =====================================================
