-- ============================================================
-- Migration : Étendre l'enum "ExamenType"
-- Description : L'éditeur de sujets autorise désormais les types
--               BACC, Concours, Etablissement, Autre en plus des
--               valeurs historiques (BAC, BEPC, CEPE).
--
--               Sans cet ajout, la finalisation d'une soumission
--               (finalizeAndPublish) échoue avec :
--                 invalid input value for enum "ExamenType":
--                 "Etablissement"
--               car la colonne "Subject"."type" est typée
--               "ExamenType".
-- ============================================================

-- ALTER TYPE ... ADD VALUE doit être exécuté hors transaction sur
-- les anciennes versions de PostgreSQL. IF NOT EXISTS rend la
-- migration idempotente (PG >= 12, ce qui est le cas de Supabase).

ALTER TYPE "ExamenType" ADD VALUE IF NOT EXISTS 'BACC';
ALTER TYPE "ExamenType" ADD VALUE IF NOT EXISTS 'Concours';
ALTER TYPE "ExamenType" ADD VALUE IF NOT EXISTS 'Etablissement';
ALTER TYPE "ExamenType" ADD VALUE IF NOT EXISTS 'Autre';
