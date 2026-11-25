import { useEffect } from "react";
import { Link, Outlet, useMatches, useNavigate, type ShouldRevalidateFunctionArgs } from "react-router";

import type { Route } from "./+types/_app";
import { BarreLaterale } from "~/components/layout/BarreLaterale";
import { champRecherche } from "~/components/catalogue/recherche";
import { BottomNav } from "~/components/layout/BottomNav";
import { Logo } from "~/components/ui/Logo";
import { getDb } from "~/db/db.server";
import { getSession } from "~/lib/auth/session.server";
import { chargerListes } from "~/lib/catalogue/catalogue.server";
import { champSaisi } from "~/lib/clavier";

/**
 * Mise en page d'une route de l'application (`export const handle`) :
 * - `large` : la page occupe toute la largeur sur ordinateur (sinon une colonne de lecture) ;
 * - `rail` : la navigation se réduit aux icônes (lecture d'un sujet).
 */
export type MiseEnPage = { large?: boolean; rail?: boolean };

export async function loader({ request }: Route.LoaderArgs) {
  const [session, listes] = await Promise.all([getSession(request), chargerListes(getDb())]);
  const role = session?.user.role ?? "";
  return {
    utilisateur: session ? { nom: session.user.name, editeur: role === "admin" || role === "moderateur" } : null,
    matieres: listes.matieres.map(({ id, nom, couleur, icone }) => ({ id, nom, couleur, icone })),
  };
}

/** Les matières et la session ne changent qu'après un envoi de formulaire. */
export function shouldRevalidate({ formMethod, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return formMethod ? defaultShouldRevalidate : false;
}

/** Coquille : barre latérale sur ordinateur, en-tête et navigation du bas sur téléphone. */
export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const matches = useMatches();
  const page = (matches[matches.length - 1]?.handle ?? {}) as MiseEnPage;
  const navigate = useNavigate();

  // « / » : chercher un sujet, depuis n'importe quelle page.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || champSaisi(document.activeElement)) return;
      e.preventDefault();
      const champ = champRecherche();
      if (champ) champ.focus();
      else navigate("/sujets", { state: { chercher: true } });
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [navigate]);

  return (
    <div className="min-h-dvh lg:flex">
      <BarreLaterale utilisateur={loaderData.utilisateur} matieres={loaderData.matieres} rail={page.rail} />
      <div className="min-w-0 flex-1">
        <header className="pas-imprime mx-auto flex max-w-xl items-center justify-between px-5 pt-5 pb-2 lg:hidden">
          <Link to="/" aria-label="Mah.ai, accueil">
            <Logo />
          </Link>
        </header>
        <main
          className={`mx-auto flex max-w-xl flex-col gap-5 px-5 pt-2 pb-32 lg:px-10 lg:pt-8 lg:pb-16 ${
            page.large ? "lg:max-w-[88rem]" : "lg:max-w-3xl"
          }`}
        >
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
