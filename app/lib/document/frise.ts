/**
 * Frise chronologique (histoire) : une échelle d'années, des périodes (bandes) et des événements
 * (repères datés). Décrite par des données (attributs du nœud `frise`) et dessinée en SVG sur le
 * serveur (`SvgFrise`). Les années avant notre ère sont négatives (−52 → « 52 av. J.-C. »).
 */

export type Periode = { debut: number; fin: number; texte: string; couleur: number };
export type Evenement = { date: number; texte: string };
export type Frise = { debut: number; fin: number; pas: number; periodes: Periode[]; evenements: Evenement[]; alt: string };

export const LIMITES_FRISE = { periodes: 20, evenements: 40, texte: 80 } as const;
/** Couleurs des périodes : celles des tuiles (fond pastel, texte ink). */
export const NB_COULEURS_FRISE = 6;

export const FRISE_DEFAUT: Frise = {
  debut: 1900,
  fin: 2000,
  pas: 10,
  periodes: [
    { debut: 1914, fin: 1918, texte: "Première Guerre mondiale", couleur: 0 },
    { debut: 1939, fin: 1945, texte: "Seconde Guerre mondiale", couleur: 1 },
  ],
  evenements: [
    { date: 1947, texte: "Insurrection à Madagascar" },
    { date: 1960, texte: "Indépendance de Madagascar" },
  ],
  alt: "",
};

const BORNE = 1_000_000;

function annee(v: unknown, defaut: number): number {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v.replace("−", "-")) : NaN;
  return Number.isFinite(n) && Math.abs(n) <= BORNE ? Math.round(n) : defaut;
}
const texte = (v: unknown) => (typeof v === "string" ? v.slice(0, LIMITES_FRISE.texte).trim() : "");
const liste = (v: unknown, max: number): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((e) => e && typeof e === "object").slice(0, max) : [];

/** Pas « rond » donnant une dizaine de graduations. */
export function pasFrise(etendue: number): number {
  const brut = etendue / 10;
  const puissance = 10 ** Math.floor(Math.log10(Math.max(brut, 1)));
  const m = brut / puissance;
  return Math.max(1, (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * puissance);
}

/** Valeurs vérifiées et complétées (nettoyage serveur et lecture dans l'éditeur). */
export function normaliserFrise(a: Record<string, unknown> | undefined): Frise {
  let debut = annee(a?.debut, FRISE_DEFAUT.debut);
  let fin = annee(a?.fin, FRISE_DEFAUT.fin);
  if (!(debut < fin)) [debut, fin] = [FRISE_DEFAUT.debut, FRISE_DEFAUT.fin];
  const p = annee(a?.pas, 0);
  // Au plus 40 graduations, sinon un pas rond est choisi.
  const pas = p > 0 && (fin - debut) / p <= 40 ? p : pasFrise(fin - debut);
  return {
    debut,
    fin,
    pas,
    periodes: liste(a?.periodes, LIMITES_FRISE.periodes).map((e) => {
      let d = annee(e.debut, debut);
      let f = annee(e.fin, d);
      if (f < d) [d, f] = [f, d];
      const c = annee(e.couleur, 0);
      return { debut: d, fin: f, texte: texte(e.texte), couleur: c >= 0 && c < NB_COULEURS_FRISE ? c : 0 };
    }),
    evenements: liste(a?.evenements, LIMITES_FRISE.evenements).map((e) => ({ date: annee(e.date, debut), texte: texte(e.texte) })),
    alt: typeof a?.alt === "string" ? a.alt.slice(0, 300).trim() : "",
  };
}

/** « 1960 », « 52 av. J.-C. » */
export const anneeFr = (n: number) => (n < 0 ? `${-n} av. J.-C.` : String(n));

/** Graduations multiples du pas dans [debut, fin]. */
export function graduationsFrise(f: Frise): number[] {
  const valeurs: number[] = [];
  for (let k = Math.ceil(f.debut / f.pas); k * f.pas <= f.fin; k++) valeurs.push(k * f.pas);
  return valeurs;
}

/**
 * Rangement en lignes : chaque élément (intervalle en pixels) va sur la première ligne où il ne
 * chevauche rien. Renvoie la ligne de chaque élément, dans l'ordre donné.
 */
export function ranger(intervalles: [number, number][], ecart = 6): number[] {
  const fins: number[] = []; // fin occupée de chaque ligne
  const ordre = intervalles.map((_, i) => i).sort((a, b) => intervalles[a]![0] - intervalles[b]![0]);
  const lignes = new Array<number>(intervalles.length).fill(0);
  for (const i of ordre) {
    const [d, f] = intervalles[i]!;
    let l = fins.findIndex((fin) => fin + ecart <= d);
    if (l === -1) {
      l = fins.length;
      fins.push(f);
    } else fins[l] = f;
    lignes[i] = l;
  }
  return lignes;
}

/** Largeur approximative d'un texte (pixels) : de quoi éviter les chevauchements. */
export const largeurTexte = (t: string, taille = 13) => t.length * taille * 0.56;
