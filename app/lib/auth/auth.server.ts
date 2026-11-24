import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "~/db/schema";
import { hashPassword, verifyPassword } from "./password";

function creerAuth() {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    appName: "Mah.ai",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      // Pas encore d'envoi d'email (il faut un domaine) : vérification désactivée pour l'instant.
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      password: { hash: hashPassword, verify: verifyPassword },
    },
    user: {
      additionalFields: {
        // Le rôle n'est jamais choisi par l'utilisateur à l'inscription.
        role: {
          type: "string",
          required: false,
          defaultValue: "eleve",
          input: false,
        },
        niveau: { type: "string", required: false, input: true },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 jours
      updateAge: 60 * 60 * 24, // prolongée au plus une fois par jour
    },
    rateLimit: { enabled: true },
    advanced: {
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
    },
    telemetry: { enabled: false },
  });
}

let instance: ReturnType<typeof creerAuth> | undefined;

/** Instance unique par isolat ; les bindings sont lus via `cloudflare:workers`. */
export function getAuth() {
  instance ??= creerAuth();
  return instance;
}

export type Session = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>
>;
