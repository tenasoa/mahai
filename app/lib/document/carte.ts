/**
 * Carte à légender (croquis de géographie) : un fond de carte (image envoyée dans R2, ou fond
 * blanc), des figurés définis par la légende (zones, lignes, flèches, points, titres de
 * parties) et des noms de lieux. Coordonnées en fraction de la largeur et de la hauteur du fond.
 * Dessinée sur le serveur (`CarteDessin`), identique dans l'éditeur et chez l'élève.
 */

export const GENRES_CARTE = ["zone", "ligne", "fleche", "point", "titre"] as const;
export type GenreCarte = (typeof GENRES_CARTE)[number];
export type GenreTrace = Exclude<GenreCarte, "titre">;

export const MOTIFS: Record<GenreTrace, { id: string; nom: string }[]> = {
  zone: [
    { id: "plein", nom: "Aplat" },
    { id: "hachures", nom: "Hachures" },
    { id: "points", nom: "Pointillé" },
    { id: "contour", nom: "Contour" },
  ],
  ligne: [
    { id: "trait", nom: "Trait" },
    { id: "tirets", nom: "Tirets" },
    { id: "epais", nom: "Trait épais" },
  ],
  fleche: [
    { id: "simple", nom: "Flèche fine" },
    { id: "epaisse", nom: "Flèche épaisse" },
  ],
  point: [
    { id: "rond", nom: "Rond" },
    { id: "carre", nom: "Carré" },
    { id: "triangle", nom: "Triangle" },
    { id: "etoile", nom: "Étoile" },
  ],
};

export const NOMS_GENRES_CARTE: Record<GenreCarte, string> = {
  zone: "Zone",
  ligne: "Ligne",
  fleche: "Flèche",
  point: "Point",
  titre: "Titre de partie",
};

export const COULEURS_CARTE = ["Bleu", "Rouge", "Vert", "Jaune", "Orange", "Violet", "Noir"];

/** Une ligne de la légende : le figuré (genre, motif, couleur) et ce qu'il représente. */
export type Entree = { genre: GenreCarte; motif: string; couleur: number; texte: string };
/** Un figuré posé sur la carte : `e` = indice de sa ligne de légende, `pts` = x0, y0, x1, y1… */
export type Trace = { e: number; pts: number[] };
export const STYLES_NOMS = ["lieu", "region", "mer"] as const;
export type StyleNom = (typeof STYLES_NOMS)[number];
export const NOMS_STYLES: Record<StyleNom, string> = { lieu: "Lieu", region: "Région, pays", mer: "Mer, océan" };
export type Nom = { x: number; y: number; texte: string; style: StyleNom };

export type Carte = {
  /** Clé R2 du fond de carte, ou `null` pour un fond blanc. */
  cle: string | null;
  largeur: number;
  hauteur: number;
  titre: string;
  legende: Entree[];
  traces: Trace[];
  noms: Nom[];
  alt: string;
};

export const LIMITES_CARTE = { legende: 24, traces: 150, points: 80, noms: 60, texte: 80 } as const;

/** Points nécessaires pour qu'un figuré soit dessiné. */
export const MIN_POINTS: Record<GenreTrace, number> = { zone: 3, ligne: 2, fleche: 2, point: 1 };

export const CARTE_DEFAUT: Carte = {
  cle: null,
  largeur: 1000,
  hauteur: 750,
  titre: "",
  legende: [],
  traces: [],
  noms: [],
  alt: "",
};

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const fraction = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? Math.round(Math.min(1, Math.max(0, n)) * 10_000) / 10_000 : null;
};
const dimension = (v: unknown, defaut: number) => {
  const n = typeof v === "number" ? v : NaN;
  return Number.isInteger(n) && n >= 1 && n <= 8000 ? n : defaut;
};

function entree(v: unknown): Entree | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const genre = (GENRES_CARTE as readonly unknown[]).includes(o.genre) ? (o.genre as GenreCarte) : null;
  if (!genre) return null;
  const motifs = genre === "titre" ? [] : MOTIFS[genre].map((m) => m.id);
  const motif = typeof o.motif === "string" && motifs.includes(o.motif) ? o.motif : (motifs[0] ?? "");
  const c = typeof o.couleur === "number" && Number.isInteger(o.couleur) ? o.couleur : 0;
  return { genre, motif, couleur: c >= 0 && c < COULEURS_CARTE.length ? c : 0, texte: texte(o.texte, LIMITES_CARTE.texte) };
}

/** Valeurs vérifiées (nettoyage serveur et lecture dans l'éditeur). */
export function normaliserCarte(a: Record<string, unknown> | undefined | null): Carte {
  const legende = (Array.isArray(a?.legende) ? a.legende : [])
    .slice(0, LIMITES_CARTE.legende)
    .map(entree)
    .filter((e): e is Entree => e !== null);
  const traces = (Array.isArray(a?.traces) ? a.traces : []).flatMap((t): Trace[] => {
    if (!t || typeof t !== "object") return [];
    const o = t as Record<string, unknown>;
    const e = typeof o.e === "number" && Number.isInteger(o.e) ? o.e : -1;
    const g = legende[e]?.genre;
    if (!g || g === "titre") return [];
    const brut = Array.isArray(o.pts) ? o.pts.slice(0, LIMITES_CARTE.points * 2) : [];
    const pts: number[] = [];
    for (let i = 0; i + 1 < brut.length; i += 2) {
      const x = fraction(brut[i]);
      const y = fraction(brut[i + 1]);
      if (x !== null && y !== null) pts.push(x, y);
    }
    if (g === "point") pts.length = Math.min(pts.length, 2);
    return pts.length / 2 >= MIN_POINTS[g] ? [{ e, pts }] : [];
  });
  const noms = (Array.isArray(a?.noms) ? a.noms : []).slice(0, LIMITES_CARTE.noms).flatMap((n): Nom[] => {
    if (!n || typeof n !== "object") return [];
    const o = n as Record<string, unknown>;
    const x = fraction(o.x);
    const y = fraction(o.y);
    if (x === null || y === null) return [];
    const style = (STYLES_NOMS as readonly unknown[]).includes(o.style) ? (o.style as StyleNom) : "lieu";
    return [{ x, y, texte: texte(o.texte, LIMITES_CARTE.texte), style }];
  });
  const cle = typeof a?.cle === "string" && a.cle ? a.cle.slice(0, 80) : null;
  return {
    cle,
    largeur: cle ? dimension(a?.largeur, 1000) : 1000,
    hauteur: cle ? dimension(a?.hauteur, 750) : 750,
    titre: texte(a?.titre, 150),
    legende,
    traces: traces.slice(0, LIMITES_CARTE.traces),
    noms,
    alt: texte(a?.alt, 300),
  };
}

/** Retire la ligne `i` de la légende et ses figurés, renumérote les autres. */
export function retirerEntree(c: Carte, i: number): Carte {
  return {
    ...c,
    legende: c.legende.filter((_, k) => k !== i),
    traces: c.traces.filter((t) => t.e !== i).map((t) => (t.e > i ? { ...t, e: t.e - 1 } : t)),
  };
}

/** Échange les lignes `i` et `j` de la légende (les figurés suivent). */
export function echangerEntrees(c: Carte, i: number, j: number): Carte {
  if (i === j || !c.legende[i] || !c.legende[j]) return c;
  const legende = [...c.legende];
  [legende[i], legende[j]] = [legende[j]!, legende[i]!];
  return { ...c, legende, traces: c.traces.map((t) => (t.e === i ? { ...t, e: j } : t.e === j ? { ...t, e: i } : t)) };
}

/** Chemin lissé passant par les points (Catmull-Rom → courbes de Bézier), en unités du dessin. */
export function cheminLisse(p: [number, number][]): string {
  if (p.length < 2) return "";
  if (p.length === 2) return `M${p[0]![0]} ${p[0]![1]}L${p[1]![0]} ${p[1]![1]}`;
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M${r(p[0]![0])} ${r(p[0]![1])}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i]!;
    const b = p[i]!;
    const c = p[i + 1]!;
    const e = p[i + 2] ?? c;
    const c1 = [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6];
    const c2 = [c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6];
    d += `C${r(c1[0]!)} ${r(c1[1]!)} ${r(c2[0]!)} ${r(c2[1]!)} ${r(c[0])} ${r(c[1])}`;
  }
  return d;
}

/**
 * Pointe d'une flèche : triangle au bout du tracé, orienté selon la fin de la courbe, et point
 * où arrêter le trait pour qu'il ne dépasse pas de la pointe.
 */
export function pointeFleche(p: [number, number][], longueur: number, largeur: number) {
  const fin = p[p.length - 1]!;
  // Le lissage (`cheminLisse`) arrive au dernier point dans la direction avant-dernier → dernier.
  const prec = p[p.length - 2]!;
  const dx0 = fin[0] - prec[0];
  const dy0 = fin[1] - prec[1];
  const n = Math.hypot(dx0, dy0) || 1;
  const ux = dx0 / n;
  const uy = dy0 / n;
  const base: [number, number] = [fin[0] - ux * longueur, fin[1] - uy * longueur];
  const g: [number, number] = [base[0] - uy * (largeur / 2), base[1] + ux * (largeur / 2)];
  const d: [number, number] = [base[0] + uy * (largeur / 2), base[1] - ux * (largeur / 2)];
  return { triangle: [fin, g, d] as [number, number][], base };
}

/** Texte cherchable (recherche plein texte du catalogue). */
export function texteCarte(c: Carte): string {
  return [c.titre, c.alt, ...c.legende.map((e) => e.texte), ...c.noms.map((n) => n.texte)].filter(Boolean).join(" ");
}
