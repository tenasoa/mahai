-- ============================================================================
-- Corrections IA — soumissions étudiants + corrections directes
-- ----------------------------------------------------------------------------
-- Une ligne par appel IA réussi. Stocke :
--   - mode (SUBMISSION = correction des réponses de l'élève
--          / DIRECT     = génération de la correction complète sans saisie)
--   - userAnswers (JSONB)  → ce que l'élève a soumis (vide pour DIRECT)
--   - aiResult (JSONB)     → la sortie structurée du modèle (un objet par question)
--   - creditsCost          → snapshot du tarif effectif au moment du débit
--   - model + tokens       → traçabilité des coûts d'API et du modèle utilisé
--
-- Le débit des crédits + l'INSERT vivent dans la même transaction côté
-- application (`actions/ai-correction.ts`).
-- ============================================================================

CREATE TABLE IF NOT EXISTS "AICorrection" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"     TEXT NOT NULL,
  "subjectId"  TEXT NOT NULL,
  mode         VARCHAR(16) NOT NULL CHECK (mode IN ('SUBMISSION', 'DIRECT')),
  "userAnswers" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "aiResult"    JSONB NOT NULL,
  "creditsCost" INTEGER NOT NULL DEFAULT 0,
  model         TEXT,
  "tokensIn"    INTEGER,
  "tokensOut"   INTEGER,
  "createdAt"   TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_ai_correction_user
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_correction_subject
    FOREIGN KEY ("subjectId") REFERENCES "Subject"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_correction_user
  ON "AICorrection" ("userId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_ai_correction_subject
  ON "AICorrection" ("subjectId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS idx_ai_correction_user_subject_mode
  ON "AICorrection" ("userId", "subjectId", mode, "createdAt" DESC);

COMMENT ON TABLE "AICorrection" IS
  'Historique des corrections IA (soumission élève + correction directe). 1 ligne = 1 appel facturé.';

-- ============================================================================
-- Tarification IA (configurable depuis /admin/configuration)
-- ============================================================================

INSERT INTO "SystemSetting" (key, value, category, type, label, description)
VALUES
  ('ai.price.submission', '3', 'ai', 'number',
   'Coût correction d''une soumission',
   'Crédits débités quand un élève fait corriger ses réponses par l''IA.'),
  ('ai.price.direct',     '8', 'ai', 'number',
   'Coût correction IA directe',
   'Crédits débités quand un élève demande la correction complète sans rédiger ses réponses.'),
  ('ai.model',            'claude-sonnet-4-6', 'ai', 'string',
   'Modèle Claude utilisé',
   'Identifiant exact du modèle Anthropic appelé (ex: claude-sonnet-4-6, claude-opus-4-7).'),
  ('ai.effort',           'medium', 'ai', 'string',
   'Niveau d''effort',
   'low | medium | high | max — contrôle profondeur de raisonnement et coût.')
ON CONFLICT (key) DO NOTHING;
