/**
 * Schéma D1 (SQLite) géré par Drizzle. Les migrations sont générées dans drizzle/
 * par `pnpm db:generate`, puis appliquées par `pnpm db:migrate:*`.
 *
 * Conventions :
 * - identifiants texte générés par l'application ;
 * - dates en millisecondes (integer mode "timestamp_ms"), une seule convention partout ;
 * - montants en ariary entiers (jamais de flottants pour l'argent).
 */
import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import type { Noeud } from "../lib/document/nettoyer";

const maintenant = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const ROLES = [
  "eleve",
  "contributeur",
  "etablissement",
  "moderateur",
  "admin",
] as const;
export type Role = (typeof ROLES)[number];

/* ---------- Tables de Better Auth (noms imposés par la bibliothèque) ---------- */

export const user = sqliteTable(
  "user",
  {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(maintenant),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .default(maintenant)
    .$onUpdate(() => new Date()),
  // Champs propres à Mah.ai (déclarés aussi dans user.additionalFields de Better Auth).
  role: text("role", { enum: ROLES }).notNull().default("eleve"),
  niveau: text("niveau"),
  },
  (t) => [
    check(
      "user_role_check",
      sql`${t.role} in ('eleve', 'contributeur', 'etablissement', 'moderateur', 'admin')`,
    ),
  ],
);

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(maintenant),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(maintenant)
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(maintenant),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(maintenant)
      .$onUpdate(() => new Date()),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(maintenant),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(maintenant)
      .$onUpdate(() => new Date()),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/** Compteurs de limitation des tentatives (Better Auth, `rateLimit.storage: "database"`). */
export const rateLimit = sqliteTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: integer("last_request").notNull(),
});

/* ---------- Catalogue ---------- */

/** Couleurs de tuile disponibles pour une matière (jetons de app/app.css). */
export const COULEURS = [
  "maths",
  "francais",
  "physique",
  "svt",
  "histoire",
  "violet",
  "turquoise",
  "sable",
  "citron",
] as const;
export type Couleur = (typeof COULEURS)[number];

export const STATUTS_SUJET = ["brouillon", "publie"] as const;
export const SOURCES_SUJET = ["officiel", "contributeur", "etablissement", "ia"] as const;

const dansListe = (colonne: unknown, valeurs: readonly string[]) =>
  sql`${colonne} in (${sql.raw(valeurs.map((v) => `'${v}'`).join(", "))})`;

/** Examens et concours (CEPE, BEPC, BAC…), liste gérée dans l'admin. */
export const examen = sqliteTable("examen", {
  id: text("id").primaryKey(), // identifiant lisible, ex. « bac »
  nom: text("nom").notNull(),
  ordre: integer("ordre").notNull().default(0),
});

/** Séries d'un examen (BAC série C…). */
export const serie = sqliteTable(
  "serie",
  {
    id: text("id").primaryKey(), // ex. « bac-c »
    examenId: text("examen_id")
      .notNull()
      .references(() => examen.id, { onDelete: "restrict" }),
    nom: text("nom").notNull(),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [index("serie_examen_id_idx").on(t.examenId)],
);

export const matiere = sqliteTable(
  "matiere",
  {
    id: text("id").primaryKey(), // ex. « maths »
    nom: text("nom").notNull(),
    couleur: text("couleur", { enum: COULEURS }).notNull(),
    ordre: integer("ordre").notNull().default(0),
  },
  (t) => [check("matiere_couleur_check", dansListe(t.couleur, COULEURS))],
);

/**
 * Un sujet d'examen ou d'exercice. L'énoncé et le corrigé sont des documents JSON (TipTap)
 * nettoyés par `nettoyerDocument` ; l'affichage passe par `RenduDocument`.
 */
export const sujet = sqliteTable(
  "sujet",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    titre: text("titre").notNull(),
    examenId: text("examen_id")
      .notNull()
      .references(() => examen.id, { onDelete: "restrict" }),
    matiereId: text("matiere_id")
      .notNull()
      .references(() => matiere.id, { onDelete: "restrict" }),
    annee: integer("annee"),
    session: text("session"), // ex. « Session normale », « Sujet blanc »
    niveau: text("niveau"), // facultatif : Terminale, L1… (hors examens nationaux)
    dureeMinutes: integer("duree_minutes"),
    /** En-tête officiel : code matière, option, coefficient (si le sujet n'a pas de série). */
    codeMatiere: text("code_matiere"),
    option: text("option"),
    coefficient: integer("coefficient"),
    /** Documents JSON (voir app/lib/document/nettoyer.ts). */
    enonce: text("enonce", { mode: "json" }).$type<Noeud>().notNull(),
    corrige: text("corrige", { mode: "json" }).$type<Noeud>(),
    /** 0 = gratuit. Tout est lisible tant que le paiement n'existe pas. */
    prixAriary: integer("prix_ariary").notNull().default(0),
    statut: text("statut", { enum: STATUTS_SUJET }).notNull().default("brouillon"),
    source: text("source", { enum: SOURCES_SUJET }).notNull().default("officiel"),
    auteurId: text("auteur_id").references(() => user.id, { onDelete: "set null" }),
    /** Titre, métadonnées et début de l'énoncé sans accents ni majuscules, pour la recherche. */
    recherche: text("recherche").notNull(),
    creeLe: integer("cree_le", { mode: "timestamp_ms" }).notNull().default(maintenant),
    modifieLe: integer("modifie_le", { mode: "timestamp_ms" })
      .notNull()
      .default(maintenant)
      .$onUpdate(() => new Date()),
    publieLe: integer("publie_le", { mode: "timestamp_ms" }),
  },
  (t) => [
    index("sujet_statut_matiere_idx").on(t.statut, t.matiereId),
    index("sujet_statut_examen_annee_idx").on(t.statut, t.examenId, t.annee),
    check("sujet_statut_check", dansListe(t.statut, STATUTS_SUJET)),
    check("sujet_source_check", dansListe(t.source, SOURCES_SUJET)),
    check("sujet_prix_check", sql`${t.prixAriary} >= 0`),
    check("sujet_coefficient_check", sql`${t.coefficient} is null or ${t.coefficient} between 1 and 20`),
  ],
);

/**
 * Séries concernées par un sujet (un même sujet sert souvent à plusieurs séries, avec un
 * coefficient et parfois un barème propres : voir `pointsSeries` dans le document).
 */
export const sujetSerie = sqliteTable(
  "sujet_serie",
  {
    sujetId: text("sujet_id")
      .notNull()
      .references(() => sujet.id, { onDelete: "cascade" }),
    serieId: text("serie_id")
      .notNull()
      .references(() => serie.id, { onDelete: "restrict" }),
    coefficient: integer("coefficient"),
  },
  (t) => [
    primaryKey({ columns: [t.sujetId, t.serieId] }),
    index("sujet_serie_serie_id_idx").on(t.serieId),
    check("sujet_serie_coefficient_check", sql`${t.coefficient} is null or ${t.coefficient} between 1 and 20`),
  ],
);
