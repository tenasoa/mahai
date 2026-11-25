/**
 * Graphique dans un repère : courbes de fonctions, points, segments et vecteurs, cercles,
 * asymptotes et aires. Décrit par des données (attributs du nœud `graphique`) et dessiné en SVG
 * sur le serveur (`SvgGraphique`) : aucun JavaScript côté élève, impression nette.
 */

import { essayerCompiler } from "./expression";

export type Courbe = { f: string; nom: string; min: number | null; max: number | null; couleur: number; pointille: boolean };
export type PointRepere = { x: number; y: number; nom: string; projections: boolean };
export type Segment = { x1: number; y1: number; x2: number; y2: number; vecteur: boolean; nom: string };
export type Cercle = { x: number; y: number; r: number; nom: string };
export type Asymptote = { sens: "verticale" | "horizontale"; valeur: number };
export type Aire = { courbe: number; courbe2: number | null; a: number; b: number };

export type Graphique = {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  pasX: number;
  pasY: number;
  grille: boolean;
  orthonorme: boolean;
  nomX: string;
  nomY: string;
  alt: string;
  courbes: Courbe[];
  points: PointRepere[];
  segments: Segment[];
  cercles: Cercle[];
  asymptotes: Asymptote[];
  aires: Aire[];
};

export const NB_COULEURS = 4;

export const LIMITES = { courbes: 6, points: 30, segments: 30, cercles: 10, asymptotes: 10, aires: 4 } as const;

export const GRAPHIQUE_DEFAUT: Graphique = {
  xmin: -5,
  xmax: 5,
  ymin: -4,
  ymax: 4,
  pasX: 1,
  pasY: 1,
  grille: true,
  orthonorme: true,
  nomX: "x",
  nomY: "y",
  alt: "",
  courbes: [{ f: "x^2 - 2", nom: "C_f", min: null, max: null, couleur: 0, pointille: false }],
  points: [],
  segments: [],
  cercles: [],
  asymptotes: [],
  aires: [],
};

const BORNE = 1e6;

/** Nombre fini, arrondi (évite 0,30000000000000004) et borné ; `defaut` sinon. */
function nombre(v: unknown, defaut: number): number;
function nombre(v: unknown, defaut: null): number | null;
function nombre(v: unknown, defaut: number | null): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.replace(",", ".")) : NaN;
  if (!Number.isFinite(n) || Math.abs(n) > BORNE) return defaut;
  return Math.round(n * 1e6) / 1e6;
}

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const liste = (v: unknown, max: number): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((e) => e && typeof e === "object").slice(0, max) : [];

/** Pas de graduation « rond » donnant au plus ~20 graduations. */
export function pasAuto(etendue: number): number {
  const brut = etendue / 10;
  const puissance = 10 ** Math.floor(Math.log10(brut));
  const m = brut / puissance;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * puissance;
}

/** Valeurs vérifiées et complétées (nettoyage serveur et lecture dans l'éditeur). */
export function normaliserGraphique(a: Record<string, unknown> | undefined): Graphique {
  const d = GRAPHIQUE_DEFAUT;
  let xmin = nombre(a?.xmin, d.xmin);
  let xmax = nombre(a?.xmax, d.xmax);
  if (!(xmin < xmax)) [xmin, xmax] = [d.xmin, d.xmax];
  let ymin = nombre(a?.ymin, d.ymin);
  let ymax = nombre(a?.ymax, d.ymax);
  if (!(ymin < ymax)) [ymin, ymax] = [d.ymin, d.ymax];
  // Au plus 50 graduations par axe : sinon un pas rond est choisi.
  const pas = (v: unknown, etendue: number) => {
    const p = nombre(v, 0);
    return p > 0 && etendue / p <= 50 ? p : pasAuto(etendue);
  };
  const couleur = (v: unknown) => {
    const n = nombre(v, 0);
    return Number.isInteger(n) && n >= 0 && n < NB_COULEURS ? n : 0;
  };
  const nbCourbes = Math.min(liste(a?.courbes, LIMITES.courbes).length, LIMITES.courbes);
  const indiceCourbe = (v: unknown) => {
    const n = nombre(v, -1);
    return Number.isInteger(n) && n >= 0 && n < nbCourbes ? n : null;
  };
  return {
    xmin,
    xmax,
    ymin,
    ymax,
    pasX: pas(a?.pasX, xmax - xmin),
    pasY: pas(a?.pasY, ymax - ymin),
    grille: a?.grille !== false,
    orthonorme: a?.orthonorme !== false,
    nomX: texte(a?.nomX ?? d.nomX, 20),
    nomY: texte(a?.nomY ?? d.nomY, 20),
    alt: texte(a?.alt, 300).trim(),
    courbes: liste(a?.courbes, LIMITES.courbes).map((c) => ({
      f: texte(c.f, 200),
      nom: texte(c.nom, 30),
      min: nombre(c.min, null),
      max: nombre(c.max, null),
      couleur: couleur(c.couleur),
      pointille: c.pointille === true,
    })),
    points: liste(a?.points, LIMITES.points).map((p) => ({
      x: nombre(p.x, 0),
      y: nombre(p.y, 0),
      nom: texte(p.nom, 30),
      projections: p.projections === true,
    })),
    segments: liste(a?.segments, LIMITES.segments).map((s) => ({
      x1: nombre(s.x1, 0),
      y1: nombre(s.y1, 0),
      x2: nombre(s.x2, 1),
      y2: nombre(s.y2, 1),
      vecteur: s.vecteur === true,
      nom: texte(s.nom, 30),
    })),
    cercles: liste(a?.cercles, LIMITES.cercles).map((c) => ({
      x: nombre(c.x, 0),
      y: nombre(c.y, 0),
      r: Math.abs(nombre(c.r, 1)) || 1,
      nom: texte(c.nom, 30),
    })),
    asymptotes: liste(a?.asymptotes, LIMITES.asymptotes).map((s) => ({
      sens: s.sens === "horizontale" ? ("horizontale" as const) : ("verticale" as const),
      valeur: nombre(s.valeur, 0),
    })),
    aires: liste(a?.aires, LIMITES.aires)
      .map((s) => ({
        courbe: indiceCourbe(s.courbe) ?? -1,
        courbe2: indiceCourbe(s.courbe2),
        a: nombre(s.a, 0),
        b: nombre(s.b, 1),
      }))
      .filter((s) => s.courbe >= 0),
  };
}

export type Point2 = [number, number];

const ECHANTILLONS = 600;

/**
 * Points d'une courbe, en coordonnées du repère, coupés en morceaux là où la fonction n'est pas
 * définie ou saute d'un bord à l'autre (asymptote verticale). Les ordonnées très loin de la
 * fenêtre sont ramenées juste au-delà du bord (le dessin est ensuite découpé à la fenêtre).
 */
export function echantillonner(g: Graphique, c: Courbe): Point2[][] {
  const f = essayerCompiler(c.f);
  if (!f) return [];
  const debut = Math.max(g.xmin, c.min ?? -Infinity);
  const fin = Math.min(g.xmax, c.max ?? Infinity);
  if (!(debut < fin)) return [];
  const hauteur = g.ymax - g.ymin;
  const bas = g.ymin - hauteur;
  const haut = g.ymax + hauteur;
  const morceaux: Point2[][] = [];
  let courant: Point2[] = [];
  let precedent: number | null = null;
  for (let i = 0; i <= ECHANTILLONS; i++) {
    const x = debut + ((fin - debut) * i) / ECHANTILLONS;
    const y = f(x);
    if (!Number.isFinite(y)) {
      if (courant.length > 1) morceaux.push(courant);
      courant = [];
      precedent = null;
      continue;
    }
    if (precedent !== null && ((precedent > haut && y < bas) || (precedent < bas && y > haut))) {
      if (courant.length > 1) morceaux.push(courant);
      courant = [];
    }
    courant.push([x, Math.min(haut, Math.max(bas, y))]);
    precedent = y;
  }
  if (courant.length > 1) morceaux.push(courant);
  return morceaux;
}

/** Contour d'une aire : sous la courbe (jusqu'à l'axe des abscisses) ou entre deux courbes. */
export function contourAire(g: Graphique, aire: Aire): Point2[] | null {
  const c1 = g.courbes[aire.courbe];
  const f1 = c1 ? essayerCompiler(c1.f) : null;
  if (!f1) return null;
  const c2 = aire.courbe2 === null ? null : g.courbes[aire.courbe2];
  const f2 = c2 ? essayerCompiler(c2.f) : null;
  const a = Math.max(Math.min(aire.a, aire.b), g.xmin);
  const b = Math.min(Math.max(aire.a, aire.b), g.xmax);
  if (!(a < b)) return null;
  const hauteur = g.ymax - g.ymin;
  const borner = (y: number) => (Number.isFinite(y) ? Math.min(g.ymax + hauteur, Math.max(g.ymin - hauteur, y)) : 0);
  const n = 200;
  const haut: Point2[] = [];
  const bas: Point2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n;
    haut.push([x, borner(f1(x))]);
    bas.push([x, f2 ? borner(f2(x)) : 0]);
  }
  return [...haut, ...bas.reverse()];
}

/** Graduations multiples de `pas` dans [min, max]. */
export function graduations(min: number, max: number, pas: number): number[] {
  const valeurs: number[] = [];
  for (let k = Math.ceil(min / pas - 1e-9); k * pas <= max + 1e-9; k++) {
    valeurs.push(Math.round(k * pas * 1e6) / 1e6);
  }
  return valeurs;
}

/** Nombre à la française : 1,5 ; −2. */
export const nombreFr = (n: number) => String(Math.round(n * 1e6) / 1e6).replace(".", ",").replace("-", "−");
