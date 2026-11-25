import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { data, Form, Link, redirect, useNavigation } from "react-router";

import type { Route } from "./+types/admin.sujet";
import { Choix, Texte } from "~/components/admin/Champs";
import { EditeurRiche } from "~/components/editeur/EditeurRiche";
import { outilsActifs } from "~/lib/document/outils";
import { RenduDocument } from "~/components/document/RenduDocument";
import { Button } from "~/components/ui/Button";
import { Icon } from "~/components/ui/Icon";
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
import { totalPoints, type Noeud } from "~/lib/document/nettoyer";
import { planDocument, pts } from "~/lib/document/plan";

export const handle = { large: true };

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

  // Ordinateur : plan et aperçu suivent les éditeurs ; un onglet à la fois.
  const [onglet, setOnglet] = useState<"enonce" | "corrige">("enonce");
  const [docEnonce, setDocEnonce] = useState<Noeud | null>(sujet?.enonce ?? null);
  const [docCorrige, setDocCorrige] = useState<Noeud | null>(sujet?.corrige ?? null);
  const enonceDiffere = useDeferredValue(docEnonce);
  const corrigeDiffere = useDeferredValue(docCorrige);

  // Ctrl S (Cmd S) : enregistrer sans quitter le clavier.
  const enregistrer = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const bouton = enregistrer.current;
        if (bouton && !bouton.disabled) bouton.form?.requestSubmit(bouton);
      }
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, []);

  const statut = sujet ? (sujet.statut === "publie" ? "Publié" : "Brouillon") : "Nouveau, pas encore enregistré";

  return (
    <>
      <div className="flex flex-col gap-1 lg:hidden">
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
        {/* Ordinateur : barre collée en haut avec le titre, l'état et les actions. */}
        <div className="sticky top-0 z-10 -mx-2 hidden items-center gap-4 border-b border-line bg-surface px-2 py-3 lg:flex">
          <Link to="/admin/sujets" aria-label="Tous les sujets" className="flex size-10 items-center justify-center rounded-full hover:bg-soft">
            <Icon name="retour" size={20} />
          </Link>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-xl font-extrabold tracking-tight">{sujet ? sujet.titre : "Nouveau sujet"}</h1>
            <p className="text-[13px] text-muted">
              {statut}
              {sujet?.statut === "publie" ? (
                <>
                  {" · "}
                  <Link to={`/sujets/${sujet.slug}`} className="underline underline-offset-4">
                    voir dans le catalogue
                  </Link>
                </>
              ) : null}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {sujet?.statut === "publie" ? (
              <Button type="submit" variant="secondary" name="intention" value="depublier" formNoValidate disabled={envoi} className="min-h-11 text-sm">
                Retirer du catalogue
              </Button>
            ) : (
              <Button type="submit" variant="secondary" name="intention" value="publier" disabled={envoi} className="min-h-11 text-sm">
                Enregistrer et publier
              </Button>
            )}
            <Button ref={enregistrer} type="submit" name="intention" value="enregistrer" disabled={envoi} className="min-h-11 text-sm">
              {envoi ? "Enregistrement…" : "Enregistrer"}
              <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[11px] font-medium">Ctrl S</span>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[14rem_minmax(0,1fr)_minmax(0,26rem)]">
        <PlanEditeur doc={enonceDiffere} series={seriesChoisies} />

        <div className="flex min-w-0 flex-col gap-6">
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

        <div role="tablist" aria-label="Partie du sujet" className="hidden gap-1 self-start rounded-full bg-soft p-1 lg:flex">
          {(
            [
              ["enonce", "Énoncé"],
              ["corrige", "Corrigé"],
            ] as const
          ).map(([id, nom]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={onglet === id}
              onClick={() => setOnglet(id)}
              className={`min-h-10 rounded-full px-5 text-sm font-bold ${onglet === id ? "bg-surface text-ink" : "text-muted hover:text-ink"}`}
            >
              {nom}
              {erreurs[id] ? " (à corriger)" : ""}
            </button>
          ))}
        </div>

        <section className={`flex flex-col gap-2 ${onglet === "enonce" ? "" : "lg:hidden"}`}>
          <h2 className="text-lg font-bold lg:sr-only">Énoncé</h2>
          {erreurs.enonce ? <FormError message={erreurs.enonce} /> : null}
          <EditeurRiche
            name="enonce"
            libelle="Énoncé"
            initial={sujet?.enonce ?? null}
            placeholder="Écris l'énoncé, ou ajoute un exercice avec « + Exercice »."
            series={seriesChoisies}
            outils={outils}
            surDocument={setDocEnonce}
          />
        </section>

        <section className={`flex flex-col gap-2 ${onglet === "corrige" ? "" : "lg:hidden"}`}>
          <h2 className="text-lg font-bold lg:sr-only">Corrigé (facultatif)</h2>
          {erreurs.corrige ? <FormError message={erreurs.corrige} /> : null}
          <EditeurRiche
            name="corrige"
            libelle="Corrigé"
            initial={sujet?.corrige ?? null}
            placeholder="Corrigé détaillé, avec les mêmes exercices."
            series={seriesChoisies}
            outils={outils}
            surDocument={setDocCorrige}
          />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3 lg:hidden">
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
          </div>
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
        </div>

        <ApercuEleve
          doc={onglet === "enonce" ? enonceDiffere : corrigeDiffere}
          partie={onglet === "enonce" ? "Énoncé" : "Corrigé"}
          series={seriesChoisies}
        />
        </div>
      </Form>
    </>
  );
}

/** Plan de l'énoncé (ordinateur) : exercices et barème, avec le total par série. */
function PlanEditeur({ doc, series }: { doc: Noeud | null; series: { id: string; nom: string }[] }) {
  const plan = useMemo(() => planDocument(doc, series[0]?.id), [doc, series]);
  const totaux = useMemo(
    () =>
      series.length > 1
        ? series.map((s) => ({ nom: `Série ${s.nom}`, total: doc ? totalPoints(doc, s.id) : null }))
        : [{ nom: "Total", total: doc ? totalPoints(doc, series[0]?.id) : null }],
    [doc, series],
  );
  return (
    <nav aria-label="Plan de l'énoncé" className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] flex-col gap-3 overflow-y-auto lg:flex">
      <p className="text-xs font-medium text-muted">Plan de l'énoncé</p>
      {plan.length ? (
        <ol className="flex flex-col gap-1 text-sm">
          {plan.map((e) => (
            <li key={e.id} className={`flex items-baseline gap-2 rounded-xl px-2.5 py-1.5 ${e.genre === "partie" ? "font-bold" : "text-ink-2"}`}>
              <span className="min-w-0 flex-1">{e.titre}</span>
              {e.points !== null ? (
                <span className="shrink-0 text-xs text-muted tabular-nums">{pts(e.points)}</span>
              ) : e.genre !== "partie" ? (
                <span className="shrink-0 text-xs text-muted">sans barème</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted">Les exercices et les questions apparaîtront ici.</p>
      )}
      {totaux.some((t) => t.total !== null) ? (
        <ul className="flex flex-col gap-1.5 border-t border-line pt-3 text-sm">
          {totaux.map((t) => {
            const juste = t.total === 20;
            return (
              <li key={t.nom} className="flex items-center gap-2">
                <span className="flex-1 font-bold">{t.nom}</span>
                <span className="tabular-nums">{t.total !== null ? `${String(t.total).replace(".", ",")} / 20` : "—"}</span>
                <Icon name={juste ? "juste" : "erreur"} size={16} />
                <span className="sr-only">{juste ? "barème complet" : "le total n'est pas 20"}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </nav>
  );
}

/** Ce que verra l'élève, mis à jour pendant la saisie (grand écran). */
function ApercuEleve({
  doc,
  partie,
  series,
}: {
  doc: Noeud | null;
  partie: string;
  series: { id: string; nom: string }[];
}) {
  const [vue, setVue] = useState<"telephone" | "ordinateur">("telephone");
  return (
    <section aria-label="Aperçu élève" className="sticky top-24 hidden max-h-[calc(100dvh-7rem)] flex-col gap-3 xl:flex">
      <div className="flex items-center gap-3">
        <p className="flex-1 text-xs font-medium text-muted">Aperçu élève · {partie}</p>
        <div className="flex gap-1 rounded-full bg-soft p-1" role="group" aria-label="Taille de l'aperçu">
          {(
            [
              ["telephone", "Téléphone"],
              ["ordinateur", "Ordinateur"],
            ] as const
          ).map(([id, nom]) => (
            <button
              key={id}
              type="button"
              aria-pressed={vue === id}
              onClick={() => setVue(id)}
              className={`min-h-8 rounded-full px-3 text-xs font-bold ${vue === id ? "bg-surface text-ink" : "text-muted hover:text-ink"}`}
            >
              {nom}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto rounded-card border-2 border-line bg-soft p-3">
        <div className={`mx-auto rounded-[14px] bg-surface p-4 ${vue === "telephone" ? "max-w-[375px]" : ""}`}>
          {doc ? (
            <RenduDocument doc={doc} serie={series.length === 1 ? series[0]!.id : null} series={series} />
          ) : (
            <p className="py-8 text-center text-sm text-muted">Rien à afficher pour l'instant.</p>
          )}
        </div>
      </div>
    </section>
  );
}
