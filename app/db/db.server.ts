import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "./schema";

/** Accès à la base D1 de l'environnement courant. */
export function getDb() {
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
