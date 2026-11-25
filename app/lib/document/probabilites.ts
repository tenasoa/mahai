/**
 * Arbre de probabilités (maths) : des branches portant un événement (nom) et sa probabilité,
 * en LaTeX (« \overline{A} », « \frac{1}{3} », « 0,3 »). Les probabilités laissées vides sont à
 * trouver par l'élève. En option, la probabilité de chaque issue (produit le long du chemin) est
 * calculée quand toutes celles du chemin sont des nombres.
 */

export type Branche = { nom: string; p: string; enfants: Branche[] };
export type ArbreProba = { branches: Branche[]; issues: boolean; alt: string };

export const LIMITES_PROBA = { profondeur: 4, enfants: 5, feuilles: 32, texte: 60 } as const;

export const PROBA_DEFAUT: ArbreProba = {
  branches: [
    { nom: "A", p: "", enfants: [] },
    { nom: "\\overline{A}", p: "", enfants: [] },
  ],
  issues: false,
  alt: "",
};

const texte = (v: unknown) => (typeof v === "string" ? v.slice(0, LIMITES_PROBA.texte) : "");

/** Valeurs vérifiées (nettoyage serveur et lecture dans l'éditeur). */
export function normaliserProba(a: Record<string, unknown> | undefined | null): ArbreProba {
  let feuilles = 0;
  const lire = (v: unknown, profondeur: number): Branche[] => {
    if (!Array.isArray(v)) return [];
    const r: Branche[] = [];
    for (const b of v.slice(0, LIMITES_PROBA.enfants)) {
      if (!b || typeof b !== "object" || feuilles >= LIMITES_PROBA.feuilles) continue;
      const o = b as Record<string, unknown>;
      const enfants = profondeur < LIMITES_PROBA.profondeur ? lire(o.enfants, profondeur + 1) : [];
      if (!enfants.length) {
        if (feuilles >= LIMITES_PROBA.feuilles) continue;
        feuilles++;
      }
      r.push({ nom: texte(o.nom), p: texte(o.p), enfants });
    }
    return r;
  };
  return { branches: lire(a?.branches, 1), issues: a?.issues === true, alt: typeof a?.alt === "string" ? a.alt.slice(0, 300) : "" };
}

/* ---------- Calcul des issues (fractions exactes) ---------- */

type Rationnel = { n: bigint; d: bigint; fraction: boolean };

const pgcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};

/** Lit « 0,3 », « 0.25 », « 1/3 », « \frac{1}{3} », « \dfrac{2}{5} », « 1 » ; sinon `null`. */
export function lireProba(s: string): Rationnel | null {
  const t = s.replace(/\{,\}/g, ",").replace(/\s|\\[,;!]/g, "").replace(/^\{(.*)\}$/, "$1");
  const frac = /^\\[dt]?frac\{(\d+)\}\{(\d+)\}$/.exec(t) ?? /^(\d+)\/(\d+)$/.exec(t);
  if (frac) {
    const d = BigInt(frac[2]!);
    return d === 0n ? null : { n: BigInt(frac[1]!), d, fraction: true };
  }
  const dec = /^(\d+)(?:[.,](\d{1,8}))?$/.exec(t);
  if (!dec) return null;
  const apres = dec[2] ?? "";
  return { n: BigInt(dec[1]! + apres), d: 10n ** BigInt(apres.length), fraction: false };
}

/** Écrit un rationnel : fraction LaTeX si une des probabilités en était une, décimal sinon. */
export function ecrireProba(r: Rationnel): string {
  const g = pgcd(r.n, r.d) || 1n;
  const n = r.n / g;
  const d = r.d / g;
  if (d === 1n) return String(n);
  if (r.fraction) return `\\frac{${n}}{${d}}`;
  // Décimal exact si le dénominateur ne contient que des 2 et des 5, sinon arrondi à 10⁻⁴.
  let reste = d;
  while (reste % 2n === 0n) reste /= 2n;
  while (reste % 5n === 0n) reste /= 5n;
  const valeur = Number(n) / Number(d);
  const ecrit = reste === 1n ? String(valeur) : String(Math.round(valeur * 1e4) / 1e4);
  return (reste === 1n ? "" : "\\approx ") + ecrit.replace(".", "{,}");
}

/** Probabilité d'une issue : produit des probabilités du chemin, ou `null` s'il en manque une. */
export function produit(chemin: string[]): string | null {
  let r: Rationnel = { n: 1n, d: 1n, fraction: false };
  for (const p of chemin) {
    const q = lireProba(p);
    if (!q) return null;
    r = { n: r.n * q.n, d: r.d * q.d, fraction: r.fraction || q.fraction };
  }
  return ecrireProba(r);
}

/* ---------- Disposition ---------- */

/** Hauteur d'une ligne (une feuille) en pixels. */
export const LIGNE_PROBA = 58;

export type NoeudPlace = {
  nom: string;
  p: string;
  profondeur: number;
  /** Ordonnée en pixels, celle du parent (racine comprise). */
  y: number;
  yParent: number;
  feuille: boolean;
  /** Probabilités du chemin depuis la racine (pour l'issue). */
  chemin: string[];
  /** Noms du chemin (texte cherchable, aide). */
  noms: string[];
};

/** Place les nœuds : feuilles les unes sous les autres, chaque parent au milieu de ses enfants. */
export function disposer(a: ArbreProba): { noeuds: NoeudPlace[]; profondeur: number; hauteur: number; yRacine: number } {
  const noeuds: NoeudPlace[] = [];
  let ligne = 0;
  let profondeur = 1;
  // Renvoie les nœuds placés de ce niveau ; leur parent règle ensuite leur `yParent`.
  const placer = (bs: Branche[], d: number, chemin: string[], noms: string[]): NoeudPlace[] =>
    bs.map((b) => {
      profondeur = Math.max(profondeur, d);
      const n: NoeudPlace = { nom: b.nom, p: b.p, profondeur: d, y: 0, yParent: 0, feuille: !b.enfants.length, chemin: [...chemin, b.p], noms: [...noms, b.nom] };
      noeuds.push(n);
      if (b.enfants.length) {
        const enfants = placer(b.enfants, d + 1, n.chemin, n.noms);
        n.y = (enfants[0]!.y + enfants[enfants.length - 1]!.y) / 2;
        for (const e of enfants) e.yParent = n.y;
      } else n.y = (ligne++ + 0.5) * LIGNE_PROBA;
      return n;
    });
  const premiers = placer(a.branches, 1, [], []);
  const yRacine = premiers.length ? (premiers[0]!.y + premiers[premiers.length - 1]!.y) / 2 : LIGNE_PROBA / 2;
  for (const n of premiers) n.yParent = yRacine;
  return { noeuds, profondeur, hauteur: Math.max(1, ligne) * LIGNE_PROBA, yRacine };
}

/** Virgule décimale sans espace dans KaTeX : « 0,4 » → « 0{,}4 ». */
export const virguleTex = (latex: string) => latex.replace(/(\d),(?=\d)/g, "$1{,}");

/** Texte cherchable. */
export function texteProba(a: ArbreProba): string {
  const r: string[] = [a.alt];
  const parcourir = (bs: Branche[]) => bs.forEach((b) => (r.push(b.nom, b.p), parcourir(b.enfants)));
  parcourir(a.branches);
  return r.filter(Boolean).join(" ");
}
