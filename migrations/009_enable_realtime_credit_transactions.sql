-- =====================================================
-- Migration: Activer Supabase Realtime pour CreditTransaction
-- Date: 2026-03-20
-- Description: Active le realtime pour que les clients
--              voient les nouvelles transactions en temps réel
-- =====================================================

-- 1. Activer le realtime pour la table CreditTransaction
ALTER PUBLICATION supabase_realtime ADD TABLE "CreditTransaction";

-- 2. S'assurer que la table a un replica identity (nécessaire pour le realtime)
ALTER TABLE "CreditTransaction" REPLICA IDENTITY FULL;

-- =====================================================
-- VÉRIFICATION
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
-- =====================================================
