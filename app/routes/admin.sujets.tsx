import { Form, Link } from "react-router";

import type { Route } from "./+types/admin.sujets";
import { ButtonLink } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { TuileMatiere } from "~/components/ui/Pictogramme";
import { getDb } from "~/db/db.server";
import { requireEditeur } from "~/lib/auth/session.server";
import { chargerListes, sujetsAdmin } from "~/lib/catalogue/catalogue.server";
import { normaliser } from "~/lib/contenu/texte";

const STATUTS = [
  { id: "", nom: "Tous" },
  { id: "publie", nom: "Publiés" },
  { id: "brouillon", nom: "Brouillons" },
] as const;

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditeur(request);
  const db = getDb();
  const [tous, listes] = await Promise.all([sujetsAdmin(db), chargerListes(db)]);

  // Filtres en paramètres d'URL (le formulaire marche sans JavaScript).
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") ?? "").trim().slice(0, 100);
  const matiere = listes.matieres.some((m) => m.id === params.get("matiere")) ? params.get("matiere")! : "";
  const statut = STATUTS.some((s) => s.id && s.id === params.get("statut")) ? params.get("statut")! : "";

  const mots = normaliser(q).split(/\s+/).filter(Boolean);
  const nomExamen = (id: string) => listes.examens.find((e) => e.id === id)?.nom ?? id;
  const nomMatiere = (id: string) => listes.matieres.find((m) => m.id === id)?.nom ?? id;
  const avantStatut = tous.filter(
    (s) =>
      (!matiere || s.matiereId === matiere) &&
      mots.every((m) => normaliser(`${s.titre} ${nomExamen(s.examenId)} ${nomMatiere(s.matiereId)} ${s.annee ?? ""}`).includes(m)),
  );
  const compte = {
    "": avantStatut.length,
    publie: avantStatut.filter((s) => s.statut === "publie").length,
    brouillon: avantStatut.filter((s) => s.statut !== "publie").length,
  };
  const sujets = statut ? avantStatut.filter((s) => (statut === "publie" ? s.statut === "publie" : s.statut !== "publie")) : avantStatut;

  return { sujets, listes, total: tous.length, filtres: { q, matiere, statut }, compte };
}

const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

const champ = "h-11 min-w-0 rounded-full border-2 border-control bg-soft px-4 text-base outline-none focus:border-ink";

function Statut({ publie }: { publie: boolean }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${publie ? "bg-juste" : "bg-soft text-ink-2"}`}>
      {publie ? "Publié" : "Brouillon"}
    </span>
  );
}

export default function AdminSujets({ loaderData }: Route.ComponentProps) {
  const { sujets, listes, total, filtres, compte } = loaderData;
  const nom = (liste: { id: string; nom: string }[], id: string) => liste.find((x) => x.id === id)?.nom ?? id;
  const filtre = Boolean(filtres.q || filtres.matiere || filtres.statut);

  /** Lien d'un onglet de statut, en gardant la recherche et la matière. */
  const lienStatut = (statut: string) => {
    const p = new URLSearchParams();
    if (filtres.q) p.set("q", filtres.q);
    if (filtres.matiere) p.set("matiere", filtres.matiere);
    if (statut) p.set("statut", statut);
    const s = p.toString();
    return s ? `?${s}` : ".";
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">Sujets</h1>
        <ButtonLink to="/admin/sujets/nouveau">Nouveau sujet</ButtonLink>
      </div>

      {total === 0 ? (
        <EmptyState title="Aucun sujet pour l'instant">
          <p>Les sujets saisis ici apparaîtront dans le catalogue une fois publiés.</p>
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Statut" className="flex flex-wrap gap-1">
              {STATUTS.map((s) => {
                const actif = filtres.statut === s.id;
                return (
                  <Link
                    key={s.id}
                    to={lienStatut(s.id)}
                    aria-current={actif ? "page" : undefined}
                    className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold ${
                      actif ? "bg-soft text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {s.nom}
                    <span className="font-medium tabular-nums text-muted">{compte[s.id]}</span>
                  </Link>
                );
              })}
            </nav>
            <Form method="get" key={`${filtres.q}|${filtres.matiere}`} className="flex flex-wrap items-center gap-2">
              {filtres.statut ? <input type="hidden" name="statut" value={filtres.statut} /> : null}
              <input
                type="search"
                name="q"
                defaultValue={filtres.q}
                placeholder="Titre, examen, matière, année…"
                aria-label="Chercher un sujet"
                className={`${champ} w-full sm:w-auto sm:flex-1 lg:w-80 lg:flex-none`}
              />
              <select name="matiere" defaultValue={filtres.matiere} aria-label="Matière" className={champ}>
                <option value="">Toutes les matières</option>
                {listes.matieres.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom}
                  </option>
                ))}
              </select>
              <button type="submit" className="inline-flex min-h-11 items-center rounded-full bg-soft px-5 text-sm font-bold hover:bg-line">
                Filtrer
              </button>
              {filtre ? (
                <Link to="." className="inline-flex min-h-11 items-center px-2 text-sm font-medium underline underline-offset-4">
                  Tout afficher
                </Link>
              ) : null}
            </Form>
          </div>

          {sujets.length === 0 ? (
            <EmptyState title="Aucun sujet ne correspond">
              <p>Essaie un autre mot ou une autre matière.</p>
            </EmptyState>
          ) : (
            <>
              {/* Téléphone : liste */}
              <ul className="flex flex-col divide-y-2 divide-line rounded-card border-2 border-line lg:hidden">
                {sujets.map((s) => {
                  const matiere = listes.matieres.find((m) => m.id === s.matiereId);
                  return (
                    <li key={s.id}>
                      <Link to={`/admin/sujets/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-soft">
                        <TuileMatiere couleur={matiere?.couleur} icone={matiere?.icone} taille={32} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="line-clamp-2 font-bold">{s.titre}</span>
                          <span className="text-sm text-muted">
                            {nom(listes.examens, s.examenId)}
                            {s.annee ? ` ${s.annee}` : ""} · {matiere?.nom ?? s.matiereId} · modifié le{" "}
                            {date.format(new Date(s.modifieLe))}
                          </span>
                        </span>
                        <Statut publie={s.statut === "publie"} />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Ordinateur : tableau, toute la ligne mène à l'éditeur */}
              <div className="hidden overflow-hidden rounded-card border-2 border-line lg:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-soft text-xs font-bold text-muted">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Sujet
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Examen
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Matière
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Corrigé
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Statut
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Modifié le
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-line">
                    {sujets.map((s) => {
                      const matiere = listes.matieres.find((m) => m.id === s.matiereId);
                      return (
                        <tr key={s.id} className="relative hover:bg-soft">
                          <td className="px-4 py-3">
                            <span className="flex min-w-48 items-center gap-3">
                              <TuileMatiere couleur={matiere?.couleur} icone={matiere?.icone} taille={32} />
                              {/* Le lien couvre toute la ligne (pseudo-élément) */}
                              <Link
                                to={`/admin/sujets/${s.id}`}
                                className="font-bold after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ink"
                              >
                                {s.titre}
                              </Link>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {nom(listes.examens, s.examenId)}
                            {s.annee ? ` ${s.annee}` : ""}
                            {s.session ? <span className="text-muted"> · {s.session}</span> : null}
                          </td>
                          <td className="px-4 py-3">{matiere?.nom ?? s.matiereId}</td>
                          <td className="px-4 py-3 text-muted">{s.aCorrige ? "Oui" : "—"}</td>
                          <td className="px-4 py-3">
                            <Statut publie={s.statut === "publie"} />
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap text-muted tabular-nums">
                            {date.format(new Date(s.modifieLe))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
