import { redirect } from "react-router";

import type { Route } from "./+types/deconnexion";
import { getAuth } from "~/lib/auth/auth.server";
import { redirectAvecCookies } from "~/lib/auth/session.server";

/** Déconnexion : uniquement en POST (formulaire), jamais par simple lien. */
export async function action({ request }: Route.ActionArgs) {
  const reponse = await getAuth().api.signOut({
    headers: request.headers,
    asResponse: true,
  });
  return redirectAvecCookies("/", reponse);
}

export function loader() {
  return redirect("/profil");
}
