import { NavLink } from "react-router";

import { Icon, type IconName } from "~/components/ui/Icon";

export const ITEMS: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: "/", label: "Accueil", icon: "accueil", end: true },
  { to: "/sujets", label: "Sujets", icon: "recherche" },
  { to: "/corriger", label: "Corriger", icon: "photo" },
  { to: "/profil", label: "Profil", icon: "profil" },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navigation principale"
      className="pas-imprime fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-4 gap-1.5 px-2.5 pt-1.5 pb-2.5">
        {ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              prefetch="intent"
              className={({ isActive }) =>
                `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs ${
                  isActive ? "bg-soft font-bold text-ink" : "text-muted"
                }`
              }
            >
              <Icon name={item.icon} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
