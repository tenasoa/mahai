-- =====================================================
-- MAH.AI - Désactiver RLS pour testing
-- =====================================================
-- Exécutez ce script dans Supabase SQL Editor
-- =====================================================

-- Désactiver RLS sur les tables principales
ALTER TABLE "Subject" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est désactivé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('Subject', 'User', 'Wishlist');

-- Vérifier les données
SELECT COUNT(*) as "Total sujets" FROM "Subject";
SELECT type, COUNT(*) as nombre FROM "Subject" GROUP BY type;
