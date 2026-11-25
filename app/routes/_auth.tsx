import { Link, Outlet, useMatches } from "react-router";

import { Icon } from "~/components/ui/Icon";
import { Logo } from "~/components/ui/Logo";
import { Pictogramme } from "~/components/ui/Pictogramme";

/**
 * Mise en page d'une route d'authentification (`export const handle`) : `lecture` pour une page
 * de texte (conditions, confidentialité), en colonne large et sans panneau de marque.
 */
export type MiseEnPageAuth = { lecture?: boolean };

/** Mosaïque décorative : les couleurs des matières, comme le logo (aucune n'est un bouton). */
const MOSAIQUE = [
  { couleur: "bg-maths", nom: "Maths", icone: "pi", taille: "col-span-2 row-span-2" },
  { couleur: "bg-histoire", nom: null, icone: "globe", taille: "" },
  { couleur: "bg-francais", nom: "Français", icone: "lettres", taille: "row-span-2" },
  { couleur: "bg-svt", nom: null, icone: "feuille", taille: "" },
  { couleur: "bg-physique", nom: "Physique-chimie", icone: "atome", taille: "col-span-2" },
  { couleur: "bg-violet", nom: null, icone: "drapeau", taille: "" },
  { couleur: "bg-turquoise", nom: null, icone: "bulle", taille: "" },
];

const ATOUTS = [
  "Sujets et corrigés du CEPE, du BEPC, du BAC et des concours",
  "Ta copie corrigée par l'IA à partir d'une photo, bientôt",
  "Tes sujets et ta progression sur tous tes appareils",
];

/** Ordinateur : la marque à gauche, le formulaire à droite. */
function PanneauMarque() {
  return (
    <aside
      aria-label="Mah.ai"
      className="sticky top-0 hidden h-dvh w-[44%] max-w-[44rem] shrink-0 flex-col gap-10 overflow-hidden bg-soft px-12 py-10 lg:flex xl:px-16"
    >
      <Link to="/" aria-label="Mah.ai, accueil" className="self-start">
        <Logo />
      </Link>
      <div aria-hidden="true" className="grid max-w-md grid-cols-4 grid-rows-3 gap-3">
        {MOSAIQUE.map((t, i) => (
          <span
            key={i}
            className={`${t.couleur} ${t.taille} flex min-h-20 flex-col justify-between gap-2 rounded-tile p-4 text-[15px] font-bold text-ink`}
          >
            <Pictogramme id={t.icone} taille={t.nom ? 30 : 26} />
            {t.nom}
          </span>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-5">
        <p className="text-4xl leading-[1.1] font-extrabold tracking-tight xl:text-5xl">Révise, corrige, progresse.</p>
        <ul className="flex flex-col gap-2.5 text-base text-ink-2">
          {ATOUTS.map((a) => (
            <li key={a} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-2 size-2.5 shrink-0 rounded-[3px] bg-control" />
              {a}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/** Écrans de connexion, d'inscription et pages légales, sans navigation du bas. */
export default function AuthLayout() {
  const matches = useMatches();
  const lecture = Boolean((matches[matches.length - 1]?.handle as MiseEnPageAuth | undefined)?.lecture);

  return (
    <div className="min-h-dvh lg:flex">
      {lecture ? null : <PanneauMarque />}
      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`mx-auto flex w-full max-w-md items-center gap-2 px-3 pt-4 pb-2 lg:px-5 lg:pt-8 ${
            lecture ? "lg:max-w-2xl" : ""
          }`}
        >
          <Link
            to="/"
            aria-label="Retour à l'accueil"
            className="inline-flex size-11 items-center justify-center rounded-full bg-soft hover:bg-line"
          >
            <Icon name="retour" size={20} />
          </Link>
          <span className={lecture ? "" : "lg:hidden"}>
            <Logo />
          </span>
          {lecture ? null : <span className="hidden text-sm text-muted lg:inline">Retour à l'accueil</span>}
        </header>
        <main
          className={`mx-auto flex w-full max-w-md flex-col gap-5 px-5 pt-4 pb-12 ${
            lecture ? "lg:max-w-2xl lg:pt-8" : "lg:my-auto lg:py-12"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
