/**
 * Figure de géométrie plane : points (placés ou construits : milieu, projeté, intersection,
 * symétrique), segments, droites, demi-droites, vecteurs, polygones, cercles et angles, avec le
 * codage habituel (traits d'égalité, angle droit, arcs). Décrite par des données (attributs du
 * nœud `geometrie`) et dessinée en SVG sur le serveur (`SvgFigure`) : rien à exécuter chez
 * l'élève. Logique pure, partagée par l'éditeur, le nettoyage et le rendu.
 */

export type Vec = [number, number];

export const TYPES_POINT = ["libre", "milieu", "projete", "intersection", "symetrique"] as const;
export type TypePoint = (typeof TYPES_POINT)[number];

/** Points cités par la construction : milieu de [AB], projeté de P sur (AB), (AB) ∩ (CD), symétrique de P par rapport à O. */
export const REFS_POINT: Record<TypePoint, number> = { libre: 0, milieu: 2, projete: 3, intersection: 4, symetrique: 2 };

export const MARQUES_POINT = ["croix", "point", "aucune"] as const;
export type MarquePoint = (typeof MARQUES_POINT)[number];

/** Place du nom autour du point ; « aucune » : nom caché (point de construction). */
export const POSITIONS_NOM = ["auto", "n", "ne", "e", "se", "s", "so", "o", "no", "aucune"] as const;
export type PositionNom = (typeof POSITIONS_NOM)[number];

export type PointFigure = {
  nom: string;
  type: TypePoint;
  refs: string[];
  /** Coordonnées d'un point libre (ignorées pour un point construit). */
  x: number;
  y: number;
  marque: MarquePoint;
  position: PositionNom;
};

export const TYPES_ELEMENT = ["segment", "droite", "demi-droite", "vecteur", "polygone", "cercle", "angle"] as const;
export type TypeElement = (typeof TYPES_ELEMENT)[number];

export type ElementFigure = {
  type: TypeElement;
  /**
   * segment, droite, demi-droite [AB), vecteur : 2 points ; polygone : 3 à 12 sommets ;
   * cercle : centre, puis un point du cercle ou rien (rayon) ; angle : A, sommet, B.
   */
  refs: string[];
  /** Rayon d'un cercle donné par son centre seul. */
  rayon: number;
  /** Longueur, nom de la droite « (d) », mesure d'angle « 60° »… */
  texte: string;
  /** Traits d'égalité (segment) ou arcs (angle), de 0 à 3. */
  codage: number;
  /** Angle droit (petit carré). */
  droit: boolean;
  pointille: boolean;
  /** 0 = noir, 1 à 4 = couleurs des tracés. */
  couleur: number;
  /** Polygone grisé. */
  remplir: boolean;
};

export type Figure = { points: PointFigure[]; elements: ElementFigure[]; quadrillage: boolean; alt: string };

export const LIMITES_FIGURE = { points: 40, elements: 60, sommets: 12 } as const;
export const NB_COULEURS_FIGURE = 5;

/** Nom de point : une lettre, un indice facultatif (A1 → A₁), des primes (A′). */
export const NOM_POINT = /^[A-Za-zΩ]\d{0,2}'{0,3}$/;
const JETON_POINT = /[A-Za-zΩ]\d{0,2}'{0,3}/g;

/** « ABC », « A B C », « A1A2 », « A'B' » → noms des points. */
export function lireNoms(saisie: string): string[] {
  return saisie.replace(/[’′]/g, "'").match(JETON_POINT) ?? [];
}

export const point = (nom: string, x: number, y: number, partiel: Partial<PointFigure> = {}): PointFigure => ({
  nom,
  type: "libre",
  refs: [],
  x,
  y,
  marque: "croix",
  position: "auto",
  ...partiel,
});

export const element = (type: TypeElement, refs: string[], partiel: Partial<ElementFigure> = {}): ElementFigure => ({
  type,
  refs,
  rayon: 1,
  texte: "",
  codage: 0,
  droit: false,
  pointille: false,
  couleur: 0,
  remplir: false,
  ...partiel,
});

export const FIGURE_DEFAUT: Figure = {
  quadrillage: false,
  alt: "",
  points: [point("A", 0, 0), point("B", 4, 0), point("C", 1, 3)],
  elements: [element("polygone", ["A", "B", "C"])],
};

/* ---------- Nettoyage ---------- */

const BORNE = 1000;

function nombre(v: unknown, defaut: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.replace(",", ".")) : NaN;
  if (!Number.isFinite(n) || Math.abs(n) > BORNE) return defaut;
  return Math.round(n * 1e4) / 1e4;
}

const entierEntre = (v: unknown, min: number, max: number, defaut: number) => {
  const n = nombre(v, defaut);
  return Number.isInteger(n) && n >= min && n <= max ? n : defaut;
};
const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max).trim() : "");
const choix = <T extends string>(v: unknown, liste: readonly T[], defaut: T): T =>
  typeof v === "string" && (liste as readonly string[]).includes(v) ? (v as T) : defaut;
const liste = (v: unknown, max: number): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((e) => e && typeof e === "object").slice(0, max) : [];
const noms = (v: unknown, max: number): string[] =>
  Array.isArray(v) ? v.filter((n): n is string => typeof n === "string" && NOM_POINT.test(n)).slice(0, max) : [];

/** Nombre de points attendus par un élément : [minimum, maximum]. */
export function refsElement(type: TypeElement): [number, number] {
  if (type === "polygone") return [3, LIMITES_FIGURE.sommets];
  if (type === "cercle") return [1, 2];
  if (type === "angle") return [3, 3];
  return [2, 2];
}

/**
 * Valeurs vérifiées et complétées (nettoyage serveur et lecture dans l'éditeur). Les noms de
 * points en double sont écartés ; les références restent telles quelles (une figure en cours
 * peut citer un point pas encore créé) : `calculerFigure` signale celles qui ne mènent à rien.
 */
export function normaliserFigure(a: Record<string, unknown> | undefined): Figure {
  const vus = new Set<string>();
  const points: PointFigure[] = [];
  for (const p of liste(a?.points, LIMITES_FIGURE.points)) {
    const nom = typeof p.nom === "string" ? p.nom.replace(/[’′]/g, "'") : "";
    if (!NOM_POINT.test(nom) || vus.has(nom)) continue;
    vus.add(nom);
    const type = choix(p.type, TYPES_POINT, "libre");
    points.push({
      nom,
      type,
      refs: noms(p.refs, REFS_POINT[type]),
      x: nombre(p.x, 0),
      y: nombre(p.y, 0),
      marque: choix(p.marque, MARQUES_POINT, "croix"),
      position: choix(p.position, POSITIONS_NOM, "auto"),
    });
  }
  const elements = liste(a?.elements, LIMITES_FIGURE.elements).map((e): ElementFigure => {
    const type = choix(e.type, TYPES_ELEMENT, "segment");
    return {
      type,
      refs: noms(e.refs, refsElement(type)[1]),
      rayon: Math.abs(nombre(e.rayon, 1)) || 1,
      texte: texte(e.texte, 30),
      codage: entierEntre(e.codage, 0, 3, 0),
      droit: e.droit === true,
      pointille: e.pointille === true,
      couleur: entierEntre(e.couleur, 0, NB_COULEURS_FIGURE - 1, 0),
      remplir: e.remplir === true,
    };
  });
  return { points, elements, quadrillage: a?.quadrillage === true, alt: texte(a?.alt, 300) };
}

/* ---------- Constructions ---------- */

const plus = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const moins = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const fois = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
const scalaire = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];
const vectoriel = (a: Vec, b: Vec) => a[0] * b[1] - a[1] * b[0];
export const distance = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const EPS = 1e-9;

export type CalculFigure = {
  /** Position de chaque point que l'on a pu placer. */
  positions: Map<string, Vec>;
  /** Par point (même ordre que `figure.points`) : pourquoi il n'a pas pu être placé. */
  erreursPoints: (string | null)[];
  /** Par élément : pourquoi il n'est pas dessiné. */
  erreursElements: (string | null)[];
};

const DESIGNATION: Record<TypePoint, (r: string[]) => string> = {
  libre: () => "",
  milieu: ([a, b]) => `[${a}${b}]`,
  projete: ([, a, b]) => `(${a}${b})`,
  intersection: ([a, b, c, d]) => `(${a}${b}) et (${c}${d})`,
  symetrique: () => "",
};

/** Place les points dans l'ordre : un point construit ne cite que des points placés avant lui. */
export function calculerFigure(f: Figure): CalculFigure {
  const positions = new Map<string, Vec>();
  const erreursPoints = f.points.map((p): string | null => {
    if (p.type === "libre") {
      positions.set(p.nom, [p.x, p.y]);
      return null;
    }
    if (p.refs.length < REFS_POINT[p.type] || p.refs.some((r) => !r)) return "Construction incomplète.";
    const inconnu = p.refs.find((r) => !positions.has(r));
    if (inconnu) return `${inconnu} doit être un point défini plus haut dans la liste.`;
    const [a, b, c, d] = p.refs.map((r) => positions.get(r)!) as Vec[];
    let pos: Vec | null = null;
    if (p.type === "milieu") pos = fois(plus(a!, b!), 0.5);
    if (p.type === "symetrique") pos = moins(fois(b!, 2), a!);
    if (p.type === "projete") {
      const u = moins(c!, b!);
      const n = scalaire(u, u);
      if (n < EPS) return `Les deux points de la droite ${DESIGNATION.projete(p.refs)} sont confondus.`;
      pos = plus(b!, fois(u, scalaire(moins(a!, b!), u) / n));
    }
    if (p.type === "intersection") {
      const u = moins(b!, a!);
      const v = moins(d!, c!);
      const det = vectoriel(u, v);
      if (Math.abs(det) < EPS) return `Les droites ${DESIGNATION.intersection(p.refs)} sont parallèles.`;
      pos = plus(a!, fois(u, vectoriel(moins(c!, a!), v) / det));
    }
    if (!pos || !Number.isFinite(pos[0]) || !Number.isFinite(pos[1])) return "Point impossible à placer.";
    positions.set(p.nom, [Math.round(pos[0] * 1e6) / 1e6, Math.round(pos[1] * 1e6) / 1e6]);
    return null;
  });

  const erreursElements = f.elements.map((e): string | null => {
    const [min] = refsElement(e.type);
    if (e.refs.length < min || e.refs.some((r) => !r)) {
      if (e.refs.length >= min) return "Il manque un point.";
      return e.type === "polygone" ? "Il faut au moins 3 sommets." : `Il faut ${min} point${min > 1 ? "s" : ""}.`;
    }
    const inconnu = e.refs.find((r) => !positions.has(r));
    if (inconnu) return `Le point ${inconnu} n'existe pas.`;
    const pts = e.refs.map((r) => positions.get(r)!);
    if (e.type === "angle" && (distance(pts[0]!, pts[1]!) < EPS || distance(pts[2]!, pts[1]!) < EPS)) {
      return "Un côté de l'angle est réduit au sommet.";
    }
    if ((e.type === "droite" || e.type === "demi-droite") && distance(pts[0]!, pts[1]!) < EPS) {
      return "Les deux points sont confondus.";
    }
    return null;
  });

  return { positions, erreursPoints, erreursElements };
}

/* ---------- Cadre et dessin ---------- */

export type Cadre = { xmin: number; xmax: number; ymin: number; ymax: number };

/**
 * Fenêtre de la figure : tous les points et les cercles, avec une marge pour les noms ; jamais
 * plus haute que large (la figure garde une taille de texte constante sur la page).
 */
export function cadreFigure(f: Figure, calcul: CalculFigure): Cadre {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [x, y] of calcul.positions.values()) {
    xs.push(x);
    ys.push(y);
  }
  f.elements.forEach((e, i) => {
    if (e.type !== "cercle" || calcul.erreursElements[i]) return;
    const c = calcul.positions.get(e.refs[0]!)!;
    const r = e.refs[1] ? distance(c, calcul.positions.get(e.refs[1])!) : e.rayon;
    xs.push(c[0] - r, c[0] + r);
    ys.push(c[1] - r, c[1] + r);
  });
  if (!xs.length) return { xmin: -1, xmax: 5, ymin: -1, ymax: 4 };
  let xmin = Math.min(...xs);
  let xmax = Math.max(...xs);
  let ymin = Math.min(...ys);
  let ymax = Math.max(...ys);
  const marge = Math.max(xmax - xmin, ymax - ymin, 1) * 0.12;
  xmin -= marge;
  xmax += marge;
  ymin -= marge;
  ymax += marge;
  // Rapport hauteur / largeur entre 0,35 et 1 : on élargit le côté trop court.
  const l = xmax - xmin;
  const h = ymax - ymin;
  if (h > l) {
    xmin -= (h - l) / 2;
    xmax += (h - l) / 2;
  } else if (h < l * 0.35) {
    ymin -= (l * 0.35 - h) / 2;
    ymax += (l * 0.35 - h) / 2;
  }
  return { xmin, xmax, ymin, ymax };
}

/** Partie visible d'une droite (AB) ou d'une demi-droite [AB) dans le cadre. */
export function couperAuCadre(a: Vec, b: Vec, cadre: Cadre, demi: boolean): [Vec, Vec] | null {
  const u = moins(b, a);
  let t0 = demi ? 0 : -Infinity;
  let t1 = Infinity;
  const bornes: [number, number, number, number][] = [
    [u[0], a[0], cadre.xmin, cadre.xmax],
    [u[1], a[1], cadre.ymin, cadre.ymax],
  ];
  for (const [du, depart, min, max] of bornes) {
    if (Math.abs(du) < EPS) {
      if (depart < min || depart > max) return null;
      continue;
    }
    const ta = (min - depart) / du;
    const tb = (max - depart) / du;
    t0 = Math.max(t0, Math.min(ta, tb));
    t1 = Math.min(t1, Math.max(ta, tb));
  }
  if (!(t0 < t1)) return null;
  return [plus(a, fois(u, t0)), plus(a, fois(u, t1))];
}

/** Directions des points reliés à chaque point (pour placer son nom du côté libre). */
export function voisins(f: Figure, calcul: CalculFigure): Map<string, Vec[]> {
  const v = new Map<string, Vec[]>();
  const relier = (p: string, q: string) => {
    const a = calcul.positions.get(p);
    const b = calcul.positions.get(q);
    if (!a || !b || p === q) return;
    const d = distance(a, b);
    if (d < EPS) return;
    v.set(p, [...(v.get(p) ?? []), fois(moins(b, a), 1 / d)]);
    v.set(q, [...(v.get(q) ?? []), fois(moins(a, b), 1 / d)]);
  };
  f.elements.forEach((e, i) => {
    if (calcul.erreursElements[i]) return;
    const r = e.refs;
    if (e.type === "polygone") r.forEach((p, k) => relier(p, r[(k + 1) % r.length]!));
    else if (e.type === "angle") {
      relier(r[1]!, r[0]!);
      relier(r[1]!, r[2]!);
    } else if (e.type === "cercle") {
      if (r[1]) relier(r[0]!, r[1]);
    } else relier(r[0]!, r[1]!);
  });
  // Point construit : il est sur la droite ou le segment qui le définit.
  f.points.forEach((p, i) => {
    if (calcul.erreursPoints[i]) return;
    if (p.type === "milieu") {
      relier(p.nom, p.refs[0]!);
      relier(p.nom, p.refs[1]!);
    }
    if (p.type === "projete") {
      relier(p.nom, p.refs[1]!);
      relier(p.nom, p.refs[2]!);
    }
  });
  return v;
}

const DIRECTIONS: Record<Exclude<PositionNom, "auto" | "aucune">, Vec> = {
  n: [0, 1],
  ne: [Math.SQRT1_2, Math.SQRT1_2],
  e: [1, 0],
  se: [Math.SQRT1_2, -Math.SQRT1_2],
  s: [0, -1],
  so: [-Math.SQRT1_2, -Math.SQRT1_2],
  o: [-1, 0],
  no: [-Math.SQRT1_2, Math.SQRT1_2],
};

/**
 * Direction (unitaire, repère mathématique) où écrire le nom d'un point : à l'opposé des
 * segments qui en partent, sinon à l'écart du centre de la figure.
 */
export function directionNom(p: PointFigure, pos: Vec, autour: Vec[] | undefined, centre: Vec): Vec | null {
  if (p.position === "aucune") return null;
  if (p.position !== "auto") return DIRECTIONS[p.position];
  let d: Vec = [0, 0];
  for (const u of autour ?? []) d = moins(d, u);
  if (Math.hypot(...d) < 0.3 && autour?.length) {
    // Deux voisins opposés (point au milieu d'un segment) : de côté.
    const u = autour[0]!;
    d = [-u[1], u[0]];
    const versCentre = moins(centre, pos);
    if (scalaire(d, versCentre) > 0) d = fois(d, -1);
  }
  if (Math.hypot(...d) < EPS) d = moins(pos, centre);
  const n = Math.hypot(...d);
  return n < EPS ? DIRECTIONS.ne : fois(d, 1 / n);
}

/** Prochain nom libre : A, B… Z, puis A1, B1… */
export function nomLibre(f: Figure): string {
  const pris = new Set(f.points.map((p) => p.nom));
  for (let tour = 0; tour < 10; tour++) {
    for (let i = 0; i < 26; i++) {
      const nom = `${String.fromCharCode(65 + i)}${tour ? tour : ""}`;
      if (!pris.has(nom)) return nom;
    }
  }
  return "Z99";
}

/** Retire un point et tout ce qui le cite (constructions et éléments). */
export function retirerPoint(f: Figure, nom: string): Figure {
  const retires = new Set([nom]);
  for (const p of f.points) if (p.refs.some((r) => retires.has(r))) retires.add(p.nom);
  return {
    ...f,
    points: f.points.filter((p) => !retires.has(p.nom)),
    elements: f.elements.filter((e) => !e.refs.some((r) => retires.has(r))),
  };
}

/** Renomme un point partout où il est cité. */
export function renommerPoint(f: Figure, ancien: string, nouveau: string): Figure {
  const r = (n: string) => (n === ancien ? nouveau : n);
  return {
    ...f,
    points: f.points.map((p) => ({ ...p, nom: r(p.nom), refs: p.refs.map(r) })),
    elements: f.elements.map((e) => ({ ...e, refs: e.refs.map(r) })),
  };
}

/** Passage des coordonnées de la figure au dessin (pixels du `viewBox`, y vers le bas). */
export const LARGEUR_FIGURE = 520;
export const MARGE_FIGURE = 12;

export function mesuresFigure(cadre: Cadre) {
  const k = LARGEUR_FIGURE / (cadre.xmax - cadre.xmin);
  const hauteur = (cadre.ymax - cadre.ymin) * k;
  return {
    k,
    largeur: LARGEUR_FIGURE + 2 * MARGE_FIGURE,
    hauteur: hauteur + 2 * MARGE_FIGURE,
    // Au dixième de pixel : assez précis, et le HTML reste léger.
    X: (x: number) => Math.round((MARGE_FIGURE + (x - cadre.xmin) * k) * 10) / 10,
    Y: (y: number) => Math.round((MARGE_FIGURE + (cadre.ymax - y) * k) * 10) / 10,
    /** Point du dessin → coordonnées de la figure. */
    versFigure: (sx: number, sy: number): Vec => [cadre.xmin + (sx - MARGE_FIGURE) / k, cadre.ymax - (sy - MARGE_FIGURE) / k],
  };
}
