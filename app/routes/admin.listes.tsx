import { data, Form, useNavigation } from "react-router";

import type { Route } from "./+types/admin.listes";
import { FormError, FormSucces } from "~/components/ui/Field";
import { getDb } from "~/db/db.server";
import { COULEURS, type Couleur } from "~/db/schema";
import { requireEditeur } from "~/lib/auth/session.server";
import { chargerListes } from "~/lib/catalogue/catalogue.server";
import { modifierListe } from "~/lib/catalogue/listes.server";
import { NOMS_COULEURS } from "~/lib/couleurs";
import { OUTILS, outilsActifs } from "~/lib/document/outils";
import { Pictogramme, TuileMatiere } from "~/components/ui/Pictogramme";
import { IDS_PICTOGRAMMES, PICTOGRAMMES, estPictogramme } from "~/lib/pictogrammes";

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

/** Pictogramme dessiné sur la tuile de la matière (choix visuel, un seul). */
function ChoixPictogramme({ valeur }: { valeur?: string | null }) {
  return (
    <details className="basis-full">
      <summary className="cursor-pointer text-sm text-muted">
        Pictogramme : {estPictogramme(valeur) ? PICTOGRAMMES[valeur] : "aucun"}
      </summary>
      <fieldset className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-1.5">
        <legend className="sr-only">Pictogramme</legend>
        <label className="flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 border-line text-xs text-muted has-checked:border-ink has-checked:bg-soft has-focus-visible:outline-2">
          <input type="radio" name="icone" value="" defaultChecked={!estPictogramme(valeur)} className="sr-only" />
          Aucun
        </label>
        {IDS_PICTOGRAMMES.map((id) => (
          <label
            key={id}
            title={PICTOGRAMMES[id]}
            className="flex size-12 cursor-pointer items-center justify-center rounded-xl border-2 border-line has-checked:border-ink has-checked:bg-soft has-focus-visible:outline-2"
          >
            <input type="radio" name="icone" value={id} defaultChecked={valeur === id} className="sr-only" />
            <Pictogramme id={id} taille={24} />
            <span className="sr-only">{PICTOGRAMMES[id]}</span>
          </label>
        ))}
      </fieldset>
    </details>
  );
}

/** Outils de l'éditeur proposés pour une matière (texte, formules, tableaux toujours là). */
function ChoixOutils({ profil }: { profil: string[] | null }) {
  const actifs: string[] = outilsActifs(profil);
  return (
    <details className="basis-full">
      <summary className="cursor-pointer text-sm text-muted">
        Outils de l'éditeur : {actifs.length === OUTILS.length ? "tous" : `${actifs.length} sur ${OUTILS.length}`}
      </summary>
      <fieldset className="mt-2 grid gap-1 sm:grid-cols-2">
        <legend className="sr-only">Outils de l'éditeur</legend>
        {OUTILS.map((o) => (
          <label key={o.id} className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="outils"
              value={o.id}
              defaultChecked={actifs.includes(o.id)}
              className="size-5 shrink-0 accent-ink"
            />
            <span>
              <span className="font-medium">{o.nom}</span> <span className="text-muted">· {o.aide}</span>
            </span>
          </label>
        ))}
      </fieldset>
    </details>
  );
}

/** Une ligne modifiable : nom, ordre, (couleur), Enregistrer / Supprimer. */
function Ligne({
  type,
  id,
  nom,
  ordre,
  couleur,
  icone = null,
  outils = null,
}: {
  type: "examen" | "serie" | "matiere";
  id: string;
  nom: string;
  ordre: number;
  couleur?: Couleur;
  icone?: string | null;
  outils?: string[] | null;
}) {
  return (
    <li>
      <Form method="post" className="flex flex-wrap items-center gap-2 py-2">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        {couleur ? (
          <TuileMatiere couleur={couleur} icone={icone} taille={32} />
        ) : null}
        <input name="nom" defaultValue={nom} required maxLength={60} aria-label="Nom" className={`${champ} grow basis-32`} />
        <input
          name="ordre"
          type="number"
          min={0}
          max={999}
          defaultValue={ordre}
          aria-label="Ordre d'affichage"
          className={`${champ} w-16 px-2 text-center`}
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
        {type === "matiere" ? <ChoixPictogramme valeur={icone} /> : null}
        {type === "matiere" ? <ChoixOutils profil={outils} /> : null}
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
      {type === "matiere" ? <ChoixPictogramme /> : null}
      {type === "matiere" ? <ChoixOutils profil={null} /> : null}
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
        <p className="text-sm text-muted lg:max-w-3xl">
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

      {/* Ordinateur : examens et séries à gauche, matières (pictogrammes, outils) à droite. */}
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5 lg:gap-6">
          <section className="flex flex-col gap-2 lg:rounded-card lg:border-2 lg:border-line lg:p-5">
            <h2 className="text-lg font-bold">Examens</h2>
            <ul className="divide-y-2 divide-line">
              {examens.map((e, i) => (
                <Ligne key={e.id} type="examen" id={e.id} nom={e.nom} ordre={i + 1} />
              ))}
            </ul>
            <Ajout type="examen" />
          </section>

          <section className="flex flex-col gap-2 lg:rounded-card lg:border-2 lg:border-line lg:p-5">
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
        </div>

        <section className="flex flex-col gap-2 lg:rounded-card lg:border-2 lg:border-line lg:p-5">
          <h2 className="text-lg font-bold">Matières</h2>
          <ul className="divide-y-2 divide-line">
            {matieres.map((m, i) => (
              <Ligne key={m.id} type="matiere" id={m.id} nom={m.nom} ordre={i + 1} couleur={m.couleur} icone={m.icone} outils={m.outils} />
            ))}
          </ul>
          <Ajout type="matiere" />
        </section>
      </div>
    </>
  );
}
