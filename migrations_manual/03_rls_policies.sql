-- 1. Activation de la RLS sur toutes les tables (déjà fait manuellement, mais par sécurité)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CreditTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Wishlist" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExamenBlanc" ENABLE ROW LEVEL SECURITY;

-- 2. POLITIQUES POUR "Subject" (Le Catalogue)
-- Tout le monde peut voir les sujets
CREATE POLICY "Les sujets sont visibles par tous" 
ON "Subject" FOR SELECT 
USING (true);

-- Seuls les admins ou contributeurs peuvent créer (via service_role par défaut ici)
-- Note: Pour simplifier, on autorise la lecture totale.

-- 3. POLITIQUES POUR "User"
-- Un utilisateur peut voir son propre profil
CREATE POLICY "Les utilisateurs voient leur propre profil" 
ON "User" FOR SELECT 
USING (auth.uid()::text = id);

-- Un utilisateur peut modifier son propre profil
CREATE POLICY "Les utilisateurs modifient leur propre profil" 
ON "User" FOR UPDATE 
USING (auth.uid()::text = id);

-- 4. POLITIQUES POUR "Purchase" (Les Achats)
-- Un utilisateur voit ses propres achats
CREATE POLICY "Les utilisateurs voient leurs propres achats" 
ON "Purchase" FOR SELECT 
USING (auth.uid()::text = "userId");

-- 5. POLITIQUES POUR "CreditTransaction"
-- Un utilisateur voit ses propres transactions
CREATE POLICY "Les utilisateurs voient leurs propres transactions" 
ON "CreditTransaction" FOR SELECT 
USING (auth.uid()::text = "userId");

-- 6. POLITIQUES POUR "Wishlist"
-- Un utilisateur voit sa propre wishlist
CREATE POLICY "Les utilisateurs voient leur propre wishlist" 
ON "Wishlist" FOR SELECT 
USING (auth.uid()::text = "userId");

-- Un utilisateur peut ajouter à sa wishlist
CREATE POLICY "Les utilisateurs ajoutent à leur propre wishlist" 
ON "Wishlist" FOR INSERT 
WITH CHECK (auth.uid()::text = "userId");

-- Un utilisateur peut supprimer de sa wishlist
CREATE POLICY "Les utilisateurs suppriment de leur propre wishlist" 
ON "Wishlist" FOR DELETE 
USING (auth.uid()::text = "userId");

-- 7. POLITIQUES POUR "ExamenBlanc"
CREATE POLICY "Les utilisateurs voient leurs propres examens" 
ON "ExamenBlanc" FOR SELECT 
USING (auth.uid()::text = "userId");

CREATE POLICY "Les utilisateurs créent leurs propres examens" 
ON "ExamenBlanc" FOR INSERT 
WITH CHECK (auth.uid()::text = "userId");
