-- Migration 018: Candidatures "Devenir contributeur"
-- Appliquer via Supabase Studio ou psql

CREATE TABLE IF NOT EXISTS "ContributorApplication" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "subjects" TEXT NOT NULL,
  "educationLevel" TEXT NOT NULL,
  "teachingExperience" TEXT NOT NULL,
  motivation TEXT NOT NULL,
  availability TEXT NOT NULL,
  "portfolioUrl" TEXT,
  "sampleLesson" TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  "adminNotes" TEXT,
  "reviewedBy" TEXT REFERENCES "User"(id) ON DELETE SET NULL,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId")
);

CREATE INDEX IF NOT EXISTS "ContributorApplication_status_idx" ON "ContributorApplication"(status);
CREATE INDEX IF NOT EXISTS "ContributorApplication_createdAt_idx" ON "ContributorApplication"("createdAt" DESC);
