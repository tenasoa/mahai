-- ═══════════════════════════════════════════════
-- MIGRATION: Ajout de nomComplet et pseudo à la table User
-- Date: 2026-03-18
-- Description: Ajoute des colonnes pour le nom complet et le pseudonyme des utilisateurs
-- ═══════════════════════════════════════════════

-- Ajout de la colonne nomComplet (nom complet affiché publiquement)
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "nomComplet" TEXT;

-- Ajout de la colonne pseudo (pseudonyme pour l'affichage dans la navbar)
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "pseudo" TEXT;

-- Ajout de commentaires pour documenter les colonnes
COMMENT ON COLUMN "User"."nomComplet" IS 'Nom complet affiché publiquement (prénom + nom)';
COMMENT ON COLUMN "User"."pseudo" IS 'Pseudonyme pour l''affichage dans l''interface';

-- Index pour les recherches par pseudo
CREATE INDEX IF NOT EXISTS idx_user_pseudo ON "User"("pseudo");

-- Migration des données existantes (optionnel)
-- Pour les utilisateurs existants, on peut initialiser nomComplet avec prenom + nom
UPDATE "User" 
SET "nomComplet" = TRIM(COALESCE("prenom", '') || ' ' || COALESCE("nom", ''))
WHERE "nomComplet" IS NULL AND ("prenom" IS NOT NULL OR "nom" IS NOT NULL);

-- Pour les utilisateurs existants, on peut initialiser pseudo avec prenom
UPDATE "User" 
SET "pseudo" = "prenom"
WHERE "pseudo" IS NULL AND "prenom" IS NOT NULL;
