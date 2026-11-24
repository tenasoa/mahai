import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env, waitUntil } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "~/db/schema";
import { emailActif, envoyerEnFond } from "~/lib/email/email.server";
import { emailReinitialisation, emailVerification } from "~/lib/email/modeles";
import { hashPassword, verifyPassword } from "./password";

/** Vrai si les identifiants Google sont configurés pour cet environnement. */
export function googleActif() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

function creerAuth() {
  const db = drizzle(env.DB, { schema });
  const socialProviders = googleActif()
    ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID!,
          clientSecret: env.GOOGLE_CLIENT_SECRET!,
          prompt: "select_account" as const,
        },
      }
    : {};

  const emails = emailActif();

  return betterAuth({
    appName: "Mah.ai",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      // La vérification d'email est proposée mais n'empêche pas de se connecter.
      requireEmailVerification: false,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      password: { hash: hashPassword, verify: verifyPassword },
      sendResetPassword: emails
        ? async ({ user, url }) =>
            envoyerEnFond(emailReinitialisation({ email: user.email, prenom: user.name }, url))
        : undefined,
      resetPasswordTokenExpiresIn: 60 * 60, // 1 heure
      revokeSessionsOnPasswordReset: true,
    },
    emailVerification: emails
      ? {
          sendVerificationEmail: async ({ user, url }) =>
            envoyerEnFond(emailVerification({ email: user.email, prenom: user.name }, url)),
          sendOnSignUp: true,
          autoSignInAfterVerification: true,
          expiresIn: 60 * 60 * 24, // 24 heures
        }
      : undefined,
    socialProviders,
    account: {
      accountLinking: {
        // Un compte email non vérifié n'est jamais rattaché automatiquement à un compte Google
        // (empêche de « préparer » un compte au nom de quelqu'un d'autre). Valeur par défaut,
        // écrite ici pour qu'elle reste visible.
        requireLocalEmailVerified: true,
      },
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
    // Compteurs en base : partagés entre toutes les instances du Worker (en mémoire, chaque
    // instance aurait les siens). Les formulaires passent par le handler HTTP pour en profiter.
    rateLimit: { enabled: true, storage: "database" },
    advanced: {
      ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] },
      backgroundTasks: { handler: waitUntil },
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
