-- 1. Insertion de l'utilisateur de test
INSERT INTO "User" ("id", "email", "prenom", "nom", "role", "credits", "emailVerified", "updatedAt")
VALUES ('test-user-1', 'test@mahai.mg', 'Test', 'User', 'ETUDIANT', 100, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 2. Insertion des sujets
-- Mathématiques
INSERT INTO "Subject" ("id", "titre", "type", "matiere", "annee", "serie", "description", "pages", "credits", "difficulte", "langue", "badge", "glyph", "featured", "rating", "reviewsCount", "hasCorrectionIa", "authorId")
VALUES 
('seed-bac-maths-2024', 'Algèbre & Fonctions — Session officielle', 'BAC', 'Mathématiques', '2024', 'C&D', 'Sujet complet d''algèbre avec fonctions, suites et probabilités', 18, 15, 'DIFFICILE', 'FRANCAIS', 'GOLD', '∑', true, 4.8, 124, true, 'test-user-1'),
('seed-bac-maths-2023', 'Analyse & Géométrie dans l''espace', 'BAC', 'Mathématiques', '2023', 'C', 'Épreuves d''analyse et géométrie 3D', 16, 12, 'DIFFICILE', 'FRANCAIS', 'AI', '∑', false, 4.6, 89, true, 'test-user-1')
ON CONFLICT ("id") DO NOTHING;

-- Physique-Chimie
INSERT INTO "Subject" ("id", "titre", "type", "matiere", "annee", "serie", "description", "pages", "credits", "difficulte", "langue", "badge", "glyph", "featured", "rating", "reviewsCount", "hasCorrectionIa", "authorId")
VALUES 
('seed-bac-physique-2024', 'Mécanique & Électricité', 'BAC', 'Physique-Chimie', '2024', 'C', 'Mécanique du point et circuits électriques', 14, 15, 'DIFFICILE', 'FRANCAIS', 'GOLD', 'φ', true, 4.7, 98, true, 'test-user-1'),
('seed-bac-physique-2023', 'Thermodynamique & Ondes', 'BAC', 'Physique-Chimie', '2023', 'C', 'Thermodynamique et propagation des ondes', 12, 10, 'MOYEN', 'FRANCAIS', 'AI', 'φ', false, 4.5, 67, true, 'test-user-1')
ON CONFLICT ("id") DO NOTHING;

-- SVT
INSERT INTO "Subject" ("id", "titre", "type", "matiere", "annee", "serie", "description", "pages", "credits", "difficulte", "langue", "badge", "glyph", "featured", "rating", "reviewsCount", "hasCorrectionIa", "authorId")
VALUES 
('seed-bac-svt-2024', 'Biologie Cellulaire & Génétique', 'BAC', 'SVT', '2024', 'D', 'Structure cellulaire et lois de Mendel', 16, 20, 'DIFFICILE', 'FRANCAIS', 'INTER', 'Ω', false, 4.4, 65, false, 'test-user-1')
ON CONFLICT ("id") DO NOTHING;

-- Français
INSERT INTO "Subject" ("id", "titre", "type", "matiere", "annee", "serie", "description", "pages", "credits", "difficulte", "langue", "badge", "glyph", "featured", "rating", "reviewsCount", "hasCorrectionIa", "authorId")
VALUES 
('seed-bac-fr-2024', 'Dissertation & Analyse littéraire', 'BAC', 'Français', '2024', 'A', 'Dissertation sur les classiques français', 8, 10, 'MOYEN', 'FRANCAIS', 'AI', '∂', false, 4.6, 78, false, 'test-user-1'),
('seed-bac-fr-2023', 'Commentaire composé — Poésie', 'BAC', 'Français', '2023', 'A', 'Analyse de poèmes de Baudelaire et Rimbaud', 6, 8, 'FACILE', 'FRANCAIS', 'FREE', '∂', false, 4.9, 215, false, 'test-user-1')
ON CONFLICT ("id") DO NOTHING;

-- BEPC
INSERT INTO "Subject" ("id", "titre", "type", "matiere", "annee", "serie", "description", "pages", "credits", "difficulte", "langue", "badge", "glyph", "featured", "rating", "reviewsCount", "hasCorrectionIa", "authorId")
VALUES 
('seed-bepc-maths-2024', 'Algèbre & Géométrie', 'BEPC', 'Mathématiques', '2024', NULL, 'Équations, inéquations et théorème de Pythagore', 10, 8, 'MOYEN', 'FRANCAIS', 'AI', '∑', false, 4.7, 156, true, 'test-user-1'),
('seed-bepc-fr-2024', 'Compréhension & Expression', 'BEPC', 'Français', '2024', NULL, 'Lecture compréhension et production écrite', 6, 5, 'FACILE', 'FRANCAIS', 'FREE', '∂', false, 4.4, 178, false, 'test-user-1')
ON CONFLICT ("id") DO NOTHING;

-- CEPE
INSERT INTO "Subject" ("id", "titre", "type", "matiere", "annee", "serie", "description", "pages", "credits", "difficulte", "langue", "badge", "glyph", "featured", "rating", "reviewsCount", "hasCorrectionIa", "authorId")
VALUES 
('seed-cepe-maths-2024', 'Calcul & Problèmes', 'CEPE', 'Mathématiques', '2024', NULL, 'Opérations de base et problèmes simples', 6, 3, 'FACILE', 'FRANCAIS', 'FREE', '∑', false, 4.8, 312, false, 'test-user-1')
ON CONFLICT ("id") DO NOTHING;
