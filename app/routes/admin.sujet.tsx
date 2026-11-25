import { useMemo, useState } from "react";
import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/admin.sujet";
import { Choix, Texte } from "~/components/admin/Champs";
import { EditeurRiche } from "~/components/editeur/EditeurRiche";
import { outilsActifs } from "~/lib/document/outils";
import { Button } from "~/components/ui/Button";
import { FormError, FormSucces } from "~/components/ui/Field";
import { getDb } from "~/db/db.server";
import { requireEditeur } from "~/lib/auth/session.server";
import {
  changerStatut,
  chargerListes,
  creerSujet,
  modifierSujet,
  sujetPourEdition,
  supprimerSujet,
} from "~/lib/catalogue/catalogue.server";
import { lireFormulaireSujet, type Erreurs } from "~/lib/catalogue/formulaire";

/**
 * Création et modification d'un sujet. La même route sert à /admin/sujets/nouveau (sans id)
 * et /admin/sujets/:id.
 */

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${data?.sujet ? data.sujet.titre : "Nouveau sujet"} — Admin Mah.ai` }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  await requireEditeur(request);
  const db = getDb();
  const listes = await chargerListes(db);
  if (!params.id) return { listes, sujet: null, notice: undefined };
  const sujet = await sujetPourEdition(db, params.id);
  if (!sujet) throw new Response("Sujet introuvable", { status: 404 });
  const url = new URL(request.url);
  const notice = url.searchParams.has("cree")
    ? "Sujet créé (brouillon)."
    : url.searchParams.has("publie")
      ? "Sujet créé et publié."
      : undefined;
  return { listes, sujet, notice };
}

export async function action({ request, params }: Route.ActionArgs) {
  const session = await requireEditeur(request);
  const db = getDb();
  const f = await request.formData();
  const intention = f.get("intention");

  if (params.id && intention === "supprimer") {
    await supprimerSujet(db, params.id);
    return redirect("/admin/sujets");
  }
  if (params.id && intention === "depublier") {
    await changerStatut(db, params.id, false);
    return { erreurs: {} as Erreurs, message: "Le sujet n'est plus visible dans le catalogue." };
  }

  const listes = await chargerListes(db);
  const lu = lireFormulaireSujet(f, listes, new Date().getUTCFullYear());
  if (!lu.ok) {
    return data({ erreurs: lu.erreurs, message: undefined }, { status: 400 });
  }

  const publier = intention === "publier";
  if (params.id) {
    await modifierSujet(db, params.id, lu.donnees, listes);
    if (publier) await changerStatut(db, params.id, true);
    return {
      erreurs: {} as Erreurs,
      message: publier ? "Sujet enregistré et publié." : "Modifications enregistrées.",
    };
  }
  const { id } = await creerSujet(db, lu.donnees, listes, session.user.id);
  if (publier) await changerStatut(db, id, true);
  return redirect(`/admin/sujets/${id}?${publier ? "publie" : "cree"}`);
}

export default function AdminSujet({ loaderData, actionData }: Route.ComponentProps) {
  const { listes, sujet } = loaderData;
  const erreurs: Erreurs = actionData?.erreurs ?? {};
  const navigation = useNavigation();
  const envoi = navigation.state === "submitting";

  const [examenId, setExamenId] = useState(sujet?.examenId ?? "");
  const [matiereId, setMatiereId] = useState(sujet?.matiereId ?? "");
  const outils = outilsActifs(listes.matieres.find((m) => m.id === matiereId)?.outils);
  const [cochees, setCochees] = useState<string[]>(sujet?.series.map((s) => s.serieId) ?? []);
  const seriesExamen = listes.series.filter((s) => s.examenId === examenId);
  const seriesChoisies = useMemo(
    () => seriesExamen.filter((s) => cochees.includes(s.id)).map((s) => ({ id: s.id, nom: s.nom })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [examenId, cochees.join(",")],
  );

  const message = actionData ? actionData.message : loaderData.notice;

  const heures = sujet?.dureeMinutes ? Math.floor(sujet.dureeMinutes / 60) : undefined;
  const minutes = sujet?.dureeMinutes ? sujet.dureeMinutes % 60 : undefined;
  const nbErreurs = Object.keys(erreurs).length;

  return (
    <>
      <div className="flex flex-col gap-1">
        <Link to="/admin/sujets" className="text-sm text-muted underline underline-offset-4">
          Tous les sujets
        </Link>
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight">
          {sujet ? sujet.titre : "Nouveau sujet"}
        </h1>
        {sujet ? (
          <p className="text-sm text-muted">
            {sujet.statut === "publie" ? (
              <>
                Publié :{" "}
                <Link to={`/sujets/${sujet.slug}`} className="underline underline-offset-4">
                  voir dans le catalogue
                </Link>
              </>
            ) : (
              "Brouillon : invisible dans le catalogue."
            )}
          </p>
        ) : null}
      </div>

      <FormSucces message={message} />
      <FormError
        message={nbErreurs ? `Le sujet n'est pas enregistré : ${nbErreurs} champ${nbErreurs > 1 ? "s" : ""} à corriger.` : undefined}
      />

      <Form method="post" className="flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-3 text-lg font-bold">En-tête du sujet</legend>
          <Texte
            id="titre"
            label="Titre"
            required
            maxLength={200}
            defaultValue={sujet?.titre}
            placeholder="Ex. Mathématiques"
            erreur={erreurs.titre}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Choix
              id="examenId"
              label="Examen"
              required
              vide="Choisir…"
              value={examenId}
              onChange={(e) => setExamenId(e.target.value)}
              options={listes.examens.map((e) => ({ valeur: e.id, libelle: e.nom }))}
              erreur={erreurs.examenId}
            />
            <Choix
              id="matiereId"
              label="Matière (épreuve)"
              required
              vide="Choisir…"
              value={matiereId}
              onChange={(e) => setMatiereId(e.target.value)}
              options={listes.matieres.map((m) => ({ valeur: m.id, libelle: m.nom }))}
              erreur={erreurs.matiereId}
            />
          </div>

          {seriesExamen.length > 0 ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1.5 text-sm font-medium">
                Séries concernées, avec leur coefficient
              </legend>
              <ul className="flex flex-col gap-2">
                {seriesExamen.map((s) => {
                  const coche = cochees.includes(s.id);
                  const coef = sujet?.series.find((x) => x.serieId === s.id)?.coefficient;
                  return (
                    <li key={s.id} className="flex flex-wrap items-center gap-3">
                      <label className="flex min-h-12 min-w-28 items-center gap-2.5 rounded-full border-2 border-line px-4">
                        <input
                          type="checkbox"
                          name="series"
                          value={s.id}
                          checked={coche}
                          onChange={(e) =>
                            setCochees((c) =>
                              e.target.checked ? [...c, s.id] : c.filter((x) => x !== s.id),
                            )
                          }
                          className="size-5 accent-ink"
                        />
                        Série {s.nom}
                      </label>
                      {coche ? (
                        <label className="flex items-center gap-2 text-sm">
                          Coefficient
                          <input
                            name={`coefficient-${s.id}`}
                            type="number"
                            min={1}
                            max={20}
                            inputMode="numeric"
                            defaultValue={coef ?? undefined}
                            className="h-12 w-20 rounded-full border-2 border-control bg-soft px-3 text-center"
                          />
                        </label>
                      ) : null}
                      {erreurs[`coefficient-${s.id}`] ? (
                        <span className="text-sm">{erreurs[`coefficient-${s.id}`]}</span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
              {seriesChoisies.length > 1 ? (
                <p className="text-sm text-muted">
                  Plusieurs séries : chaque exercice et question aura une case de points par série.
                </p>
              ) : null}
            </fieldset>
          ) : null}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Texte
              id="annee"
              label="Année"
              type="number"
              inputMode="numeric"
              min={1960}
              max={2100}
              defaultValue={sujet?.annee ?? undefined}
              erreur={erreurs.annee}
            />
            <Texte
              id="session"
              label="Session"
              maxLength={80}
              placeholder="Normale, blanc…"
              defaultValue={sujet?.session ?? undefined}
            />
            <Texte
              id="dureeHeures"
              label="Durée : heures"
              type="number"
              inputMode="numeric"
              min={0}
              max={12}
              defaultValue={heures}
              erreur={erreurs.duree}
            />
            <Texte
              id="dureeMinutes"
              label="minutes"
              type="number"
              inputMode="numeric"
              min={0}
              max={59}
              defaultValue={minutes}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Texte
              id="codeMatiere"
              label="Code matière"
              maxLength={20}
              placeholder="Ex. 009"
              defaultValue={sujet?.codeMatiere ?? undefined}
            />
            <Texte
              id="option"
              label="Option"
              maxLength={40}
              defaultValue={sujet?.option ?? undefined}
            />
            {seriesChoisies.length === 0 ? (
              <Texte
                id="coefficient"
                label="Coefficient"
                type="number"
                inputMode="numeric"
                min={1}
                max={20}
                defaultValue={sujet?.coefficient ?? undefined}
                erreur={erreurs.coefficient}
              />
            ) : null}
            <Choix
              id="source"
              label="Source"
              defaultValue={sujet?.source ?? "officiel"}
              options={[
                { valeur: "officiel", libelle: "Sujet officiel" },
                { valeur: "etablissement", libelle: "Établissement" },
                { valeur: "contributeur", libelle: "Contributeur" },
              ]}
            />
          </div>
          <Texte
            id="niveau"
            label="Niveau (facultatif)"
            maxLength={80}
            placeholder="Ex. Terminale, L1"
            defaultValue={sujet?.niveau ?? undefined}
          />
        </fieldset>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Énoncé</h2>
          {erreurs.enonce ? <FormError message={erreurs.enonce} /> : null}
          <EditeurRiche
            name="enonce"
            libelle="Énoncé"
            initial={sujet?.enonce ?? null}
            placeholder="Écris l'énoncé, ou ajoute un exercice avec « + Exercice »."
            series={seriesChoisies}
            outils={outils}
          />
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold">Corrigé (facultatif)</h2>
          {erreurs.corrige ? <FormError message={erreurs.corrige} /> : null}
          <EditeurRiche
            name="corrige"
            libelle="Corrigé"
            initial={sujet?.corrige ?? null}
            placeholder="Corrigé détaillé, avec les mêmes exercices."
            series={seriesChoisies}
            outils={outils}
          />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" name="intention" value="enregistrer" disabled={envoi}>
            {envoi ? "Enregistrement…" : "Enregistrer"}
          </Button>
          {sujet?.statut === "publie" ? (
            <Button
              type="submit"
              variant="secondary"
              name="intention"
              value="depublier"
              formNoValidate
              disabled={envoi}
            >
              Retirer du catalogue
            </Button>
          ) : (
            <Button type="submit" variant="secondary" name="intention" value="publier" disabled={envoi}>
              Enregistrer et publier
            </Button>
          )}
          {sujet ? (
            <button
              type="submit"
              name="intention"
              value="supprimer"
              formNoValidate
              disabled={envoi}
              onClick={(e) => {
                if (!window.confirm("Supprimer définitivement ce sujet ? Cette action est irréversible.")) {
                  e.preventDefault();
                }
              }}
              className="ml-auto min-h-12 px-2 text-sm font-medium text-ink-2 underline underline-offset-4"
            >
              Supprimer le sujet
            </button>
          ) : null}
        </div>
      </Form>
    </>
  );
}
