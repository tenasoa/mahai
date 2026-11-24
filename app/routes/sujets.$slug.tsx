import { Link } from "react-router";

import type { Route } from "./+types/sujets.$slug";
import { RenduDocument } from "~/components/document/RenduDocument";
import { getDb } from "~/db/db.server";
import { chargerListes, sujetPublie } from "~/lib/catalogue/catalogue.server";
import { duree } from "~/lib/catalogue/formulaire";
import { totalPoints } from "~/lib/document/nettoyer";
import { TUILES } from "~/lib/couleurs";

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

  return {
    sujet: { ...sujet, recherche: undefined },
    examen: listes.examens.find((e) => e.id === sujet.examenId)?.nom ?? "",
    matiere: listes.matieres.find((m) => m.id === sujet.matiereId) ?? null,
    series,
    serie,
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

export default function Sujet({ loaderData }: Route.ComponentProps) {
  const { sujet, examen, matiere, series, serie } = loaderData;
  const choisie = series.find((s) => s.id === serie);
  const coefficient = choisie ? choisie.coefficient : series.length === 0 ? sujet.coefficient : null;
  const total = totalPoints(sujet.enonce, serie);
  const d = duree(sujet.dureeMinutes);

  return (
    <>
      <Link to="/sujets" className="pas-imprime text-sm text-muted underline underline-offset-4">
        Tous les sujets
      </Link>

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
            <span aria-hidden="true" className={`${TUILES[matiere.couleur]} size-10 shrink-0 rounded-[12px]`} />
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

      <RenduDocument doc={sujet.enonce} serie={serie} series={series} />

      {sujet.corrige ? (
        <details className="group rounded-card border-2 border-line">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between px-5 font-bold">
            Voir le corrigé
            <span aria-hidden="true" className="text-muted group-open:rotate-90">
              ›
            </span>
          </summary>
          <div className="border-t-2 border-line p-5">
            <RenduDocument doc={sujet.corrige} serie={serie} series={series} />
          </div>
        </details>
      ) : null}

      <div className="pas-imprime flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex min-h-12 items-center rounded-full bg-soft px-6 font-medium hover:bg-line"
        >
          Enregistrer en PDF
        </button>
      </div>
    </>
  );
}
