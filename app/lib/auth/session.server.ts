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

export { cheminSur } from "./redirection";

/** Recopie les cookies posés par Better Auth sur une redirection. */
export function redirectAvecCookies(vers: string, reponse: Response) {
  const headers = new Headers();
  for (const cookie of reponse.headers.getSetCookie()) {
    headers.append("Set-Cookie", cookie);
  }
  return redirect(vers, { headers });
}
