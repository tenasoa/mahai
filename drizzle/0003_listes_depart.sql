-- Listes de départ du catalogue. Modifiables ensuite depuis l'admin (/admin/listes).
INSERT INTO `examen` (`id`, `nom`, `ordre`) VALUES
  ('cepe', 'CEPE', 1),
  ('bepc', 'BEPC', 2),
  ('bac', 'BAC', 3),
  ('concours', 'Concours', 4);
--> statement-breakpoint
-- Séries du BAC (anciennes A1, A2, C, D et nouvelles S, OSE) ; à compléter dans l'admin.
INSERT INTO `serie` (`id`, `examen_id`, `nom`, `ordre`) VALUES
  ('bac-a1', 'bac', 'A1', 1),
  ('bac-a2', 'bac', 'A2', 2),
  ('bac-c', 'bac', 'C', 3),
  ('bac-d', 'bac', 'D', 4),
  ('bac-s', 'bac', 'S', 5),
  ('bac-ose', 'bac', 'OSE', 6);
--> statement-breakpoint
INSERT INTO `matiere` (`id`, `nom`, `couleur`, `ordre`) VALUES
  ('maths', 'Maths', 'maths', 1),
  ('francais', 'Français', 'francais', 2),
  ('physique', 'Physique-chimie', 'physique', 3),
  ('svt', 'SVT', 'svt', 4),
  ('histoire', 'Histoire-géo', 'histoire', 5),
  ('malagasy', 'Malagasy', 'violet', 6),
  ('anglais', 'Anglais', 'turquoise', 7),
  ('philosophie', 'Philosophie', 'sable', 8),
  ('culture-generale', 'Culture générale', 'citron', 9);
