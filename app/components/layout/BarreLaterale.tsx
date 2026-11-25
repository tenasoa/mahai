import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Logo } from "~/components/ui/Logo";
import type { Couleur } from "~/db/schema";
import { TuileMatiere } from "~/components/ui/Pictogramme";
import { ITEMS } from "./BottomNav";
import { debutExamen, EVENEMENT_RECENTS, lireRecents, type SujetRecent } from "~/lib/recents";

export type UtilisateurCoquille = { nom: string; editeur: boolean } | null;
export type MatiereCoquille = { id: string; nom: string; couleur: Couleur; icone: string | null };

/**
 * Navigation sur ordinateur (≥ 1024 px) : remplace la barre du bas. `rail` la réduit aux icônes
 * pour laisser la place à la lecture d'un sujet.
 */
export function BarreLaterale({
  utilisateur,
  matieres,
  rail = false,
}: {
  utilisateur: UtilisateurCoquille;
  matieres: MatiereCoquille[];
  rail?: boolean;
}) {

  if (rail) {
    return (
      <nav
        aria-label="Navigation principale"
        className="pas-imprime sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center gap-1.5 border-r border-line px-2 py-5 lg:flex"
      >
        <Link to="/" aria-label="Mah.ai, accueil" className="mb-3 flex size-14 items-center justify-center rounded-2xl hover:bg-soft">
          <Logo seul />
        </Link>
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            prefetch="intent"
            className={({ isActive }) =>
              `flex min-h-14 w-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] ${
                isActive ? "bg-soft font-bold text-ink" : "text-muted hover:text-ink"
              }`
            }
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
        {utilisateur?.editeur ? (
          <Link to="/admin/sujets" className="mt-auto flex min-h-14 w-16 flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] text-muted hover:text-ink">
            <Icon name="admin" size={20} />
            Admin
          </Link>
        ) : null}
      </nav>
    );
  }

  return (
    <aside
      aria-label="Navigation"
      className="pas-imprime sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-6 overflow-y-auto border-r border-line px-4 py-6 lg:flex"
    >
      <Link to="/" aria-label="Mah.ai, accueil" className="px-3.5">
        <Logo />
      </Link>
      <nav aria-label="Navigation principale">
        <ul className="flex flex-col gap-1">
          {ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                prefetch="intent"
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-[14px] px-3.5 text-[15px] ${
                    isActive ? "bg-soft font-bold text-ink" : "text-muted hover:text-ink"
                  }`
                }
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </NavLink>
            </li>
          ))}
          {utilisateur?.editeur ? (
            <li>
              <Link to="/admin/sujets" className="flex min-h-11 items-center gap-3 rounded-[14px] px-3.5 text-[15px] text-muted hover:text-ink">
                <Icon name="admin" size={20} />
                Admin
              </Link>
            </li>
          ) : null}
        </ul>
      </nav>

      <Recents matieres={matieres} />

      <div className="mt-auto flex flex-col gap-3">
      <ExamenEnCours />

      <div className="flex flex-col gap-2.5 rounded-card bg-soft p-4">
        {utilisateur ? (
          <>
            <p className="truncate text-sm font-bold">{utilisateur.nom}</p>
            <Link to="/profil" className="text-sm text-ink-2 underline underline-offset-4">
              Mon profil
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm font-bold">Pas encore de compte</p>
            <p className="text-[13px] leading-normal text-muted">
              Garde tes sujets et tes corrections sur tous tes appareils.
            </p>
            <Link
              to="/connexion"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-surface px-5 text-sm font-medium hover:bg-line"
            >
              Se connecter
            </Link>
          </>
        )}
      </div>
      </div>
    </aside>
  );
}

/** Relit les sujets récents à l'ouverture d'un sujet (cet onglet) ou dans un autre onglet. */
function useRecents() {
  const [recents, setRecents] = useState<SujetRecent[] | null>(null);
  useEffect(() => {
    const lire = () => setRecents(lireRecents());
    lire();
    window.addEventListener(EVENEMENT_RECENTS, lire);
    window.addEventListener("storage", lire);
    return () => {
      window.removeEventListener(EVENEMENT_RECENTS, lire);
      window.removeEventListener("storage", lire);
    };
  }, []);
  return recents;
}

const RECENTS_AFFICHES = 5;

/** Derniers sujets ouverts sur cet appareil. */
function Recents({ matieres }: { matieres: MatiereCoquille[] }) {
  const recents = useRecents();
  const { pathname } = useLocation();
  if (recents === null) return null; // avant la lecture du navigateur : rien plutôt qu'un faux vide
  return (
    <nav aria-labelledby="titre-recents" className="flex min-h-0 flex-col">
      <p id="titre-recents" className="mb-2 ml-3.5 text-xs font-medium text-muted">
        Récents
      </p>
      {recents.length ? (
        <ul className="flex flex-col gap-0.5">
          {recents.slice(0, RECENTS_AFFICHES).map((r) => {
            const m = matieres.find((x) => x.id === r.matiereId);
            const actif = pathname === `/sujets/${r.slug}`;
            return (
              <li key={r.slug}>
                <Link
                  to={`/sujets/${r.slug}`}
                  prefetch="intent"
                  aria-current={actif ? "page" : undefined}
                  className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 ${actif ? "bg-soft" : "hover:bg-soft/60"}`}
                >
                  <TuileMatiere couleur={m?.couleur} icone={m?.icone} taille={28} />
                  <span className="flex min-w-0 flex-col">
                    <span className={`truncate text-sm ${actif ? "font-bold" : "text-ink-2"}`}>{r.titre}</span>
                    <span className="truncate text-xs text-muted">{r.examen}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mx-3.5 text-[13px] leading-normal text-muted">Les sujets que tu ouvres apparaîtront ici.</p>
      )}
    </nav>
  );
}

/** « 1:42:10 », « 12:05 ». */
function chrono(secondes: number) {
  const s = Math.max(0, Math.floor(secondes));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const deux = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${deux(m)}:${deux(s % 60)}` : `${m}:${deux(s % 60)}`;
}

/** Mode examen lancé sur un sujet : le temps restant, et un lien pour y revenir. */
function ExamenEnCours() {
  const recents = useRecents();
  const { pathname } = useLocation();
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const enCours = (recents ?? [])
    .map((r) => ({ r, debut: debutExamen(r.slug) }))
    .find((x): x is { r: SujetRecent; debut: number } => x.debut !== null && x.r.dureeMinutes !== null);
  const actif = Boolean(enCours);
  useEffect(() => {
    if (!actif) return;
    setMaintenant(Date.now());
    const minuterie = window.setInterval(() => setMaintenant(Date.now()), 1000);
    return () => window.clearInterval(minuterie);
  }, [actif]);

  // Sur la page du sujet, le bandeau du mode examen suffit.
  if (!enCours || pathname === `/sujets/${enCours.r.slug}`) return null;
  const restant = (enCours.debut + enCours.r.dureeMinutes! * 60_000 - maintenant) / 1000;
  return (
    <Link
      to={`/sujets/${enCours.r.slug}`}
      className="flex flex-col gap-1 rounded-card bg-a-revoir p-4 hover:outline-2 hover:outline-ink"
    >
      <span className="flex items-center gap-2 text-xs font-bold">
        <Icon name="chrono" size={16} />
        {restant > 0 ? "Mode examen en cours" : "Temps écoulé"}
      </span>
      <span className="truncate text-sm">{enCours.r.titre}</span>
      <span className="text-2xl font-extrabold tabular-nums">{chrono(restant)}</span>
      <span className="text-[13px] underline underline-offset-4">Reprendre</span>
    </Link>
  );
}
