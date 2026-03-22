-- ═══════════════════════════════════════════════
-- MIGRATION: Ajout de profilePicture à la table User
-- Date: 2026-03-18
-- Description: Ajoute une colonne pour stocker l'URL de l'avatar utilisateur
-- ═══════════════════════════════════════════════

-- Ajout de la colonne profilePicture (nullable pour ne pas casser les données existantes)
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "profilePicture" TEXT;

-- Ajout d'un commentaire pour documenter la colonne
COMMENT ON COLUMN "User"."profilePicture" IS 'URL de l''avatar utilisateur (stocké sur Vercel Blob)';

-- Index pour les requêtes de filtrage (optionnel)
CREATE INDEX IF NOT EXISTS idx_user_profilepicture ON "User"("profilePicture");
