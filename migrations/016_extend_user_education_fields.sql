-- Migration: Extend User Education Fields
-- Purpose: Add support for Lycée types (General/Technique) and more granular classes

-- 1. Add lyceeType column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lyceeType" TEXT;

-- 2. Extend GradeLevel enum with technical years
-- We use a DO block to avoid errors if values already exist
DO $$
BEGIN
    ALTER TYPE "GradeLevel" ADD VALUE 'TECH_1';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE "GradeLevel" ADD VALUE 'TECH_2';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE "GradeLevel" ADD VALUE 'TECH_3';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add FACULTE and INSTITUT to EducationLevel if they are missing
DO $$
BEGIN
    ALTER TYPE "EducationLevel" ADD VALUE 'FACULTE';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    ALTER TYPE "EducationLevel" ADD VALUE 'INSTITUT';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON COLUMN "User"."lyceeType" IS 'Type de lycée: GENERALE ou TECHNIQUE';
