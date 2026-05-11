-- ============================================================
-- Migration : Colonnes de révision sur SubjectSubmission
-- Description : Ajoute les colonnes nécessaires pour la boucle
--               admin → contributeur (notes, réviseur,
--               validation, demande de révision).
-- Compatible PostgreSQL 13+ / Supabase
-- ============================================================

-- Notes / message envoyé par l'admin au contributeur
-- (utilisé pour REJECTED, VALIDATED, REVISION_REQUESTED)
ALTER TABLE "SubjectSubmission"
  ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- ID de l'admin qui a traité la soumission (rejet / validation / révision)
ALTER TABLE "SubjectSubmission"
  ADD COLUMN IF NOT EXISTS "reviewerId" TEXT;

-- Timestamp de validation définitive (transition vers VALIDATED / PUBLISHED)
ALTER TABLE "SubjectSubmission"
  ADD COLUMN IF NOT EXISTS "validatedAt" TIMESTAMPTZ;

-- Timestamp de la dernière action admin (rejet ou demande de révision)
ALTER TABLE "SubjectSubmission"
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMPTZ;

-- Contrainte FK reviewerId → User (idempotent)
DO $$ BEGIN
  ALTER TABLE "SubjectSubmission"
    ADD CONSTRAINT "SubjectSubmission_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "User"(id) ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- Index pour récupérer rapidement les soumissions d'un contributeur
-- avec demande de révision en cours
CREATE INDEX IF NOT EXISTS idx_submission_author_revision
  ON "SubjectSubmission" ("authorId", status)
  WHERE status = 'REVISION_REQUESTED';

COMMENT ON COLUMN "SubjectSubmission"."notes" IS
  'Message de l''admin vers le contributeur (rejet / validation / demande de révision).';
COMMENT ON COLUMN "SubjectSubmission"."reviewerId" IS
  'ID de l''admin ayant traité la soumission en dernier.';
COMMENT ON COLUMN "SubjectSubmission"."validatedAt" IS
  'Horodatage de la validation finale (passage à VALIDATED / PUBLISHED).';
COMMENT ON COLUMN "SubjectSubmission"."reviewedAt" IS
  'Horodatage de la dernière décision admin (rejet ou demande de révision).';
