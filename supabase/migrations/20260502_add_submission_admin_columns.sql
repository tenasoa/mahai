-- ============================================================
-- Migration : Ajout des colonnes manquantes pour la validation admin
-- Description : Colonnes nécessaires pour le workflow de validation
--               des soumissions par les administrateurs
-- ============================================================

-- Ajouter les colonnes manquantes à SubjectSubmission
ALTER TABLE "SubjectSubmission"
  ADD COLUMN IF NOT EXISTS pages INTEGER,
  ADD COLUMN IF NOT EXISTS difficulte TEXT,  -- 'FACILE' | 'MOYEN' | 'DIFFICILE'
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,  -- Notes de modération / motifs de refus
  ADD COLUMN IF NOT EXISTS "reviewerId" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS "validatedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMPTZ;

-- Index pour améliorer les performances des requêtes admin
CREATE INDEX IF NOT EXISTS idx_submission_status_reviewer
  ON "SubjectSubmission" (status, "reviewerId")
  WHERE status IN ('SUBMITTED', 'VALIDATED', 'REJECTED');

CREATE INDEX IF NOT EXISTS idx_submission_validated_at
  ON "SubjectSubmission" ("validatedAt" DESC)
  WHERE status = 'VALIDATED';

-- Commentaires pour documenter les colonnes
COMMENT ON COLUMN "SubjectSubmission".pages IS 'Nombre de pages du sujet (pour validation)';
COMMENT ON COLUMN "SubjectSubmission".difficulte IS 'Niveau de difficulte : FACILE | MOYEN | DIFFICILE';
COMMENT ON COLUMN "SubjectSubmission".description IS 'Description du sujet pour le catalogue';
COMMENT ON COLUMN "SubjectSubmission".notes IS 'Notes de modération, motifs de refus ou commentaires validation';
COMMENT ON COLUMN "SubjectSubmission"."reviewerId" IS 'ID de l''admin qui a validé/refusé la soumission';
COMMENT ON COLUMN "SubjectSubmission"."validatedAt" IS 'Date de validation et publication';
COMMENT ON COLUMN "SubjectSubmission"."reviewedAt" IS 'Date de revue (refus ou demande de révision)';
