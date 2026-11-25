/**
 * Tableau de signes et de variations.
 *
 * - `x` : les valeurs de la première ligne (LaTeX : « -\infty », « \frac{1}{2} »…).
 * - Ligne de signes : `cases` alterne points et intervalles (2n − 1 cases pour n valeurs de x) :
 *   aux points « » (rien), « 0 », « | » (trait) ou « || » (valeur interdite) ; entre deux points
 *   « + », « - » ou « » (rien).
 * - Ligne de variations : une case par valeur de x, avec sa position (haut, milieu, bas) ; une
 *   valeur interdite (double barre) a une limite à gauche et une à droite. Les flèches se
 *   déduisent des positions.
 */

export type Position = "h" | "m" | "b";
export type CaseVariation = { v: string; p: Position; barre: boolean; v2: string; p2: Position };
export type LigneSigne = { type: "signe"; nom: string; cases: string[] };
export type LigneVariation = { type: "variation"; nom: string; cases: CaseVariation[] };
export type Ligne = LigneSigne | LigneVariation;
export type Variations = { nomX: string; x: string[]; lignes: Ligne[] };

export const SIGNES_POINT = ["", "0", "|", "||"] as const;
export const SIGNES_INTERVALLE = ["", "+", "-"] as const;
export const POSITIONS: Position[] = ["h", "m", "b"];

export const MIN_X = 2;
export const MAX_X = 9;
export const MAX_LIGNES = 6;
const MAX_TEXTE = 60;

const texte = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_TEXTE) : "");
const position = (v: unknown): Position => (v === "h" || v === "b" ? v : "m");

export const caseVide = (p: Position = "m"): CaseVariation => ({ v: "", p, barre: false, v2: "", p2: p });

export function ligneSigne(n: number, nom = "f'(x)"): LigneSigne {
  return { type: "signe", nom, cases: Array.from({ length: 2 * n - 1 }, () => "") };
}

export function ligneVariation(n: number, nom = "f"): LigneVariation {
  return { type: "variation", nom, cases: Array.from({ length: n }, () => caseVide()) };
}

export const VARIATIONS_DEFAUT: Variations = {
  nomX: "x",
  x: ["-\\infty", "1", "+\\infty"],
  lignes: [
    { type: "signe", nom: "f'(x)", cases: ["", "-", "0", "+", ""] },
    {
      type: "variation",
      nom: "f",
      cases: [
        { v: "+\\infty", p: "h", barre: false, v2: "", p2: "h" },
        { v: "-2", p: "b", barre: false, v2: "", p2: "b" },
        { v: "+\\infty", p: "h", barre: false, v2: "", p2: "h" },
      ],
    },
  ],
};

/** Valeurs vérifiées, chaque ligne ramenée au nombre de valeurs de x. */
export function normaliserVariations(a: Record<string, unknown> | undefined): Variations {
  const xBruts = Array.isArray(a?.x) ? (a.x as unknown[]).slice(0, MAX_X).map(texte) : [];
  const x = xBruts.length >= MIN_X ? xBruts : [...VARIATIONS_DEFAUT.x];
  const n = x.length;
  const lignesBrutes = Array.isArray(a?.lignes) ? (a.lignes as unknown[]).slice(0, MAX_LIGNES) : [];
  const lignes: Ligne[] = lignesBrutes
    .filter((l): l is Record<string, unknown> => !!l && typeof l === "object")
    .map((l) => {
      const cases = Array.isArray(l.cases) ? (l.cases as unknown[]) : [];
      if (l.type === "variation") {
        return {
          type: "variation" as const,
          nom: texte(l.nom),
          cases: Array.from({ length: n }, (_, i) => {
            const c = cases[i] as Record<string, unknown> | undefined;
            if (!c || typeof c !== "object") return caseVide();
            const barre = c.barre === true;
            return {
              v: texte(c.v),
              p: position(c.p),
              barre,
              v2: barre ? texte(c.v2) : "",
              p2: barre ? position(c.p2) : position(c.p),
            };
          }),
        };
      }
      return {
        type: "signe" as const,
        nom: texte(l.nom),
        cases: Array.from({ length: 2 * n - 1 }, (_, i) => {
          const c = cases[i];
          const permis: readonly string[] = i % 2 === 0 ? SIGNES_POINT : SIGNES_INTERVALLE;
          return typeof c === "string" && permis.includes(c) ? c : "";
        }),
      };
    });
  return { nomX: texte(a?.nomX ?? "x"), x, lignes };
}

/** Ajoute une valeur de x après l'indice `i` (les lignes reçoivent des cases vides). */
export function insererX(t: Variations, i: number): Variations {
  if (t.x.length >= MAX_X) return t;
  return {
    ...t,
    x: [...t.x.slice(0, i + 1), "", ...t.x.slice(i + 1)],
    lignes: t.lignes.map((l) =>
      l.type === "signe"
        ? // L'intervalle coupé en deux garde son signe des deux côtés du nouveau point.
          { ...l, cases: [...l.cases.slice(0, 2 * i + 1), l.cases[2 * i + 1] ?? "", "", ...l.cases.slice(2 * i + 1)] }
        : { ...l, cases: [...l.cases.slice(0, i + 1), caseVide(), ...l.cases.slice(i + 1)] },
    ),
  };
}

/** Retire la valeur de x d'indice `i` et les cases qui en dépendent. */
export function retirerX(t: Variations, i: number): Variations {
  if (t.x.length <= MIN_X) return t;
  // Ligne de signes : on retire le point et l'intervalle qui le suit (ou le précède pour le dernier).
  const debut = i === t.x.length - 1 ? 2 * i - 1 : 2 * i;
  return {
    ...t,
    x: t.x.filter((_, j) => j !== i),
    lignes: t.lignes.map((l) =>
      l.type === "signe"
        ? { ...l, cases: l.cases.filter((_, j) => j !== debut && j !== debut + 1) }
        : { ...l, cases: l.cases.filter((_, j) => j !== i) },
    ),
  };
}
