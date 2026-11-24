import { Link, NavLink, Outlet } from "react-router";

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
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-2">
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
        </nav>
      </header>
      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-5 pt-2 pb-20">
        <Outlet />
      </main>
    </div>
  );
}
