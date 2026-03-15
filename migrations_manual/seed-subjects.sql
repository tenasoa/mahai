-- =====================================================
-- MAH.AI - Seed Database Supabase
-- =====================================================
-- Exécutez ce script dans l'éditeur SQL de Supabase
-- ou via psql : psql -f seed-subjects.sql
-- =====================================================

-- 1. Insérer des utilisateurs de test (si nécessaire)
INSERT INTO "User" (id, email, prenom, nom, role, credits, "createdAt")
VALUES 
  ('test-user-1', 'test@mahai.mg', 'Test', 'User', 'ETUDIANT', 100, NOW()),
  ('demo-user-1', 'demo@mahai.mg', 'Demo', 'User', 'CONTRIBUTEUR', 50, NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Insérer des sujets de test
INSERT INTO "Subject" (
  id, titre, type, matiere, annee, serie, description, 
  pages, credits, difficulte, langue, format, badge, glyph,
  featured, rating, "reviewsCount", "hasCorrectionIa", 
  "hasCorrectionProf", "authorId", "createdAt"
) VALUES
  -- BAC Mathématiques
  (
    'bac-maths-2024-001',
    'Algèbre & Fonctions — Session officielle',
    'BAC',
    'Mathématiques',
    '2024',
    'C&D',
    'Sujet complet d''algèbre avec fonctions, suites et probabilités',
    18, 15, 'DIFFICILE', 'FRANCAIS', 'PDF', 'GOLD', '∑',
    true, 4.8, 124, true, false,
    'test-user-1',
    NOW()
  ),
  (
    'bac-maths-2023-001',
    'Analyse & Géométrie dans l''espace',
    'BAC',
    'Mathématiques',
    '2023',
    'C',
    'Épreuves d''analyse et géométrie 3D',
    16, 12, 'DIFFICILE', 'FRANCAIS', 'PDF', 'AI', '∑',
    false, 4.6, 89, true, false,
    'test-user-1',
    NOW() - INTERVAL '30 days'
  ),
  
  -- BAC Physique
  (
    'bac-physique-2024-001',
    'Mécanique & Électricité',
    'BAC',
    'Physique-Chimie',
    '2024',
    'C',
    'Mécanique du point et circuits électriques',
    14, 15, 'DIFFICILE', 'FRANCAIS', 'PDF', 'GOLD', 'φ',
    true, 4.7, 98, true, false,
    'test-user-1',
    NOW()
  ),
  (
    'bac-physique-2023-001',
    'Thermodynamique & Ondes',
    'BAC',
    'Physique-Chimie',
    '2023',
    'C',
    'Thermodynamique et propagation des ondes',
    12, 10, 'MOYEN', 'FRANCAIS', 'PDF', 'AI', 'φ',
    false, 4.5, 67, true, false,
    'test-user-1',
    NOW() - INTERVAL '45 days'
  ),
  
  -- BAC SVT
  (
    'bac-svt-2024-001',
    'Biologie Cellulaire & Génétique',
    'BAC',
    'SVT',
    '2024',
    'D',
    'Structure cellulaire et lois de Mendel',
    16, 20, 'DIFFICILE', 'FRANCAIS', 'PDF', 'INTER', 'Ω',
    false, 4.4, 65, false, false,
    'test-user-1',
    NOW()
  ),
  (
    'bac-svt-2023-001',
    'Évolution & Écologie',
    'BAC',
    'SVT',
    '2023',
    'D',
    'Théorie de l''évolution et écosystèmes',
    14, 15, 'MOYEN', 'FRANCAIS', 'PDF', 'AI', 'Ω',
    false, 4.3, 52, true, false,
    'test-user-1',
    NOW() - INTERVAL '60 days'
  ),
  
  -- BAC Français
  (
    'bac-francais-2024-001',
    'Dissertation & Analyse littéraire',
    'BAC',
    'Français',
    '2024',
    'A',
    'Dissertation sur les classiques français',
    8, 10, 'MOYEN', 'FRANCAIS', 'PDF', 'AI', '∂',
    false, 4.6, 78, false, false,
    'test-user-1',
    NOW()
  ),
  (
    'bac-francais-2023-001',
    'Commentaire composé — Poésie',
    'BAC',
    'Français',
    '2023',
    'A',
    'Analyse de poèmes de Baudelaire et Rimbaud',
    6, 8, 'FACILE', 'FRANCAIS', 'PDF', 'FREE', '∂',
    false, 4.9, 215, false, false,
    'test-user-1',
    NOW() - INTERVAL '90 days'
  ),
  
  -- BAC Philosophie
  (
    'bac-philo-2024-001',
    'Dissertation — La conscience',
    'BAC',
    'Philosophie',
    '2024',
    'A',
    'Réflexion sur la conscience et l''inconscient',
    6, 25, 'DIFFICILE', 'FRANCAIS', 'PDF', 'GOLD', 'λ',
    true, 4.9, 98, false, false,
    'test-user-1',
    NOW()
  ),
  (
    'bac-philo-2023-001',
    'Commentaire — Texte de Kant',
    'BAC',
    'Philosophie',
    '2023',
    'A',
    'Extrait de la Critique de la raison pure',
    5, 15, 'DIFFICILE', 'FRANCAIS', 'PDF', 'AI', 'λ',
    false, 4.2, 43, false, false,
    'test-user-1',
    NOW() - INTERVAL '120 days'
  ),
  
  -- BEPC Mathématiques
  (
    'bepc-maths-2024-001',
    'Algèbre & Géométrie',
    'BEPC',
    'Mathématiques',
    '2024',
    NULL,
    'Équations, inéquations et théorème de Pythagore',
    10, 8, 'MOYEN', 'FRANCAIS', 'PDF', 'AI', '∑',
    false, 4.7, 156, true, false,
    'test-user-1',
    NOW()
  ),
  (
    'bepc-maths-2023-001',
    'Arithmétique & Statistiques',
    'BEPC',
    'Mathématiques',
    '2023',
    NULL,
    'Nombres relatifs et tableaux statistiques',
    8, 6, 'FACILE', 'FRANCAIS', 'PDF', 'FREE', '∑',
    false, 4.8, 203, false, false,
    'test-user-1',
    NOW() - INTERVAL '180 days'
  ),
  
  -- BEPC Physique
  (
    'bepc-physique-2024-001',
    'Électricité & Mécanique',
    'BEPC',
    'Physique-Chimie',
    '2024',
    NULL,
    'Circuits simples et mouvement',
    8, 8, 'MOYEN', 'FRANCAIS', 'PDF', 'AI', 'φ',
    false, 4.5, 87, true, false,
    'test-user-1',
    NOW()
  ),
  
  -- BEPC Français
  (
    'bepc-francais-2024-001',
    'Compréhension & Expression',
    'BEPC',
    'Français',
    '2024',
    NULL,
    'Lecture compréhension et production écrite',
    6, 5, 'FACILE', 'FRANCAIS', 'PDF', 'FREE', '∂',
    false, 4.4, 178, false, false,
    'test-user-1',
    NOW()
  ),
  
  -- CEPE Mathématiques
  (
    'cepe-maths-2024-001',
    'Calcul & Problèmes',
    'CEPE',
    'Mathématiques',
    '2024',
    NULL,
    'Opérations de base et problèmes simples',
    6, 3, 'FACILE', 'FRANCAIS', 'PDF', 'FREE', '∑',
    false, 4.8, 312, false, false,
    'test-user-1',
    NOW()
  ),
  (
    'cepe-maths-2023-001',
    'Géométrie & Mesures',
    'CEPE',
    'Mathématiques',
    '2023',
    NULL,
    'Figures géométriques et conversions',
    5, 3, 'FACILE', 'FRANCAIS', 'PDF', 'FREE', '∑',
    false, 4.7, 289, false, false,
    'test-user-1',
    NOW() - INTERVAL '365 days'
  ),
  
  -- CEPE Français
  (
    'cepe-francais-2024-001',
    'Dictée & Compréhension',
    'CEPE',
    'Français',
    '2024',
    NULL,
    'Dictée de mots et textes courts',
    4, 3, 'FACILE', 'FRANCAIS', 'PDF', 'FREE', '∂',
    false, 4.6, 267, false, false,
    'test-user-1',
    NOW()
  ),
  
  -- Histoire-Géo
  (
    'bac-histoire-2024-001',
    'Madagascar : Indépendance à nos jours',
    'BAC',
    'Histoire-Géographie',
    '2024',
    'A',
    'Histoire politique de Madagascar depuis 1960',
    10, 12, 'MOYEN', 'FRANCAIS', 'PDF', 'AI', 'π',
    false, 4.3, 54, false, false,
    'test-user-1',
    NOW()
  ),
  (
    'bepc-histoire-2024-001',
    'Géographie de Madagascar',
    'BEPC',
    'Histoire-Géographie',
    '2024',
    NULL,
    'Relief, climat et ressources de Madagascar',
    8, 8, 'FACILE', 'FRANCAIS', 'PDF', 'AI', 'π',
    false, 4.2, 43, false, false,
    'test-user-1',
    NOW()
  ),
  
  -- Économie
  (
    'bac-eco-2024-001',
    'Microéconomie — Offre et Demande',
    'BAC',
    'Économie',
    '2024',
    'G',
    'Lois du marché et équilibre',
    12, 18, 'DIFFICILE', 'FRANCAIS', 'PDF', 'GOLD', '€',
    true, 4.5, 32, false, false,
    'test-user-1',
    NOW()
  );

-- 3. Vérifier les données insérées
SELECT 
  type AS "Type",
  matiere AS "Matière",
  COUNT(*) AS "Nombre de sujets",
  AVG(rating)::numeric(3,2) AS "Note moyenne"
FROM "Subject"
GROUP BY type, matiere
ORDER BY type, matiere;

-- 4. Afficher quelques exemples
SELECT 
  titre,
  type,
  matiere,
  annee,
  credits,
  badge,
  rating
FROM "Subject"
ORDER BY "createdAt" DESC
LIMIT 10;
