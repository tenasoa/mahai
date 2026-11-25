import { useEffect, useRef, useState, type PointerEvent as EvenementPointeur } from "react";
import { createPortal } from "react-dom";

import { SvgFigure } from "~/components/document/SvgFigure";
import {
  FIGURE_DEFAUT,
  LIMITES_FIGURE,
  NOM_POINT,
  REFS_POINT,
  cadreFigure,
  calculerFigure,
  element,
  lireNoms,
  mesuresFigure,
  nomLibre,
  normaliserFigure,
  point,
  refsElement,
  renommerPoint,
  retirerPoint,
  type Cadre,
  type ElementFigure,
  type Figure,
  type MarquePoint,
  type PointFigure,
  type PositionNom,
  type TypeElement,
  type TypePoint,
} from "~/lib/document/geometrie";
import { Nombre, Section, Supprimer, champ, ligne, petit } from "./DialogueGraphique";

/**
 * Éditeur d'une figure de géométrie : points (placés ou construits), tracés et codage, avec
 * l'aperçu en direct (le même SVG que celui de l'élève). Dans l'aperçu, on fait glisser un point
 * placé et on double-clique pour en ajouter un.
 */

export type FigureEnCours = { attrs: Record<string, unknown> | null; pos?: number };

const NOMS_TYPES_POINT: Record<TypePoint, string> = {
  libre: "Placé",
  milieu: "Milieu",
  projete: "Projeté orthogonal",
  intersection: "Intersection",
  symetrique: "Symétrique",
};

const NOMS_TYPES_ELEMENT: Record<TypeElement, string> = {
  segment: "Segment",
  droite: "Droite",
  "demi-droite": "Demi-droite",
  vecteur: "Vecteur",
  polygone: "Polygone",
  cercle: "Cercle",
  angle: "Angle",
};

const AIDE_REFS: Record<Exclude<TypeElement, "cercle">, string> = {
  segment: "AB",
  droite: "AB",
  "demi-droite": "AB",
  vecteur: "AB",
  polygone: "ABCD",
  angle: "ABC",
};

const NOMS_POSITIONS: Record<PositionNom, string> = {
  auto: "Nom : auto",
  n: "Nom en haut",
  ne: "Nom en haut à droite",
  e: "Nom à droite",
  se: "Nom en bas à droite",
  s: "Nom en bas",
  so: "Nom en bas à gauche",
  o: "Nom à gauche",
  no: "Nom en haut à gauche",
  aucune: "Nom caché",
};

const NOMS_MARQUES: Record<MarquePoint, string> = { croix: "×", point: "•", aucune: "Sans marque" };
const COULEURS = ["Noir", "Bleu", "Rouge", "Vert", "Violet"];

const p = point;
const e = element;

const MODELES: { nom: string; f: Omit<Figure, "alt"> }[] = [
  { nom: "Triangle", f: { ...FIGURE_DEFAUT } },
  {
    nom: "Triangle rectangle",
    f: {
      quadrillage: false,
      points: [p("A", 0, 0), p("B", 4, 0), p("C", 0, 3)],
      elements: [
        e("polygone", ["A", "B", "C"]),
        e("angle", ["B", "A", "C"], { droit: true }),
        e("segment", ["A", "B"], { texte: "4 cm" }),
        e("segment", ["A", "C"], { texte: "3 cm" }),
      ],
    },
  },
  {
    nom: "Triangle isocèle",
    f: {
      quadrillage: false,
      points: [p("A", 2, 3.2), p("B", 0, 0), p("C", 4, 0)],
      elements: [
        e("polygone", ["A", "B", "C"]),
        e("segment", ["A", "B"], { codage: 1 }),
        e("segment", ["A", "C"], { codage: 1 }),
        e("angle", ["A", "B", "C"], { codage: 1 }),
        e("angle", ["A", "C", "B"], { codage: 1 }),
      ],
    },
  },
  {
    nom: "Hauteur et médiane",
    f: {
      quadrillage: false,
      points: [
        p("A", 1, 3.5),
        p("B", 0, 0),
        p("C", 5, 0),
        p("H", 0, 0, { type: "projete", refs: ["A", "B", "C"] }),
        p("I", 0, 0, { type: "milieu", refs: ["B", "C"] }),
      ],
      elements: [
        e("polygone", ["A", "B", "C"]),
        e("segment", ["A", "H"], { pointille: true }),
        e("angle", ["A", "H", "C"], { droit: true }),
        e("segment", ["A", "I"], { couleur: 1 }),
        e("segment", ["B", "I"], { codage: 1 }),
        e("segment", ["I", "C"], { codage: 1 }),
      ],
    },
  },
  {
    nom: "Parallélogramme",
    f: {
      quadrillage: false,
      points: [
        p("A", 0, 0),
        p("B", 4, 0),
        p("C", 5.5, 2.5),
        p("D", 1.5, 2.5),
        p("O", 0, 0, { type: "intersection", refs: ["A", "C", "B", "D"], marque: "point" }),
      ],
      elements: [
        e("polygone", ["A", "B", "C", "D"]),
        e("segment", ["A", "O"], { pointille: true, codage: 1 }),
        e("segment", ["O", "C"], { pointille: true, codage: 1 }),
        e("segment", ["B", "O"], { pointille: true, codage: 2 }),
        e("segment", ["O", "D"], { pointille: true, codage: 2 }),
      ],
    },
  },
  {
    nom: "Thalès",
    f: {
      quadrillage: false,
      points: [p("A", 1, 4), p("B", 0, 0), p("C", 5, 0), p("M", 0.6, 2.4), p("N", 2.6, 2.4)],
      elements: [e("polygone", ["A", "B", "C"]), e("segment", ["M", "N"], { couleur: 1 })],
    },
  },
  {
    nom: "Cercle et tangente",
    f: {
      quadrillage: false,
      points: [p("O", 0, 0, { marque: "point" }), p("A", 2, 0), p("B", 2, 2.4, { marque: "aucune", position: "aucune" })],
      elements: [
        e("cercle", ["O", "A"], { texte: "C" }),
        e("segment", ["O", "A"]),
        e("droite", ["A", "B"], { texte: "(T)" }),
        e("angle", ["O", "A", "B"], { droit: true }),
      ],
    },
  },
];

/** Champ de noms de points (« ABC ») qui garde la saisie en cours. */
function Noms({
  valeur,
  onChange,
  libelle,
  aide,
  max,
  className = "w-20",
}: {
  valeur: string[];
  onChange: (noms: string[]) => void;
  libelle: string;
  aide: string;
  max: number;
  className?: string;
}) {
  const [brut, setBrut] = useState(valeur.join(""));
  useEffect(() => {
    if (lireNoms(brut).join("|") !== valeur.join("|")) setBrut(valeur.join(""));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seulement quand la valeur change de l'extérieur
  }, [valeur]);
  return (
    <input
      value={brut}
      aria-label={libelle}
      title={libelle}
      placeholder={aide}
      spellCheck={false}
      autoCapitalize="characters"
      maxLength={max * 4}
      onChange={(ev) => {
        setBrut(ev.target.value);
        onChange(lireNoms(ev.target.value).slice(0, max));
      }}
      className={`${champ} ${className} text-center font-semibold`}
    />
  );
}

/** Nom d'un point : renommé partout quand la saisie est valable et libre. */
function NomPoint({ nom, pris, onRenommer }: { nom: string; pris: (n: string) => boolean; onRenommer: (n: string) => void }) {
  const [brut, setBrut] = useState(nom);
  useEffect(() => setBrut(nom), [nom]);
  const saisi = brut.replace(/[’′]/g, "'");
  const invalide = saisi !== nom && (!NOM_POINT.test(saisi) || pris(saisi));
  return (
    <input
      value={brut}
      aria-label={`Nom du point ${nom}`}
      aria-invalid={invalide || undefined}
      title={invalide ? "Une lettre, un chiffre d'indice et des primes ; pas deux points du même nom" : "Nom du point"}
      maxLength={6}
      spellCheck={false}
      onChange={(ev) => {
        setBrut(ev.target.value);
        const n = ev.target.value.replace(/[’′]/g, "'");
        if (n !== nom && NOM_POINT.test(n) && !pris(n)) onRenommer(n);
      }}
      onBlur={() => setBrut(nom)}
      className={`${champ} w-14 text-center font-semibold ${invalide ? "border-erreur" : ""}`}
    />
  );
}

const etiquette = "text-sm text-muted";

export function DialogueFigure({
  figure,
  onValider,
  onFermer,
}: {
  figure: FigureEnCours | null;
  onValider: (f: Figure) => void;
  onFermer: () => void;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const zone = useRef<HTMLDivElement>(null);
  const [f, setF] = useState<Figure>(FIGURE_DEFAUT);
  /** Point en cours de déplacement, avec le cadre figé pendant le geste. */
  const [glisse, setGlisse] = useState<{ nom: string; cadre: Cadre } | null>(null);

  useEffect(() => {
    if (!figure) return;
    setF(figure.attrs ? normaliserFigure(figure.attrs) : FIGURE_DEFAUT);
    const d = dialogue.current;
    if (d && !d.open) d.showModal();
  }, [figure]);

  if (!figure) return null;
  const nouveau = figure.pos === undefined;
  const calcul = calculerFigure(f);
  const cadre = glisse?.cadre ?? cadreFigure(f, calcul);

  const majPoint = (i: number, partiel: Partial<PointFigure>) =>
    setF((a) => ({ ...a, points: a.points.map((pt, j) => (j === i ? { ...pt, ...partiel } : pt)) }));
  const majElement = (i: number, partiel: Partial<ElementFigure>) =>
    setF((a) => ({ ...a, elements: a.elements.map((el, j) => (j === i ? { ...el, ...partiel } : el)) }));
  const ajouterPoint = (pt: PointFigure) =>
    setF((a) => (a.points.length >= LIMITES_FIGURE.points ? a : { ...a, points: [...a.points, pt] }));
  const ajouterElement = (type: TypeElement) =>
    setF((a) => (a.elements.length >= LIMITES_FIGURE.elements ? a : { ...a, elements: [...a.elements, element(type, [])] }));

  /** Position de la souris dans la figure, arrondie (au demi-carreau, ou au centième avec Maj). */
  function positionSouris(ev: EvenementPointeur | React.MouseEvent, c: Cadre): [number, number] | null {
    const svg = zone.current?.querySelector("svg");
    const matrice = svg?.getScreenCTM();
    if (!svg || !matrice) return null;
    const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(matrice.inverse());
    const [x, y] = mesuresFigure(c).versFigure(pt.x, pt.y);
    const pas = ev.shiftKey ? 0.01 : f.quadrillage ? 0.5 : 0.1;
    const arrondi = (v: number) => Math.round(Math.round(v / pas) * pas * 100) / 100;
    return [arrondi(x), arrondi(y)];
  }

  function debutGlisse(ev: EvenementPointeur<HTMLDivElement>) {
    const cible = (ev.target as Element).closest("[data-point]");
    const nom = cible?.getAttribute("data-point");
    if (!nom) return;
    ev.preventDefault();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    setGlisse({ nom, cadre });
  }

  function suiteGlisse(ev: EvenementPointeur<HTMLDivElement>) {
    if (!glisse) return;
    const pos = positionSouris(ev, glisse.cadre);
    if (!pos) return;
    setF((a) => ({ ...a, points: a.points.map((pt) => (pt.nom === glisse.nom ? { ...pt, x: pos[0], y: pos[1] } : pt)) }));
  }

  function ajouterAuDoubleClic(ev: React.MouseEvent<HTMLDivElement>) {
    if ((ev.target as Element).closest("[data-point]")) return;
    const pos = positionSouris(ev, cadre);
    if (pos) ajouterPoint(point(nomLibre(f), pos[0], pos[1]));
  }

  const pris = (n: string) => f.points.some((pt) => pt.nom === n);

  // Portail vers <body> : hors du formulaire du sujet (Entrée dans un champ ne l'envoie pas).
  return createPortal(
    <dialog
      ref={dialogue}
      onClose={onFermer}
      aria-labelledby="titre-figure"
      className="m-auto w-[min(100vw-1.5rem,76rem)] rounded-3xl border-2 border-line bg-surface p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex max-h-[calc(100dvh-4rem)] flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="titre-figure" className="text-lg font-extrabold">
            {nouveau ? "Nouvelle figure" : "Modifier la figure"}
          </h2>
          <span className="flex-1" />
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Modèles">
            {MODELES.map((m) => (
              <button
                key={m.nom}
                type="button"
                onClick={() => setF({ ...m.f, alt: f.alt })}
                className="min-h-9 rounded-full border-2 border-line px-3 text-sm font-medium hover:border-control"
              >
                {m.nom}
              </button>
            ))}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:overflow-hidden">
          <div className="flex flex-col gap-3 md:overflow-y-auto md:pr-1">
            <Section
              titre="Points"
              ajouter={f.points.length < LIMITES_FIGURE.points ? () => ajouterPoint(point(nomLibre(f), 1, 1)) : undefined}
            >
              <p className="text-xs text-muted">
                Un point construit ne cite que des points placés plus haut. Noms : A, B1 (indice), A' (prime).
              </p>
              {f.points.map((pt, i) => {
                const erreur = calcul.erreursPoints[i];
                const refs = (debut: number, nb: number) => pt.refs.slice(debut, debut + nb).filter(Boolean);
                // Chaque place garde son rang (« » tant qu'elle n'est pas remplie).
                const majRefs = (debut: number, nb: number, noms: string[]) => {
                  const suite = Array.from({ length: REFS_POINT[pt.type] }, (_, k) => pt.refs[k] ?? "");
                  for (let j = 0; j < nb; j++) suite[debut + j] = noms[j] ?? "";
                  majPoint(i, { refs: suite });
                };
                return (
                  <div key={i} className="flex flex-col gap-1 border-b border-line pb-2 last:border-0">
                    <div className={ligne}>
                      <NomPoint nom={pt.nom} pris={pris} onRenommer={(n) => setF((a) => renommerPoint(a, pt.nom, n))} />
                      <select
                        value={pt.type}
                        onChange={(ev) => majPoint(i, { type: ev.target.value as TypePoint, refs: [] })}
                        aria-label={`Construction du point ${pt.nom}`}
                        className={champ}
                      >
                        {(Object.keys(NOMS_TYPES_POINT) as TypePoint[]).map((t) => (
                          <option key={t} value={t}>
                            {NOMS_TYPES_POINT[t]}
                          </option>
                        ))}
                      </select>
                      {pt.type === "libre" ? (
                        <>
                          <span className={etiquette}>(</span>
                          <Nombre libelle={`Abscisse de ${pt.nom}`} valeur={pt.x} onChange={(n) => majPoint(i, { x: n ?? 0 })} className="w-16" />
                          <span className={etiquette}>;</span>
                          <Nombre libelle={`Ordonnée de ${pt.nom}`} valeur={pt.y} onChange={(n) => majPoint(i, { y: n ?? 0 })} className="w-16" />
                          <span className={etiquette}>)</span>
                        </>
                      ) : null}
                      {pt.type === "milieu" ? (
                        <>
                          <span className={etiquette}>de [</span>
                          <Noms libelle="Extrémités du segment" aide="AB" max={2} valeur={refs(0, 2)} onChange={(n) => majRefs(0, 2, n)} className="w-16" />
                          <span className={etiquette}>]</span>
                        </>
                      ) : null}
                      {pt.type === "projete" ? (
                        <>
                          <span className={etiquette}>de</span>
                          <Noms libelle="Point projeté" aide="C" max={1} valeur={refs(0, 1)} onChange={(n) => majRefs(0, 1, n)} className="w-12" />
                          <span className={etiquette}>sur (</span>
                          <Noms libelle="Droite" aide="AB" max={2} valeur={refs(1, 2)} onChange={(n) => majRefs(1, 2, n)} className="w-16" />
                          <span className={etiquette}>)</span>
                        </>
                      ) : null}
                      {pt.type === "intersection" ? (
                        <>
                          <span className={etiquette}>de (</span>
                          <Noms libelle="Première droite" aide="AB" max={2} valeur={refs(0, 2)} onChange={(n) => majRefs(0, 2, n)} className="w-16" />
                          <span className={etiquette}>) et (</span>
                          <Noms libelle="Seconde droite" aide="CD" max={2} valeur={refs(2, 2)} onChange={(n) => majRefs(2, 2, n)} className="w-16" />
                          <span className={etiquette}>)</span>
                        </>
                      ) : null}
                      {pt.type === "symetrique" ? (
                        <>
                          <span className={etiquette}>de</span>
                          <Noms libelle="Point de départ" aide="A" max={1} valeur={refs(0, 1)} onChange={(n) => majRefs(0, 1, n)} className="w-12" />
                          <span className={etiquette}>par rapport à</span>
                          <Noms libelle="Centre de symétrie" aide="O" max={1} valeur={refs(1, 1)} onChange={(n) => majRefs(1, 1, n)} className="w-12" />
                        </>
                      ) : null}
                    </div>
                    <div className={ligne}>
                      <select
                        value={pt.marque}
                        onChange={(ev) => majPoint(i, { marque: ev.target.value as MarquePoint })}
                        aria-label={`Marque du point ${pt.nom}`}
                        className={champ}
                      >
                        {(Object.keys(NOMS_MARQUES) as MarquePoint[]).map((m) => (
                          <option key={m} value={m}>
                            {NOMS_MARQUES[m]}
                          </option>
                        ))}
                      </select>
                      <select
                        value={pt.position}
                        onChange={(ev) => majPoint(i, { position: ev.target.value as PositionNom })}
                        aria-label={`Place du nom de ${pt.nom}`}
                        className={champ}
                      >
                        {(Object.keys(NOMS_POSITIONS) as PositionNom[]).map((m) => (
                          <option key={m} value={m}>
                            {NOMS_POSITIONS[m]}
                          </option>
                        ))}
                      </select>
                      <span className="flex-1" />
                      <Supprimer onClick={() => setF((a) => retirerPoint(a, pt.nom))} quoi={`le point ${pt.nom} et ce qui en dépend`} />
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

            <Section titre="Tracés et codage">
              {f.elements.map((el, i) => {
                const erreur = calcul.erreursElements[i];
                const [, max] = refsElement(el.type);
                return (
                  <div key={i} className="flex flex-col gap-1 border-b border-line pb-2 last:border-0">
                    <div className={ligne}>
                      <select
                        value={el.type}
                        onChange={(ev) => {
                          const type = ev.target.value as TypeElement;
                          majElement(i, { type, refs: el.refs.slice(0, refsElement(type)[1]) });
                        }}
                        aria-label={`Genre du tracé ${i + 1}`}
                        className={champ}
                      >
                        {(Object.keys(NOMS_TYPES_ELEMENT) as TypeElement[]).map((t) => (
                          <option key={t} value={t}>
                            {NOMS_TYPES_ELEMENT[t]}
                          </option>
                        ))}
                      </select>
                      {el.type === "cercle" ? (
                        <>
                          <span className={etiquette}>centre</span>
                          <Noms
                            libelle="Centre du cercle"
                            aide="O"
                            max={1}
                            valeur={el.refs.slice(0, 1).filter(Boolean)}
                            onChange={(n) => majElement(i, { refs: el.refs[1] ? [n[0] ?? "", el.refs[1]] : [n[0] ?? ""] })}
                            className="w-12"
                          />
                          <span className={etiquette}>passant par</span>
                          <Noms
                            libelle="Point du cercle (vide : rayon)"
                            aide="A"
                            max={1}
                            valeur={el.refs.slice(1, 2)}
                            onChange={(n) => majElement(i, { refs: [el.refs[0] ?? "", ...n] })}
                            className="w-12"
                          />
                          {el.refs.length < 2 ? (
                            <>
                              <span className={etiquette}>ou rayon</span>
                              <Nombre libelle="Rayon" valeur={el.rayon} onChange={(n) => majElement(i, { rayon: Math.abs(n ?? 1) || 1 })} className="w-14" />
                            </>
                          ) : null}
                        </>
                      ) : (
                        <Noms
                          libelle={el.type === "angle" ? "Angle (sommet au milieu)" : el.type === "polygone" ? "Sommets dans l'ordre" : "Points"}
                          aide={AIDE_REFS[el.type]}
                          max={max}
                          valeur={el.refs}
                          onChange={(n) => majElement(i, { refs: n })}
                          className={el.type === "polygone" ? "w-28" : "w-16"}
                        />
                      )}
                      <input
                        value={el.texte}
                        onChange={(ev) => majElement(i, { texte: ev.target.value })}
                        aria-label="Texte affiché"
                        placeholder={
                          el.type === "segment" ? "4 cm" : el.type === "angle" ? "60°" : el.type === "vecteur" ? "u" : el.type === "polygone" ? "" : "(d)"
                        }
                        maxLength={30}
                        className={`${champ} w-20`}
                      />
                      <span className="flex-1" />
                      <Supprimer onClick={() => setF((a) => ({ ...a, elements: a.elements.filter((_, j) => j !== i) }))} quoi={`le tracé ${i + 1}`} />
                    </div>
                    <div className={`${ligne} text-sm`}>
                      {el.type === "segment" ? (
                        <select
                          value={el.codage}
                          onChange={(ev) => majElement(i, { codage: Number(ev.target.value) })}
                          aria-label="Codage des longueurs égales"
                          className={champ}
                        >
                          <option value={0}>Sans codage</option>
                          <option value={1}>Codage /</option>
                          <option value={2}>Codage //</option>
                          <option value={3}>Codage ///</option>
                        </select>
                      ) : null}
                      {el.type === "angle" ? (
                        <>
                          <label className="flex items-center gap-1.5">
                            <input type="checkbox" checked={el.droit} onChange={(ev) => majElement(i, { droit: ev.target.checked })} />
                            Angle droit
                          </label>
                          {el.droit ? null : (
                            <select
                              value={Math.max(1, el.codage)}
                              onChange={(ev) => majElement(i, { codage: Number(ev.target.value) })}
                              aria-label="Nombre d'arcs"
                              className={champ}
                            >
                              <option value={1}>1 arc</option>
                              <option value={2}>2 arcs</option>
                              <option value={3}>3 arcs</option>
                            </select>
                          )}
                        </>
                      ) : null}
                      {el.type === "polygone" ? (
                        <label className="flex items-center gap-1.5">
                          <input type="checkbox" checked={el.remplir} onChange={(ev) => majElement(i, { remplir: ev.target.checked })} />
                          Grisé
                        </label>
                      ) : null}
                      {el.type === "angle" ? null : (
                        <label className="flex items-center gap-1.5">
                          <input type="checkbox" checked={el.pointille} onChange={(ev) => majElement(i, { pointille: ev.target.checked })} />
                          Pointillés
                        </label>
                      )}
                      <select
                        value={el.couleur}
                        onChange={(ev) => majElement(i, { couleur: Number(ev.target.value) })}
                        aria-label="Couleur"
                        className={champ}
                      >
                        {COULEURS.map((nom, k) => (
                          <option key={k} value={k}>
                            {nom}
                          </option>
                        ))}
                      </select>
                    </div>
                    {erreur ? (
                      <p role="alert" className="text-sm text-ink-2">
                        {erreur}
                      </p>
                    ) : null}
                  </div>
                );
              })}
              {f.elements.length < LIMITES_FIGURE.elements ? (
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Ajouter un tracé">
                  {(Object.keys(NOMS_TYPES_ELEMENT) as TypeElement[]).map((t) => (
                    <button key={t} type="button" onClick={() => ajouterElement(t)} className={petit}>
                      + {NOMS_TYPES_ELEMENT[t]}
                    </button>
                  ))}
                </div>
              ) : null}
            </Section>

            <label className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" checked={f.quadrillage} onChange={(ev) => setF((a) => ({ ...a, quadrillage: ev.target.checked }))} />
              Quadrillage (une unité par carreau)
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <div
              ref={zone}
              onPointerDown={debutGlisse}
              onPointerMove={suiteGlisse}
              onPointerUp={() => setGlisse(null)}
              onPointerCancel={() => setGlisse(null)}
              onDoubleClick={ajouterAuDoubleClic}
              className="touch-none rounded-2xl border-2 border-line p-2 select-none"
            >
              <SvgFigure f={f} calcul={calcul} cadre={cadre} interactif />
            </div>
            <p className="text-xs text-muted">
              Fais glisser un point placé pour le déplacer (Maj : au centième), double-clique pour ajouter un point.
            </p>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Description (pour les lecteurs d'écran)
              <input
                value={f.alt}
                onChange={(ev) => setF((a) => ({ ...a, alt: ev.target.value }))}
                maxLength={300}
                placeholder="Triangle ABC rectangle en A, avec AB = 4 cm et AC = 3 cm"
                className={champ}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={onFermer} className="min-h-12 rounded-full bg-soft px-6 font-medium hover:bg-line">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onValider(normaliserFigure(f))}
            className="min-h-12 rounded-full bg-ink px-6 font-bold text-white hover:bg-ink-2"
          >
            {nouveau ? "Insérer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
