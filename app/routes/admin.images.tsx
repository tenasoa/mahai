import { Form, useNavigation } from "react-router";

import type { Route } from "./+types/admin.images";
import { Button } from "~/components/ui/Button";
import { EmptyState } from "~/components/ui/EmptyState";
import { FormSucces } from "~/components/ui/Field";
import { getDb } from "~/db/db.server";
import { requireEditeur } from "~/lib/auth/session.server";
import { DELAI_GRACE_MS, taille } from "~/lib/medias/nettoyage";
import { inventaireMedias, supprimerInutilises } from "~/lib/medias/nettoyage.server";
import { urlMedia } from "~/lib/medias/medias";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Images — Admin Mah.ai" }, { name: "robots", content: "noindex" }];
}

const AFFICHES = 60;

export async function loader({ request }: Route.LoaderArgs) {
  const session = await requireEditeur(request);
  const { utilises, inutilises, recents, tailleInutilises } = await inventaireMedias(getDb());
  return {
    peutSupprimer: session.user.role === "admin",
    utilises,
    recents: recents.length,
    nombre: inutilises.length,
    tailleInutilises,
    apercu: inutilises.slice(0, AFFICHES),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const session = await requireEditeur(request);
  if (session.user.role !== "admin") throw new Response("Interdit", { status: 403 });
  const f = await request.formData();
  if (f.get("intention") !== "supprimer") return null;
  const { nombre, octets } = await supprimerInutilises(getDb());
  return {
    message:
      nombre === 0
        ? "Aucune image à supprimer."
        : `${nombre} image${nombre > 1 ? "s" : ""} supprimée${nombre > 1 ? "s" : ""} (${taille(octets)} libérés).`,
  };
}

const date = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function Chiffre({ valeur, libelle }: { valeur: string | number; libelle: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-card border-2 border-line p-4">
      <span className="text-2xl font-extrabold">{valeur}</span>
      <span className="text-sm text-muted">{libelle}</span>
    </div>
  );
}

/** Images envoyées pour les sujets : repère celles que plus aucun sujet n'utilise et les supprime. */
export default function AdminImages({ loaderData, actionData }: Route.ComponentProps) {
  const { peutSupprimer, utilises, recents, nombre, tailleInutilises, apercu } = loaderData;
  const envoi = useNavigation().state === "submitting";
  const heures = DELAI_GRACE_MS / 3_600_000;

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">Images</h1>
        <p className="text-muted">
          Images et schémas envoyés pour les sujets. Une image n'est plus utilisée quand elle a été
          retirée d'un sujet ou que son sujet a été supprimé. Les brouillons comptent comme utilisés.
        </p>
      </div>

      <FormSucces message={actionData?.message} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Chiffre valeur={utilises} libelle="utilisées par un sujet" />
        <Chiffre valeur={nombre} libelle={nombre ? `inutilisées (${taille(tailleInutilises)})` : "inutilisées"} />
        <Chiffre valeur={recents} libelle={`envoyées il y a moins de ${heures} h, gardées`} />
      </div>

      {nombre === 0 ? (
        <EmptyState title="Rien à nettoyer">
          <p>Toutes les images envoyées depuis plus de {heures} heures sont utilisées par un sujet.</p>
        </EmptyState>
      ) : (
        <>
          <section aria-labelledby="titre-inutilisees" className="flex flex-col gap-3">
            <h2 id="titre-inutilisees" className="text-lg font-extrabold">
              Inutilisées
              {nombre > apercu.length ? ` (${apercu.length} plus anciennes sur ${nombre})` : ""}
            </h2>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {apercu.map((f) => (
                <li key={f.cle} className="flex flex-col gap-1 rounded-card border-2 border-line p-2 text-xs text-muted">
                  {f.dansR2 ? (
                    <img
                      src={urlMedia(f.cle)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-[4/3] w-full rounded-chip bg-soft object-contain"
                    />
                  ) : (
                    <span className="flex aspect-[4/3] items-center justify-center rounded-chip bg-soft p-2 text-center">
                      Fiche sans fichier (envoi interrompu)
                    </span>
                  )}
                  <span>
                    {date.format(new Date(f.creeLe))}
                    {f.dansR2 ? ` · ${taille(f.taille)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {peutSupprimer ? (
            <Form method="post" className="flex flex-col gap-2">
              <p className="text-sm text-ink-2">
                La suppression est définitive. Les images envoyées il y a moins de {heures} heures ne
                sont jamais touchées.
              </p>
              <Button
                type="submit"
                name="intention"
                value="supprimer"
                disabled={envoi}
                className="self-start"
                onClick={(e) => {
                  if (!window.confirm(`Supprimer définitivement ${nombre} image${nombre > 1 ? "s" : ""} inutilisée${nombre > 1 ? "s" : ""} ?`)) {
                    e.preventDefault();
                  }
                }}
              >
                {envoi ? "Suppression…" : `Supprimer ${nombre} image${nombre > 1 ? "s" : ""} inutilisée${nombre > 1 ? "s" : ""}`}
              </Button>
            </Form>
          ) : (
            <p className="text-sm text-muted">Seul un administrateur peut supprimer ces images.</p>
          )}
        </>
      )}
    </>
  );
}
