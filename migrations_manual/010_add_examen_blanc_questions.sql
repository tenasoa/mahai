-- =====================================================
-- Migration: Ajout des tables ExamenBlanc extensions
-- Fichier: 010_add_examen_blanc_questions.sql
-- Date: 2026-03-20
-- Description: Ajoute la colonne subjectId à ExamenBlanc
--              et crée la table QuestionExamen pour la
--              fonctionnalité "Convertir en examen blanc"
-- =====================================================

-- 1. Ajouter la colonne subjectId à ExamenBlanc (nullable)
ALTER TABLE "ExamenBlanc"
  ADD COLUMN IF NOT EXISTS "subjectId" TEXT REFERENCES "Subject"("id") ON DELETE SET NULL;

-- Index pour les lookups par sujet
CREATE INDEX IF NOT EXISTS "ExamenBlanc_subjectId_idx" ON "ExamenBlanc"("subjectId");

-- =====================================================
-- 2. Créer la table QuestionExamen
-- =====================================================

CREATE TABLE IF NOT EXISTS "QuestionExamen" (
    "id"        TEXT PRIMARY KEY,
    "examenId"  TEXT NOT NULL REFERENCES "ExamenBlanc"("id") ON DELETE CASCADE,
    "numero"    INTEGER NOT NULL,
    "texte"     TEXT NOT NULL,
    "type"      TEXT NOT NULL DEFAULT 'réponse',
    "options"   JSONB,          -- pour les QCM : ["option A", "option B", ...]
    "points"    INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index pour récupérer toutes les questions d'un examen
CREATE INDEX IF NOT EXISTS "QuestionExamen_examenId_idx" ON "QuestionExamen"("examenId");

-- =====================================================
-- 3. VÉRIFICATION
-- =====================================================
-- Pour vérifier que la migration s'est bien appliquée :
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'ExamenBlanc' ORDER BY ordinal_position;
-- SELECT table_name FROM information_schema.tables
--   WHERE table_name = 'QuestionExamen';
