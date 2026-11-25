import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { SvgGraphique } from "~/components/document/SvgGraphique";
import { erreurExpression } from "~/lib/document/expression";
import {
  GRAPHIQUE_DEFAUT,
  LIMITES,
  NB_COULEURS,
  normaliserGraphique,
  type Graphique,
} from "~/lib/document/graphique";

/**
 * Éditeur d'un graphique : formulaire (fenêtre, courbes, points, segments, cercles, asymptotes,
 * aires) et aperçu en direct, le même SVG que celui de l'élève.
 */

export type GraphiqueEnCours = { attrs: Record<string, unknown> | null; pos?: number };

const COULEURS = ["Bleu", "Rouge", "Vert", "Violet"];

const MODELES: { nom: string; g: Partial<Graphique> }[] = [
  { nom: "Parabole", g: { courbes: [{ f: "x^2 - 2x - 3", nom: "C_f", min: null, max: null, couleur: 0, pointille: false }], ymin: -5, ymax: 6 } },
  {
    nom: "Fonction rationnelle",
    g: {
      courbes: [{ f: "(2x + 1)/(x - 1)", nom: "C_f", min: null, max: null, couleur: 0, pointille: false }],
      asymptotes: [
        { sens: "verticale", valeur: 1 },
        { sens: "horizontale", valeur: 2 },
      ],
      xmin: -6,
      xmax: 8,
      ymin: -5,
      ymax: 8,
    },
  },
  {
    nom: "Exponentielle et logarithme",
    g: {
      courbes: [
        { f: "e^x", nom: "y = e^x", min: null, max: null, couleur: 0, pointille: false },
        { f: "ln(x)", nom: "y = ln x", min: null, max: null, couleur: 1, pointille: false },
        { f: "x", nom: "", min: null, max: null, couleur: 2, pointille: true },
      ],
      xmin: -4,
      xmax: 6,
      ymin: -4,
      ymax: 6,
    },
  },
  {
    nom: "Aire sous la courbe",
    g: {
      courbes: [{ f: "-0.5x^2 + 2x + 1", nom: "C_f", min: null, max: null, couleur: 0, pointille: false }],
      aires: [{ courbe: 0, courbe2: null, a: 0, b: 3 }],
      xmin: -2,
      xmax: 6,
      ymin: -2,
      ymax: 5,
    },
  },
  {
    nom: "Points et vecteurs",
    g: {
      courbes: [],
      points: [
        { x: 1, y: 2, nom: "A", projections: true },
        { x: 4, y: 3, nom: "B", projections: false },
      ],
      segments: [{ x1: 1, y1: 2, x2: 4, y2: 3, vecteur: true, nom: "u" }],
      xmin: -1,
      xmax: 6,
      ymin: -1,
      ymax: 5,
    },
  },
  {
    nom: "Cercle trigonométrique",
    g: {
      courbes: [],
      cercles: [{ x: 0, y: 0, r: 1, nom: "" }],
      points: [{ x: 0.5, y: 0.866025, nom: "M", projections: true }],
      segments: [{ x1: 0, y1: 0, x2: 0.5, y2: 0.866025, vecteur: false, nom: "" }],
      xmin: -1.5,
      xmax: 1.5,
      ymin: -1.5,
      ymax: 1.5,
      pasX: 0.5,
      pasY: 0.5,
    },
  },
];

const VIDE: Graphique = { ...GRAPHIQUE_DEFAUT, courbes: [], points: [], segments: [], cercles: [], asymptotes: [], aires: [] };

const champ = "h-10 min-w-0 rounded-xl border-2 border-line bg-surface px-2 text-sm focus:border-ink";
const petit = "min-h-9 rounded-full bg-soft px-3 text-sm font-medium hover:bg-line";

const lire = (s: string): number | null | undefined => {
  if (s.trim() === "") return null;
  const n = Number(s.replace(",", ".").replace("−", "-"));
  return Number.isFinite(n) ? n : undefined;
};
const ecrire = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

/** Champ numérique qui accepte la saisie en cours (« - », « 1, »). `vide` : la valeur peut être nulle. */
function Nombre({
  valeur,
  onChange,
  libelle,
  vide = false,
  className = "w-16",
}: {
  valeur: number | null;
  onChange: (n: number | null) => void;
  libelle: string;
  vide?: boolean;
  className?: string;
}) {
  const [brut, setBrut] = useState(ecrire(valeur));
  useEffect(() => {
    if (lire(brut) !== valeur) setBrut(ecrire(valeur));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement quand la valeur change de l'extérieur
  }, [valeur]);
  return (
    <input
      value={brut}
      inputMode="decimal"
      aria-label={libelle}
      title={libelle}
      placeholder={vide ? "—" : undefined}
      onChange={(e) => {
        setBrut(e.target.value);
        const n = lire(e.target.value);
        if (n === null ? vide : n !== undefined) onChange(n ?? null);
      }}
      className={`${champ} ${className} text-center`}
    />
  );
}

function Section({ titre, children, ajouter }: { titre: string; children: ReactNode; ajouter?: () => void }) {
  return (
    <fieldset className="flex flex-col gap-2 rounded-2xl border-2 border-line p-3">
      <legend className="px-1 text-sm font-bold">{titre}</legend>
      {children}
      {ajouter ? (
        <button type="button" onClick={ajouter} className={`${petit} self-start`}>
          + Ajouter
        </button>
      ) : null}
    </fieldset>
  );
}

function Supprimer({ onClick, quoi }: { onClick: () => void; quoi: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={`Supprimer ${quoi}`} title="Supprimer" className="min-h-9 min-w-9 rounded-full text-muted hover:bg-soft">
      ✕
    </button>
  );
}

const ligne = "flex flex-wrap items-center gap-1.5";

export function DialogueGraphique({
  graphique,
  onValider,
  onFermer,
}: {
  graphique: GraphiqueEnCours | null;
  onValider: (g: Graphique) => void;
  onFermer: () => void;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const [g, setG] = useState<Graphique>(GRAPHIQUE_DEFAUT);

  useEffect(() => {
    if (!graphique) return;
    setG(graphique.attrs ? normaliserGraphique(graphique.attrs) : GRAPHIQUE_DEFAUT);
    const d = dialogue.current;
    if (d && !d.open) d.showModal();
  }, [graphique]);

  if (!graphique) return null;
  const nouveau = graphique.pos === undefined;
  const apercu = normaliserGraphique(g);

  const maj = (partiel: Partial<Graphique>) => setG((ancien) => ({ ...ancien, ...partiel }));
  function majListe<K extends "courbes" | "points" | "segments" | "cercles" | "asymptotes" | "aires">(
    cle: K,
    i: number,
    partiel: Partial<Graphique[K][number]>,
  ) {
    setG((ancien) => ({ ...ancien, [cle]: ancien[cle].map((e, j) => (j === i ? { ...e, ...partiel } : e)) }));
  }
  function retirer(cle: "courbes" | "points" | "segments" | "cercles" | "asymptotes" | "aires", i: number) {
    setG((ancien) => {
      const suivant = { ...ancien, [cle]: ancien[cle].filter((_, j) => j !== i) };
      if (cle === "courbes") {
        // Les aires désignent les courbes par leur rang : on les recale.
        suivant.aires = ancien.aires
          .filter((a) => a.courbe !== i)
          .map((a) => ({
            ...a,
            courbe: a.courbe > i ? a.courbe - 1 : a.courbe,
            courbe2: a.courbe2 === i ? null : a.courbe2 !== null && a.courbe2 > i ? a.courbe2 - 1 : a.courbe2,
          }));
      }
      return suivant;
    });
  }
  function ajouter<K extends "courbes" | "points" | "segments" | "cercles" | "asymptotes" | "aires">(cle: K, e: Graphique[K][number]) {
    setG((ancien) => (ancien[cle].length >= LIMITES[cle] ? ancien : { ...ancien, [cle]: [...ancien[cle], e] }));
  }

  // Portail vers <body> : hors du formulaire du sujet (Entrée dans un champ ne l'envoie pas).
  return createPortal(
    <dialog
      ref={dialogue}
      onClose={onFermer}
      aria-labelledby="titre-graphique"
      className="m-auto w-[min(100vw-1.5rem,72rem)] rounded-3xl border-2 border-line bg-surface p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex max-h-[calc(100dvh-4rem)] flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="titre-graphique" className="text-lg font-extrabold">
            {nouveau ? "Nouveau graphique" : "Modifier le graphique"}
          </h2>
          <span className="flex-1" />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Modèles">
            {MODELES.map((m) => (
              <button
                key={m.nom}
                type="button"
                onClick={() => setG({ ...VIDE, ...m.g, alt: g.alt })}
                className="min-h-9 rounded-full border-2 border-line px-3 text-sm font-medium hover:border-control"
              >
                {m.nom}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:overflow-hidden">
          <div className="flex flex-col gap-3 md:overflow-y-auto md:pr-1">
            <Section titre="Fenêtre">
              <div className={ligne}>
                <span className="w-6 text-sm text-muted">x</span>
                <Nombre libelle="x minimum" valeur={g.xmin} onChange={(n) => maj({ xmin: n ?? 0 })} />
                <span className="text-sm text-muted">à</span>
                <Nombre libelle="x maximum" valeur={g.xmax} onChange={(n) => maj({ xmax: n ?? 0 })} />
                <span className="text-sm text-muted">pas</span>
                <Nombre libelle="Pas des graduations en x" valeur={g.pasX} onChange={(n) => maj({ pasX: n ?? 1 })} />
                <input value={g.nomX} onChange={(e) => maj({ nomX: e.target.value })} aria-label="Nom de l'axe des abscisses" maxLength={20} className={`${champ} w-20`} />
              </div>
              <div className={ligne}>
                <span className="w-6 text-sm text-muted">y</span>
                <Nombre libelle="y minimum" valeur={g.ymin} onChange={(n) => maj({ ymin: n ?? 0 })} />
                <span className="text-sm text-muted">à</span>
                <Nombre libelle="y maximum" valeur={g.ymax} onChange={(n) => maj({ ymax: n ?? 0 })} />
                <span className="text-sm text-muted">pas</span>
                <Nombre libelle="Pas des graduations en y" valeur={g.pasY} onChange={(n) => maj({ pasY: n ?? 1 })} />
                <input value={g.nomY} onChange={(e) => maj({ nomY: e.target.value })} aria-label="Nom de l'axe des ordonnées" maxLength={20} className={`${champ} w-20`} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={g.grille} onChange={(e) => maj({ grille: e.target.checked })} />
                  Quadrillage
                </label>
                <label className="flex items-center gap-1.5">
                  <input type="checkbox" checked={g.orthonorme} onChange={(e) => maj({ orthonorme: e.target.checked })} />
                  Repère orthonormé
                </label>
              </div>
            </Section>

            <Section
              titre="Courbes"
              ajouter={
                g.courbes.length < LIMITES.courbes
                  ? () => ajouter("courbes", { f: "", nom: "", min: null, max: null, couleur: g.courbes.length % NB_COULEURS, pointille: false })
                  : undefined
              }
            >
              <p className="text-xs text-muted">
                Exemples : 2x^2 - 3x + 1 · (x+1)/(x-2) · e^(-x) · ln(x) · sqrt(x) · |x| · sin(2x). Intervalle vide = toute la fenêtre.
              </p>
              {g.courbes.map((c, i) => {
                const erreur = c.f.trim() ? erreurExpression(c.f) : null;
                return (
                  <div key={i} className="flex flex-col gap-1 border-b border-line pb-2 last:border-0">
                    <div className={ligne}>
                      <span className="text-sm text-muted">y =</span>
                      <input
                        value={c.f}
                        onChange={(e) => majListe("courbes", i, { f: e.target.value })}
                        aria-label={`Expression de la courbe ${i + 1}`}
                        aria-invalid={erreur ? true : undefined}
                        maxLength={200}
                        spellCheck={false}
                        autoCapitalize="off"
                        placeholder="x^2 - 1"
                        className={`${champ} flex-1 font-mono ${erreur ? "border-erreur" : ""}`}
                      />
                      <input
                        value={c.nom}
                        onChange={(e) => majListe("courbes", i, { nom: e.target.value })}
                        aria-label={`Nom de la courbe ${i + 1}`}
                        placeholder="Nom (C_f)"
                        maxLength={30}
                        className={`${champ} w-24`}
                      />
                      <Supprimer onClick={() => retirer("courbes", i)} quoi={`la courbe ${i + 1}`} />
                    </div>
                    <div className={ligne}>
                      <span className="text-sm text-muted">sur</span>
                      <Nombre libelle="Début de l'intervalle" vide valeur={c.min} onChange={(n) => majListe("courbes", i, { min: n })} />
                      <span className="text-sm text-muted">à</span>
                      <Nombre libelle="Fin de l'intervalle" vide valeur={c.max} onChange={(n) => majListe("courbes", i, { max: n })} />
                      <select
                        value={c.couleur}
                        onChange={(e) => majListe("courbes", i, { couleur: Number(e.target.value) })}
                        aria-label="Couleur"
                        className={champ}
                      >
                        {COULEURS.map((nom, k) => (
                          <option key={k} value={k}>
                            {nom}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1.5 text-sm">
                        <input type="checkbox" checked={c.pointille} onChange={(e) => majListe("courbes", i, { pointille: e.target.checked })} />
                        Pointillés
                      </label>
                    </div>
                    {erreur ? (
                      <p role="alert" className="text-sm text-ink-2">
                        {erreur}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </Section>

            <Section
              titre="Points"
              ajouter={g.points.length < LIMITES.points ? () => ajouter("points", { x: 1, y: 1, nom: String.fromCharCode(65 + (g.points.length % 26)), projections: false }) : undefined}
            >
              {g.points.map((p, i) => (
                <div key={i} className={ligne}>
                  <input value={p.nom} onChange={(e) => majListe("points", i, { nom: e.target.value })} aria-label={`Nom du point ${i + 1}`} maxLength={30} className={`${champ} w-14`} />
                  <span className="text-sm text-muted">(</span>
                  <Nombre libelle="Abscisse" valeur={p.x} onChange={(n) => majListe("points", i, { x: n ?? 0 })} />
                  <span className="text-sm text-muted">;</span>
                  <Nombre libelle="Ordonnée" valeur={p.y} onChange={(n) => majListe("points", i, { y: n ?? 0 })} />
                  <span className="text-sm text-muted">)</span>
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={p.projections} onChange={(e) => majListe("points", i, { projections: e.target.checked })} />
                    Pointillés vers les axes
                  </label>
                  <Supprimer onClick={() => retirer("points", i)} quoi={`le point ${p.nom || i + 1}`} />
                </div>
              ))}
            </Section>

            <Section
              titre="Segments et vecteurs"
              ajouter={g.segments.length < LIMITES.segments ? () => ajouter("segments", { x1: 0, y1: 0, x2: 1, y2: 1, vecteur: false, nom: "" }) : undefined}
            >
              {g.segments.map((s, i) => (
                <div key={i} className={ligne}>
                  <span className="text-sm text-muted">de</span>
                  <Nombre libelle="x du départ" valeur={s.x1} onChange={(n) => majListe("segments", i, { x1: n ?? 0 })} className="w-14" />
                  <Nombre libelle="y du départ" valeur={s.y1} onChange={(n) => majListe("segments", i, { y1: n ?? 0 })} className="w-14" />
                  <span className="text-sm text-muted">à</span>
                  <Nombre libelle="x de l'arrivée" valeur={s.x2} onChange={(n) => majListe("segments", i, { x2: n ?? 0 })} className="w-14" />
                  <Nombre libelle="y de l'arrivée" valeur={s.y2} onChange={(n) => majListe("segments", i, { y2: n ?? 0 })} className="w-14" />
                  <input value={s.nom} onChange={(e) => majListe("segments", i, { nom: e.target.value })} aria-label="Nom" placeholder="Nom" maxLength={30} className={`${champ} w-16`} />
                  <label className="flex items-center gap-1.5 text-sm">
                    <input type="checkbox" checked={s.vecteur} onChange={(e) => majListe("segments", i, { vecteur: e.target.checked })} />
                    Vecteur
                  </label>
                  <Supprimer onClick={() => retirer("segments", i)} quoi={`le segment ${i + 1}`} />
                </div>
              ))}
            </Section>

            <Section
              titre="Cercles"
              ajouter={g.cercles.length < LIMITES.cercles ? () => ajouter("cercles", { x: 0, y: 0, r: 1, nom: "" }) : undefined}
            >
              {g.cercles.map((c, i) => (
                <div key={i} className={ligne}>
                  <span className="text-sm text-muted">centre</span>
                  <Nombre libelle="x du centre" valeur={c.x} onChange={(n) => majListe("cercles", i, { x: n ?? 0 })} className="w-14" />
                  <Nombre libelle="y du centre" valeur={c.y} onChange={(n) => majListe("cercles", i, { y: n ?? 0 })} className="w-14" />
                  <span className="text-sm text-muted">rayon</span>
                  <Nombre libelle="Rayon" valeur={c.r} onChange={(n) => majListe("cercles", i, { r: n ?? 1 })} className="w-14" />
                  <input value={c.nom} onChange={(e) => majListe("cercles", i, { nom: e.target.value })} aria-label="Nom" placeholder="Nom" maxLength={30} className={`${champ} w-16`} />
                  <Supprimer onClick={() => retirer("cercles", i)} quoi={`le cercle ${i + 1}`} />
                </div>
              ))}
            </Section>

            <Section
              titre="Asymptotes"
              ajouter={g.asymptotes.length < LIMITES.asymptotes ? () => ajouter("asymptotes", { sens: "verticale", valeur: 0 }) : undefined}
            >
              {g.asymptotes.map((s, i) => (
                <div key={i} className={ligne}>
                  <select
                    value={s.sens}
                    onChange={(e) => majListe("asymptotes", i, { sens: e.target.value as "verticale" })}
                    aria-label="Sens"
                    className={champ}
                  >
                    <option value="verticale">Verticale x =</option>
                    <option value="horizontale">Horizontale y =</option>
                  </select>
                  <Nombre libelle="Valeur" valeur={s.valeur} onChange={(n) => majListe("asymptotes", i, { valeur: n ?? 0 })} />
                  <Supprimer onClick={() => retirer("asymptotes", i)} quoi={`l'asymptote ${i + 1}`} />
                </div>
              ))}
            </Section>

            <Section
              titre="Aires"
              ajouter={g.courbes.length > 0 && g.aires.length < LIMITES.aires ?() => ajouter("aires", { courbe: 0, courbe2: null, a: 0, b: 1 }) : undefined}
            >
              {g.courbes.length === 0 ? <p className="text-xs text-muted">Ajoute d'abord une courbe.</p> : null}
              {g.aires.map((s, i) => (
                <div key={i} className={ligne}>
                  <span className="text-sm text-muted">entre</span>
                  <select value={s.courbe} onChange={(e) => majListe("aires", i, { courbe: Number(e.target.value) })} aria-label="Courbe" className={`${champ} max-w-32`}>
                    {g.courbes.map((c, k) => (
                      <option key={k} value={k}>
                        {c.nom || c.f || `Courbe ${k + 1}`}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm text-muted">et</span>
                  <select
                    value={s.courbe2 ?? ""}
                    onChange={(e) => majListe("aires", i, { courbe2: e.target.value === "" ? null : Number(e.target.value) })}
                    aria-label="Seconde limite"
                    className={`${champ} max-w-32`}
                  >
                    <option value="">l'axe des abscisses</option>
                    {g.courbes.map((c, k) =>
                      k === s.courbe ? null : (
                        <option key={k} value={k}>
                          {c.nom || c.f || `Courbe ${k + 1}`}
                        </option>
                      ),
                    )}
                  </select>
                  <span className="text-sm text-muted">pour x de</span>
                  <Nombre libelle="Début" valeur={s.a} onChange={(n) => majListe("aires", i, { a: n ?? 0 })} className="w-14" />
                  <span className="text-sm text-muted">à</span>
                  <Nombre libelle="Fin" valeur={s.b} onChange={(n) => majListe("aires", i, { b: n ?? 0 })} className="w-14" />
                  <Supprimer onClick={() => retirer("aires", i)} quoi={`l'aire ${i + 1}`} />
                </div>
              ))}
            </Section>
          </div>

          <div className="flex flex-col gap-2">
            <div className="rounded-2xl border-2 border-line p-2">
              <SvgGraphique g={apercu} />
            </div>
            {g.xmin >= g.xmax || g.ymin >= g.ymax ? (
              <p role="alert" className="text-sm text-ink-2">
                Le minimum doit être plus petit que le maximum (fenêtre par défaut affichée).
              </p>
            ) : null}
            <label className="flex flex-col gap-1 text-sm font-medium">
              Description (pour les lecteurs d'écran)
              <input
                value={g.alt}
                onChange={(e) => maj({ alt: e.target.value })}
                maxLength={300}
                placeholder="Parabole de sommet (1 ; −4) coupant l'axe en −1 et 3"
                className={champ}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={onFermer} className="min-h-12 rounded-full bg-soft px-6 font-medium hover:bg-line">
            Annuler
          </button>
          <button type="button" onClick={() => onValider(apercu)} className="min-h-12 rounded-full bg-ink px-6 font-bold text-white hover:bg-ink-2">
            {nouveau ? "Insérer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
