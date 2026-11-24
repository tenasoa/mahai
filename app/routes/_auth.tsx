import { Link, Outlet } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Logo } from "~/components/ui/Logo";

/** Mise en page des écrans de connexion et d'inscription, sans navigation du bas. */
export default function AuthLayout() {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-md items-center gap-2 px-3 pt-4 pb-2">
        <Link
          to="/"
          aria-label="Retour à l'accueil"
          className="inline-flex size-11 items-center justify-center rounded-full bg-soft"
        >
          <Icon name="retour" size={20} />
        </Link>
        <Logo />
      </header>
      <main className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-4 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
