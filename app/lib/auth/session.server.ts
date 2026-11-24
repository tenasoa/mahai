import { redirect } from "react-router";

import { getAuth } from "./auth.server";

export async function getSession(request: Request) {
  return getAuth().api.getSession({ headers: request.headers });
}

/** Renvoie la session, ou redirige vers la connexion en gardant la page demandée. */
export async function requireSession(request: Request) {
  const session = await getSession(request);
  if (!session) {
    const url = new URL(request.url);
    throw redirect(
      `/connexion?suite=${encodeURIComponent(url.pathname + url.search)}`,
    );
  }
  return session;
}

/** Rôles qui peuvent gérer le catalogue. */
const EDITEURS = new Set(["admin", "moderateur"]);

/** Session d'un admin ou modérateur ; les autres voient une page introuvable. */
export async function requireEditeur(request: Request) {
  const session = await requireSession(request);
  if (!EDITEURS.has(session.user.role ?? "")) {
    throw new Response("Page introuvable", { status: 404 });
  }
  return session;
}

export { cheminSur } from "./redirection";

const ENTETES_TRANSMIS = [
  "cookie",
  "origin",
  "user-agent",
  "accept-language",
  "cf-connecting-ip",
];

/**
 * Appelle un point d'entrée de Better Auth en passant par son handler HTTP, comme le ferait le
 * navigateur. Contrairement à `auth.api.*`, ce chemin applique la limitation des tentatives et
 * la vérification d'origine.
 */
export function appelerAuth(request: Request, chemin: string, corps: unknown) {
  const headers = new Headers({ "content-type": "application/json" });
  for (const nom of ENTETES_TRANSMIS) {
    const valeur = request.headers.get(nom);
    if (valeur) headers.set(nom, valeur);
  }
  return getAuth().handler(
    new Request(new URL(`/api/auth${chemin}`, request.url), {
      method: "POST",
      headers,
      body: JSON.stringify(corps),
    }),
  );
}

/** Recopie les cookies posés par Better Auth sur une redirection. */
export function redirectAvecCookies(vers: string, reponse: Response) {
  const headers = new Headers();
  for (const cookie of reponse.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }
  return redirect(vers, { headers });
}
