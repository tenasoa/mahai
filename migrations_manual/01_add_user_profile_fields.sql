-- Mah.AI - Migration: Add User Profile Fields
-- Run this script manually in Supabase SQL Editor
-- Created: 2026-03-16
-- Purpose: Add comprehensive user profile information

-- =====================================================
-- 1. CREATE NEW ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE "UserType" AS ENUM ('ETUDIANT', 'PROFESSIONNEL', 'ENSEIGNANT', 'PARENT', 'AUTRE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EducationLevel" AS ENUM ('PRIMAIRE', 'COLLEGE', 'LYCEE', 'UNIVERSITE', 'FORMATION');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GradeLevel" AS ENUM (
        '11EME', '10EME', '9EME', '8EME', '7EME',
        '6EME', '5EME', '4EME', '3EME',
        'SECONDE', 'PREMIERE', 'TERMINALE',
        'L1', 'L2', 'L3', 'M1', 'M2'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. ADD COLUMNS TO USER TABLE
-- =====================================================

-- Add user type field
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "userType" "UserType" DEFAULT 'ETUDIANT';

-- Add custom user type (for when AUTRE is selected)
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "customUserType" TEXT;

-- Add educational information
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "etablissement" TEXT;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "educationLevel" "EducationLevel";

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "gradeLevel" "GradeLevel";

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "filiere" TEXT;

-- Add personal information
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "age" INTEGER;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "dateNaissance" DATE;

-- Add location information
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "region" TEXT;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "district" TEXT;

-- Add preferences and settings
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT '{}';

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "bio" TEXT;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "matieresPreferees" TEXT[];

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "objectifsEtude" TEXT[];

-- Add privacy settings
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "profilePublic" BOOLEAN DEFAULT true;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "showEmail" BOOLEAN DEFAULT false;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "showPhone" BOOLEAN DEFAULT false;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "showEtablissement" BOOLEAN DEFAULT true;

-- Add notification preferences
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "notifCorrections" BOOLEAN DEFAULT true;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "notifSujets" BOOLEAN DEFAULT true;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "notifPromos" BOOLEAN DEFAULT false;

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "notifRappels" BOOLEAN DEFAULT true;

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS "idx_user_region" ON "User"("region");
CREATE INDEX IF NOT EXISTS "idx_user_educationLevel" ON "User"("educationLevel");
CREATE INDEX IF NOT EXISTS "idx_user_userType" ON "User"("userType");
CREATE INDEX IF NOT EXISTS "idx_user_gradeLevel" ON "User"("gradeLevel");

-- =====================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN "User"."userType" IS 'Type d''utilisateur prédéfini';
COMMENT ON COLUMN "User"."customUserType" IS 'Type personnalisé quand AUTRE est sélectionné';
COMMENT ON COLUMN "User"."etablissement" IS 'Nom de l''établissement scolaire/professionnel';
COMMENT ON COLUMN "User"."educationLevel" IS 'Niveau d''éducation principal';
COMMENT ON COLUMN "User"."gradeLevel" IS 'Classe/année spécifique';
COMMENT ON COLUMN "User"."filiere" IS 'Filière d''études (université ou technique)';
COMMENT ON COLUMN "User"."age" IS 'Âge de l''utilisateur';
COMMENT ON COLUMN "User"."dateNaissance" IS 'Date de naissance pour calcul automatique de l''âge';
COMMENT ON COLUMN "User"."region" IS 'Région de Madagascar (23 régions)';
COMMENT ON COLUMN "User"."district" IS 'District correspondant à la région';
COMMENT ON COLUMN "User"."preferences" IS 'Préférences utilisateur au format JSON';
COMMENT ON COLUMN "User"."bio" IS 'Biographie/description personnelle';
COMMENT ON COLUMN "User"."matieresPreferees" IS 'Liste des matières préférées pour recommandations';
COMMENT ON COLUMN "User"."objectifsEtude" IS 'Objectifs d''apprentissage personnalisés';
COMMENT ON COLUMN "User"."profilePublic" IS 'Visibilité du profil public';
COMMENT ON COLUMN "User"."showEmail" IS 'Afficher email dans profil public';
COMMENT ON COLUMN "User"."showPhone" IS 'Afficher téléphone dans profil public';
COMMENT ON COLUMN "User"."showEtablissement" IS 'Afficher établissement dans profil public';
COMMENT ON COLUMN "User"."notifCorrections" IS 'Notifications pour nouvelles corrections IA';
COMMENT ON COLUMN "User"."notifSujets" IS 'Notifications pour nouveaux sujets';
COMMENT ON COLUMN "User"."notifPromos" IS 'Notifications pour offres promotionnelles';
COMMENT ON COLUMN "User"."notifRappels" IS 'Notifications de rappels d''étude';

-- =====================================================
-- 5. UPDATE TRIGGER FOR UPDATED_AT
-- =====================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for User table if it doesn't exist
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at 
    BEFORE UPDATE ON "User" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
