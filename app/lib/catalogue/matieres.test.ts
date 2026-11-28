import { describe, expect, it } from "vitest";

import { matieresEnAvant, parNom } from "./matieres";

const m = (id: string, nom = id) => ({ id, nom });
const liste = [m("a"), m("b"), m("c"), m("d"), m("e")];
const compte: Record<string, number> = { a: 1, b: 0, c: 5, d: 2, e: 2 };
const n = (id: string) => compte[id] ?? 0;

describe("matieresEnAvant", () => {
  it("cache les matières sans sujet et met les plus fournies d'abord", () => {
    const r = matieresEnAvant(liste, n, 10);
    expect(r.visibles.map((x) => x.id)).toEqual(["c", "d", "e", "a"]);
    expect(r.avecSujets.map((x) => x.id)).toEqual(["a", "c", "d", "e"]);
  });

  it("garde l'ordre de l'administration à nombre égal et coupe à max", () => {
    expect(matieresEnAvant(liste, n, 2).visibles.map((x) => x.id)).toEqual(["c", "d"]);
  });

  it("garde toujours visible la matière choisie, même sans sujet", () => {
    expect(matieresEnAvant(liste, n, 2, "a").visibles.map((x) => x.id)).toEqual(["c", "a"]);
    expect(matieresEnAvant(liste, n, 10, "b").visibles.map((x) => x.id)).toContain("b");
  });

  it("ne montre rien quand aucune matière n'a de sujet", () => {
    expect(matieresEnAvant(liste, () => 0, 10).visibles).toEqual([]);
  });
});

describe("parNom", () => {
  it("trie à la française, sans tenir compte des accents ni des majuscules", () => {
    expect(parNom([m("1", "Électronique"), m("2", "anglais"), m("3", "Espagnol")]).map((x) => x.nom)).toEqual([
      "anglais",
      "Électronique",
      "Espagnol",
    ]);
  });
});
