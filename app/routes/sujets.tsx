import { useEffect, useRef, useState } from "react";
import { Form, Link, useFetcher, useLocation, useNavigate, useSearchParams, useSubmit } from "react-router";

import type { Route } from "./+types/sujets";
import type { MiseEnPage } from "./_app";
import type { Apercu } from "./api.apercu.$slug";
import { champRecherche } from "~/components/catalogue/recherche";
import { TableSujets, type ListesAffichage, type SujetResume } from "~/components/catalogue/TableSujets";
import { ButtonLink } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { Icon } from "~/components/ui/Icon";
import { Kbd } from "~/components/ui/Kbd";
import { getDb } from "~/db/db.server";
import {
  anneesPubliees,
  chargerListes,
  chercherSujets,
  compterFacettes,
} from "~/lib/catalogue/catalogue.server";
import { TRIS, type Tri } from "~/lib/catalogue/tri";
import { duree } from "~/lib/catalogue/formulaire";
import { motsRecherche } from "~/lib/contenu/texte";
import { TuileMatiere } from "~/components/ui/Pictogramme";
import type { Couleur } from "~/db/schema";
import { pts } from "~/lib/document/plan";

export const handle: MiseEnPage = { large: true };

export function meta({}: Route.MetaArgs) {
  return [{ title: "Sujets — Mah.ai" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const p = new URL(request.url).searchParams;
  const db = getDb();
  const listes = await chargerListes(db);
  const garder = (id: string | null, liste: { id: string }[]) =>
    id && liste.some((x) => x.id === id) ? id : null;
  const annee = Number(p.get("annee"));
  const page = Math.max(0, Math.min(500, Number(p.get("page")) || 0));
  const tri = p.get("tri");
  const filtres = {
    mots: motsRecherche(p.get("q") ?? ""),
    examenId: garder(p.get("examen"), listes.examens),
    matiereId: garder(p.get("matiere"), listes.matieres),
    serieId: garder(p.get("serie"), listes.series),
    annee: Number.isInteger(annee) && annee > 1900 ? annee : null,
    corrige: p.get("corrige") === "1",
    tri: (TRIS as readonly string[]).includes(tri ?? "") ? (tri as Tri) : "recent",
    page,
  };
  const [resultats, annees, compteurs] = await Promise.all([
    chercherSujets(db, filtres),
    anneesPubliees(db),
    compterFacettes(db, filtres),
  ]);
  return { listes, annees, filtres, compteurs, ...resultats };
}

type Donnees = Route.ComponentProps["loaderData"];

const selectFiltre =
  "min-h-11 min-w-0 flex-[1_1_9rem] rounded-full border-2 border-line bg-surface px-3 text-sm";

const nomDe = (liste: { id: string; nom: string }[], id: string) => liste.find((x) => x.id === id)?.nom ?? "";

const pluriel = (n: number, mot: string) => `${n} ${mot}${n > 1 ? "s" : ""}`;

const LIBELLES_TRI: Record<Tri, string> = { recent: "Plus récents", matiere: "Par matière", duree: "Plus courts" };

const surOrdinateur = () => window.matchMedia("(min-width: 1024px)").matches;

export default function Sujets({ loaderData }: Route.ComponentProps) {
  const { filtres, suivante } = loaderData;
  const [params] = useSearchParams();
  const location = useLocation();

  // Venu par la touche « / » depuis une autre page : le curseur va dans la recherche.
  useEffect(() => {
    if ((location.state as { chercher?: boolean } | null)?.chercher) champRecherche()?.focus();
  }, [location.state]);

  const lienPage = (page: number) => {
    const suite = new URLSearchParams(params);
    if (page > 0) suite.set("page", String(page));
    else suite.delete("page");
    return `?${suite}`;
  };

  return (
    <>
      <Telephone donnees={loaderData} />
      <Ordinateur donnees={loaderData} />

      {filtres.page > 0 || suivante ? (
        <nav aria-label="Pages" className="flex justify-between gap-3 lg:justify-end">
          {filtres.page > 0 ? (
            <Link to={lienPage(filtres.page - 1)} className="min-h-11 rounded-full bg-soft px-5 py-2.5 text-sm font-medium hover:bg-line">
              Précédents
            </Link>
          ) : (
            <span className="lg:hidden" />
          )}
          {suivante ? (
            <Link to={lienPage(filtres.page + 1)} className="min-h-11 rounded-full bg-soft px-5 py-2.5 text-sm font-medium hover:bg-line">
              Suivants
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}

function filtreActif(f: Donnees["filtres"]) {
  return Boolean(f.mots.length || f.examenId || f.matiereId || f.serieId || f.annee || f.corrige);
}

function Vide({ filtre }: { filtre: boolean }) {
  return (
    <EmptyState title={filtre ? "Aucun sujet trouvé" : "Le catalogue se remplit"}>
      {filtre ? (
        <p>Essaie avec moins de mots ou sans filtre. De nouveaux sujets arrivent régulièrement.</p>
      ) : (
        <p>Les premiers sujets et corrigés arrivent bientôt : CEPE, BEPC, BAC et concours.</p>
      )}
    </EmptyState>
  );
}

/* ---------- Téléphone : recherche, listes déroulantes, cartes ---------- */

function Telephone({ donnees }: { donnees: Donnees }) {
  const { listes, annees, filtres, sujets } = donnees;
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const seriesExamen = filtres.examenId
    ? listes.series.filter((s) => s.examenId === filtres.examenId)
    : listes.series;

  // La matière choisie reste visible dans la bande qui défile.
  const bande = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const ul = bande.current;
    const actif = ul?.querySelector<HTMLElement>("[aria-current]");
    if (ul && actif) ul.scrollLeft = actif.offsetLeft - (ul.clientWidth - actif.offsetWidth) / 2;
  }, [filtres.matiereId]);

  return (
    <div className="flex flex-col gap-5 lg:hidden">
      <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">Sujets</h1>

      {/* Formulaire GET : la recherche et les filtres marchent sans JavaScript. */}
      <Form key={params.toString()} method="get" role="search" className="flex flex-col gap-3">
        <label htmlFor="recherche-mobile" className="sr-only">
          Chercher un sujet
        </label>
        <div className="flex min-h-13 items-center gap-2.5 rounded-full border-2 border-control bg-soft px-4 focus-within:border-ink">
          <Icon name="recherche" size={20} />
          <input
            id="recherche-mobile"
            data-recherche
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Ex. BAC 2024 maths"
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select name="examen" defaultValue={filtres.examenId ?? ""} aria-label="Examen" className={selectFiltre}>
            <option value="">Tous examens</option>
            {listes.examens.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
          {seriesExamen.length > 0 ? (
            <select name="serie" defaultValue={filtres.serieId ?? ""} aria-label="Série" className={selectFiltre}>
              <option value="">Toutes séries</option>
              {seriesExamen.map((s) => (
                <option key={s.id} value={s.id}>
                  {filtres.examenId ? "" : `${nomDe(listes.examens, s.examenId)} `}
                  {s.nom}
                </option>
              ))}
            </select>
          ) : null}
          {annees.length > 0 ? (
            <select name="annee" defaultValue={filtres.annee ?? ""} aria-label="Année" className={selectFiltre}>
              <option value="">Toutes années</option>
              {annees.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          ) : null}
          {filtres.matiereId ? <input type="hidden" name="matiere" value={filtres.matiereId} /> : null}
          <button type="submit" className="min-h-11 grow rounded-full border-2 border-ink px-5 text-sm font-bold">
            Filtrer
          </button>
        </div>
      </Form>

      <nav aria-label="Filtrer par matière" className="-mx-5">
        <ul ref={bande} className="relative flex snap-x gap-1 overflow-x-auto scroll-px-5 px-5 [scrollbar-width:none]">
          {listes.matieres.map((m) => {
            const actif = filtres.matiereId === m.id;
            const suite = new URLSearchParams(params);
            suite.delete("page");
            if (actif) suite.delete("matiere");
            else suite.set("matiere", m.id);
            const lien = suite.toString();
            return (
              <li key={m.id} className="w-19 shrink-0 snap-start">
                <Link
                  to={lien ? `?${lien}` : "."}
                  aria-current={actif ? "true" : undefined}
                  className={`flex h-full flex-col items-center gap-1.5 rounded-2xl border-2 px-0.5 py-2 text-center text-[11px] leading-tight break-words hyphens-auto ${
                    actif ? "border-ink bg-soft font-bold" : "border-transparent"
                  }`}
                >
                  <TuileMatiere couleur={m.couleur} icone={m.icone} taille={36} />
                  {m.nom}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {sujets.length === 0 ? (
        <Vide filtre={filtreActif(filtres)} />
      ) : (
        <ul className="flex flex-col gap-2.5">
          {sujets.map((s) => {
            const matiere = listes.matieres.find((m) => m.id === s.matiereId);
            const series = s.series.map((id) => nomDe(listes.series, id)).filter(Boolean);
            const d = duree(s.dureeMinutes);
            return (
              <li key={s.id}>
                <Link
                  to={`/sujets/${s.slug}`}
                  className="flex items-center gap-3 rounded-card border-2 border-line p-4 hover:border-control"
                >
                  <TuileMatiere couleur={matiere?.couleur} icone={matiere?.icone} taille={44} />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-bold">{s.titre}</span>
                    <span className="text-sm text-muted">
                      {[
                        `${nomDe(listes.examens, s.examenId)}${s.annee ? ` ${s.annee}` : ""}`,
                        series.length ? `Série ${series.join(", ")}` : null,
                        matiere?.nom,
                        d,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  <Icon name="suivant" size={20} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- Ordinateur : filtres avec compteurs, tableau, aperçu ---------- */

function Ordinateur({ donnees }: { donnees: Donnees }) {
  const { listes, filtres, sujets, compteurs } = donnees;
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [choisi, setChoisi] = useState(0);
  const q = params.get("q") ?? "";

  // Nouvelle recherche : l'aperçu revient au premier résultat.
  const cle = params.toString();
  useEffect(() => setChoisi(0), [cle]);

  // ↑ ↓ parcourent les résultats, Entrée ouvre le sujet choisi.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (!surOrdinateur() || e.altKey || e.ctrlKey || e.metaKey || sujets.length === 0) return;
      const actif = document.activeElement;
      const libre = !actif || actif === document.body || actif.closest("[data-resultats]");
      if (!libre) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setChoisi((i) => Math.max(0, Math.min(sujets.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))));
      } else if (e.key === "Enter" && (actif === document.body || !actif)) {
        const s = sujets[Math.min(choisi, sujets.length - 1)];
        if (s) navigate(`/sujets/${s.slug}`);
      }
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [sujets, choisi, navigate]);

  const garde = (sauf: string[]) =>
    [...params.entries()].filter(([k, v]) => v && !sauf.includes(k) && k !== "page");

  const sujet = sujets[Math.min(choisi, sujets.length - 1)];

  return (
    <div className="hidden flex-col gap-6 lg:flex">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl leading-none font-extrabold tracking-tight">Sujets</h1>
          <p className="text-sm text-muted tabular-nums" aria-live="polite">
            {compteurs.total ? `${pluriel(compteurs.total, "sujet")} ${compteurs.total > 1 ? "trouvés" : "trouvé"}` : "Aucun sujet"}
          </p>
        </div>
        <Form method="get" role="search" className="w-full max-w-xl">
          {garde(["q"]).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <label htmlFor="recherche" className="sr-only">
            Chercher un sujet
          </label>
          <div className="flex min-h-13 items-center gap-3 rounded-full border-2 border-control bg-soft pr-2 pl-5 focus-within:border-ink">
            <Icon name="recherche" size={20} />
            <input
              id="recherche"
              data-recherche
              name="q"
              type="search"
              defaultValue={q}
              key={q}
              placeholder="Ex. BAC 2024 maths série C"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted"
            />
            <Kbd label="Raccourci : barre oblique">/</Kbd>
            <button type="submit" className="min-h-10 rounded-full bg-surface px-5 text-sm font-medium hover:bg-line">
              Chercher
            </button>
          </div>
        </Form>
      </div>

      <MatieresEnTuiles listes={listes} filtres={filtres} compteurs={compteurs} />

      <div className="grid grid-cols-[13.5rem_minmax(0,1fr)] items-start gap-8 xl:grid-cols-[13.5rem_minmax(0,1fr)_20rem] xl:gap-6">
        <Filtres key={params.toString()} listes={listes} filtres={filtres} compteurs={compteurs} q={q} />

        <section aria-label="Résultats" data-resultats className="flex min-w-0 flex-col gap-3">
          {sujets.length === 0 ? (
            <Vide filtre={filtreActif(filtres)} />
          ) : (
            <>
              <TableSujets
                sujets={sujets as SujetResume[]}
                listes={listes as ListesAffichage}
                choisi={choisi}
                surChoix={setChoisi}
                legende="Sujets trouvés"
                compact
              />
              <p className="hidden items-center gap-1.5 text-xs text-muted xl:flex">
                <Kbd label="Flèche haut">↑</Kbd>
                <Kbd label="Flèche bas">↓</Kbd>
                pour parcourir,
                <Kbd>Entrée</Kbd>
                pour ouvrir
              </p>
            </>
          )}
        </section>

        {sujet ? <Apercu sujet={sujet as SujetResume} listes={listes as ListesAffichage} /> : null}
      </div>
    </div>
  );
}

function Filtres({
  listes,
  filtres,
  compteurs,
  q,
}: {
  listes: Donnees["listes"];
  filtres: Donnees["filtres"];
  compteurs: Donnees["compteurs"];
  q: string;
}) {
  const submit = useSubmit();
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);

  const series = filtres.examenId
    ? listes.series.filter((s) => s.examenId === filtres.examenId)
    : listes.series.filter((s) => compteurs.series[s.id] || s.id === filtres.serieId);
  const annees = Object.keys(compteurs.annees)
    .map(Number)
    .sort((a, b) => b - a);
  if (filtres.annee && !annees.includes(filtres.annee)) annees.unshift(filtres.annee);

  return (
    <Form
      method="get"
      aria-label="Filtres"
      onChange={(e) => {
        // Changer d'examen remet la série à zéro (elle n'appartient plus forcément à l'examen).
        const cible = e.target as unknown as HTMLInputElement;
        const donnees = new FormData(e.currentTarget);
        if (cible.name === "examen") donnees.delete("serie");
        for (const [k, v] of [...donnees.entries()]) if (!v || (k === "tri" && v === "recent")) donnees.delete(k);
        submit(donnees, { method: "get", preventScrollReset: true });
      }}
      className="flex min-w-0 flex-col gap-6"
    >
      {q ? <input type="hidden" name="q" value={q} /> : null}

      <Groupe titre="Examen" nom="examen" valeur={filtres.examenId}
        options={listes.examens.map((e) => ({ id: e.id, nom: e.nom, n: compteurs.examens[e.id] ?? 0 }))} />

      {series.length ? (
        <Groupe titre="Série" nom="serie" valeur={filtres.serieId}
          options={series.map((s) => ({
            id: s.id,
            nom: filtres.examenId ? s.nom : `${nomDe(listes.examens, s.examenId)} ${s.nom}`,
            n: compteurs.series[s.id] ?? 0,
          }))} />
      ) : null}

      {filtres.matiereId ? <input type="hidden" name="matiere" value={filtres.matiereId} /> : null}

      {annees.length ? (
        <Groupe titre="Année" nom="annee" valeur={filtres.annee ? String(filtres.annee) : null}
          options={annees.map((a) => ({ id: String(a), nom: String(a), n: compteurs.annees[String(a)] ?? 0 }))} />
      ) : null}

      <fieldset className="flex min-w-0 flex-col gap-2.5">
        <legend className="mb-2 text-xs font-medium text-muted">Affichage</legend>
        <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name="corrige" value="1" defaultChecked={filtres.corrige} className="size-4.5 accent-ink" />
          Avec corrigé seulement
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-xs text-muted">Trier</span>
          <select name="tri" defaultValue={filtres.tri} className="min-h-10 rounded-full border-2 border-line bg-surface px-3 text-sm">
            {TRIS.map((t) => (
              <option key={t} value={t}>
                {LIBELLES_TRI[t]}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        {js ? null : (
          <button type="submit" className="min-h-10 rounded-full border-2 border-ink px-5 text-sm font-bold">
            Appliquer
          </button>
        )}
        {filtreActif({ ...filtres, mots: [] }) ? (
          <Link to={q ? `/sujets?q=${encodeURIComponent(q)}` : "/sujets"} className="text-sm text-ink-2 underline underline-offset-4">
            Effacer les filtres
          </Link>
        ) : null}
      </div>
    </Form>
  );
}

/** Ordinateur : les matières en tuiles (pictogramme, nom, nombre de sujets) au-dessus des résultats. */
function MatieresEnTuiles({
  listes,
  filtres,
  compteurs,
}: {
  listes: Donnees["listes"];
  filtres: Donnees["filtres"];
  compteurs: Donnees["compteurs"];
}) {
  const [params] = useSearchParams();
  const lien = (id: string | null) => {
    const suite = new URLSearchParams(params);
    suite.delete("page");
    if (id) suite.set("matiere", id);
    else suite.delete("matiere");
    const texte = suite.toString();
    return texte ? `?${texte}` : "/sujets";
  };
  const total = Object.values(compteurs.matieres).reduce((a, n) => a + n, 0);
  const tuile = (actif: boolean, vide: boolean) =>
    `flex min-h-12 items-center gap-2.5 rounded-2xl border-2 py-1.5 pr-3.5 pl-1.5 text-sm ${
      actif ? "border-ink bg-soft font-bold" : `border-line hover:border-control ${vide ? "text-muted" : ""}`
    }`;
  return (
    <nav aria-label="Filtrer par matière">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link to={lien(null)} preventScrollReset aria-current={!filtres.matiereId ? "true" : undefined} className={tuile(!filtres.matiereId, false)}>
            <span aria-hidden="true" className="grid size-9 grid-cols-2 gap-0.5 p-1.5">
              <span className="rounded-[3px] bg-maths" />
              <span className="rounded-[3px] bg-histoire" />
              <span className="rounded-[3px] bg-francais" />
              <span className="rounded-[3px] bg-svt" />
            </span>
            Toutes
            <span className="text-xs font-normal text-muted tabular-nums">{total}</span>
          </Link>
        </li>
        {listes.matieres.map((m) => {
          const actif = filtres.matiereId === m.id;
          const n = compteurs.matieres[m.id] ?? 0;
          return (
            <li key={m.id}>
              <Link to={lien(actif ? null : m.id)} preventScrollReset aria-current={actif ? "true" : undefined} className={tuile(actif, n === 0)}>
                <TuileMatiere couleur={m.couleur} icone={m.icone} taille={36} />
                {m.nom}
                <span className="text-xs font-normal text-muted tabular-nums">{n}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Un filtre à choix unique, avec le nombre de sujets que donnerait chaque choix. */
function Groupe({
  titre,
  nom,
  valeur,
  options,
}: {
  titre: string;
  nom: string;
  valeur: string | null | undefined;
  options: { id: string; nom: string; n: number; couleur?: Couleur; icone?: string | null }[];
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-0.5">
      <legend className="mb-2 text-xs font-medium text-muted">{titre}</legend>
      {[{ id: "", nom: "Tous", n: -1 }, ...options].map((o) => {
        const coche = (valeur ?? "") === o.id;
        return (
          <label
            key={o.id || "tous"}
            className={`flex min-h-9 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-sm has-focus-visible:outline-2 has-focus-visible:outline-ink ${
              coche ? "bg-soft font-bold" : o.n === 0 ? "text-muted hover:bg-soft/60" : "hover:bg-soft/60"
            }`}
          >
            <input type="radio" name={nom} value={o.id} defaultChecked={coche} className="sr-only" />
            {"couleur" in o && o.couleur ? <TuileMatiere couleur={o.couleur} icone={o.icone} taille={22} /> : null}
            <span className="min-w-0 flex-1 truncate">{o.nom}</span>
            {o.n >= 0 ? <span className="text-xs text-muted tabular-nums">{o.n}</span> : null}
          </label>
        );
      })}
    </fieldset>
  );
}

/* ---------- Aperçu du sujet choisi (grand écran) ---------- */

function Apercu({ sujet, listes }: { sujet: SujetResume; listes: ListesAffichage }) {
  const fetcher = useFetcher<Apercu>();
  const { load } = fetcher;
  useEffect(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) load(`/api/apercu/${sujet.slug}`);
  }, [sujet.slug, load]);

  const matiere = listes.matieres.find((m) => m.id === sujet.matiereId);
  const donnees = fetcher.data?.slug === sujet.slug ? fetcher.data : null;
  const d = duree(sujet.dureeMinutes);
  const series = sujet.series.map((id) => nomDe(listes.series, id)).filter(Boolean);

  return (
    <aside aria-label="Aperçu du sujet" className="sticky top-8 hidden flex-col gap-5 rounded-card border-2 border-line p-5 xl:flex">
      <div className="flex items-start gap-3">
        <TuileMatiere couleur={matiere?.couleur} icone={matiere?.icone} taille={44} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[13px] text-muted">
            {nomDe(listes.examens, sujet.examenId)}
            {sujet.annee ? ` ${sujet.annee}` : ""}
            {series.length ? ` · Série ${series.join(", ")}` : ""}
          </p>
          <h2 className="text-lg leading-snug font-bold">{sujet.titre}</h2>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div className="flex flex-col rounded-xl bg-soft p-3">
          <dt className="text-xs text-muted">Durée</dt>
          <dd className="font-bold tabular-nums">{d ?? "—"}</dd>
        </div>
        <div className="flex flex-col rounded-xl bg-soft p-3">
          <dt className="text-xs text-muted">Coef.</dt>
          <dd className="font-bold tabular-nums">
            {donnees ? (donnees.coefficient ?? (donnees.coefficients.join(" / ") || "—")) : "…"}
          </dd>
        </div>
        <div className="flex flex-col rounded-xl bg-soft p-3">
          <dt className="text-xs text-muted">Barème</dt>
          <dd className="font-bold tabular-nums">{donnees ? (donnees.total !== null ? pts(donnees.total) : "—") : "…"}</dd>
        </div>
      </dl>

      <section aria-label="Plan du sujet" className="flex flex-col gap-2">
        <h3 className="text-xs font-medium text-muted">Plan</h3>
        {!donnees ? (
          <p className="text-sm text-muted">{fetcher.state === "loading" ? "Chargement…" : "—"}</p>
        ) : donnees.plan.length ? (
          <ol className="flex flex-col gap-1.5 text-sm">
            {donnees.plan.map((e) => (
              <li key={e.id} className={`flex items-baseline gap-3 ${e.genre === "partie" ? "pt-1 font-bold" : ""}`}>
                <span className="min-w-0 flex-1">{e.titre}</span>
                {e.points !== null ? <span className="shrink-0 text-xs text-muted tabular-nums">{pts(e.points)}</span> : null}
              </li>
            ))}
          </ol>
        ) : donnees.questions ? (
          <p className="text-sm text-ink-2">{pluriel(donnees.questions, "question")}</p>
        ) : (
          <p className="text-sm text-muted">Pas de plan détaillé pour ce sujet.</p>
        )}
        {donnees ? (
          <p className="text-[13px] text-muted">{donnees.aCorrige ? "Corrigé disponible" : "Corrigé pas encore disponible"}</p>
        ) : null}
      </section>

      <div className="flex flex-col gap-2">
        <ButtonLink to={`/sujets/${sujet.slug}`} className="w-full">
          Lire le sujet
        </ButtonLink>
        {sujet.dureeMinutes ? (
          <Link
            to={`/sujets/${sujet.slug}?mode=examen`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-soft px-6 font-medium hover:bg-line"
          >
            <Icon name="chrono" size={18} />
            S'entraîner chronométré
          </Link>
        ) : null}
      </div>
    </aside>
  );
}

