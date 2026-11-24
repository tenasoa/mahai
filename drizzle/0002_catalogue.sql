CREATE TABLE `examen` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `matiere` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL,
	`couleur` text NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	CONSTRAINT "matiere_couleur_check" CHECK("matiere"."couleur" in ('maths', 'francais', 'physique', 'svt', 'histoire', 'violet', 'turquoise', 'sable', 'citron'))
);
--> statement-breakpoint
CREATE TABLE `serie` (
	`id` text PRIMARY KEY NOT NULL,
	`examen_id` text NOT NULL,
	`nom` text NOT NULL,
	`ordre` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`examen_id`) REFERENCES `examen`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `serie_examen_id_idx` ON `serie` (`examen_id`);--> statement-breakpoint
CREATE TABLE `sujet` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`titre` text NOT NULL,
	`examen_id` text NOT NULL,
	`matiere_id` text NOT NULL,
	`annee` integer,
	`session` text,
	`niveau` text,
	`duree_minutes` integer,
	`code_matiere` text,
	`option` text,
	`coefficient` integer,
	`enonce` text NOT NULL,
	`corrige` text,
	`prix_ariary` integer DEFAULT 0 NOT NULL,
	`statut` text DEFAULT 'brouillon' NOT NULL,
	`source` text DEFAULT 'officiel' NOT NULL,
	`auteur_id` text,
	`recherche` text NOT NULL,
	`cree_le` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`modifie_le` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`publie_le` integer,
	FOREIGN KEY (`examen_id`) REFERENCES `examen`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`matiere_id`) REFERENCES `matiere`(`id`) ON UPDATE no action ON DELETE restrict,
	FOREIGN KEY (`auteur_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "sujet_statut_check" CHECK("sujet"."statut" in ('brouillon', 'publie')),
	CONSTRAINT "sujet_source_check" CHECK("sujet"."source" in ('officiel', 'contributeur', 'etablissement', 'ia')),
	CONSTRAINT "sujet_prix_check" CHECK("sujet"."prix_ariary" >= 0),
	CONSTRAINT "sujet_coefficient_check" CHECK("sujet"."coefficient" is null or "sujet"."coefficient" between 1 and 20)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sujet_slug_unique` ON `sujet` (`slug`);--> statement-breakpoint
CREATE INDEX `sujet_statut_matiere_idx` ON `sujet` (`statut`,`matiere_id`);--> statement-breakpoint
CREATE INDEX `sujet_statut_examen_annee_idx` ON `sujet` (`statut`,`examen_id`,`annee`);--> statement-breakpoint
CREATE TABLE `sujet_serie` (
	`sujet_id` text NOT NULL,
	`serie_id` text NOT NULL,
	`coefficient` integer,
	PRIMARY KEY(`sujet_id`, `serie_id`),
	FOREIGN KEY (`sujet_id`) REFERENCES `sujet`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`serie_id`) REFERENCES `serie`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "sujet_serie_coefficient_check" CHECK("sujet_serie"."coefficient" is null or "sujet_serie"."coefficient" between 1 and 20)
);
--> statement-breakpoint
CREATE INDEX `sujet_serie_serie_id_idx` ON `sujet_serie` (`serie_id`);