import { describe, expect, it } from "vitest";

import { nettoyerDocument, texteBrut } from "./nettoyer";
import { LIGNE_PROBA, disposer, lireProba, normaliserProba, produit, virguleTex } from "./probabilites";

const deuxFois = (p: [string, string], q: [string, string]) =>
  normaliserProba({
    branches: [
      { nom: "A", p: p[0], enfants: [{ nom: "B", p: q[0] }, { nom: "\\overline{B}", p: q[1] }] },
      { nom: "\\overline{A}", p: p[1], enfants: [{ nom: "B", p: q[0] }, { nom: "\\overline{B}", p: q[1] }] },
    ],
  });

describe("lireProba et produit", () => {
  it("lit décimaux, fractions et rejette le reste", () => {
    expect(lireProba("0,3")).toEqual({ n: 3n, d: 10n, fraction: false });
    expect(lireProba("\\frac{1}{3}")).toEqual({ n: 1n, d: 3n, fraction: true });
    expect(lireProba("2/5")).toEqual({ n: 2n, d: 5n, fraction: true });
    expect(lireProba("0{,}25")).toEqual({ n: 25n, d: 100n, fraction: false });
    expect(lireProba("p")).toBeNull();
    expect(lireProba("1/0")).toBeNull();
    expect(lireProba("")).toBeNull();
  });

  it("calcule exactement : décimal, fraction réduite, valeur approchée", () => {
    expect(produit(["0,3", "0,6"])).toBe("0{,}18");
    expect(produit(["\\frac{1}{3}", "\\frac{3}{4}"])).toBe("\\frac{1}{4}");
    expect(produit(["0,5", "\\frac{2}{3}"])).toBe("\\frac{1}{3}");
    expect(produit(["0,1", "0,2", "0,3"])).toBe("0{,}006");
    expect(produit(["1", "1"])).toBe("1");
    expect(produit(["0,3", ""])).toBeNull();
  });
});

describe("normaliserProba", () => {
  it("limite la profondeur et le nombre de feuilles", () => {
    const profond = { nom: "A", p: "1", enfants: [{ nom: "B", enfants: [{ nom: "C", enfants: [{ nom: "D", enfants: [{ nom: "E" }] }] }] }] };
    const a = normaliserProba({ branches: [profond] });
    expect(a.branches[0]!.enfants[0]!.enfants[0]!.enfants[0]!.enfants).toEqual([]);

    const large = Array.from({ length: 5 }, () => ({ nom: "X", enfants: Array.from({ length: 5 }, () => ({ nom: "Y", enfants: Array.from({ length: 5 }, () => ({ nom: "Z" })) })) }));
    const b = normaliserProba({ branches: large });
    const compte = (bs: typeof b.branches): number => bs.reduce((s, x) => s + (x.enfants.length ? compte(x.enfants) : 1), 0);
    expect(compte(b.branches)).toBeLessThanOrEqual(32);
  });
});

describe("disposer", () => {
  it("feuilles l'une sous l'autre, parents au milieu de leurs enfants", () => {
    const { noeuds, profondeur, hauteur, yRacine } = disposer(deuxFois(["0,4", "0,6"], ["0,5", "0,5"]));
    expect(profondeur).toBe(2);
    expect(hauteur).toBe(4 * LIGNE_PROBA);
    expect(virguleTex("0,4 + 1,25x")).toBe("0{,}4 + 1{,}25x");
    const [a, b1, b2, abar] = noeuds;
    expect(a!.y).toBe((b1!.y + b2!.y) / 2);
    expect(b1!.yParent).toBe(a!.y);
    expect(yRacine).toBe((a!.y + abar!.y) / 2);
    expect(noeuds.filter((n) => n.feuille).map((n) => n.chemin)).toEqual([
      ["0,4", "0,5"],
      ["0,4", "0,5"],
      ["0,6", "0,5"],
      ["0,6", "0,5"],
    ]);
  });
});

describe("nettoyage", () => {
  it("garde l'arbre et le rend cherchable", () => {
    const doc = nettoyerDocument({ type: "doc", content: [{ type: "probabilites", attrs: { ...deuxFois(["0,4", "0,6"], ["", ""]), issues: true, pirate: 1 } }] });
    const attrs = doc.content![0]!.attrs!;
    expect(attrs.issues).toBe(true);
    expect("pirate" in attrs).toBe(false);
    expect(texteBrut(doc)).toContain("\\overline{A}");
  });
});
