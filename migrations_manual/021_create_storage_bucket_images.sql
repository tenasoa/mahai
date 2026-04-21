-- Migration 021: Création du bucket de stockage pour les images du blog
-- À appliquer dans l'éditeur SQL de Supabase

-- 1. Création du bucket 'images' s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Définition des politiques de sécurité (RLS) pour le bucket 'images'

-- Autoriser l'accès public en lecture aux fichiers (indispensable pour l'affichage du blog)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Autoriser l'upload aux utilisateurs authentifiés (Admins/Contributeurs)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- Autoriser la modification/suppression à l'utilisateur qui a uploadé le fichier
CREATE POLICY "Authenticated Update/Delete"
ON storage.objects FOR ALL
TO authenticated
USING ( bucket_id = 'images' AND auth.uid() = owner );
