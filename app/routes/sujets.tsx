import { Form, Link, useSearchParams } from "react-router";

import type { Route } from "./+types/sujets";
import { EmptyState } from "~/components/ui/EmptyState";
import { Icon } from "~/components/ui/Icon";
import { getDb } from "~/db/db.server";
import { anneesPubliees, chargerListes, chercherSujets } from "~/lib/catalogue/catalogue.server";
import { duree } from "~/lib/catalogue/formulaire";
import { motsRecherche } from "~/lib/contenu/texte";
import { TUILES } from "~/lib/couleurs";

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
  const filtres = {
    mots: motsRecherche(p.get("q") ?? ""),
    examenId: garder(p.get("examen"), listes.examens),
    matiereId: garder(p.get("matiere"), listes.matieres),
    serieId: garder(p.get("serie"), listes.series),
    annee: Number.isInteger(annee) && annee > 1900 ? annee : null,
    page,
  };
  const [resultats, annees] = await Promise.all([chercherSujets(db, filtres), anneesPubliees(db)]);
  return { listes, annees, filtres, ...resultats };
}

const selectFiltre =
  "min-h-11 min-w-0 flex-1 rounded-full border-2 border-line bg-surface px-3 text-sm";

export default function Sujets({ loaderData }: Route.ComponentProps) {
  const { listes, annees, filtres, sujets, suivante } = loaderData;
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const nom = (liste: { id: string; nom: string }[], id: string) =>
    liste.find((x) => x.id === id)?.nom ?? "";
  const seriesExamen = filtres.examenId
    ? listes.series.filter((s) => s.examenId === filtres.examenId)
    : listes.series;
  const filtre = Boolean(filtres.mots.length || filtres.examenId || filtres.matiereId || filtres.serieId || filtres.annee);

  const lienPage = (page: number) => {
    const suite = new URLSearchParams(params);
    if (page > 0) suite.set("page", String(page));
    else suite.delete("page");
    return `?${suite}`;
  };

  return (
    <>
      <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">Sujets</h1>

      {/* Formulaire GET : la recherche et les filtres marchent sans JavaScript. */}
      <Form method="get" role="search" className="flex flex-col gap-3">
        <label htmlFor="recherche" className="sr-only">
          Chercher un sujet
        </label>
        <div className="flex min-h-13 items-center gap-2.5 rounded-full border-2 border-control bg-soft px-4 focus-within:border-ink">
          <Icon name="recherche" size={20} />
          <input
            id="recherche"
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
                  {filtres.examenId ? "" : `${nom(listes.examens, s.examenId)} `}
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
          <button type="submit" className="min-h-11 rounded-full border-2 border-ink px-5 text-sm font-bold">
            Filtrer
          </button>
        </div>
      </Form>

      <nav aria-label="Filtrer par matière">
        <ul className="grid grid-cols-5 gap-2">
          {listes.matieres.map((m) => {
            const actif = filtres.matiereId === m.id;
            const suite = new URLSearchParams(params);
            suite.delete("page");
            if (actif) suite.delete("matiere");
            else suite.set("matiere", m.id);
            const lien = suite.toString();
            return (
              <li key={m.id}>
                <Link
                  to={lien ? `?${lien}` : "."}
                  aria-current={actif ? "true" : undefined}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-2 text-center text-[11px] leading-tight ${
                    actif ? "border-ink bg-soft font-bold" : "border-transparent"
                  }`}
                >
                  <span className={`${TUILES[m.couleur]} size-8 rounded-[10px]`} />
                  {m.nom}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {sujets.length === 0 ? (
        <EmptyState title={filtre ? "Aucun sujet trouvé" : "Le catalogue se remplit"}>
          {filtre ? (
            <p>Essaie avec moins de mots ou sans filtre. De nouveaux sujets arrivent régulièrement.</p>
          ) : (
            <p>Les premiers sujets et corrigés arrivent bientôt : CEPE, BEPC, BAC et concours.</p>
          )}
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {sujets.map((s) => {
            const matiere = listes.matieres.find((m) => m.id === s.matiereId);
            const series = s.series.map((id) => nom(listes.series, id)).filter(Boolean);
            const d = duree(s.dureeMinutes);
            return (
              <li key={s.id}>
                <Link
                  to={`/sujets/${s.slug}`}
                  className="flex items-center gap-3 rounded-card border-2 border-line p-4 hover:border-control"
                >
                  <span
                    aria-hidden="true"
                    className={`${matiere ? TUILES[matiere.couleur] : "bg-soft"} size-11 shrink-0 rounded-[12px]`}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-bold">{s.titre}</span>
                    <span className="text-sm text-muted">
                      {[
                        `${nom(listes.examens, s.examenId)}${s.annee ? ` ${s.annee}` : ""}`,
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

      {filtres.page > 0 || suivante ? (
        <nav aria-label="Pages" className="flex justify-between gap-3">
          {filtres.page > 0 ? (
            <Link to={lienPage(filtres.page - 1)} className="min-h-11 rounded-full bg-soft px-5 py-2.5 text-sm font-medium">
              Précédents
            </Link>
          ) : (
            <span />
          )}
          {suivante ? (
            <Link to={lienPage(filtres.page + 1)} className="min-h-11 rounded-full bg-soft px-5 py-2.5 text-sm font-medium">
              Suivants
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
