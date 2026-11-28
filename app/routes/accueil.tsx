import { Form, Link } from "react-router";

import type { Route } from "./+types/accueil";
import type { MiseEnPage } from "./_app";
import { TableSujets } from "~/components/catalogue/TableSujets";
import { ButtonLink } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { Icon } from "~/components/ui/Icon";
import { Kbd } from "~/components/ui/Kbd";
import { LiensLegaux } from "~/components/ui/LiensLegaux";
import { getDb } from "~/db/db.server";
import { anneesPubliees, chargerListes, chiffresCatalogue, derniersSujets } from "~/lib/catalogue/catalogue.server";
import { TUILES } from "~/lib/couleurs";
import { matieresEnAvant } from "~/lib/catalogue/matieres";
import { Pictogramme } from "~/components/ui/Pictogramme";

export const handle: MiseEnPage = { large: true };

export async function loader() {
  const db = getDb();
  const [listes, chiffres, derniers, annees] = await Promise.all([
    chargerListes(db),
    chiffresCatalogue(db),
    derniersSujets(db),
    anneesPubliees(db),
  ]);
  return { listes, chiffres, derniers, annees };
}

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

/** 11 tuiles et « Toutes les matières » : des rangées pleines à 2, 3 et 6 colonnes. */
const TUILES_MAX = 11;

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

const selectRecherche = "min-h-12 min-w-0 flex-1 rounded-full border-2 border-line bg-surface px-4 text-sm";

export default function Accueil({ loaderData }: Route.ComponentProps) {
  const { listes, chiffres, derniers, annees } = loaderData;
  // Les matières qui ont des sujets, les plus fournies d'abord ; tant que le catalogue est vide,
  // les premières matières annoncées « Bientôt ».
  const { visibles, avecSujets } = matieresEnAvant(listes.matieres, (id) => chiffres.parMatiere[id]?.sujets ?? 0, TUILES_MAX);
  const tuiles = visibles.length ? visibles : listes.matieres.slice(0, TUILES_MAX);

  return (
    <>
      <div className="flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-col gap-3 lg:justify-center lg:gap-5">
          <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight lg:text-5xl lg:leading-[1.05]">
            Révise, corrige, progresse.
          </h1>
          <p className="text-base leading-relaxed text-ink-2 lg:max-w-xl lg:text-[17px]">
            Sujets d'examens, corrigés, et une IA qui corrige ta copie à partir
            d'une photo. CEPE, BEPC, BAC et concours.
          </p>

          {/* Ordinateur : la recherche directement sur l'accueil. */}
          <Form method="get" action="/sujets" role="search" className="hidden flex-col gap-3 lg:flex">
            <div className="flex min-h-14 items-center gap-3 rounded-full border-2 border-control bg-soft pr-2 pl-5 focus-within:border-ink">
              <Icon name="recherche" size={22} />
              <label htmlFor="recherche" className="sr-only">
                Chercher un sujet
              </label>
              <input
                id="recherche"
                data-recherche
                name="q"
                type="search"
                placeholder="Ex. BAC 2024 maths série C"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
              />
              <Kbd label="Raccourci : barre oblique">/</Kbd>
              <button type="submit" className="min-h-11 rounded-full bg-ink px-6 text-[15px] font-bold text-white hover:bg-ink-2">
                Chercher
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <select name="examen" defaultValue="" aria-label="Examen" className={selectRecherche}>
                <option value="">Tous examens</option>
                {listes.examens.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
              <select name="matiere" defaultValue="" aria-label="Matière" className={selectRecherche}>
                <option value="">Toutes matières</option>
                {(avecSujets.length ? avecSujets : listes.matieres).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
                  </option>
                ))}
              </select>
              {annees.length ? (
                <select name="annee" defaultValue="" aria-label="Année" className={selectRecherche}>
                  <option value="">Toutes années</option>
                  {annees.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </Form>
        </div>

        <section aria-labelledby="titre-examens" className="hidden flex-col gap-3 rounded-card border-2 border-line p-6 lg:flex">
          <h2 id="titre-examens" className="text-[17px] font-bold">
            Par examen
          </h2>
          <ul className="flex flex-col gap-2.5">
            {listes.examens.map((e) => {
              const n = chiffres.parExamen[e.id]?.sujets ?? 0;
              const series = listes.series.filter((s) => s.examenId === e.id).map((s) => s.nom);
              return (
                <li key={e.id}>
                  <Link
                    to={`/sujets?examen=${e.id}`}
                    className="flex items-center gap-4 rounded-[14px] bg-soft p-3.5 hover:bg-line"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-base font-bold">{e.nom}</span>
                      {series.length ? (
                        <span className="truncate text-[13px] text-muted">Séries {series.join(", ")}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm text-ink-2 tabular-nums">
                      {n ? pluriel(n, "sujet") : "Bientôt"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section aria-labelledby="titre-matieres" className="flex flex-col gap-3 lg:gap-3.5">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="titre-matieres" className="text-base font-bold lg:text-xl">
            <span className="lg:hidden">Choisis une matière</span>
            <span className="hidden lg:inline">Matières</span>
          </h2>
          <Link to="/sujets" className="hidden text-sm text-muted underline-offset-4 hover:underline lg:inline">
            Tout le catalogue
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-3 lg:gap-3 xl:grid-cols-5 2xl:grid-cols-6">
          {tuiles.map((m) => {
            const c = chiffres.parMatiere[m.id];
            return (
              <li key={m.id}>
                <Link
                  to={`/sujets?matiere=${m.id}`}
                  className={`${TUILES[m.couleur]} flex h-full min-h-24 flex-col justify-end gap-0.5 rounded-tile p-4 text-ink lg:min-h-30 lg:p-[18px]`}
                >
                  <Pictogramme id={m.icone} taille={26} className="mb-auto" />
                  <span className="text-base font-bold break-words hyphens-auto lg:text-[17px] xl:text-base 2xl:text-[17px]">{m.nom}</span>
                  <span className="text-xs tabular-nums lg:text-[13px]">
                    {c?.sujets
                      ? `${pluriel(c.sujets, "sujet")}${c.corriges ? ` · ${pluriel(c.corriges, "corrigé")}` : ""}`
                      : "Bientôt"}
                  </span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              to={avecSujets.length > tuiles.length ? "/sujets?matieres=toutes" : "/sujets"}
              className="flex h-full min-h-24 flex-col justify-end rounded-tile bg-soft p-4 text-base font-bold text-ink lg:min-h-30 lg:p-[18px] lg:text-[17px]"
            >
              Toutes les matières
            </Link>
          </li>
        </ul>
      </section>

      <ButtonLink to="/sujets" className="min-h-14 w-full lg:hidden">
        Voir les sujets
      </ButtonLink>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start lg:gap-8">
        <section aria-labelledby="titre-derniers" className="hidden min-w-0 flex-col gap-3.5 lg:flex">
          <h2 id="titre-derniers" className="text-xl font-bold">
            Derniers sujets publiés
          </h2>
          {derniers.length ? (
            <TableSujets sujets={derniers} listes={listes} legende="Derniers sujets publiés" />
          ) : (
            <EmptyState title="Le catalogue se remplit">
              <p>Les premiers sujets et corrigés arrivent bientôt : CEPE, BEPC, BAC et concours.</p>
            </EmptyState>
          )}
        </section>

        <div className="flex flex-col gap-4">
          <section aria-labelledby="titre-bientot" className="flex flex-col gap-3 rounded-tile bg-soft p-5">
            <h2 id="titre-bientot" className="text-base font-bold">
              En préparation
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-ink-2">
              {A_VENIR.map((texte) => (
                <li key={texte} className="flex items-center gap-2">
                  <span aria-hidden="true" className="size-2.5 shrink-0 rounded-[3px] bg-control" />
                  {texte}
                </li>
              ))}
            </ul>
          </section>
          <section aria-labelledby="titre-raccourcis" className="hidden flex-col gap-3 rounded-tile border-2 border-line p-5 lg:flex">
            <h2 id="titre-raccourcis" className="text-base font-bold">
              Raccourcis clavier
            </h2>
            <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2.5 text-sm text-ink-2">
              <dt>
                <Kbd>/</Kbd>
              </dt>
              <dd>Chercher un sujet</dd>
              <dt className="flex gap-1">
                <Kbd label="Flèche haut">↑</Kbd>
                <Kbd label="Flèche bas">↓</Kbd>
              </dt>
              <dd>Parcourir les résultats</dd>
              <dt>
                <Kbd>C</Kbd>
              </dt>
              <dd>Corrigé à côté de l'énoncé</dd>
            </dl>
          </section>
        </div>
      </div>

      <LiensLegaux />
    </>
  );
}
