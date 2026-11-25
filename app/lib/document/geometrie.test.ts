import { describe, expect, it } from "vitest";

import {
  cadreFigure,
  calculerFigure,
  couperAuCadre,
  directionNom,
  element,
  lireNoms,
  nomLibre,
  normaliserFigure,
  point,
  renommerPoint,
  retirerPoint,
  type Figure,
} from "./geometrie";
import { nettoyerDocument } from "./nettoyer";

const figure = (partiel: Partial<Figure>): Figure => ({ quadrillage: false, alt: "", points: [], elements: [], ...partiel });

describe("géométrie", () => {
  it("lit les noms de points saisis", () => {
    expect(lireNoms("ABC")).toEqual(["A", "B", "C"]);
    expect(lireNoms("A1 A2")).toEqual(["A1", "A2"]);
    expect(lireNoms("A'B’")).toEqual(["A'", "B'"]);
    expect(lireNoms("[AB]")).toEqual(["A", "B"]);
  });

  it("écarte les noms invalides ou en double et borne les valeurs", () => {
    const f = normaliserFigure({
      points: [
        { nom: "A", x: "1,5", y: 1e9 },
        { nom: "A", x: 2, y: 2 },
        { nom: "<b>", x: 0, y: 0 },
        { nom: "I", type: "milieu", refs: ["A", "B", "C", "<x>"] },
      ],
      elements: [{ type: "inconnu", refs: ["A", "I", "Z"], codage: 9, couleur: 12, texte: 42 }],
    });
    expect(f.points.map((p) => p.nom)).toEqual(["A", "I"]);
    expect(f.points[0]).toMatchObject({ x: 1.5, y: 0, type: "libre" });
    expect(f.points[1]!.refs).toEqual(["A", "B"]);
    expect(f.elements[0]).toMatchObject({ type: "segment", refs: ["A", "I"], codage: 0, couleur: 0, texte: "" });
  });

  it("construit milieu, projeté, intersection et symétrique", () => {
    const f = figure({
      points: [
        point("A", 0, 0),
        point("B", 4, 0),
        point("C", 1, 3),
        point("D", 3, 3),
        point("I", 0, 0, { type: "milieu", refs: ["A", "B"] }),
        point("H", 0, 0, { type: "projete", refs: ["C", "A", "B"] }),
        point("O", 0, 0, { type: "intersection", refs: ["A", "D", "B", "C"] }),
        point("C'", 0, 0, { type: "symetrique", refs: ["C", "I"] }),
      ],
    });
    const { positions, erreursPoints } = calculerFigure(f);
    expect(erreursPoints.every((e) => e === null)).toBe(true);
    expect(positions.get("I")).toEqual([2, 0]);
    expect(positions.get("H")).toEqual([1, 0]);
    expect(positions.get("O")).toEqual([2, 2]);
    expect(positions.get("C'")).toEqual([3, -3]);
  });

  it("signale les constructions impossibles", () => {
    const f = figure({
      points: [
        point("A", 0, 0),
        point("B", 1, 0),
        point("M", 0, 0, { type: "milieu", refs: ["A", "Z"] }),
        point("P", 0, 0, { type: "intersection", refs: ["A", "B", "A", "B"] }),
        point("Q", 0, 0, { type: "projete", refs: ["B", "A", "A"] }),
        point("R", 0, 0, { type: "milieu", refs: ["A", ""] }),
      ],
      elements: [element("segment", ["A", "M"]), element("polygone", ["A", "B"]), element("angle", ["A", "A", "B"])],
    });
    const c = calculerFigure(f);
    expect(c.erreursPoints[2]).toMatch(/Z doit être un point/);
    expect(c.erreursPoints[3]).toMatch(/parallèles/);
    expect(c.erreursPoints[4]).toMatch(/confondus/);
    expect(c.erreursPoints[5]).toBe("Construction incomplète.");
    expect(c.erreursElements[0]).toMatch(/M n'existe pas/);
    expect(c.erreursElements[1]).toMatch(/3 sommets/);
    expect(c.erreursElements[2]).toMatch(/réduit au sommet/);
  });

  it("cadre la figure avec ses cercles, jamais plus haute que large", () => {
    const f = figure({ points: [point("O", 0, 0)], elements: [element("cercle", ["O"], { rayon: 2 })] });
    const cadre = cadreFigure(f, calculerFigure(f));
    expect(cadre.xmin).toBeLessThan(-2);
    expect(cadre.ymax).toBeGreaterThan(2);
    const haute = figure({ points: [point("A", 0, 0), point("B", 0, 10)] });
    const c2 = cadreFigure(haute, calculerFigure(haute));
    expect(c2.xmax - c2.xmin).toBeCloseTo(c2.ymax - c2.ymin);
  });

  it("coupe une droite et une demi-droite au cadre", () => {
    const cadre = { xmin: -5, xmax: 5, ymin: -5, ymax: 5 };
    expect(couperAuCadre([0, 0], [1, 1], cadre, false)).toEqual([
      [-5, -5],
      [5, 5],
    ]);
    expect(couperAuCadre([0, 0], [1, 0], cadre, true)).toEqual([
      [0, 0],
      [5, 0],
    ]);
    expect(couperAuCadre([0, 9], [1, 9], cadre, false)).toBeNull();
  });

  it("écrit le nom à l'opposé des segments qui partent du point", () => {
    const p = point("A", 0, 0);
    const d = directionNom(p, [0, 0], [[1, 0], [0, 1]], [1, 1])!;
    expect(d[0]).toBeCloseTo(-Math.SQRT1_2);
    expect(d[1]).toBeCloseTo(-Math.SQRT1_2);
    expect(directionNom({ ...p, position: "n" }, [0, 0], [], [1, 1])).toEqual([0, 1]);
    expect(directionNom({ ...p, position: "aucune" }, [0, 0], [], [1, 1])).toBeNull();
  });

  it("renomme et retire un point partout où il est cité", () => {
    const f = figure({
      points: [point("A", 0, 0), point("B", 4, 0), point("I", 0, 0, { type: "milieu", refs: ["A", "B"] }), point("C", 1, 3)],
      elements: [element("polygone", ["A", "B", "C"]), element("segment", ["C", "I"])],
    });
    const r = renommerPoint(f, "A", "E");
    expect(r.points[2]!.refs).toEqual(["E", "B"]);
    expect(r.elements[0]!.refs).toEqual(["E", "B", "C"]);
    const sans = retirerPoint(f, "B");
    expect(sans.points.map((p) => p.nom)).toEqual(["A", "C"]);
    expect(sans.elements).toEqual([]);
    expect(nomLibre(f)).toBe("D");
  });

  it("garde la figure dans un document nettoyé", () => {
    const doc = nettoyerDocument({
      type: "doc",
      content: [{ type: "geometrie", attrs: { points: [{ nom: "A", x: 1, y: 2, onclick: "x" }], alt: "Point A" } }],
    });
    expect(doc.content![0]!.attrs).toMatchObject({ alt: "Point A", points: [{ nom: "A", x: 1, y: 2 }] });
    expect(JSON.stringify(doc)).not.toContain("onclick");
  });
});
