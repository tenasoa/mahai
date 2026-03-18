-- ═══════════════════════════════════════════════
-- MIGRATION: Ajout de birthDate à la table User
-- Date: 2026-03-18
-- Description: Ajoute une colonne pour la date de naissance des utilisateurs
-- ═══════════════════════════════════════════════

-- Ajout de la colonne birthDate (nullable pour ne pas casser les données existantes)
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "birthDate" TEXT;

-- Ajout d'un commentaire pour documenter la colonne
COMMENT ON COLUMN "User"."birthDate" IS 'Date de naissance au format ISO (YYYY-MM-DD)';

-- Index pour les requêtes de filtrage par âge (optionnel)
CREATE INDEX IF NOT EXISTS idx_user_birthdate ON "User"("birthDate");
