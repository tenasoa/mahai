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
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

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
