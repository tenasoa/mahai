import { Link, NavLink, Outlet, useMatches } from "react-router";

import type { Route } from "./+types/admin";
import { Logo } from "~/components/ui/Logo";
import { requireEditeur } from "~/lib/auth/session.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Admin — Mah.ai" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireEditeur(request);
  return { nom: session.user.name };
}

const lien = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-10 items-center rounded-full px-4 text-sm font-bold ${
    isActive ? "bg-soft text-ink" : "text-muted hover:text-ink"
  }`;

/** Espace de gestion du catalogue (admin et modérateurs). Plus large que l'application. */
export default function Admin() {
  const matches = useMatches();
  // L'éditeur de sujet prend toute la largeur sur ordinateur (plan, éditeur, aperçu).
  const large = Boolean((matches[matches.length - 1]?.handle as { large?: boolean } | undefined)?.large);
  // Les autres pages (listes, tableaux) passent aussi en largeur d'ordinateur.
  const largeur = large ? "max-w-4xl lg:max-w-[96rem] lg:px-8" : "max-w-4xl lg:max-w-6xl lg:px-8 xl:max-w-7xl";
  return (
    <div className="min-h-dvh">
      <header className={`mx-auto flex ${largeur} flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-2`}>
        <Link to="/" aria-label="Mah.ai, accueil">
          <Logo />
        </Link>
        <nav aria-label="Admin" className="flex gap-1">
          <NavLink to="/admin/sujets" className={lien}>
            Sujets
          </NavLink>
          <NavLink to="/admin/listes" className={lien}>
            Listes
          </NavLink>
          <NavLink to="/admin/images" className={lien}>
            Images
          </NavLink>
        </nav>
      </header>
      <main className={`mx-auto flex ${largeur} flex-col gap-5 px-5 pt-2 pb-20`}>
        <Outlet />
      </main>
    </div>
  );
}
