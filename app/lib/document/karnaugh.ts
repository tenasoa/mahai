/**
 * Tableau de Karnaugh (2 à 4 variables) et table de vérité.
 * Les valeurs sont rangées par minterme : position i = combinaison binaire de i, la première
 * variable étant le bit de poids fort. Chaque case vaut « 0 », « 1 », « X » (indifférent) ou
 * « . » (vide).
 */

export type Karnaugh = { variables: string[]; sortie: string; valeurs: string };

export const VALEURS_CASE = [".", "0", "1", "X"] as const;

const NOM = /^[\p{L}\p{N}_'’]{1,8}$/u;

/** Code de Gray sur `bits` bits, dans l'ordre d'affichage : 00, 01, 11, 10… */
export function gray(bits: number): number[] {
  return Array.from({ length: 1 << bits }, (_, i) => i ^ (i >> 1));
}

export const binaire = (v: number, bits: number) => v.toString(2).padStart(bits, "0");

/** Découpage : lignes = première moitié des variables, colonnes = le reste. */
export function disposition(n: number) {
  const bitsLignes = Math.floor(n / 2);
  const bitsColonnes = n - bitsLignes;
  return { bitsLignes, bitsColonnes, lignes: gray(bitsLignes), colonnes: gray(bitsColonnes) };
}

/** Minterme d'une case (ligne, colonne exprimées en valeurs de Gray). */
export const minterme = (ligne: number, colonne: number, bitsColonnes: number) =>
  (ligne << bitsColonnes) | colonne;

/** Valeurs vérifiées (utilisé par le nettoyage du document). */
export function normaliserKarnaugh(a: Record<string, unknown> | undefined): Karnaugh {
  const brutes = Array.isArray(a?.variables) ? a.variables.slice(0, 4) : [];
  // Un nom invalide est remplacé (jamais retiré) : le nombre de variables, donc les valeurs, ne bouge pas.
  const variables =
    brutes.length < 2
      ? ["A", "B", "C"]
      : brutes.map((v, i) => (typeof v === "string" && NOM.test(v.trim()) ? v.trim() : "ABCD"[i]!));
  const sortie = typeof a?.sortie === "string" && NOM.test(a.sortie.trim()) ? a.sortie.trim() : "S";
  const taille = 1 << variables.length;
  const brut = typeof a?.valeurs === "string" ? a.valeurs.toUpperCase() : "";
  let valeurs = "";
  for (let i = 0; i < taille; i++) {
    const c = brut[i];
    valeurs += c === "0" || c === "1" || c === "X" ? c : ".";
  }
  return { variables, sortie, valeurs };
}

/** Lignes d'une table de vérité vierge : toutes les combinaisons des entrées, sortie vide. */
export function lignesTableVerite(entrees: string[]): string[][] {
  const n = entrees.length;
  return Array.from({ length: 1 << n }, (_, i) => binaire(i, n).split(""));
}
