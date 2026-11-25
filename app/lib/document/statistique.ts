/**
 * Diagramme statistique (géographie, SES, sciences) : barres, courbes, secteurs, pyramide des
 * âges, diagramme ombrothermique. Un tableau de données (catégories × séries) décrit dans les
 * attributs du nœud `statistique`, dessiné en SVG sur le serveur (`SvgStatistique`).
 */

export const GENRES_STAT = ["barres", "courbe", "secteurs", "pyramide", "ombrothermique"] as const;
export type GenreStat = (typeof GENRES_STAT)[number];

export const NOMS_GENRES_STAT: Record<GenreStat, string> = {
  barres: "Barres",
  courbe: "Courbe",
  secteurs: "Secteurs",
  pyramide: "Pyramide des âges",
  ombrothermique: "Diagramme ombrothermique",
};

export type Serie = { nom: string; valeurs: (number | null)[] };

export type Statistique = {
  genre: GenreStat;
  /** Étiquettes des catégories (années, pays, mois, tranches d'âge du plus jeune au plus âgé…). */
  categories: string[];
  series: Serie[];
  /** Unité des valeurs (axe vertical) : « millions d'hab. », « % », « mm »… */
  unite: string;
  /** Diagramme ombrothermique : unité des températures. */
  unite2: string;
  /** Afficher la valeur sur chaque barre ou secteur. */
  valeurs: boolean;
  alt: string;
};

export const LIMITES_STAT = { categories: 40, series: 6 } as const;
export const NB_COULEURS_STAT = 8;

/** Séries attendues par genre : [minimum, maximum] (secteurs : une seule ; pyramide : hommes, femmes). */
export function seriesAttendues(genre: GenreStat): [number, number] {
  if (genre === "secteurs") return [1, 1];
  if (genre === "pyramide" || genre === "ombrothermique") return [2, 2];
  return [1, LIMITES_STAT.series];
}

export const MOIS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export const STAT_DEFAUT: Statistique = {
  genre: "barres",
  categories: ["2000", "2010", "2020"],
  // Sans valeurs : jamais de chiffres inventés, l'auteur saisit les siens.
  series: [{ nom: "Série 1", valeurs: [null, null, null] }],
  unite: "",
  unite2: "",
  valeurs: true,
  alt: "",
};

function nombre(v: unknown): number | null {
  const n =
    typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.replace(/\s/g, "").replace(",", ".").replace("−", "-")) : NaN;
  return Number.isFinite(n) && Math.abs(n) <= 1e12 ? Math.round(n * 1e4) / 1e4 : null;
}
const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max).trim() : "");

/** Valeurs vérifiées et complétées (nettoyage serveur et lecture dans l'éditeur). */
export function normaliserStatistique(a: Record<string, unknown> | undefined): Statistique {
  const genre = typeof a?.genre === "string" && (GENRES_STAT as readonly string[]).includes(a.genre) ? (a.genre as GenreStat) : "barres";
  const categories = (Array.isArray(a?.categories) ? a.categories : STAT_DEFAUT.categories)
    .slice(0, LIMITES_STAT.categories)
    .map((c) => texte(typeof c === "number" ? String(c) : c, 30));
  const [, max] = seriesAttendues(genre);
  const series = (Array.isArray(a?.series) ? a.series : [])
    .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
    .slice(0, max)
    .map((s) => {
      const brutes = Array.isArray(s.valeurs) ? s.valeurs : [];
      return { nom: texte(s.nom, 40), valeurs: categories.map((_, i) => nombre(brutes[i])) };
    });
  return {
    genre,
    categories,
    series,
    unite: texte(a?.unite, 30),
    unite2: texte(a?.unite2, 30),
    valeurs: a?.valeurs === true,
    alt: texte(a?.alt, 300),
  };
}

/**
 * Lit un tableau collé depuis un tableur (colonnes séparées par des tabulations ou « ; ») :
 * première ligne = noms des séries (la première case est ignorée), première colonne = catégories.
 */
export function lireTableau(collage: string): { categories: string[]; series: Serie[] } | null {
  const lignes = collage
    .split(/\r?\n/)
    .map((l) => l.split(l.includes("\t") ? "\t" : ";").map((c) => c.trim()))
    .filter((l) => l.some((c) => c));
  if (lignes.length < 2 || lignes[0]!.length < 2) return null;
  const [entete, ...corps] = lignes;
  const noms = entete!.slice(1, 1 + LIMITES_STAT.series);
  const lignesCorps = corps.slice(0, LIMITES_STAT.categories);
  return {
    categories: lignesCorps.map((l) => l[0] ?? ""),
    series: noms.map((nom, j) => ({ nom, valeurs: lignesCorps.map((l) => nombre(l[j + 1])) })),
  };
}

/** Échelle « ronde » de 0 (ou du minimum négatif) au maximum : bornes et pas. */
export function echelle(min: number, max: number, cible = 5): { min: number; max: number; pas: number } {
  const bas = Math.min(0, min);
  const haut = Math.max(0, max);
  if (haut - bas === 0) return { min: 0, max: 1, pas: 0.2 };
  const brut = (haut - bas) / cible;
  const puissance = 10 ** Math.floor(Math.log10(brut));
  const m = brut / puissance;
  const pas = (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * puissance;
  return { min: Math.floor(bas / pas + 1e-9) * pas, max: Math.ceil(haut / pas - 1e-9) * pas, pas };
}

/** Nombre à la française : 1 234,5 ; −2. */
export function nombreStat(n: number): string {
  const arrondi = Math.round(n * 100) / 100;
  return arrondi.toLocaleString("fr-FR", { maximumFractionDigits: 2 }).replace(/ | /g, " ").replace("-", "−");
}

/** Parts des secteurs (valeurs positives seulement), en fraction de 1. */
export function parts(valeurs: (number | null)[]): number[] {
  const positives = valeurs.map((v) => (v !== null && v > 0 ? v : 0));
  const total = positives.reduce((s, v) => s + v, 0);
  return positives.map((v) => (total ? v / total : 0));
}
