-- Migration pour ajouter les colonnes status manquantes
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter "status" à la table "Subject" si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Subject' AND column_name = 'status') THEN
        ALTER TABLE "Subject" ADD COLUMN "status" TEXT DEFAULT 'PUBLISHED' NOT NULL;
    END IF;
END $$;

-- 2. Ajouter "status" à la table "CreditTransaction" si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'CreditTransaction' AND column_name = 'status') THEN
        ALTER TABLE "CreditTransaction" ADD COLUMN "status" TEXT DEFAULT 'PENDING' NOT NULL;
    END IF;
END $$;
