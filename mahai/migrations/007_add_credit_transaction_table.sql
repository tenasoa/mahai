-- Migration : Création de la table CreditTransaction pour l'historique des crédits
-- Date : 2026-03-19
-- Description : Table pour tracker toutes les transactions de crédits (achats et recharges)

CREATE TABLE IF NOT EXISTS "CreditTransaction" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "type" TEXT NOT NULL CHECK (type IN ('ACHAT', 'RECHARGE', 'REMBOURSEMENT', 'BONUS')),
  "amount" INTEGER NOT NULL,
  "description" TEXT,
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les recherches rapides par utilisateur
CREATE INDEX IF NOT EXISTS idx_credit_transaction_user ON "CreditTransaction"("userId");

-- Index pour les recherches par date
CREATE INDEX IF NOT EXISTS idx_credit_transaction_created ON "CreditTransaction"("createdAt" DESC);

-- Index pour les recherches par type
CREATE INDEX IF NOT EXISTS idx_credit_transaction_type ON "CreditTransaction"("type");

-- Commentaire
COMMENT ON TABLE "CreditTransaction" IS 'Historique des transactions de crédits des utilisateurs';
COMMENT ON COLUMN "CreditTransaction"."type" IS 'Type de transaction: ACHAT (dépense), RECHARGE (ajout), REMBOURSEMENT, BONUS';
COMMENT ON COLUMN "CreditTransaction"."amount" IS 'Montant en crédits (positif pour les ajouts, négatif pour les dépenses)';
