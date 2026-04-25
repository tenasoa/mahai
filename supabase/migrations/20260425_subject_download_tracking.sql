-- ============================================================================
-- Suivi des téléchargements de sujets (filigrane / traçabilité)
-- ----------------------------------------------------------------------------
-- Objectif : pour chaque téléchargement PDF d'un sujet, enregistrer une ligne
-- avec un identifiant unique. Cet identifiant est imprimé en filigrane sur le
-- PDF généré, ce qui permet de remonter à l'utilisateur en cas de revente
-- frauduleuse en dehors de la plateforme.
-- ============================================================================

CREATE TABLE IF NOT EXISTS "SubjectDownload" (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID         NOT NULL,
  "subjectId" UUID         NOT NULL,
  -- Code court (8 caractères) inscrit en filigrane visible. Permet de retrouver
  -- la ligne complète sans avoir à inscrire l'UUID complet sur le document.
  "watermarkCode" VARCHAR(12) NOT NULL UNIQUE,
  "ipAddress"     VARCHAR(64),
  "userAgent"     TEXT,
  "downloadedAt"  TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_subject_download_user
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_subject_download_subject
    FOREIGN KEY ("subjectId") REFERENCES "Subject"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_subject_download_user
  ON "SubjectDownload" ("userId", "downloadedAt" DESC);

CREATE INDEX IF NOT EXISTS idx_subject_download_subject
  ON "SubjectDownload" ("subjectId", "downloadedAt" DESC);

CREATE INDEX IF NOT EXISTS idx_subject_download_watermark
  ON "SubjectDownload" ("watermarkCode");

COMMENT ON TABLE  "SubjectDownload" IS
  'Historique des téléchargements PDF de sujets — alimente la traçabilité du filigrane.';
COMMENT ON COLUMN "SubjectDownload"."watermarkCode" IS
  'Code court visible sur le PDF (ex: A4F2-9C71). Recherche rapide depuis l''admin.';
