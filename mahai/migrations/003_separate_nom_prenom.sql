-- ═══════════════════════════════════════════════
-- MIGRATION: Séparation de nomComplet en nom et prenom
-- Date: 2026-03-18
-- Description: Migration de nomComplet vers des champs nom et prenom séparés
-- ═══════════════════════════════════════════════

-- Note: La table User a déjà 'prenom' et 'nom' comme colonnes
-- Cette migration s'assure que les données sont correctement réparties

-- Si nomComplet existe et que prenom/nom sont vides, on sépare
-- Format attendu: "Prénom Nom" ou "Prénom NOM"

-- Mise à jour des utilisateurs qui ont nomComplet mais pas de prenom/nom séparés
UPDATE "User"
SET 
  "prenom" = COALESCE("prenom", SPLIT_PART("nomComplet", ' ', 1)),
  "nom" = COALESCE("nom", 
    CASE 
      WHEN POSITION(' ' IN "nomComplet") > 0 
      THEN SUBSTRING("nomComplet" FROM POSITION(' ' IN "nomComplet") + 1)
      ELSE NULL
    END
  )
WHERE "nomComplet" IS NOT NULL 
  AND "nomComplet" != ''
  AND (COALESCE("prenom", '') = '' OR COALESCE("nom", '') = '');

-- Index pour les recherches par nom
CREATE INDEX IF NOT EXISTS idx_user_nom ON "User"("nom");
CREATE INDEX IF NOT EXISTS idx_user_prenom ON "User"("prenom");

-- Commentaire sur les colonnes
COMMENT ON COLUMN "User"."prenom" IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN "User"."nom" IS 'Nom de famille de l''utilisateur';
COMMENT ON COLUMN "User"."nomComplet" IS 'Nom complet (prénom + nom) - Peut être généré automatiquement';
COMMENT ON COLUMN "User"."pseudo" IS 'Pseudonyme pour l''affichage dans l''interface';
