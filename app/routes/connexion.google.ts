import { data, redirect } from "react-router";

import type { Route } from "./+types/connexion.google";
import { googleActif } from "~/lib/auth/auth.server";
import { cheminSur } from "~/lib/auth/redirection";
import { appelerAuth, redirectAvecCookies } from "~/lib/auth/session.server";

/**
 * Démarre la connexion Google depuis un simple formulaire (marche sans JavaScript) :
 * Better Auth prépare l'état, on recopie ses cookies et on envoie vers Google.
 */
export async function action({ request }: Route.ActionArgs) {
  if (!googleActif()) {
    throw data("Connexion Google indisponible.", { status: 404 });
  }
  const form = await request.formData();
  const suite = cheminSur(String(form.get("suite") ?? ""));

  const reponse = await appelerAuth(request, "/sign-in/social", {
    provider: "google",
    callbackURL: suite,
    newUserCallbackURL: suite,
    errorCallbackURL: "/connexion",
    disableRedirect: true,
  });

  const corps = (await reponse.clone().json().catch(() => null)) as {
    url?: string;
  } | null;
  if (!reponse.ok || !corps?.url) {
    return redirect("/connexion?error=google");
  }
  return redirectAvecCookies(corps.url, reponse);
}

export function loader() {
  return redirect("/connexion");
}
