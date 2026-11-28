import { Link } from "react-router";

import { Icon } from "~/components/ui/Icon";
import type { Couleur } from "~/db/schema";
import { duree } from "~/lib/catalogue/formulaire";
import { TuileMatiere } from "~/components/ui/Pictogramme";

export type SujetResume = {
  id: string;
  slug: string;
  titre: string;
  examenId: string;
  matiereId: string;
  annee: number | null;
  dureeMinutes: number | null;
  aCorrige: boolean;
  series: string[];
};

export type ListesAffichage = {
  examens: { id: string; nom: string }[];
  series: { id: string; nom: string }[];
  matieres: { id: string; nom: string; couleur: Couleur; icone: string | null }[];
};

const nomDe = (liste: { id: string; nom: string }[], id: string) => liste.find((x) => x.id === id)?.nom ?? "";

/**
 * Sujets en tableau (ordinateur). Avec `surChoix`, une ligne se choisit au clic (aperçu à côté)
 * et le titre reste le lien qui ouvre le sujet.
 */
export function TableSujets({
  sujets,
  listes,
  choisi,
  surChoix,
  legende,
  compact = false,
}: {
  sujets: SujetResume[];
  listes: ListesAffichage;
  choisi?: number;
  surChoix?: (i: number) => void;
  legende: string;
  /** À partir de 1280 px (aperçu affiché à côté) : examen et séries sous le titre, corrigé en icône. */
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{legende}</caption>
        <thead>
          <tr className="text-left text-xs text-muted">
            <th scope="col" className="px-3 pb-2.5 font-medium">Sujet</th>
            <th scope="col" className={`px-3 pb-2.5 font-medium ${compact ? "xl:hidden" : ""}`}>Examen</th>
            <th scope="col" className={`px-3 pb-2.5 font-medium ${compact ? "xl:hidden" : ""}`}>Séries</th>
            <th scope="col" className="px-3 pb-2.5 font-medium">Durée</th>
            <th scope="col" className="px-3 pb-2.5 font-medium">Corrigé</th>
          </tr>
        </thead>
        <tbody>
          {sujets.map((s, i) => {
            const matiere = listes.matieres.find((m) => m.id === s.matiereId);
            const actif = choisi === i;
            const series = s.series.map((id) => nomDe(listes.series, id)).filter(Boolean).join(", ");
            return (
              <tr
                key={s.id}
                onClick={surChoix ? () => surChoix(i) : undefined}
                aria-selected={surChoix ? actif : undefined}
                className={`border-t border-line ${surChoix ? "cursor-pointer" : ""} ${actif ? "bg-soft" : surChoix ? "hover:bg-soft/60" : ""}`}
              >
                <td className="px-3 py-3">
                  <Link
                    to={`/sujets/${s.slug}`}
                    prefetch="intent"
                    onFocus={surChoix ? () => surChoix(i) : undefined}
                    className="flex min-w-40 items-center gap-3 font-bold hover:underline hover:underline-offset-4"
                  >
                    <TuileMatiere couleur={matiere?.couleur} icone={matiere?.icone} taille={30} />
                    <span>
                      {s.titre}
                      {matiere && matiere.nom !== s.titre ? <span className="sr-only">, {matiere.nom}</span> : null}
                      {compact ? (
                        <span className="hidden text-xs font-normal text-muted xl:block">
                          {nomDe(listes.examens, s.examenId)}
                          {s.annee ? ` ${s.annee}` : ""}
                          {series ? ` · Série ${series}` : ""}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </td>
                <td className={`min-w-32 px-3 py-3 tabular-nums ${compact ? "xl:hidden" : ""}`}>
                  {nomDe(listes.examens, s.examenId)}
                  {s.annee ? ` ${s.annee}` : ""}
                </td>
                <td className={`px-3 py-3 ${compact ? "xl:hidden" : ""}`}>{series || "—"}</td>
                <td className="px-3 py-3 whitespace-nowrap tabular-nums">{duree(s.dureeMinutes) ?? "—"}</td>
                <td className="px-3 py-3">
                  {s.aCorrige ? (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="juste" size={16} />
                      <span className={compact ? "xl:sr-only" : ""}>Oui</span>
                    </span>
                  ) : (
                    <span className="text-muted">
                      <span className={`whitespace-nowrap ${compact ? "xl:hidden" : ""}`}>Pas encore</span>
                      {compact ? (
                        <span className="hidden xl:inline">
                          <span aria-hidden="true">—</span>
                          <span className="sr-only">Pas encore</span>
                        </span>
                      ) : null}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
