-- Pool de corrections IA directes (mode DIRECT uniquement).
-- Les corrections DIRECT ne dépendent pas des réponses de l'utilisateur,
-- donc elles peuvent être partagées entre utilisateurs pour économiser
-- les appels à l'API IA.

CREATE TABLE IF NOT EXISTS "DirectCorrectionPool" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "subjectId"         TEXT NOT NULL REFERENCES "Subject"(id) ON DELETE CASCADE,
  "content"           JSONB NOT NULL,
  "generatedByUserId" TEXT NOT NULL REFERENCES "User"(id),
  "timesServed"       INTEGER NOT NULL DEFAULT 0,
  "model"             TEXT,
  "tokensIn"          INTEGER DEFAULT 0,
  "tokensOut"         INTEGER DEFAULT 0,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "DirectCorrectionPool_subjectId_idx"
  ON "DirectCorrectionPool"("subjectId");

-- Suivi des corrections déjà vues par chaque utilisateur
-- (pour éviter de montrer deux fois la même correction du pool).
CREATE TABLE IF NOT EXISTS "DirectCorrectionSeen" (
  "userId"  TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "poolId"  UUID NOT NULL REFERENCES "DirectCorrectionPool"(id) ON DELETE CASCADE,
  "seenAt"  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY("userId", "poolId")
);

-- Lien optionnel depuis AICorrection vers le pool (NULL = correction fraîche).
ALTER TABLE "AICorrection"
  ADD COLUMN IF NOT EXISTS "cachedFromPoolId" UUID
    REFERENCES "DirectCorrectionPool"(id) ON DELETE SET NULL;
