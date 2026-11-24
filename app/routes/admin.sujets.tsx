import { Link } from "react-router";

import type { Route } from "./+types/admin.sujets";
import { ButtonLink } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { getDb } from "~/db/db.server";
import { requireEditeur } from "~/lib/auth/session.server";
import { chargerListes, sujetsAdmin } from "~/lib/catalogue/catalogue.server";
import { TUILES } from "~/lib/couleurs";

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditeur(request);
  const db = getDb();
  const [sujets, listes] = await Promise.all([sujetsAdmin(db), chargerListes(db)]);
  return { sujets, listes };
}

const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default function AdminSujets({ loaderData }: Route.ComponentProps) {
  const { sujets, listes } = loaderData;
  const nom = (liste: { id: string; nom: string }[], id: string) =>
    liste.find((x) => x.id === id)?.nom ?? id;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">Sujets</h1>
        <ButtonLink to="/admin/sujets/nouveau">Nouveau sujet</ButtonLink>
      </div>

      {sujets.length === 0 ? (
        <EmptyState title="Aucun sujet pour l'instant">
          <p>Les sujets saisis ici apparaîtront dans le catalogue une fois publiés.</p>
        </EmptyState>
      ) : (
        <ul className="flex flex-col divide-y-2 divide-line rounded-card border-2 border-line">
          {sujets.map((s) => {
            const matiere = listes.matieres.find((m) => m.id === s.matiereId);
            return (
              <li key={s.id}>
                <Link
                  to={`/admin/sujets/${s.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-soft"
                >
                  <span
                    aria-hidden="true"
                    className={`${matiere ? TUILES[matiere.couleur] : "bg-soft"} size-8 shrink-0 rounded-[10px]`}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-bold">{s.titre}</span>
                    <span className="text-sm text-muted">
                      {nom(listes.examens, s.examenId)}
                      {s.annee ? ` ${s.annee}` : ""} · {matiere?.nom ?? s.matiereId} · modifié le{" "}
                      {date.format(new Date(s.modifieLe))}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      s.statut === "publie" ? "bg-juste" : "bg-soft text-ink-2"
                    }`}
                  >
                    {s.statut === "publie" ? "Publié" : "Brouillon"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
