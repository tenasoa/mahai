-- Migration 012: Table Testimonials pour la landing page
-- Les témoignages seront gérés depuis l'admin et affichés sur la landing

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,           -- ex: "BAC série D · Mention Bien 2024"
  quote TEXT NOT NULL,
  avatar_initial CHAR(1),       -- lettre initiale pour l'avatar
  rating SMALLINT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_example BOOLEAN DEFAULT false,  -- marqué comme exemple (non vérifié)
  is_featured BOOLEAN DEFAULT false, -- mis en avant sur la landing
  is_published BOOLEAN DEFAULT true,
  display_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes de la landing (publié + ordre)
CREATE INDEX idx_testimonials_landing
  ON public.testimonials (is_published, display_order)
  WHERE is_published = true;

-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Lecture publique (landing page)
CREATE POLICY "testimonials_public_read"
  ON public.testimonials
  FOR SELECT
  USING (is_published = true);

-- Écriture réservée aux admins (via service_role)
CREATE POLICY "testimonials_admin_all"
  ON public.testimonials
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."User"
      WHERE id = auth.uid()::text AND role = 'ADMIN'
    )
  );

-- Insérer les témoignages exemples actuels
INSERT INTO public.testimonials (name, role, quote, avatar_initial, is_example, is_featured, display_order) VALUES
  ('Seheno Rakotondrabe', 'BAC série D · Mention Bien 2024',
   'Grâce à MahAI, j''ai pu m''exercer sur les sujets des 10 dernières années. La correction IA m''a permis de comprendre exactement où j''échouais.',
   'S', true, true, 1),
  ('Tiana Andriantsoa', 'BEPC 2024 · Admis avec mention',
   'L''interface est élégante et les sujets sont bien organisés. Le paiement Mobile Money fonctionne parfaitement, je recommande vivement.',
   'T', true, true, 2),
  ('Rivo Ramaroson', 'Contributeur certifié · 12 sujets publiés',
   'En tant que contributeur, j''ai publié 12 sujets et reçu mes gains directement via Mobile Money. Un système transparent et équitable.',
   'R', true, true, 3);

COMMENT ON TABLE public.testimonials IS 'Témoignages affichés sur la landing page. Les entrées marquées is_example sont des exemples illustratifs.';
COMMENT ON COLUMN public.testimonials.is_example IS 'true = témoignage illustratif (pas un vrai utilisateur vérifié)';
