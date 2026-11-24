/**
 * Traduit les codes d'erreur de Better Auth en messages pour l'utilisateur.
 * Volontairement vague pour la connexion : on ne dit pas si l'email existe.
 */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe incorrect.",
  INVALID_EMAIL: "Cet email n'est pas valide.",
  INVALID_PASSWORD: "Email ou mot de passe incorrect.",
  USER_ALREADY_EXISTS: "Un compte existe déjà avec cet email. Connecte-toi.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Un compte existe déjà avec cet email. Connecte-toi.",
  PASSWORD_TOO_SHORT: "Le mot de passe doit faire au moins 8 caractères.",
  PASSWORD_TOO_LONG: "Le mot de passe est trop long (128 caractères maximum).",
  TOO_MANY_REQUESTS: "Trop de tentatives. Réessaie dans une minute.",
};

export const MESSAGE_PAR_DEFAUT =
  "Quelque chose s'est mal passé. Réessaie dans un instant.";

export function messageErreur(code: string | undefined, status?: number): string {
  if (status === 429) return MESSAGES.TOO_MANY_REQUESTS!;
  if (code && MESSAGES[code]) return MESSAGES[code]!;
  return MESSAGE_PAR_DEFAUT;
}

/** Erreurs renvoyées dans l'URL (`?error=`) au retour de Google. */
const MESSAGES_OAUTH: Record<string, string> = {
  access_denied: "Connexion Google annulée.",
  unable_to_link_account:
    "Un compte existe déjà avec cet email. Connecte-toi avec ton mot de passe.",
  account_already_linked_to_different_user:
    "Ce compte Google est déjà relié à un autre compte Mah.ai.",
  email_not_found: "Google n'a pas transmis d'email. Utilise un autre compte.",
  email_not_verified: "Ton email Google n'est pas vérifié.",
};

export function messageErreurOAuth(code: string | null): string | undefined {
  if (!code) return undefined;
  return (
    MESSAGES_OAUTH[code] ?? "La connexion avec Google a échoué. Réessaie."
  );
}

/** Lit le code d'erreur d'une réponse de Better Auth. */
export async function lireErreur(reponse: Response): Promise<string> {
  let code: string | undefined;
  try {
    const corps = (await reponse.clone().json()) as { code?: string };
    code = corps?.code;
  } catch {
    code = undefined;
  }
  return messageErreur(code, reponse.status);
}
