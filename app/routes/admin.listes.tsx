import { data, Form, useNavigation } from "react-router";

import type { Route } from "./+types/admin.listes";
import { FormError, FormSucces } from "~/components/ui/Field";
import { getDb } from "~/db/db.server";
import { COULEURS, type Couleur } from "~/db/schema";
import { requireEditeur } from "~/lib/auth/session.server";
import { chargerListes } from "~/lib/catalogue/catalogue.server";
import { modifierListe } from "~/lib/catalogue/listes.server";
import { NOMS_COULEURS, TUILES } from "~/lib/couleurs";

export async function loader({ request }: Route.LoaderArgs) {
  await requireEditeur(request);
  return chargerListes(getDb());
}

export async function action({ request }: Route.ActionArgs) {
  await requireEditeur(request);
  const r = await modifierListe(getDb(), await request.formData());
  return r.ok ? { message: r.message, erreur: undefined } : data({ message: undefined, erreur: r.erreur }, { status: 400 });
}

const champ =
  "h-11 min-w-0 rounded-full border-2 border-control bg-soft px-4 text-base outline-none focus:border-ink";
const petit = "inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium";

function SelectCouleur({ valeur }: { valeur?: Couleur }) {
  return (
    <select name="couleur" defaultValue={valeur ?? ""} required aria-label="Couleur" className={`${champ} w-32`}>
      <option value="">Couleur…</option>
      {COULEURS.map((c) => (
        <option key={c} value={c}>
          {NOMS_COULEURS[c]}
        </option>
      ))}
    </select>
  );
}

/** Une ligne modifiable : nom, ordre, (couleur), Enregistrer / Supprimer. */
function Ligne({
  type,
  id,
  nom,
  ordre,
  couleur,
}: {
  type: "examen" | "serie" | "matiere";
  id: string;
  nom: string;
  ordre: number;
  couleur?: Couleur;
}) {
  return (
    <li>
      <Form method="post" className="flex flex-wrap items-center gap-2 py-2">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        {couleur ? (
          <span aria-hidden="true" className={`${TUILES[couleur]} size-8 shrink-0 rounded-[10px]`} />
        ) : null}
        <input name="nom" defaultValue={nom} required maxLength={60} aria-label="Nom" className={`${champ} flex-1`} />
        <input
          name="ordre"
          type="number"
          min={0}
          max={999}
          defaultValue={ordre}
          aria-label="Ordre d'affichage"
          className={`${champ} w-20 text-center`}
        />
        {type === "matiere" ? <SelectCouleur valeur={couleur} /> : null}
        <button type="submit" name="intention" value="modifier" className={`${petit} bg-soft hover:bg-line`}>
          Enregistrer
        </button>
        <button
          type="submit"
          name="intention"
          value="supprimer"
          formNoValidate
          onClick={(e) => {
            if (!window.confirm(`Supprimer « ${nom} » ?`)) e.preventDefault();
          }}
          className={`${petit} text-ink-2 underline underline-offset-4`}
        >
          Supprimer
        </button>
      </Form>
    </li>
  );
}

function Ajout({ type, children }: { type: "examen" | "serie" | "matiere"; children?: React.ReactNode }) {
  return (
    <Form method="post" className="flex flex-wrap items-center gap-2 rounded-card bg-soft p-3">
      <input type="hidden" name="type" value={type} />
      {children}
      <input name="nom" required maxLength={60} placeholder="Nom" aria-label="Nom" className={`${champ} flex-1 bg-surface`} />
      <input
        name="ordre"
        type="number"
        min={0}
        max={999}
        placeholder="Ordre"
        aria-label="Ordre d'affichage"
        className={`${champ} w-24 bg-surface text-center`}
      />
      {type === "matiere" ? <SelectCouleur /> : null}
      <button type="submit" name="intention" value="ajouter" className={`${petit} border-2 border-ink font-bold`}>
        Ajouter
      </button>
    </Form>
  );
}

export default function AdminListes({ loaderData, actionData }: Route.ComponentProps) {
  const { examens, series, matieres } = loaderData;
  const envoi = useNavigation().state === "submitting";

  return (
    <>
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] leading-none font-extrabold tracking-tight">Listes</h1>
        <p className="text-sm text-muted">
          Examens, séries et matières proposés dans les sujets. Un élément utilisé par un sujet ne peut
          pas être supprimé.
        </p>
      </div>
      <div aria-live="polite">
        {envoi ? null : (
          <>
            <FormSucces message={actionData?.message} />
            <FormError message={actionData?.erreur} />
          </>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Examens</h2>
        <ul className="divide-y-2 divide-line">
          {examens.map((e, i) => (
            <Ligne key={e.id} type="examen" id={e.id} nom={e.nom} ordre={i + 1} />
          ))}
        </ul>
        <Ajout type="examen" />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Séries</h2>
        {examens.map((e) => {
          const liste = series.filter((s) => s.examenId === e.id);
          if (liste.length === 0) return null;
          return (
            <div key={e.id}>
              <h3 className="text-sm font-bold text-muted">{e.nom}</h3>
              <ul className="divide-y-2 divide-line">
                {liste.map((s, i) => (
                  <Ligne key={s.id} type="serie" id={s.id} nom={s.nom} ordre={i + 1} />
                ))}
              </ul>
            </div>
          );
        })}
        <Ajout type="serie">
          <select name="examenId" required aria-label="Examen" className={`${champ} bg-surface`}>
            <option value="">Examen…</option>
            {examens.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nom}
              </option>
            ))}
          </select>
        </Ajout>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Matières</h2>
        <ul className="divide-y-2 divide-line">
          {matieres.map((m, i) => (
            <Ligne key={m.id} type="matiere" id={m.id} nom={m.nom} ordre={i + 1} couleur={m.couleur} />
          ))}
        </ul>
        <Ajout type="matiere" />
      </section>
    </>
  );
}
