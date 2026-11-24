import { env, waitUntil } from "cloudflare:workers";

import { creerEnvoyeurGmail } from "./gmail";
import type { Email } from "./mime";

/** Vrai si l'envoi d'emails par Gmail est configuré pour cet environnement. */
export function emailActif() {
  return Boolean(
    env.GMAIL_CLIENT_ID &&
      env.GMAIL_CLIENT_SECRET &&
      env.GMAIL_REFRESH_TOKEN &&
      env.GMAIL_EXPEDITEUR,
  );
}

let envoyeur: ReturnType<typeof creerEnvoyeurGmail> | undefined;

/**
 * Envoie en arrière-plan : la réponse part sans attendre Gmail (et sans révéler par le temps
 * de réponse si un compte existe). Les échecs sont journalisés.
 */
export function envoyerEnFond(email: Email) {
  if (!emailActif()) return;
  envoyeur ??= creerEnvoyeurGmail({
    clientId: env.GMAIL_CLIENT_ID!,
    clientSecret: env.GMAIL_CLIENT_SECRET!,
    refreshToken: env.GMAIL_REFRESH_TOKEN!,
    expediteur: env.GMAIL_EXPEDITEUR!,
  });
  waitUntil(
    envoyeur(email).catch((erreur: unknown) => {
      console.error("Échec d'envoi d'email", { sujet: email.sujet, erreur: String(erreur) });
    }),
  );
}
