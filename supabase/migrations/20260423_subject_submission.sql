-- ============================================================
-- Migration : SubjectSubmission + SubjectImage
-- Description : Tables pour les brouillons/soumissions de
--               sujets contributeurs + images Vercel Blob.
-- Compatible PostgreSQL 13+ / Supabase
-- ============================================================

-- ── Nettoyage (idempotent) ────────────────────────────────────────
-- Supprime les tables si elles existent déjà pour éviter tout
-- conflit de schéma (tables auto-créées par ensureTable()).

DROP TABLE IF EXISTS "SubjectImage" CASCADE;
DROP TABLE IF EXISTS "SubjectSubmission" CASCADE;

-- ── Table principale ──────────────────────────────────────────────

CREATE TABLE "SubjectSubmission" (
  id            TEXT        PRIMARY KEY,

  -- Métadonnées pédagogiques
  title         TEXT        NOT NULL DEFAULT '',
  matiere       TEXT        NOT NULL DEFAULT '',
  niveau        TEXT        NOT NULL DEFAULT '',   -- CEPE | BEPC | BAC
  serie         TEXT,                               -- A | C | D | OSE (BAC uniquement)
  annee         INTEGER,
  duree         TEXT,                               -- 1h | 2h | 3h | 3h30 | 4h
  coefficient   INTEGER,

  -- Contenu
  "contentType" TEXT        NOT NULL DEFAULT 'sujet_seul',
  -- sujet_seul | sujet_corrige | cours_exercices | annale
  content       JSONB       NOT NULL DEFAULT '{}',  -- JSON Tiptap sérialisé
  tags          TEXT[]      NOT NULL DEFAULT '{}',

  -- Tarification
  prix          INTEGER     NOT NULL DEFAULT 0,     -- en Ariary
  "prixMode"    TEXT        NOT NULL DEFAULT 'forfait', -- par_page | forfait
  visibilite    TEXT        NOT NULL DEFAULT 'public',  -- public | abonnes | premium

  -- Workflow
  status        TEXT        NOT NULL DEFAULT 'DRAFT',
  -- DRAFT | SUBMITTED | VERIFIED | VALIDATED | PUBLISHED | REJECTED

  -- ── Métadonnées enrichies (v2) ──
  "examType"       TEXT,                  -- CEPE | BEPC | BACC | Concours | Etablissement | Autre
  "bepcOption"     TEXT,                  -- A | B
  "baccType"       TEXT,                  -- General | Technique
  "concoursType"   TEXT,                  -- saisie libre (si Concours)
  "etablissement"  TEXT,                  -- nom de l'établissement (optionnel)
  "semestre"       TEXT,                  -- S1 | Final
  "filiere"        TEXT,                  -- saisie libre
  "anneeScolaire"  TEXT,                  -- "2010-2011" ou "2016" (concours)
  "dateOfficielle" TEXT,                  -- ex: "Jeudi 22 septembre 2016 après-midi"
  "customMeta"     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{id,label,value}]

  -- Relations
  "authorId"    TEXT        NOT NULL,

  -- Timestamps
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Contrainte clé étrangère (idempotent via DO block) ────────────

DO $$ BEGIN
  ALTER TABLE "SubjectSubmission"
    ADD CONSTRAINT "SubjectSubmission_authorId_fkey"
    FOREIGN KEY ("authorId") REFERENCES "User"(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Index ─────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_submission_author_status
  ON "SubjectSubmission" ("authorId", status, "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_submission_matiere_niveau
  ON "SubjectSubmission" (matiere, niveau);

CREATE INDEX IF NOT EXISTS idx_submission_status
  ON "SubjectSubmission" (status, "createdAt" DESC);

-- ── Trigger updatedAt ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_submission_updated_at ON "SubjectSubmission";
CREATE TRIGGER set_submission_updated_at
  BEFORE UPDATE ON "SubjectSubmission"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ── Table des images (URLs Vercel Blob) ───────────────────────────

CREATE TABLE "SubjectImage" (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "submissionId"  TEXT        NOT NULL,
  "authorId"      TEXT        NOT NULL,
  url             TEXT        NOT NULL UNIQUE,
  filename        TEXT        NOT NULL,
  "mimeType"      TEXT        NOT NULL DEFAULT 'image/jpeg',
  size            INTEGER     NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK SubjectImage → SubjectSubmission (idempotent)
DO $$ BEGIN
  ALTER TABLE "SubjectImage"
    ADD CONSTRAINT "SubjectImage_submissionId_fkey"
    FOREIGN KEY ("submissionId") REFERENCES "SubjectSubmission"(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_subject_image_submission
  ON "SubjectImage" ("submissionId");

CREATE INDEX IF NOT EXISTS idx_subject_image_author
  ON "SubjectImage" ("authorId");

-- ── RLS (Row Level Security) ──────────────────────────────────────
-- Activer seulement si vous utilisez Supabase Auth avec RLS.
-- Si vous gérez l'auth vous-même (JWT custom), commentez cette section.

ALTER TABLE "SubjectSubmission" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SubjectImage"      ENABLE ROW LEVEL SECURITY;

-- Contributeur : accès uniquement à ses propres brouillons
DO $$ BEGIN
  CREATE POLICY "submission_own_access"
    ON "SubjectSubmission"
    FOR ALL
    USING (auth.uid()::TEXT = "authorId");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Admins / vérificateurs / validateurs : accès à tout
DO $$ BEGIN
  CREATE POLICY "submission_admin_access"
    ON "SubjectSubmission"
    FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM "User"
        WHERE id = auth.uid()::TEXT
          AND role IN ('ADMIN', 'VERIFICATEUR', 'VALIDATEUR')
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Images : contributeur accède à ses propres images
DO $$ BEGIN
  CREATE POLICY "image_own_access"
    ON "SubjectImage"
    FOR ALL
    USING (auth.uid()::TEXT = "authorId");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── Vue résumé pour l'admin ───────────────────────────────────────

CREATE OR REPLACE VIEW "v_submission_summary" AS
SELECT
  s.id,
  s.title,
  s.matiere,
  s.niveau,
  s.serie,
  s.annee,
  s.status,
  s.prix,
  s."prixMode",
  s.visibilite,
  s."contentType",
  s."createdAt",
  s."updatedAt",
  u.prenom || ' ' || u.nom   AS author_name,
  u.email                     AS author_email,
  COALESCE(jsonb_array_length(s.content->'content'), 0) AS block_count,
  (SELECT COUNT(*) FROM "SubjectImage" i WHERE i."submissionId" = s.id) AS image_count
FROM "SubjectSubmission" s
JOIN "User" u ON u.id = s."authorId";

-- ── Commentaires ──────────────────────────────────────────────────

COMMENT ON TABLE "SubjectSubmission" IS
  'Brouillons et soumissions de sujets contributeurs. '
  'status: DRAFT → SUBMITTED → VERIFIED → VALIDATED → PUBLISHED | REJECTED';

COMMENT ON COLUMN "SubjectSubmission".content IS
  'JSON Tiptap (editor.getJSON()). Blocs : partie, exercice, question, '
  'annotation, formula (KaTeX), schema (image Vercel Blob).';

COMMENT ON COLUMN "SubjectSubmission".prix IS
  'Prix en Ariary. Commission plateforme 30%, revenu contributeur 70%.';

COMMENT ON TABLE "SubjectImage" IS
  'Images uploadées vers Vercel Blob pour chaque soumission. '
  'Supprimées en cascade quand le brouillon est supprimé.';
