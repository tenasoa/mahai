-- Migration pour ajouter le support des notifications lues et ignorées
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne "isRead" à CreditTransaction
ALTER TABLE "CreditTransaction" 
ADD COLUMN IF NOT EXISTS "isRead" BOOLEAN DEFAULT false NOT NULL;

-- 2. Ajouter la colonne "isDismissed" à CreditTransaction
ALTER TABLE "CreditTransaction" 
ADD COLUMN IF NOT EXISTS "isDismissed" BOOLEAN DEFAULT false NOT NULL;

-- 3. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS "CreditTransaction_userId_isDismissed_idx" 
ON "CreditTransaction"("userId", "isDismissed");

CREATE INDEX IF NOT EXISTS "CreditTransaction_userId_isRead_idx" 
ON "CreditTransaction"("userId", "isRead");

-- 4. Mettre à jour les notifications existantes non lues
UPDATE "CreditTransaction" 
SET "isRead" = false, "isDismissed" = false 
WHERE "isRead" IS NULL OR "isDismissed" IS NULL;
