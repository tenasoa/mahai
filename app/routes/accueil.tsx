import { Link } from "react-router";

import type { Route } from "./+types/accueil";
import { ButtonLink } from "~/components/ui/Button";
import { LiensLegaux } from "~/components/ui/LiensLegaux";
import { MATIERES } from "~/lib/matieres";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Mah.ai — révise, corrige, progresse" },
    {
      name: "description",
      content:
        "Sujets d'examens, corrigés et une IA qui corrige ta copie à partir d'une photo. CEPE, BEPC, BAC et concours.",
    },
  ];
}

const A_VENIR = [
  "Correction IA de ta copie à partir d'une photo",
  "Séries quotidiennes, XP et badges",
  "Examens blancs chronométrés",
];

export default function Accueil() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          Révise, corrige, progresse.
        </h1>
        <p className="text-base leading-relaxed text-ink-2">
          Sujets d'examens, corrigés, et une IA qui corrige ta copie à partir
          d'une photo. CEPE, BEPC, BAC et concours.
        </p>
      </div>

      <section aria-labelledby="titre-matieres" className="flex flex-col gap-3">
        <h2 id="titre-matieres" className="text-base font-bold">
          Choisis une matière
        </h2>
        <ul className="grid grid-cols-2 gap-2.5">
          {MATIERES.map((m) => (
            <li key={m.id}>
              <Link
                to={`/sujets?matiere=${m.id}`}
                className={`${m.tile} flex min-h-24 items-end rounded-tile p-4 text-base font-bold text-ink`}
              >
                {m.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/sujets"
              className="flex min-h-24 items-end rounded-tile bg-soft p-4 text-base font-bold text-ink"
            >
              Toutes les matières
            </Link>
          </li>
        </ul>
      </section>

      <ButtonLink to="/sujets" className="min-h-14 w-full">
        Voir les sujets
      </ButtonLink>

      <section
        aria-labelledby="titre-bientot"
        className="flex flex-col gap-3 rounded-tile bg-soft p-5"
      >
        <h2 id="titre-bientot" className="text-base font-bold">
          En préparation
        </h2>
        <ul className="flex flex-col gap-2 text-sm text-ink-2">
          {A_VENIR.map((texte) => (
            <li key={texte} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-[3px] bg-control"
              />
              {texte}
            </li>
          ))}
        </ul>
      </section>

      <LiensLegaux />
    </>
  );
}
