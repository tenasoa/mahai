-- Mah.AI - Complete Database Schema for Supabase
-- Run this script manually in Supabase SQL Editor
-- Last updated: 2026-03-15

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ETUDIANT', 'CONTRIBUTEUR', 'PROFESSEUR', 'VERIFICATEUR', 'VALIDATEUR', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ExamenType" AS ENUM ('BAC', 'BEPC', 'CEPE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Difficulte" AS ENUM ('FACILE', 'MOYEN', 'DIFFICILE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Langue" AS ENUM ('FRANCAIS', 'MALGACHE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Format" AS ENUM ('PDF', 'INTERACTIF');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "Badge" AS ENUM ('GOLD', 'AI', 'FREE', 'INTER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ExamenStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'REJECTED', 'VALIDATED', 'PUBLISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT,
    "role" "Role" DEFAULT 'ETUDIANT' NOT NULL,
    "credits" INTEGER DEFAULT 10 NOT NULL,
    "phone" TEXT,
    "phoneVerified" BOOLEAN DEFAULT false NOT NULL,
    "schoolLevel" TEXT,
    "emailVerified" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Subject table
CREATE TABLE IF NOT EXISTS "Subject" (
    "id" TEXT PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "type" "ExamenType" NOT NULL,
    "matiere" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "serie" TEXT,
    "description" TEXT,
    "pages" INTEGER NOT NULL,
    "credits" INTEGER NOT NULL,
    "difficulte" "Difficulte" DEFAULT 'MOYEN' NOT NULL,
    "langue" "Langue" DEFAULT 'FRANCAIS' NOT NULL,
    "format" "Format" DEFAULT 'PDF' NOT NULL,
    "badge" "Badge" DEFAULT 'AI' NOT NULL,
    "glyph" TEXT DEFAULT '∑' NOT NULL,
    "featured" BOOLEAN DEFAULT false NOT NULL,
    "rating" DOUBLE PRECISION DEFAULT 0 NOT NULL,
    "reviewsCount" INTEGER DEFAULT 0 NOT NULL,
    "hasCorrectionIa" BOOLEAN DEFAULT false NOT NULL,
    "hasCorrectionProf" BOOLEAN DEFAULT false NOT NULL,
    "authorId" TEXT NOT NULL REFERENCES "User"("id"),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Purchase table
CREATE TABLE IF NOT EXISTS "Purchase" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id"),
    "subjectId" TEXT REFERENCES "Subject"("id"),
    "creditsAmount" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" TEXT,
    "status" TEXT DEFAULT 'PENDING' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ExamenBlanc table
CREATE TABLE IF NOT EXISTS "ExamenBlanc" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id"),
    "titre" TEXT NOT NULL,
    "typeExamen" TEXT NOT NULL,
    "matiere" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "dureeSecondes" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "score" DOUBLE PRECISION,
    "scoreMax" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "status" "ExamenStatus" DEFAULT 'NOT_STARTED' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- CreditTransaction table
CREATE TABLE IF NOT EXISTS "CreditTransaction" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id"),
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "paymentMethod" TEXT,
    "transactionId" TEXT,
    "status" TEXT DEFAULT 'PENDING' NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- SubjectSubmission table
CREATE TABLE IF NOT EXISTS "SubjectSubmission" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id"),
    "content" JSONB NOT NULL,
    "status" "SubmissionStatus" DEFAULT 'PENDING' NOT NULL,
    "reviewerId" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Wishlist table
CREATE TABLE IF NOT EXISTS "Wishlist" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "subjectId" TEXT NOT NULL REFERENCES "Subject"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- PasswordReset table
CREATE TABLE IF NOT EXISTS "PasswordReset" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- EmailVerification table
CREATE TABLE IF NOT EXISTS "EmailVerification" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "PasswordReset_token_key" ON "PasswordReset"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerification_token_key" ON "EmailVerification"("token");
CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_userId_subjectId_key" ON "Wishlist"("userId", "subjectId");

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS "Purchase_userId_idx" ON "Purchase"("userId");
CREATE INDEX IF NOT EXISTS "Purchase_subjectId_idx" ON "Purchase"("subjectId");
CREATE INDEX IF NOT EXISTS "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");
CREATE INDEX IF NOT EXISTS "Subject_authorId_idx" ON "Subject"("authorId");
CREATE INDEX IF NOT EXISTS "ExamenBlanc_userId_idx" ON "ExamenBlanc"("userId");

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for User table
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at 
    BEFORE UPDATE ON "User" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. SEED DATA (Optional - for development)
-- =====================================================

-- Insert a default admin user (password is hashed, replace with actual hash)
-- INSERT INTO "User" ("id", "email", "password", "prenom", "role", "credits", "emailVerified")
-- VALUES ('admin-1', 'admin@mahai.edu', '$2b$10$...', 'Admin', 'ADMIN', 9999, true)
-- ON CONFLICT ("email") DO NOTHING;

-- =====================================================
-- 6. NOTES FOR SUPABASE
-- =====================================================

-- After running this script:
-- 1. Enable Row Level Security (RLS) on all tables if needed
-- 2. Create RLS policies based on your security requirements
-- 3. Add storage buckets for PDF files if using Supabase Storage
-- 4. Configure authentication in Supabase Auth settings
-- 5. Update environment variables in your Next.js app

-- Example RLS policies (customize based on your needs):
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own data" ON "User" FOR SELECT USING (auth.uid()::text = id);
-- ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own purchases" ON "Purchase" FOR SELECT USING (auth.uid()::text = "userId");
