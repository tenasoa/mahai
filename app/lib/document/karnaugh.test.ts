import { describe, expect, it } from "vitest";

import { disposition, gray, lignesTableVerite, minterme, normaliserKarnaugh } from "./karnaugh";
import { nettoyerDocument } from "./nettoyer";

describe("Karnaugh", () => {
  it("range les lignes et colonnes en code de Gray", () => {
    expect(gray(1)).toEqual([0, 1]);
    expect(gray(2)).toEqual([0, 1, 3, 2]);
    const d = disposition(3);
    expect(d.lignes).toEqual([0, 1]);
    expect(d.colonnes).toEqual([0, 1, 3, 2]);
    // ligne A=1, colonne BC=10 → minterme 110 = 6
    expect(minterme(1, 2, d.bitsColonnes)).toBe(6);
  });

  it("vérifie variables, sortie et valeurs", () => {
    expect(normaliserKarnaugh({ variables: ["A", "B"], sortie: "F", valeurs: "01x1" })).toEqual({
      variables: ["A", "B"],
      sortie: "F",
      valeurs: "01X1",
    });
    const k = normaliserKarnaugh({ variables: ["<b>", 3], valeurs: "1" });
    expect(k.variables).toEqual(["A", "B"]);
    expect(k.valeurs).toBe("1...");
    expect(normaliserKarnaugh({ variables: ["X"] }).variables).toEqual(["A", "B", "C"]);
    expect(normaliserKarnaugh({ variables: ["A", "B", "C", "D", "E"] }).variables).toHaveLength(4);
  });

  it("produit toutes les combinaisons d'une table de vérité", () => {
    expect(lignesTableVerite(["A", "B"])).toEqual([
      ["0", "0"],
      ["0", "1"],
      ["1", "0"],
      ["1", "1"],
    ]);
  });
});

describe("blocs d'électronique", () => {
  it("garde les schémas PNG, les chronogrammes et les tableaux de Karnaugh", () => {
    const doc = nettoyerDocument({
      type: "doc",
      content: [
        { type: "schema", attrs: { cle: "m/0b5c3a3e-2a4b-4c1d-9e8f-123456789abc.png", alt: "Pont diviseur", largeur: 800 } },
        { type: "schema", attrs: { cle: "m/0b5c3a3e-2a4b-4c1d-9e8f-123456789abc.webp" } },
        { type: "chronogramme", attrs: { source: "{signal: [{name: 'clk', wave: 'p...'}]}" } },
        { type: "karnaugh", attrs: { variables: ["A", "B"], valeurs: "0110" } },
      ],
    });
    expect(doc.content?.map((n) => n.type)).toEqual(["schema", "chronogramme", "karnaugh"]);
    expect(doc.content?.[0]?.attrs).toMatchObject({ alt: "Pont diviseur", largeur: 800, hauteur: null });
  });
});
