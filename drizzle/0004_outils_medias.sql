CREATE TABLE `media` (
	`cle` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`taille` integer NOT NULL,
	`largeur` integer,
	`hauteur` integer,
	`auteur_id` text,
	`cree_le` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`auteur_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `media_auteur_id_idx` ON `media` (`auteur_id`);--> statement-breakpoint
ALTER TABLE `matiere` ADD `outils` text;