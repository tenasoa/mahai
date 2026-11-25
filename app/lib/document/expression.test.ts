import { describe, expect, it } from "vitest";

import { compiler, erreurExpression } from "./expression";

const en = (source: string, x: number) => compiler(source)(x);

describe("compiler", () => {
  it("respecte les priorités", () => {
    expect(en("1 + 2 * 3", 0)).toBe(7);
    expect(en("2^3^2", 0)).toBe(512);
    expect(en("-x^2", 3)).toBe(-9);
    expect(en("2^-1", 0)).toBe(0.5);
    expect(en("(1 + 2) * 3", 0)).toBe(9);
    expect(en("8 / 4 / 2", 0)).toBe(1);
  });

  it("lit la multiplication implicite", () => {
    expect(en("2x", 3)).toBe(6);
    expect(en("3(x+1)", 1)).toBe(6);
    expect(en("(x+1)(x-1)", 3)).toBe(8);
    expect(en("2x^2 - 3x + 1", 2)).toBe(3);
    expect(en("x sin(x)", Math.PI / 2)).toBeCloseTo(Math.PI / 2);
    expect(en("2pi", 0)).toBeCloseTo(2 * Math.PI);
  });

  it("connaît les fonctions et les constantes", () => {
    expect(en("ln(e)", 0)).toBeCloseTo(1);
    expect(en("exp(0)", 0)).toBe(1);
    expect(en("e^x", 1)).toBeCloseTo(Math.E);
    expect(en("log(100)", 0)).toBe(2);
    expect(en("sqrt(x)", 9)).toBe(3);
    expect(en("√x", 16)).toBe(4);
    expect(en("cos(π)", 0)).toBeCloseTo(-1);
    expect(en("sin(x)^2 + cos(x)^2", 1.3)).toBeCloseTo(1);
    expect(en("sin x", 0)).toBe(0);
  });

  it("accepte l'écriture usuelle", () => {
    expect(en("1,5x", 2)).toBe(3);
    expect(en("x²", 3)).toBe(9);
    expect(en("2×x − 1", 2)).toBe(3);
    expect(en("|x - 3|", 1)).toBe(2);
    expect(en("2|x|", -4)).toBe(8);
    expect(en("abs(x)", -1)).toBe(1);
    expect(en("X + 1", 1)).toBe(2);
  });

  it("rend NaN hors du domaine", () => {
    expect(en("ln(x)", -1)).toBeNaN();
    expect(en("sqrt(x)", -1)).toBeNaN();
    expect(en("1/x", 0)).toBe(Infinity);
  });

  it("refuse le reste avec un message clair", () => {
    expect(erreurExpression("")).toBe("Expression vide.");
    expect(erreurExpression("(x + 1")).toBe("Parenthèse non fermée.");
    expect(erreurExpression("x + 1)")).toBe("Parenthèse fermante en trop.");
    expect(erreurExpression("y + 1")).toMatch(/Inconnu/);
    expect(erreurExpression("alert(1)")).toMatch(/Inconnu/);
    expect(erreurExpression("x; 1")).toMatch(/non reconnu/);
    expect(erreurExpression("2 +")).toBe("Expression incomplète.");
    expect(erreurExpression("sin")).toMatch(/argument/);
    expect(erreurExpression("x".repeat(201))).toBe("Expression trop longue.");
    expect(erreurExpression("x^2 - 1")).toBeNull();
  });
});
