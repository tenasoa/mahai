-- =====================================================
-- MAH.AI - Production Security Setup (RLS + Policies)
-- =====================================================
-- EXÉCUTEZ CECI EN PRODUCTION (pas le disable-rls.sql !)
-- =====================================================

-- 1. Activer RLS sur toutes les tables
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditTransaction" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. SUJET (Subject)
-- =====================================================

-- Tout le monde peut lire les sujets publiés
CREATE POLICY "Sujets lisibles par tous"
ON "Subject"
FOR SELECT
TO anon
USING (true);  -- Tous les sujets sont publics

-- Seuls les contributeurs/authors peuvent créer
CREATE POLICY "Contributeurs peuvent créer des sujets"
ON "Subject"
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IN (SELECT id FROM "User" WHERE role IN ('CONTRIBUTEUR', 'PROFESSEUR', 'ADMIN'))
);

-- Seuls les authors peuvent modifier leurs propres sujets
CREATE POLICY "Authors peuvent modifier leurs sujets"
ON "Subject"
FOR UPDATE
TO authenticated
USING (
  auth.uid() = "authorId" 
  OR auth.uid() IN (SELECT id FROM "User" WHERE role = 'ADMIN')
);

-- Seuls les authors peuvent supprimer leurs sujets
CREATE POLICY "Authors peuvent supprimer leurs sujets"
ON "Subject"
FOR DELETE
TO authenticated
USING (
  auth.uid() = "authorId" 
  OR auth.uid() IN (SELECT id FROM "User" WHERE role = 'ADMIN')
);

-- =====================================================
-- 3. USER (User)
-- =====================================================

-- Chaque utilisateur peut lire son propre profil
CREATE POLICY "Utilisateurs peuvent lire leur profil"
ON "User"
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Lecture publique limitée (prenom, nom, role) pour les authors
CREATE POLICY "Infos authors lisibles publiquement"
ON "User"
FOR SELECT
TO anon
USING (role IN ('CONTRIBUTEUR', 'PROFESSEUR'));

-- Modification de son propre profil uniquement
CREATE POLICY "Utilisateurs peuvent modifier leur profil"
ON "User"
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- 4. WISHLIST (Wishlist)
-- =====================================================

-- Chaque utilisateur peut voir sa propre wishlist
CREATE POLICY "Utilisateurs peuvent voir leur wishlist"
ON "Wishlist"
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

-- Ajouter à sa propre wishlist
CREATE POLICY "Utilisateurs peuvent ajouter à leur wishlist"
ON "Wishlist"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "userId");

-- Supprimer de sa propre wishlist
CREATE POLICY "Utilisateurs peuvent supprimer de leur wishlist"
ON "Wishlist"
FOR DELETE
TO authenticated
USING (auth.uid() = "userId");

-- =====================================================
-- 5. PURCHASE (Purchase)
-- =====================================================

-- Chaque utilisateur peut voir ses propres achats
CREATE POLICY "Utilisateurs peuvent voir leurs achats"
ON "Purchase"
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

-- Créer un achat (pour l'utilisateur connecté)
CREATE POLICY "Utilisateurs peuvent créer des achats"
ON "Purchase"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = "userId");

-- =====================================================
-- 6. CREDIT TRANSACTION (CreditTransaction)
-- =====================================================

-- Chaque utilisateur peut voir ses propres transactions
CREATE POLICY "Utilisateurs peuvent voir leurs transactions"
ON "CreditTransaction"
FOR SELECT
TO authenticated
USING (auth.uid() = "userId");

-- =====================================================
-- 7. GRANTS (Permissions de base)
-- =====================================================

-- Usage du schema public
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- SELECT sur toutes les tables pour anon (lecture seule publique)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- SELECT/INSERT/UPDATE pour authenticated (selon policies)
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ALL pour service_role (admin)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- =====================================================
-- 8. VÉRIFICATION
-- =====================================================

-- Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity as "RLS activé"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('Subject', 'User', 'Wishlist', 'Purchase', 'CreditTransaction');

-- Vérifier les policies
SELECT 
  tablename,
  policyname,
  cmd as "Commande",
  roles as "Rôles"
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
