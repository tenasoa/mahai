ALTER TABLE `matiere` ADD `icone` text;--> statement-breakpoint
-- Pictogrammes des matières de départ (modifiables ensuite dans /admin/listes).
UPDATE `matiere` SET `icone` = CASE `id`
  WHEN 'maths' THEN 'pi'
  WHEN 'francais' THEN 'lettres'
  WHEN 'physique' THEN 'atome'
  WHEN 'svt' THEN 'feuille'
  WHEN 'histoire' THEN 'globe'
  WHEN 'malagasy' THEN 'drapeau'
  WHEN 'anglais' THEN 'bulle'
  WHEN 'philosophie' THEN 'ampoule'
  WHEN 'culture-generale' THEN 'etoile'
END WHERE `icone` IS NULL;
