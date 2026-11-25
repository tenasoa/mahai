import { describe, expect, it } from "vitest";

import { echantillonner, graduations, normaliserGraphique, pasAuto } from "./graphique";
import { insererX, normaliserVariations, retirerX, VARIATIONS_DEFAUT } from "./variations";

describe("graphique", () => {
  it("corrige une fenêtre ou un pas invalides", () => {
    const g = normaliserGraphique({ xmin: 3, xmax: 1, ymin: "-2,5", ymax: 4, pasX: 0.0001, pasY: -1 });
    expect([g.xmin, g.xmax]).toEqual([-5, 5]);
    expect(g.ymin).toBe(-2.5);
    expect(g.pasX).toBe(1);
    expect(g.pasY).toBe(pasAuto(6.5));
  });

  it("borne les listes et retire les aires sans courbe", () => {
    const g = normaliserGraphique({
      courbes: Array.from({ length: 10 }, () => ({ f: "x" })),
      aires: [{ courbe: 9 }, { courbe: 0, courbe2: 7, a: 0, b: 1 }],
      points: [{ x: "abc", y: 1e9, nom: 3 }],
    });
    expect(g.courbes).toHaveLength(6);
    expect(g.aires).toEqual([{ courbe: 0, courbe2: null, a: 0, b: 1 }]);
    expect(g.points[0]).toEqual({ x: 0, y: 0, nom: "", projections: false });
  });

  it("coupe la courbe aux asymptotes et hors du domaine", () => {
    const g = normaliserGraphique({});
    expect(echantillonner(g, { ...g.courbes[0]!, f: "1/x" })).toHaveLength(2);
    expect(echantillonner(g, { ...g.courbes[0]!, f: "sqrt(x)" })).toHaveLength(1);
    expect(echantillonner(g, { ...g.courbes[0]!, f: "x +" })).toEqual([]);
    const morceaux = echantillonner(g, { ...g.courbes[0]!, f: "x", min: 1, max: 2 });
    expect(morceaux[0]![0]).toEqual([1, 1]);
    expect(morceaux[0]!.at(-1)).toEqual([2, 2]);
  });

  it("place les graduations sur les multiples du pas", () => {
    expect(graduations(-1.2, 1.2, 0.5)).toEqual([-1, -0.5, 0, 0.5, 1]);
  });
});

describe("variations", () => {
  it("ramène chaque ligne au nombre de valeurs de x", () => {
    const t = normaliserVariations({
      x: ["a", "b", "c", "d"],
      lignes: [
        { type: "signe", nom: "f'", cases: ["+", "-", "0", "<script>"] },
        { type: "variation", nom: "f", cases: [{ v: "1", p: "h" }] },
      ],
    });
    expect(t.lignes[0]!.cases).toEqual(["", "-", "0", "", "", "", ""]);
    expect(t.lignes[1]!.cases).toHaveLength(4);
  });

  it("ajoute et retire une valeur de x avec ses cases", () => {
    const t = normaliserVariations(VARIATIONS_DEFAUT);
    const plus = insererX(t, 0);
    expect(plus.x).toEqual(["-\\infty", "", "1", "+\\infty"]);
    expect(plus.lignes[0]!.cases).toEqual(["", "-", "", "-", "0", "+", ""]);
    const moins = retirerX(plus, 1);
    expect(moins).toEqual(t);
    expect(retirerX(normaliserVariations({ x: ["a", "b"] }), 0).x).toEqual(["a", "b"]);
  });
});
