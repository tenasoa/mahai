import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";

import type { Route } from "./+types/sujets.$slug";
import type { MiseEnPage } from "./_app";
import { RenduDocument } from "~/components/document/RenduDocument";
import { Icon } from "~/components/ui/Icon";
import { Kbd } from "~/components/ui/Kbd";
import { getDb } from "~/db/db.server";
import { chargerListes, sujetPublie, sujetsVoisins } from "~/lib/catalogue/catalogue.server";
import { duree } from "~/lib/catalogue/formulaire";
import { champSaisi, ecrireLocal, lireLocal } from "~/lib/clavier";
import { ajouterRecent, cleExamen, EVENEMENT_RECENTS } from "~/lib/recents";
import { totalPoints } from "~/lib/document/nettoyer";
import { planDocument, pts, type EntreePlan } from "~/lib/document/plan";
import { TuileMatiere } from "~/components/ui/Pictogramme";

/** « Maths » → « maths », mais un sigle (SVT, POO) garde ses majuscules. */
const enMinuscule = (nom: string) => (/^\p{Lu}\p{Ll}/u.test(nom) ? nom[0]!.toLocaleLowerCase("fr") + nom.slice(1) : nom);

export const handle: MiseEnPage = { large: true, rail: true };

export async function loader({ request, params }: Route.LoaderArgs) {
  const db = getDb();
  const [sujet, listes] = await Promise.all([sujetPublie(db, params.slug), chargerListes(db)]);
  if (!sujet) throw new Response("Sujet introuvable", { status: 404 });

  const series = sujet.series
    .map((s) => {
      const info = listes.series.find((x) => x.id === s.serieId);
      return info ? { id: info.id, nom: info.nom, coefficient: s.coefficient } : null;
    })
    .filter((s) => s !== null);
  const demandee = new URL(request.url).searchParams.get("serie");
  const serie = series.find((s) => s.id === demandee)?.id ?? (series.length === 1 ? series[0]!.id : null);
  const voisins = await sujetsVoisins(db, sujet);

  return {
    sujet: { ...sujet, recherche: undefined },
    examen: listes.examens.find((e) => e.id === sujet.examenId)?.nom ?? "",
    matiere: listes.matieres.find((m) => m.id === sujet.matiereId) ?? null,
    series,
    serie,
    plan: planDocument(sujet.enonce, serie),
    baremes: series.map((s) => ({ ...s, total: totalPoints(sujet.enonce, s.id) })),
    voisins: voisins.map((v) => ({
      ...v,
      examen: listes.examens.find((e) => e.id === v.examenId)?.nom ?? "",
    })),
  };
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  if (!data) return [{ title: "Sujet introuvable — Mah.ai" }];
  const { sujet, examen } = data;
  const titre = `${sujet.titre} — ${examen}${sujet.annee ? ` ${sujet.annee}` : ""}`;
  return [
    { title: `${titre} — Mah.ai` },
    { name: "description", content: `Sujet ${titre}${sujet.corrige ? " avec corrigé" : ""}, sur Mah.ai.` },
  ];
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-bold">{children}</dd>
    </div>
  );
}

const CLE_A_COTE = "mahai:corrige-a-cote";
const cleNotes = (slug: string) => `mahai:notes:${slug}`;

const surOrdinateur = () => window.matchMedia("(min-width: 1024px)").matches;

/** « 3:05:09 », « 42:10 ». */
function chrono(secondes: number) {
  const s = Math.max(0, Math.floor(secondes));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const deux = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${deux(m)}:${deux(s % 60)}` : `${m}:${deux(s % 60)}`;
}

/**
 * Mode examen : un compte à rebours de la durée de l'épreuve, gardé sur cet appareil (on peut
 * recharger la page) ; le corrigé reste masqué jusqu'à la fin. `?mode=examen` le démarre.
 */
function useModeExamen(slug: string, dureeMinutes: number | null) {
  const [debut, setDebut] = useState<number | null>(null);
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [params, setParams] = useSearchParams();

  useEffect(() => {
    const garde = Number(lireLocal(cleExamen(slug)));
    if (garde > 0) setDebut(garde);
    else setDebut(null);
  }, [slug]);

  const demander = params.get("mode") === "examen";
  useEffect(() => {
    if (!demander) return;
    if (dureeMinutes && !lireLocal(cleExamen(slug))) {
      const t = Date.now();
      ecrireLocal(cleExamen(slug), String(t));
      setDebut(t);
      window.dispatchEvent(new Event(EVENEMENT_RECENTS));
    }
    const suite = new URLSearchParams(params);
    suite.delete("mode");
    setParams(suite, { replace: true, preventScrollReset: true });
  }, [demander, dureeMinutes, slug, params, setParams]);

  useEffect(() => {
    if (debut === null) return;
    setMaintenant(Date.now());
    const minuterie = window.setInterval(() => setMaintenant(Date.now()), 1000);
    return () => window.clearInterval(minuterie);
  }, [debut]);

  const demarrer = () => {
    const t = Date.now();
    ecrireLocal(cleExamen(slug), String(t));
    setDebut(t);
    window.dispatchEvent(new Event(EVENEMENT_RECENTS));
    window.scrollTo({ top: 0 });
  };
  const arreter = () => {
    ecrireLocal(cleExamen(slug), null);
    setDebut(null);
    window.dispatchEvent(new Event(EVENEMENT_RECENTS));
  };
  const restant = debut !== null && dureeMinutes ? (debut + dureeMinutes * 60_000 - maintenant) / 1000 : null;
  return { actif: debut !== null && dureeMinutes !== null, restant, demarrer, arreter };
}

export default function Sujet({ loaderData }: Route.ComponentProps) {
  const { sujet, examen, matiere, series, serie, plan, baremes, voisins } = loaderData;
  const choisie = series.find((s) => s.id === serie);
  const coefficient = choisie ? choisie.coefficient : series.length === 0 ? sujet.coefficient : null;
  const total = totalPoints(sujet.enonce, serie);
  const d = duree(sujet.dureeMinutes);
  const mode = useModeExamen(sujet.slug, sujet.dureeMinutes);
  const corrige = mode.actif ? null : sujet.corrige;

  // Barre latérale « Récents » : ce sujet passe en tête.
  useEffect(() => {
    ajouterRecent({
      slug: sujet.slug,
      titre: sujet.titre,
      matiereId: sujet.matiereId,
      examen: `${examen}${sujet.annee ? ` ${sujet.annee}` : ""}`,
      dureeMinutes: sujet.dureeMinutes,
    });
  }, [sujet.slug, sujet.titre, sujet.matiereId, sujet.annee, sujet.dureeMinutes, examen]);

  // Corrigé à côté de l'énoncé (ordinateur) : préférence gardée, touche C.
  const [aCote, setACote] = useState(false);
  useEffect(() => setACote(lireLocal(CLE_A_COTE) === "1"), []);
  const basculer = () =>
    setACote((v) => {
      ecrireLocal(CLE_A_COTE, v ? null : "1");
      return !v;
    });
  useEffect(() => {
    if (!sujet.corrige || mode.actif) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "c" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (champSaisi(document.activeElement) || !surOrdinateur()) return;
      e.preventDefault();
      basculer();
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [sujet.corrige, mode.actif]);
  const deuxColonnes = aCote && corrige !== null;

  return (
    <div className="flex flex-col gap-5">
      {/* Ordinateur : barre d'outils de lecture. */}
      <div className="pas-imprime sticky top-0 z-10 -mx-2 hidden items-center gap-3 bg-surface px-2 py-3 lg:flex">
        <Link to="/sujets" className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-soft hover:text-ink">
          <Icon name="retour" size={18} />
          Tous les sujets
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {sujet.corrige && !mode.actif ? (
            <button
              type="button"
              aria-pressed={aCote}
              onClick={basculer}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-medium ${
                aCote ? "border-ink bg-soft" : "border-line hover:border-control"
              }`}
            >
              <Icon name="colonnes" size={18} />
              Corrigé à côté
              <Kbd>C</Kbd>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 items-center rounded-full bg-soft px-4 text-sm font-medium hover:bg-line"
          >
            Enregistrer en PDF
          </button>
          {sujet.dureeMinutes && !mode.actif ? (
            <button
              type="button"
              onClick={mode.demarrer}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 text-sm font-bold text-white hover:bg-ink-2"
            >
              <Icon name="chrono" size={18} />
              Mode examen
            </button>
          ) : null}
        </div>
      </div>

      <Link to="/sujets" className="pas-imprime text-sm text-muted underline underline-offset-4 lg:hidden">
        Tous les sujets
      </Link>

      {mode.actif && mode.restant !== null ? (
        <div
          role="status"
          className="pas-imprime flex flex-wrap items-center gap-x-4 gap-y-2 rounded-card bg-a-revoir px-5 py-3.5 lg:sticky lg:top-[4.25rem] lg:z-10"
        >
          <Icon name="chrono" size={22} />
          <p className="flex flex-col">
            <span className="font-bold">{mode.restant > 0 ? "Mode examen" : "Temps écoulé"}</span>
            <span className="text-sm">
              {mode.restant > 0 ? "Le corrigé est masqué jusqu'à la fin." : "Pose ton stylo : tu peux voir le corrigé."}
            </span>
          </p>
          <span className="text-2xl font-extrabold tabular-nums" aria-label={`Temps restant : ${chrono(mode.restant)}`}>
            {chrono(mode.restant)}
          </span>
          <button
            type="button"
            onClick={mode.arreter}
            className="ml-auto inline-flex min-h-11 items-center rounded-full bg-surface px-5 text-sm font-medium"
          >
            {mode.restant > 0 ? "Arrêter" : "Voir le corrigé"}
          </button>
        </div>
      ) : null}

      <div
        className={`flex flex-col gap-5 print:block lg:grid lg:items-start lg:gap-8 ${
          deuxColonnes ? "lg:grid-cols-[13rem_minmax(0,1fr)]" : "lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_17rem]"
        }`}
      >
        <Sommaire plan={plan} total={total} decalage={mode.actif} />

        <div className="flex min-w-0 flex-col gap-5">
          {/* En-tête de l'épreuve, construit à partir des informations du sujet. */}
          <header className="flex flex-col gap-4 rounded-card border-2 border-ink p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold">
                  {examen}
                  {sujet.session ? ` · ${sujet.session}` : ""}
                  {sujet.annee ? ` · Session ${sujet.annee}` : ""}
                </p>
                <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-tight">{sujet.titre}</h1>
              </div>
              {matiere ? (
                <TuileMatiere couleur={matiere.couleur} icone={matiere.icone} taille={44} />
              ) : null}
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              {matiere ? <Info label="Épreuve">{matiere.nom}</Info> : null}
              {series.length ? (
                <Info label={series.length > 1 ? "Séries" : "Série"}>{series.map((s) => s.nom).join(", ")}</Info>
              ) : null}
              {sujet.option ? <Info label="Option">{sujet.option}</Info> : null}
              {d ? <Info label="Durée">{d}</Info> : null}
              {coefficient ? (
                <Info label="Coefficient">{coefficient}</Info>
              ) : series.some((s) => s.coefficient) ? (
                <Info label="Coefficients">
                  {series
                    .filter((s) => s.coefficient)
                    .map((s) => `${s.nom} = ${s.coefficient}`)
                    .join(" ; ")}
                </Info>
              ) : null}
              {sujet.codeMatiere ? <Info label="Code matière">{sujet.codeMatiere}</Info> : null}
              {total !== null ? <Info label="Barème">{String(total).replace(".", ",")} points</Info> : null}
            </dl>
          </header>

          {series.length > 1 ? (
            <nav aria-label="Barème de quelle série ?" className="pas-imprime flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted">Barème de la série</span>
              {[{ id: null as string | null, nom: "Toutes" }, ...series].map((s) => {
                const actif = serie === s.id;
                return (
                  <Link
                    key={s.id ?? "toutes"}
                    to={s.id ? `?serie=${s.id}` : "."}
                    aria-current={actif ? "true" : undefined}
                    preventScrollReset
                    className={`inline-flex min-h-10 items-center rounded-full border-2 px-4 font-bold ${
                      actif ? "border-ink bg-soft" : "border-line"
                    }`}
                  >
                    {s.nom}
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {deuxColonnes ? (
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-2 lg:gap-6">
              <section aria-labelledby="titre-enonce" className="min-w-0">
                <h2 id="titre-enonce" className="pas-imprime mb-3 hidden text-xs font-medium text-muted lg:block">
                  Énoncé
                </h2>
                <RenduDocument doc={sujet.enonce} serie={serie} series={series} ancre="enonce" />
              </section>
              <section
                aria-labelledby="titre-corrige"
                className="hidden min-w-0 rounded-card bg-soft p-5 lg:block print:block print:bg-transparent print:p-0"
              >
                <h2 id="titre-corrige" className="mb-3 text-xs font-medium text-muted">
                  Corrigé
                </h2>
                <RenduDocument doc={corrige!} serie={serie} series={series} />
              </section>
            </div>
          ) : (
            <RenduDocument doc={sujet.enonce} serie={serie} series={series} ancre="enonce" />
          )}

          {corrige ? (
            <details className={`group rounded-card border-2 border-line ${deuxColonnes ? "lg:hidden" : ""}`}>
              <summary className="flex min-h-14 cursor-pointer items-center justify-between px-5 font-bold">
                Voir le corrigé
                <span aria-hidden="true" className="text-muted group-open:rotate-90">
                  ›
                </span>
              </summary>
              <div className="border-t-2 border-line p-5">
                <RenduDocument doc={corrige} serie={serie} series={series} />
              </div>
            </details>
          ) : sujet.corrige ? (
            <p className="pas-imprime rounded-card border-2 border-line p-5 text-sm text-muted">
              Le corrigé s'affichera à la fin du mode examen.
            </p>
          ) : null}

          <div className="pas-imprime flex flex-wrap gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-12 items-center rounded-full bg-soft px-6 font-medium hover:bg-line"
            >
              Enregistrer en PDF
            </button>
          </div>
        </div>

        {deuxColonnes ? null : (
          <aside aria-label="Outils de révision" className={`pas-imprime sticky hidden flex-col gap-4 xl:flex ${mode.actif ? "top-40" : "top-20"}`}>
            {baremes.length > 1 ? (
              <section aria-labelledby="titre-baremes" className="flex flex-col gap-2.5 rounded-card border-2 border-line p-4">
                <h2 id="titre-baremes" className="text-sm font-bold">
                  Par série
                </h2>
                <ul className="flex flex-col gap-1 text-sm">
                  {baremes.map((b) => (
                    <li key={b.id}>
                      <Link
                        to={`?serie=${b.id}`}
                        preventScrollReset
                        aria-current={serie === b.id ? "true" : undefined}
                        className={`flex items-center gap-2 rounded-xl px-2.5 py-2 ${serie === b.id ? "bg-soft font-bold" : "hover:bg-soft/60"}`}
                      >
                        <span className="flex-1">Série {b.nom}</span>
                        <span className="text-xs text-muted tabular-nums">
                          {[b.coefficient ? `coef. ${b.coefficient}` : null, b.total !== null ? pts(b.total) : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <Notes slug={sujet.slug} />
            {voisins.length ? (
              <section aria-labelledby="titre-voisins" className="flex flex-col gap-2.5 rounded-card border-2 border-line p-4">
                <h2 id="titre-voisins" className="text-sm font-bold">
                  {matiere ? `Autres sujets de ${enMinuscule(matiere.nom)}` : "Autres sujets"}
                </h2>
                <ul className="flex flex-col gap-1 text-sm">
                  {voisins.map((v) => (
                    <li key={v.slug}>
                      <Link to={`/sujets/${v.slug}`} prefetch="intent" className="flex flex-col rounded-xl px-2.5 py-2 hover:bg-soft">
                        <span className="font-medium">{v.titre}</span>
                        <span className="text-xs text-muted">
                          {v.examen}
                          {v.annee ? ` ${v.annee}` : ""}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        )}
      </div>
    </div>
  );
}

/** Sommaire (ordinateur) : parties, exercices et questions, avec la partie en cours de lecture. */
function Sommaire({ plan, total, decalage }: { plan: EntreePlan[]; total: number | null; decalage: boolean }) {
  const [courant, setCourant] = useState<string | null>(null);

  useEffect(() => {
    if (!surOrdinateur()) return;
    const cibles = plan
      .map((e) => document.getElementById(`enonce-${e.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (!cibles.length) return;
    const visibles = new Map<string, boolean>();
    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const e of entrees) visibles.set(e.target.id, e.isIntersecting);
        const premier = cibles.find((c) => visibles.get(c.id));
        if (premier) setCourant(premier.id.replace(/^enonce-/, ""));
      },
      { rootMargin: "-80px 0px -55% 0px" },
    );
    cibles.forEach((c) => observateur.observe(c));
    return () => observateur.disconnect();
  }, [plan]);

  if (!plan.length) return <div className="hidden lg:block" />;

  return (
    <nav
      aria-label="Sommaire du sujet"
      className={`pas-imprime sticky hidden max-h-[calc(100dvh-6rem)] flex-col gap-3 overflow-y-auto pb-4 lg:flex ${
        decalage ? "top-40" : "top-20"
      }`}
    >
      <p className="text-xs font-medium text-muted">Sommaire</p>
      <ol className="flex flex-col gap-0.5 text-sm">
        {plan.map((e) => (
          <li key={e.id}>
            <a
              href={`#enonce-${e.id}`}
              aria-current={courant === e.id ? "location" : undefined}
              className={`flex items-baseline gap-2 rounded-xl px-2.5 py-1.5 ${
                courant === e.id ? "bg-soft font-bold text-ink" : e.genre === "partie" ? "font-bold text-ink" : "text-ink-2 hover:bg-soft/60"
              }`}
            >
              <span className="min-w-0 flex-1">{e.titre}</span>
              {e.points !== null ? <span className="shrink-0 text-xs font-normal text-muted tabular-nums">{pts(e.points)}</span> : null}
            </a>
            {e.questions.length ? (
              <ol className="mb-1 ml-3 flex flex-col border-l border-line pl-2">
                {e.questions.map((q) => (
                  <li key={q.id}>
                    <a href={`#enonce-${q.id}`} className="flex items-baseline gap-2 rounded-lg px-2 py-1 text-[13px] text-muted hover:text-ink">
                      <span className="min-w-0 flex-1 truncate">{q.titre}</span>
                      {q.points !== null ? <span className="shrink-0 text-xs tabular-nums">{pts(q.points)}</span> : null}
                    </a>
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        ))}
      </ol>
      {total !== null ? (
        <p className="flex justify-between border-t border-line px-2.5 pt-3 text-sm font-bold">
          Total <span className="tabular-nums">{pts(total)}</span>
        </p>
      ) : null}
    </nav>
  );
}

/** Notes personnelles sur le sujet, gardées sur cet appareil. */
function Notes({ slug }: { slug: string }) {
  const [texte, setTexte] = useState("");
  useEffect(() => setTexte(lireLocal(cleNotes(slug)) ?? ""), [slug]);
  return (
    <section className="flex flex-col gap-2 rounded-card border-2 border-line p-4">
      <label htmlFor="mes-notes" className="text-sm font-bold">
        Mes notes
      </label>
      <textarea
        id="mes-notes"
        value={texte}
        onChange={(e) => {
          setTexte(e.target.value);
          ecrireLocal(cleNotes(slug), e.target.value || null);
        }}
        rows={6}
        maxLength={5000}
        placeholder="Formules à retenir, erreurs à éviter…"
        className="resize-y rounded-xl border-2 border-line bg-surface p-3 text-sm outline-none placeholder:text-muted focus:border-ink"
      />
      <p className="text-xs text-muted">Gardées sur cet appareil seulement.</p>
    </section>
  );
}
