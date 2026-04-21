-- Migration : Tables de blog et commentaires
-- Date : 2026-04-21
-- Description : Création des tables pour le blog et les commentaires utilisateurs

-- ============================================================
-- 1. TABLE BlogPost - Articles de blog
-- ============================================================
DROP TABLE IF EXISTS "BlogPost" CASCADE;
CREATE TABLE "BlogPost" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "author_id" TEXT NOT NULL,
  "author_name" TEXT NOT NULL,
  "cover_image" TEXT,
  "read_time" INTEGER DEFAULT 5,
  "is_published" BOOLEAN DEFAULT false,
  "is_featured" BOOLEAN DEFAULT false,
  "views" INTEGER DEFAULT 0,
  "published_at" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_blog_post_slug ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS idx_blog_post_category ON "BlogPost"("category");
CREATE INDEX IF NOT EXISTS idx_blog_post_published ON "BlogPost"("is_published");
CREATE INDEX IF NOT EXISTS idx_blog_post_featured ON "BlogPost"("is_featured");
CREATE INDEX IF NOT EXISTS idx_blog_post_author ON "BlogPost"("author_id");

COMMENT ON TABLE "BlogPost" IS 'Articles de blog publiés sur la plateforme';
COMMENT ON COLUMN "BlogPost"."slug" IS 'URL-friendly identifier for the post';
COMMENT ON COLUMN "BlogPost"."read_time" IS 'Estimated reading time in minutes';


-- ============================================================
-- 2. TABLE BlogComment - Commentaires sur les articles
-- ============================================================
DROP TABLE IF EXISTS "BlogComment" CASCADE;
CREATE TABLE "BlogComment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "post_id" UUID NOT NULL REFERENCES "BlogPost"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "parent_id" UUID REFERENCES "BlogComment"("id") ON DELETE CASCADE,
  "is_approved" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_blog_comment_post ON "BlogComment"("post_id");
CREATE INDEX IF NOT EXISTS idx_blog_comment_user ON "BlogComment"("user_id");
CREATE INDEX IF NOT EXISTS idx_blog_comment_parent ON "BlogComment"("parent_id");
CREATE INDEX IF NOT EXISTS idx_blog_comment_approved ON "BlogComment"("is_approved");

COMMENT ON TABLE "BlogComment" IS 'Commentaires des utilisateurs sur les articles de blog';
COMMENT ON COLUMN "BlogComment"."parent_id" IS 'For nested/reply comments';


-- ============================================================
-- 3. TABLE BlogCategory - Catégories de blog (optionnel pour gestion avancée)
-- ============================================================
DROP TABLE IF EXISTS "BlogCategory" CASCADE;
CREATE TABLE "BlogCategory" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT UNIQUE NOT NULL,
  "slug" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "color" TEXT DEFAULT '#gold',
  "sort_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Données initiales pour les catégories
INSERT INTO "BlogCategory" (name, slug, description, sort_order) VALUES
  ('Conseils BAC', 'conseils-bac', 'Conseils et astuces pour réussir le BAC', 1),
  ('Conseils BEPC', 'conseits-bepc', 'Conseils et astuces pour réussir le BEPC', 2),
  ('Conseils CEPE', 'conseils-cepe', 'Conseils et astuces pour réussir le CEPE', 3),
  ('Actualités', 'actualites', 'Nouvelles et mises à jour de la plateforme', 4),
  ('Tutoriel', 'tutoriel', 'Guides et tutoriels pour utiliser Mah.AI', 5),
  ('Technologie', 'technologie', 'Articles sur notre technologie IA', 6),
  ('Communauté', 'communaute', 'Histoires et succès de notre communauté', 7),
  ('Carrière', 'carriere', 'Opportunités pour contributeurs et enseignants', 8)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE "BlogCategory" IS 'Catégories pour classer les articles de blog';
