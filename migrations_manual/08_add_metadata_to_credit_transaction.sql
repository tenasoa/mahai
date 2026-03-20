-- Migration : Ajout de la colonne metadata à CreditTransaction
-- Date : 2026-03-19
-- Exécuter dans Supabase SQL Editor

ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}';

COMMENT ON COLUMN "CreditTransaction"."metadata" IS 'Données JSON: operator, phoneNumber, price, transferCode, status, timestamp';
