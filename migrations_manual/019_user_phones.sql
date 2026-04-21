-- Migration 019: Multiples numéros de téléphone par utilisateur
-- Appliquer via Supabase Studio ou psql

CREATE TABLE IF NOT EXISTS "UserPhone" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "phone" TEXT NOT NULL,
  "provider" TEXT NOT NULL, -- MVOLA, ORANGE, AIRTEL
  "label" TEXT, -- "Personnel", "Travail", etc.
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "phone")
);

-- Index pour accélérer les recherches par utilisateur
CREATE INDEX IF NOT EXISTS "UserPhone_userId_idx" ON "UserPhone"("userId");

-- S'assurer qu'un seul numéro est par défaut par utilisateur (optionnel mais recommandé)
-- Pour simplifier, on gérera ça côté application pour le moment.
