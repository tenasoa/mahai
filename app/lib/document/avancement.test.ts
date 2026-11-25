import { describe, expect, it } from "vitest";

import { cellules, ecrireQuantite, equation, lireQuantite, normaliserAvancement } from "./avancement";
import { nettoyerDocument, texteBrut } from "./nettoyer";

const combustion = (ch4: string, o2: string, h2o = "0") =>
  normaliserAvancement({
    especes: [
      { formule: "CH4", coef: 1, reactif: true, initial: ch4 },
      { formule: "CO2", coef: 1, reactif: false, initial: "0" },
      { formule: "O2", coef: 2, reactif: true, initial: o2 },
      { formule: "H2O", coef: 2, reactif: false, initial: h2o },
    ],
  });

describe("quantités", () => {
  it("lit décimaux, notation scientifique et fractions", () => {
    expect(lireQuantite("0,5")).toBe(0.5);
    expect(lireQuantite("2,0e-3")).toBeCloseTo(0.002);
    expect(lireQuantite("2{,}0 \\times 10^{-2}")).toBeCloseTo(0.02);
    expect(lireQuantite("3·10^-4")).toBeCloseTo(0.0003);
    expect(lireQuantite("1/4")).toBe(0.25);
    expect(lireQuantite("n_1")).toBeNull();
    expect(lireQuantite("")).toBeNull();
  });

  it("écrit en décimal ou en notation scientifique, sans erreurs d'arrondi", () => {
    expect(ecrireQuantite(0.3 - 2 * 0.1)).toBe("0{,}1");
    expect(ecrireQuantite(0.25)).toBe("0{,}25");
    expect(ecrireQuantite(0.002)).toBe("2 \\times 10^{-3}");
    expect(ecrireQuantite(0.0125)).toBe("0{,}0125");
    expect(ecrireQuantite(0.00999)).toBe("9{,}99 \\times 10^{-3}");
    expect(ecrireQuantite(1e-15)).toBe("0");
  });
});

describe("cellules", () => {
  it("garde l'écriture scientifique et les chiffres significatifs de l'énoncé", () => {
    const c = cellules(combustion("2,0e-2", "5,0 \\times 10^{-2}"));
    expect(c.initial.slice(0, 2)).toEqual(["2{,}0 \\times 10^{-2}", "5{,}0 \\times 10^{-2}"]);
    expect(c.enCours[0]).toBe("2{,}0 \\times 10^{-2} - x");
    expect(c.xmax).toBe("x_{max} = 2{,}0 \\times 10^{-2}");
    expect(c.final).toEqual(["0", "1{,}0 \\times 10^{-2}", "2{,}0 \\times 10^{-2}", "4{,}0 \\times 10^{-2}"]);
  });

  it("garde les chiffres significatifs en écriture décimale", () => {
    const c = cellules(combustion("0,10", "0,30"));
    expect(c.xmax).toBe("x_{max} = 0{,}10");
    expect(c.final).toEqual(["0", "0{,}10", "0{,}10", "0{,}20"]);
  });

  it("ordonne réactifs puis produits et écrit l'équation", () => {
    const t = combustion("1", "3");
    expect(t.especes.map((e) => e.formule)).toEqual(["CH4", "O2", "CO2", "H2O"]);
    expect(equation(t)).toBe("CH4 + 2O2 -> CO2 + 2H2O");
  });

  it("calcule x_max et le réactif limitant", () => {
    const c = cellules(combustion("1", "3"));
    expect(c.xmax).toBe("x_{max} = 1");
    expect(c.limitants).toEqual([0]);
    expect(c.enCours).toEqual(["1 - x", "3 - 2x", "x", "2x"]);
    expect(c.final).toEqual(["0", "1", "1", "2"]);
  });

  it("deux réactifs limitants (proportions stœchiométriques)", () => {
    expect(cellules(combustion("0,5", "1")).limitants).toEqual([0, 1]);
  });

  it("excès, symboles et cases vides", () => {
    const c = cellules(combustion("n_1", "excès", ""));
    expect(c.initial).toEqual(["n_1", "\\text{excès}", "0", ""]);
    expect(c.enCours).toEqual(["n_1 - x", "\\text{excès}", "x", ""]);
    expect(c.final).toEqual(["n_1 - x_{max}", "\\text{excès}", "x_{max}", ""]);
    expect(c.xmax).toBe("x_{max}");
  });

  it("lignes laissées vides pour l'élève", () => {
    const t = { ...combustion("1", "3"), enCours: false, final: false };
    const c = cellules(t);
    expect(c.enCours.every((v) => v === "")).toBe(true);
    expect(c.final.every((v) => v === "")).toBe(true);
    expect(c.xmax).toBe("x_{max}");
    expect(c.limitants).toEqual([]);
  });
});

describe("nettoyage", () => {
  it("borne les coefficients et rend l'équation cherchable", () => {
    const doc = nettoyerDocument({
      type: "doc",
      content: [{ type: "avancement", attrs: { especes: [{ formule: "Fe", coef: 99, initial: "0,1" }, { formule: "Fe^2+", coef: -3, reactif: false }], unite: "kg" } }],
    });
    const a = doc.content![0]!.attrs as ReturnType<typeof normaliserAvancement>;
    expect(a.especes.map((e) => e.coef)).toEqual([20, 1]);
    expect(a.unite).toBe("mol");
    expect(texteBrut(doc)).toContain("20Fe -> Fe^2+");
  });
});
