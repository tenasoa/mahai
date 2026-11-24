import { base64Url, construireMime, type Email } from "./mime";

/**
 * Envoi d'emails par l'API Gmail d'un compte Gmail dédié (gratuit).
 * Le jeton d'accès est obtenu à partir d'un « refresh token » et gardé en mémoire
 * jusqu'à son expiration.
 */

export type ConfigGmail = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  expediteur: string;
};

type Recuperer = typeof fetch;

export function creerEnvoyeurGmail(config: ConfigGmail, recuperer: Recuperer = fetch) {
  let jeton: { valeur: string; expire: number } | undefined;

  async function jetonAcces(): Promise<string> {
    if (jeton && jeton.expire > Date.now() + 60_000) return jeton.valeur;
    const reponse = await recuperer("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      }),
    });
    if (!reponse.ok) {
      throw new Error(`Gmail : jeton refusé (${reponse.status}) ${await reponse.text()}`);
    }
    const corps = (await reponse.json()) as { access_token: string; expires_in: number };
    jeton = { valeur: corps.access_token, expire: Date.now() + corps.expires_in * 1000 };
    return jeton.valeur;
  }

  return async function envoyer(email: Email): Promise<void> {
    const brut = construireMime(email, { nom: "Mah.ai", adresse: config.expediteur });
    const reponse = await recuperer(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${await jetonAcces()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ raw: base64Url(brut) }),
      },
    );
    if (!reponse.ok) {
      throw new Error(`Gmail : envoi refusé (${reponse.status}) ${await reponse.text()}`);
    }
  };
}
