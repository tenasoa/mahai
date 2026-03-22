-- =====================================================
-- Migration 011: Champs admin pour CreditTransaction
-- Date: 2026-03-20
-- Description: Ajoute les champs nécessaires pour la
--              validation manuelle des paiements MVola
-- =====================================================

-- Numéro de téléphone MVola de l'expéditeur
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;

-- Code de référence saisi par l'utilisateur pendant l'achat
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "senderCode" TEXT;

-- Motif de refus (retourné à l'utilisateur)
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Date de validation/refus
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "validatedAt" TIMESTAMP(3);

-- ID de l'admin qui a traité la transaction
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "validatedBy" TEXT REFERENCES "User"("id") ON DELETE SET NULL;

-- Index pour lookup rapide par statut
CREATE INDEX IF NOT EXISTS "CreditTransaction_status_idx" ON "CreditTransaction"("status");

-- =====================================================
-- VÉRIFICATION
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'CreditTransaction' ORDER BY ordinal_position;
-- =====================================================
