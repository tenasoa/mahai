-- ============================================================
-- Migration : Subject — métadonnées enrichies
-- Description : Aligne la table Subject avec SubjectSubmission
--               (filiere, duree, coefficient, examType,
--                anneeScolaire, dateOfficielle, customMeta…)
--
--               Sans ces colonnes, finalizeAndPublish() perdait
--               les métadonnées saisies par le contributeur.
-- ============================================================

-- Métadonnées pédagogiques étendues
ALTER TABLE "Subject"
  ADD COLUMN IF NOT EXISTS "duree"          TEXT,
  ADD COLUMN IF NOT EXISTS "coefficient"    INTEGER,
  ADD COLUMN IF NOT EXISTS "filiere"        TEXT,
  ADD COLUMN IF NOT EXISTS "niveau"         TEXT,
  ADD COLUMN IF NOT EXISTS "examType"       TEXT,
  ADD COLUMN IF NOT EXISTS "anneeScolaire"  TEXT,
  ADD COLUMN IF NOT EXISTS "dateOfficielle" TEXT,
  ADD COLUMN IF NOT EXISTS "bepcOption"     TEXT,
  ADD COLUMN IF NOT EXISTS "baccType"       TEXT,
  ADD COLUMN IF NOT EXISTS "concoursType"   TEXT,
  ADD COLUMN IF NOT EXISTS "etablissement"  TEXT,
  ADD COLUMN IF NOT EXISTS "semestre"       TEXT,
  ADD COLUMN IF NOT EXISTS "customMeta"     JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Liens contenu / soumission d'origine (utiles pour l'affichage)
  ADD COLUMN IF NOT EXISTS "submissionId"   TEXT,
  ADD COLUMN IF NOT EXISTS "content"        JSONB,
  ADD COLUMN IF NOT EXISTS "contentType"    TEXT,
  ADD COLUMN IF NOT EXISTS "tags"           TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "prixMode"       TEXT,
  ADD COLUMN IF NOT EXISTS "visibilite"     TEXT,
  ADD COLUMN IF NOT EXISTS "reviewerId"     TEXT,
  ADD COLUMN IF NOT EXISTS "publishedAt"    TIMESTAMPTZ;

-- FK optionnelle vers la soumission d'origine
DO $$ BEGIN
  ALTER TABLE "Subject"
    ADD CONSTRAINT "Subject_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "SubjectSubmission"(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- FK optionnelle vers l'admin qui a publié
DO $$ BEGIN
  ALTER TABLE "Subject"
    ADD CONSTRAINT "Subject_reviewerId_fkey"
    FOREIGN KEY ("reviewerId") REFERENCES "User"(id)
    ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Index utile pour retrouver le sujet à partir de sa soumission
CREATE INDEX IF NOT EXISTS idx_subject_submission_id
  ON "Subject"("submissionId");

CREATE INDEX IF NOT EXISTS idx_subject_examtype
  ON "Subject"("examType", "anneeScolaire");

COMMENT ON COLUMN "Subject"."examType"       IS 'Type d''examen (CEPE | BEPC | BACC | Concours | Etablissement | Autre)';
COMMENT ON COLUMN "Subject"."anneeScolaire"  IS 'Année scolaire ou année du concours (ex: "2010-2011")';
COMMENT ON COLUMN "Subject"."dateOfficielle" IS 'Date officielle de l''épreuve (texte libre)';
COMMENT ON COLUMN "Subject"."customMeta"     IS 'Métadonnées libres saisies par le contributeur [{id,label,value}]';
COMMENT ON COLUMN "Subject"."submissionId"   IS 'Soumission contributeur d''origine (lien historique)';
