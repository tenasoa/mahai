import { Link, Outlet } from "react-router";

import { BottomNav } from "~/components/layout/BottomNav";
import { Logo } from "~/components/ui/Logo";

/** Coquille de l'application : en-tête, contenu, navigation du bas. */
export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-xl items-center justify-between px-5 pt-5 pb-2">
        <Link to="/" aria-label="Mah.ai, accueil">
          <Logo />
        </Link>
      </header>
      <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-2 pb-32">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
