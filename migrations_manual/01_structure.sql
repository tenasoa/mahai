-- 1. Création des Enums
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

-- 2. Création des Tables
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
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

CREATE TABLE IF NOT EXISTS "SubjectSubmission" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id"),
    "content" JSONB NOT NULL,
    "status" "SubmissionStatus" DEFAULT 'PENDING' NOT NULL,
    "reviewerId" TEXT,
    "validatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "Wishlist" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "subjectId" TEXT NOT NULL REFERENCES "Subject"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Wishlist_userId_subjectId_key" ON "Wishlist"("userId", "subjectId");

CREATE TABLE IF NOT EXISTS "PasswordReset" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "EmailVerification" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN DEFAULT false NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
