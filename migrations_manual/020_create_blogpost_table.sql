-- =====================================================
-- MAH.AI - Create BlogPost Table
-- =====================================================
-- Cette migration crée la table BlogPost pour gérer
-- les articles du blog de Mah.AI

CREATE TABLE IF NOT EXISTS "BlogPost" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general' NOT NULL,
    "author_id" TEXT NOT NULL REFERENCES "User"("id"),
    "author_name" TEXT DEFAULT 'Admin Mah.AI' NOT NULL,
    "cover_image" TEXT,
    "read_time" INTEGER DEFAULT 5,
    "is_published" BOOLEAN DEFAULT false NOT NULL,
    "is_featured" BOOLEAN DEFAULT false NOT NULL,
    "views" INTEGER DEFAULT 0 NOT NULL,
    "published_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX IF NOT EXISTS "BlogPost_author_id_idx" ON "BlogPost"("author_id");
CREATE INDEX IF NOT EXISTS "BlogPost_is_published_idx" ON "BlogPost"("is_published");
CREATE INDEX IF NOT EXISTS "BlogPost_is_featured_idx" ON "BlogPost"("is_featured");
CREATE INDEX IF NOT EXISTS "BlogPost_category_idx" ON "BlogPost"("category");

-- =====================================================
-- 3. ENABLE RLS (Row Level Security)
-- =====================================================

ALTER TABLE "BlogPost" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Allow anyone to read published posts
CREATE POLICY "BlogPost_read_published"
    ON "BlogPost"
    FOR SELECT
    USING (is_published = true);

-- Allow admin to read all posts
CREATE POLICY "BlogPost_read_admin"
    ON "BlogPost"
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
        )
    );

-- Allow admin to insert
CREATE POLICY "BlogPost_insert_admin"
    ON "BlogPost"
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
        )
    );

-- Allow admin to update
CREATE POLICY "BlogPost_update_admin"
    ON "BlogPost"
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
        )
    );

-- Allow admin to delete
CREATE POLICY "BlogPost_delete_admin"
    ON "BlogPost"
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM "User" u
            WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
        )
    );
