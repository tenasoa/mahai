import { useEffect, useState } from "react";

import { SvgStatistique } from "~/components/document/SvgStatistique";
import {
  GENRES_STAT,
  LIMITES_STAT,
  MOIS,
  NOMS_GENRES_STAT,
  STAT_DEFAUT,
  lireTableau,
  normaliserStatistique,
  seriesAttendues,
  type GenreStat,
  type Statistique,
} from "~/lib/document/statistique";
import { BoutonModele, DialogueDessin } from "./DialogueDessin";
import { Nombre, Section, Supprimer, champ, petit } from "./DialogueGraphique";

/**
 * Éditeur d'un diagramme statistique : genre, tableau des données (catégories × séries, ou
 * collé depuis un tableur), unités, aperçu en direct. Les modèles ne donnent que la structure
 * (mois, tranches d'âge) : les valeurs sont toujours celles de l'auteur.
 */

export type StatistiqueEnCours = { attrs: Record<string, unknown> | null; pos?: number };

const vides = (n: number) => Array.from({ length: n }, () => null);

const MODELES: { nom: string; s: Omit<Statistique, "alt"> }[] = [
  { nom: "Barres", s: { ...STAT_DEFAUT } },
  {
    nom: "Secteurs",
    s: { genre: "secteurs", categories: ["Agriculture", "Industrie", "Services"], series: [{ nom: "Part", valeurs: vides(3) }], unite: "%", unite2: "", valeurs: true },
  },
  {
    nom: "Pyramide des âges",
    s: {
      genre: "pyramide",
      categories: ["0-14", "15-29", "30-44", "45-59", "60-74", "75 et +"],
      series: [
        { nom: "Hommes", valeurs: vides(6) },
        { nom: "Femmes", valeurs: vides(6) },
      ],
      unite: "%",
      unite2: "",
      valeurs: false,
    },
  },
  {
    nom: "Ombrothermique",
    s: {
      genre: "ombrothermique",
      categories: [...MOIS],
      series: [
        { nom: "Précipitations", valeurs: vides(12) },
        { nom: "Températures", valeurs: vides(12) },
      ],
      unite: "mm",
      unite2: "°C",
      valeurs: false,
    },
  },
];

/**
 * Change de genre en gardant les données : il manque des séries, on les ajoute ; il y en a trop,
 * elles restent en réserve (cachées, non enregistrées) pour revenir au genre précédent.
 */
function changerGenre(s: Statistique, genre: GenreStat): Statistique {
  const [min] = seriesAttendues(genre);
  let series = s.series;
  const noms = genre === "pyramide" ? ["Hommes", "Femmes"] : genre === "ombrothermique" ? ["Précipitations", "Températures"] : [];
  while (series.length < min) series = [...series, { nom: noms[series.length] ?? `Série ${series.length + 1}`, valeurs: vides(s.categories.length) }];
  return { ...s, genre, series };
}

export function DialogueStatistique({
  statistique,
  onValider,
  onFermer,
}: {
  statistique: StatistiqueEnCours | null;
  onValider: (s: Statistique) => void;
  onFermer: () => void;
}) {
  const [s, setS] = useState<Statistique>(STAT_DEFAUT);
  const [collage, setCollage] = useState("");
  const [erreurCollage, setErreurCollage] = useState(false);
  useEffect(() => {
    if (!statistique) return;
    setS(statistique.attrs ? normaliserStatistique(statistique.attrs) : STAT_DEFAUT);
    setCollage("");
    setErreurCollage(false);
  }, [statistique]);

  const apercu = normaliserStatistique(s);
  const [minSeries, maxSeries] = seriesAttendues(s.genre);
  const visibles = s.series.slice(0, maxSeries);

  const majValeur = (j: number, i: number, v: number | null) =>
    setS((a) => ({ ...a, series: a.series.map((x, k) => (k === j ? { ...x, valeurs: x.valeurs.map((y, l) => (l === i ? v : y)) } : x)) }));
  const ajouterCategorie = () =>
    setS((a) =>
      a.categories.length >= LIMITES_STAT.categories
        ? a
        : { ...a, categories: [...a.categories, ""], series: a.series.map((x) => ({ ...x, valeurs: [...x.valeurs, null] })) },
    );
  const retirerCategorie = (i: number) =>
    setS((a) => ({
      ...a,
      categories: a.categories.filter((_, l) => l !== i),
      series: a.series.map((x) => ({ ...x, valeurs: x.valeurs.filter((_, l) => l !== i) })),
    }));

  function coller() {
    const t = lireTableau(collage);
    if (!t) {
      setErreurCollage(true);
      return;
    }
    setErreurCollage(false);
    setCollage("");
    setS((a) => changerGenre({ ...a, categories: t.categories, series: t.series }, a.genre));
  }

  return (
    <DialogueDessin
      ouvert={Boolean(statistique)}
      titre={statistique?.pos === undefined ? "Nouveau diagramme" : "Modifier le diagramme"}
      nouveau={statistique?.pos === undefined}
      modeles={MODELES.map((m) => (
        <BoutonModele key={m.nom} onClick={() => setS({ ...m.s, series: m.s.series.map((x) => ({ ...x })), alt: s.alt })}>
          {m.nom}
        </BoutonModele>
      ))}
      formulaire={
        <>
          <Section titre="Genre">
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Genre de diagramme">
              {GENRES_STAT.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={s.genre === g}
                  onClick={() => setS((a) => changerGenre(a, g))}
                  className={`min-h-9 rounded-full border-2 px-3 text-sm font-medium ${s.genre === g ? "border-ink bg-soft" : "border-line hover:border-control"}`}
                >
                  {NOMS_GENRES_STAT[g]}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">
              {s.genre === "secteurs"
                ? "Une seule série ; les pourcentages sont calculés."
                : s.genre === "pyramide"
                  ? "Tranches d'âge de la plus jeune à la plus âgée ; hommes à gauche, femmes à droite."
                  : s.genre === "ombrothermique"
                    ? "Précipitations en barres, températures en courbe ; échelle des températures = moitié de celle des précipitations."
                    : "Plusieurs séries possibles, côte à côte."}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={s.unite}
                onChange={(e) => setS((a) => ({ ...a, unite: e.target.value }))}
                maxLength={30}
                aria-label="Unité"
                placeholder={s.genre === "ombrothermique" ? "Unité des précipitations (mm)" : "Unité (%, millions d'hab.…)"}
                className={`${champ} flex-1`}
              />
              {s.genre === "ombrothermique" ? (
                <input
                  value={s.unite2}
                  onChange={(e) => setS((a) => ({ ...a, unite2: e.target.value }))}
                  maxLength={30}
                  aria-label="Unité des températures"
                  placeholder="°C"
                  className={`${champ} w-20`}
                />
              ) : null}
              {s.genre === "pyramide" || s.genre === "ombrothermique" ? null : (
                <label className="flex items-center gap-1.5 text-sm">
                  <input type="checkbox" checked={s.valeurs} onChange={(e) => setS((a) => ({ ...a, valeurs: e.target.checked }))} />
                  Afficher les valeurs
                </label>
              )}
            </div>
          </Section>

          <Section titre="Données">
            <div className="overflow-x-auto">
              <table className="border-separate border-spacing-1 text-sm">
                <thead>
                  <tr>
                    <th scope="col" className="text-left text-xs font-medium text-muted">
                      Catégorie
                    </th>
                    {visibles.map((x, j) => (
                      <th key={j} scope="col">
                        <span className="flex items-center gap-0.5">
                          <input
                            value={x.nom}
                            onChange={(e) => setS((a) => ({ ...a, series: a.series.map((y, k) => (k === j ? { ...y, nom: e.target.value } : y)) }))}
                            maxLength={40}
                            aria-label={`Nom de la série ${j + 1}`}
                            className={`${champ} w-28 font-bold`}
                          />
                          {visibles.length > minSeries ? (
                            <Supprimer onClick={() => setS((a) => ({ ...a, series: a.series.filter((_, k) => k !== j) }))} quoi={`la série ${x.nom || j + 1}`} />
                          ) : null}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.categories.map((c, i) => (
                    <tr key={i}>
                      <td>
                        <input
                          value={c}
                          onChange={(e) => setS((a) => ({ ...a, categories: a.categories.map((y, l) => (l === i ? e.target.value : y)) }))}
                          maxLength={30}
                          aria-label={`Catégorie ${i + 1}`}
                          className={`${champ} w-28`}
                        />
                      </td>
                      {visibles.map((x, j) => (
                        <td key={j}>
                          <Nombre
                            libelle={`${x.nom || `Série ${j + 1}`}, ${c || `catégorie ${i + 1}`}`}
                            vide
                            valeur={x.valeurs[i] ?? null}
                            onChange={(n) => majValeur(j, i, n)}
                            className="w-28"
                          />
                        </td>
                      ))}
                      <td>
                        <Supprimer onClick={() => retirerCategorie(i)} quoi={`la catégorie ${c || i + 1}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {s.categories.length < LIMITES_STAT.categories ? (
                <button type="button" onClick={ajouterCategorie} className={petit}>
                  + Catégorie
                </button>
              ) : null}
              {visibles.length < maxSeries ? (
                <button
                  type="button"
                  onClick={() => setS((a) => ({ ...a, series: [...a.series, { nom: `Série ${a.series.length + 1}`, valeurs: vides(a.categories.length) }] }))}
                  className={petit}
                >
                  + Série
                </button>
              ) : null}
            </div>
            <details>
              <summary className="cursor-pointer text-sm text-muted">Coller depuis un tableur</summary>
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-xs text-muted">
                  Première ligne : noms des séries ; première colonne : catégories. Colonnes séparées par des tabulations (copie
                  d'Excel ou de LibreOffice) ou par « ; ».
                </p>
                <textarea
                  value={collage}
                  onChange={(e) => setCollage(e.target.value)}
                  rows={5}
                  spellCheck={false}
                  aria-label="Tableau à coller"
                  className="min-w-0 rounded-xl border-2 border-line bg-surface p-2 font-mono text-sm focus:border-ink"
                />
                {erreurCollage ? (
                  <p role="alert" className="text-sm text-ink-2">
                    Il faut au moins une ligne de noms et une ligne de valeurs, avec deux colonnes ou plus.
                  </p>
                ) : null}
                <button type="button" onClick={coller} disabled={!collage.trim()} className={`${petit} self-start disabled:opacity-40`}>
                  Remplacer les données
                </button>
              </div>
            </details>
          </Section>
        </>
      }
      apercu={<SvgStatistique s={apercu} />}
      alt={s.alt}
      onAlt={(alt) => setS((a) => ({ ...a, alt }))}
      exempleAlt="Population de Madagascar de 1960 à 2020, en millions d'habitants"
      onValider={() => onValider(apercu)}
      onFermer={onFermer}
    />
  );
}
