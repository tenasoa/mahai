/**
 * Génétique (SVT) : arbre généalogique et échiquier de croisement, décrits par des données.
 * Logique pure, partagée par l'éditeur, le nettoyage et le rendu élève.
 */

/* ---------- Arbre généalogique ---------- */

/** « vide » : case laissée libre pour décaler les individus suivants. */
export type Sexe = "m" | "f" | "i" | "vide";
/** hétérozygote : symbole à moitié plein ; conductrice : point au centre (gène lié à l'X). */
export type Etat = "sain" | "atteint" | "heterozygote" | "conductrice";
export type Numerotation = "generation" | "continue" | "aucune";

export type Individu = {
  sexe: Sexe;
  etat: Etat;
  decede: boolean;
  /** Uni à l'individu suivant de la même génération. */
  uni: boolean;
  /** Union entre apparentés (double trait). */
  consanguin: boolean;
  /** Indice, dans la génération précédente, d'un des parents (ou du parent seul). */
  parent: number | null;
  /** Texte sous le numéro : génotype, prénom… */
  nom: string;
};

export type Arbre = { generations: Individu[][]; numerotation: Numerotation; legende: boolean };

export const SEXES: Sexe[] = ["m", "f", "i", "vide"];
export const ETATS: Etat[] = ["sain", "atteint", "heterozygote", "conductrice"];
export const MAX_GENERATIONS = 6;
export const MAX_PAR_GENERATION = 16;
const MAX_NOM = 20;

const ROMAINS = ["I", "II", "III", "IV", "V", "VI"];
export const romain = (g: number) => ROMAINS[g] ?? String(g + 1);

export const individu = (sexe: Sexe = "m", parent: number | null = null): Individu => ({
  sexe,
  etat: "sain",
  decede: false,
  uni: false,
  consanguin: false,
  parent,
  nom: "",
});

export const ARBRE_DEFAUT: Arbre = {
  numerotation: "generation",
  legende: true,
  generations: [
    [{ ...individu("m"), uni: true }, individu("f")],
    [individu("m", 0), { ...individu("f", 0), etat: "atteint" }, individu("m", 0)],
  ],
};

const choix = <T extends string>(v: unknown, liste: readonly T[], defaut: T): T =>
  typeof v === "string" && (liste as readonly string[]).includes(v) ? (v as T) : defaut;

/** Valeurs vérifiées ; unions et filiations impossibles retirées. */
export function normaliserArbre(a: Record<string, unknown> | undefined): Arbre {
  const brutes = Array.isArray(a?.generations) ? a.generations.slice(0, MAX_GENERATIONS) : [];
  const generations: Individu[][] = brutes.map((g) =>
    (Array.isArray(g) ? g.slice(0, MAX_PAR_GENERATION) : []).map((b) => {
      const i = (b && typeof b === "object" ? b : {}) as Record<string, unknown>;
      return {
        sexe: choix(i.sexe, SEXES, "m"),
        etat: choix(i.etat, ETATS, "sain"),
        decede: i.decede === true,
        uni: i.uni === true,
        consanguin: i.consanguin === true,
        parent: typeof i.parent === "number" && Number.isInteger(i.parent) ? i.parent : null,
        nom: typeof i.nom === "string" ? i.nom.slice(0, MAX_NOM) : "",
      };
    }),
  );
  generations.forEach((g, n) => {
    g.forEach((ind, i) => {
      if (ind.sexe === "vide") Object.assign(ind, { etat: "sain", decede: false, uni: false, parent: null, nom: "" });
      // Une union a besoin d'un conjoint à droite.
      const suivant = g[i + 1];
      if (!suivant || suivant.sexe === "vide") ind.uni = false;
      if (!ind.uni) ind.consanguin = false;
      const avant = generations[n - 1];
      if (ind.parent !== null && (!avant || !avant[ind.parent] || avant[ind.parent]!.sexe === "vide")) ind.parent = null;
    });
  });
  if (generations.length === 0) generations.push([individu("m")]);
  return {
    generations: generations.map((g) => (g.length ? g : [individu("m")])),
    numerotation: choix(a?.numerotation, ["generation", "continue", "aucune"] as const, "generation"),
    legende: a?.legende !== false,
  };
}

/** Famille d'un individu de la génération précédente : son union s'il en a une, sinon lui seul. */
export function famille(g: Individu[], i: number): [number] | [number, number] {
  if (g[i]?.uni) return [i, i + 1];
  if (i > 0 && g[i - 1]?.uni) return [i - 1, i];
  return [i];
}

/** Familles d'une génération (choix du parent dans l'éditeur), repérées par leur premier indice. */
export function familles(g: Individu[]): ([number] | [number, number])[] {
  const liste: ([number] | [number, number])[] = [];
  for (let i = 0; i < g.length; i++) {
    if (g[i]!.sexe === "vide") continue;
    const f = famille(g, i);
    liste.push(f);
    if (f.length === 2) i++;
  }
  return liste;
}

/** Numéros affichés sous les symboles (« » pour une case vide ou sans numérotation). */
export function numeros(arbre: Arbre): string[][] {
  let continu = 0;
  return arbre.generations.map((g) => {
    let n = 0;
    return g.map((ind) => {
      if (ind.sexe === "vide" || arbre.numerotation === "aucune") return "";
      n++;
      continu++;
      return String(arbre.numerotation === "continue" ? continu : n);
    });
  });
}

/** Déplace un individu ; les filiations de la génération suivante le suivent. */
export function deplacerIndividu(arbre: Arbre, g: number, i: number, sens: -1 | 1): Arbre {
  const j = i + sens;
  const gen = arbre.generations[g];
  if (!gen || j < 0 || j >= gen.length) return arbre;
  const echange = (k: number | null) => (k === i ? j : k === j ? i : k);
  return {
    ...arbre,
    generations: arbre.generations.map((liste, n) => {
      if (n === g) {
        const copie = [...liste];
        [copie[i], copie[j]] = [copie[j]!, copie[i]!];
        return copie;
      }
      if (n === g + 1) return liste.map((ind) => ({ ...ind, parent: echange(ind.parent) }));
      return liste;
    }),
  };
}

export function retirerIndividu(arbre: Arbre, g: number, i: number): Arbre {
  return {
    ...arbre,
    generations: arbre.generations.map((liste, n) => {
      if (n === g) return liste.filter((_, k) => k !== i);
      if (n === g + 1) {
        return liste.map((ind) => ({
          ...ind,
          parent: ind.parent === null || ind.parent === i ? null : ind.parent > i ? ind.parent - 1 : ind.parent,
        }));
      }
      return liste;
    }),
  };
}

export function retirerGeneration(arbre: Arbre, g: number): Arbre {
  const generations = arbre.generations.filter((_, n) => n !== g);
  // La génération qui remonte perd ses parents.
  if (generations[g]) generations[g] = generations[g]!.map((ind) => ({ ...ind, parent: null }));
  return { ...arbre, generations };
}

/* Dessin : unités du SVG. */
export const TAILLE = 30;
export const PAS_X = 60;
export const PAS_Y = 100;
export const MARGE_G = 44;
export const MARGE_H = 22;

export type Trait = { x1: number; y1: number; x2: number; y2: number; double?: boolean };
export type Place = { x: number; y: number; g: number; i: number; ind: Individu; numero: string };

/** Positions des symboles et traits (unions, fratries) de l'arbre. */
export function disposer(arbre: Arbre): { places: Place[]; traits: Trait[]; largeur: number; hauteur: number } {
  const nums = numeros(arbre);
  const x = (i: number) => MARGE_G + PAS_X / 2 + i * PAS_X;
  const y = (g: number) => MARGE_H + TAILLE / 2 + g * PAS_Y;
  const places: Place[] = [];
  const traits: Trait[] = [];
  const r = TAILLE / 2;

  arbre.generations.forEach((gen, g) => {
    gen.forEach((ind, i) => {
      if (ind.sexe === "vide") return;
      places.push({ x: x(i), y: y(g), g, i, ind, numero: nums[g]![i]! });
      if (ind.uni) traits.push({ x1: x(i) + r, y1: y(g), x2: x(i + 1) - r, y2: y(g), double: ind.consanguin });
    });
    // Fratries : un trait horizontal sous les parents, relié à chaque enfant.
    const enfants = arbre.generations[g + 1];
    if (!enfants) return;
    const parFamille = new Map<number, number[]>();
    enfants.forEach((e, k) => {
      if (e.parent === null || e.sexe === "vide") return;
      const premier = famille(gen, e.parent)[0];
      parFamille.set(premier, [...(parFamille.get(premier) ?? []), k]);
    });
    for (const [premier, liste] of parFamille) {
      const f = famille(gen, premier);
      const xo = f.length === 2 ? (x(f[0]) + x(f[1])) / 2 : x(f[0]);
      const yo = f.length === 2 ? y(g) : y(g) + r;
      const yf = y(g) + PAS_Y * 0.58;
      const xs = liste.map(x);
      traits.push({ x1: xo, y1: yo, x2: xo, y2: yf });
      traits.push({ x1: Math.min(xo, ...xs), y1: yf, x2: Math.max(xo, ...xs), y2: yf });
      for (const xe of xs) traits.push({ x1: xe, y1: yf, x2: xe, y2: y(g + 1) - r });
    }
  });

  const colonnes = Math.max(...arbre.generations.map((g) => g.length));
  return {
    places,
    traits,
    largeur: MARGE_G + colonnes * PAS_X + 6,
    hauteur: MARGE_H + (arbre.generations.length - 1) * PAS_Y + TAILLE + 40,
  };
}

const NOMS_SEXE = { m: "Homme", f: "Femme", i: "Sexe inconnu" } as const;
const NOMS_ETAT: Record<Etat, [string, string]> = {
  sain: ["sain", "saine"],
  atteint: ["atteint", "atteinte"],
  heterozygote: ["hétérozygote", "hétérozygote"],
  conductrice: ["conducteur", "conductrice"],
};

export function libelleSymbole(sexe: Exclude<Sexe, "vide">, etat: Etat): string {
  const [masculin, feminin] = NOMS_ETAT[etat];
  return sexe === "i" ? `${NOMS_SEXE.i}, ${masculin}` : `${NOMS_SEXE[sexe]} ${sexe === "f" ? feminin : masculin}`;
}

/** Symboles présents dans l'arbre, pour la légende (hommes puis femmes, sains d'abord). */
export function symbolesUtilises(arbre: Arbre): { sexe: Exclude<Sexe, "vide">; etat: Etat }[] {
  const vus = new Set<string>();
  for (const g of arbre.generations) for (const ind of g) if (ind.sexe !== "vide") vus.add(`${ind.sexe}:${ind.etat}`);
  const liste: { sexe: Exclude<Sexe, "vide">; etat: Etat }[] = [];
  for (const etat of ETATS) for (const sexe of ["m", "f", "i"] as const) if (vus.has(`${sexe}:${etat}`)) liste.push({ sexe, etat });
  return liste;
}

/* ---------- Échiquier de croisement ---------- */

export type Gamete = { g: string; f: string };
/** `geno` vide : déduit des gamètes. « A//a » : chromosomes homologues ; « ; » sépare les gènes. */
export type CaseCroisement = { geno: string; pheno: string };
export type Echiquier = {
  nomColonnes: string;
  nomLignes: string;
  colonnes: Gamete[];
  lignes: Gamete[];
  cases: CaseCroisement[][];
};

export const MAX_GAMETES = 8;
const MAX_TEXTE = 40;

const texte = (v: unknown, max = MAX_TEXTE) => (typeof v === "string" ? v.slice(0, max) : "");

export const gamete = (g = "", f = ""): Gamete => ({ g, f });
const caseVide = (): CaseCroisement => ({ geno: "", pheno: "" });

export const ECHIQUIER_DEFAUT: Echiquier = {
  nomColonnes: "Gamètes ♂",
  nomLignes: "Gamètes ♀",
  colonnes: [gamete("A", "1/2"), gamete("a", "1/2")],
  lignes: [gamete("A", "1/2"), gamete("a", "1/2")],
  cases: [
    [caseVide(), caseVide()],
    [caseVide(), caseVide()],
  ],
};

function gametes(v: unknown): Gamete[] {
  const liste = (Array.isArray(v) ? v : []).slice(0, MAX_GAMETES).map((b) => {
    const o = (b && typeof b === "object" ? b : {}) as Record<string, unknown>;
    return gamete(texte(o.g), texte(o.f, 20));
  });
  return liste.length ? liste : [gamete("A")];
}

export function normaliserEchiquier(a: Record<string, unknown> | undefined): Echiquier {
  const colonnes = gametes(a?.colonnes);
  const lignes = gametes(a?.lignes);
  const brutes = Array.isArray(a?.cases) ? a.cases : [];
  return {
    nomColonnes: texte(a?.nomColonnes),
    nomLignes: texte(a?.nomLignes),
    colonnes,
    lignes,
    cases: lignes.map((_, l) => {
      const ligne = Array.isArray(brutes[l]) ? (brutes[l] as unknown[]) : [];
      return colonnes.map((_, c) => {
        const o = (ligne[c] && typeof ligne[c] === "object" ? ligne[c] : {}) as Record<string, unknown>;
        return { geno: texte(o.geno, 80), pheno: texte(o.pheno) };
      });
    }),
  };
}

/**
 * Génotype déduit de deux gamètes. Gènes séparés par des espaces (« A B » × « a b ») : un couple
 * de chromosomes par gène (« A//a;B//b ») ; sinon un seul couple (« AB » × « ab » : « AB//ab »).
 */
export function genotype(g1: string, g2: string): string {
  const a = g1.trim().split(/\s+/).filter(Boolean);
  const b = g2.trim().split(/\s+/).filter(Boolean);
  if (a.length > 1 && a.length === b.length) return a.map((x, i) => `${x}//${b[i]}`).join(";");
  return `${g1.trim()}//${g2.trim()}`;
}

/** « A//a;B//b » → [["A", "a"], ["B", "b"]] ; un texte sans « // » reste d'un seul tenant. */
export function couples(geno: string): ([string] | [string, string])[] {
  return geno
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p): [string] | [string, string] => {
      const i = p.indexOf("//");
      return i < 0 ? [p] : [p.slice(0, i).trim(), p.slice(i + 2).trim()];
    });
}

export function insererGamete(e: Echiquier, sens: "colonne" | "ligne"): Echiquier {
  if (sens === "colonne") {
    if (e.colonnes.length >= MAX_GAMETES) return e;
    return { ...e, colonnes: [...e.colonnes, gamete()], cases: e.cases.map((l) => [...l, caseVide()]) };
  }
  if (e.lignes.length >= MAX_GAMETES) return e;
  return { ...e, lignes: [...e.lignes, gamete()], cases: [...e.cases, e.colonnes.map(caseVide)] };
}

export function retirerGamete(e: Echiquier, sens: "colonne" | "ligne", k: number): Echiquier {
  if (sens === "colonne") {
    if (e.colonnes.length <= 1) return e;
    return { ...e, colonnes: e.colonnes.filter((_, j) => j !== k), cases: e.cases.map((l) => l.filter((_, j) => j !== k)) };
  }
  if (e.lignes.length <= 1) return e;
  return { ...e, lignes: e.lignes.filter((_, j) => j !== k), cases: e.cases.filter((_, j) => j !== k) };
}
