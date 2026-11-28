import { useEffect, useState } from "react";
import { Link } from "react-router";

import { TuileMatiere } from "~/components/ui/Pictogramme";
import type { Couleur } from "~/db/schema";
import { parNom } from "~/lib/catalogue/matieres";
import { normaliser } from "~/lib/contenu/texte";

type Matiere = { id: string; nom: string; couleur: Couleur; icone: string | null };

/**
 * Toutes les matières qui ont des sujets, par ordre alphabétique, quand elles ne tiennent pas
 * dans les étiquettes en tête. Un `<details>` : s'ouvre sans JavaScript ; avec, un champ filtre
 * la liste (utile quand il y en a des centaines).
 */
export function ToutesMatieres({
  matieres,
  nombre,
  lien,
  choisie,
  ouvert,
}: {
  matieres: Matiere[];
  nombre: (id: string) => number;
  lien: (id: string | null) => string;
  choisie: string | null;
  ouvert: boolean;
}) {
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
  const [filtre, setFiltre] = useState("");
  const mots = normaliser(filtre).split(" ").filter(Boolean);
  const liste = parNom(matieres).filter((m) => {
    const nom = normaliser(m.nom);
    return mots.every((mot) => nom.includes(mot));
  });

  return (
    <details open={ouvert} className="group">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full border-2 border-line px-4 text-sm font-medium hover:border-control [&::-webkit-details-marker]:hidden">
        Liste des matières
        <span className="text-xs font-normal text-muted tabular-nums">{matieres.length}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none">
          <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      <div className="mt-3 flex flex-col gap-3 rounded-card border-2 border-line p-3">
        {js ? (
          <input
            type="search"
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
            placeholder="Chercher une matière"
            aria-label="Chercher une matière"
            className="min-h-11 rounded-full border-2 border-control bg-soft px-4 text-base outline-none placeholder:text-muted focus:border-ink"
          />
        ) : null}
        {liste.length ? (
          <ul className="grid max-h-88 grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-1 overflow-y-auto">
            {liste.map((m) => {
              const actif = m.id === choisie;
              return (
                <li key={m.id}>
                  <Link
                    to={lien(actif ? null : m.id)}
                    preventScrollReset
                    aria-current={actif ? "true" : undefined}
                    className={`flex min-h-11 items-center gap-2.5 rounded-xl px-2 text-sm ${actif ? "bg-soft font-bold" : "hover:bg-soft"}`}
                  >
                    <TuileMatiere couleur={m.couleur} icone={m.icone} taille={26} />
                    <span className="min-w-0 flex-1">{m.nom}</span>
                    <span className="text-xs font-normal text-muted tabular-nums">{nombre(m.id)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-2 py-3 text-sm text-muted" aria-live="polite">
            Aucune matière ne correspond.
          </p>
        )}
      </div>
    </details>
  );
}
