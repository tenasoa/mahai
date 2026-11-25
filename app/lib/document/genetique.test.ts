import { describe, expect, it } from "vitest";

import {
  ARBRE_DEFAUT,
  ECHIQUIER_DEFAUT,
  couples,
  deplacerIndividu,
  disposer,
  familles,
  genotype,
  individu,
  insererGamete,
  normaliserArbre,
  normaliserEchiquier,
  numeros,
  retirerGamete,
  retirerIndividu,
  symbolesUtilises,
} from "./genetique";
import { normaliserReperes, nouveauRepere } from "./reperes";
import { nettoyerDocument } from "./nettoyer";

describe("arbre généalogique", () => {
  it("retire les unions sans conjoint et les parents introuvables", () => {
    const a = normaliserArbre({
      generations: [
        [{ sexe: "m", uni: true }, { sexe: "vide", etat: "atteint" }],
        [{ sexe: "f", parent: 5 }, { sexe: "x", etat: "??", parent: 0 }],
      ],
      numerotation: "rien",
    });
    expect(a.generations[0]![0]!.uni).toBe(false);
    expect(a.generations[0]![1]!.etat).toBe("sain");
    expect(a.generations[1]![0]!.parent).toBeNull();
    expect(a.generations[1]![1]).toMatchObject({ sexe: "m", etat: "sain", parent: 0 });
    expect(a.numerotation).toBe("generation");
  });

  it("garde l'arbre par défaut tel quel", () => {
    expect(normaliserArbre(ARBRE_DEFAUT as unknown as Record<string, unknown>)).toEqual(ARBRE_DEFAUT);
  });

  it("numérote par génération ou en continu, sans compter les cases vides", () => {
    const a = normaliserArbre({
      generations: [[individu("m"), individu("vide"), individu("f")], [individu("m")]],
    });
    expect(numeros(a)).toEqual([["1", "", "2"], ["1"]]);
    expect(numeros({ ...a, numerotation: "continue" })).toEqual([["1", "", "2"], ["3"]]);
  });

  it("regroupe les couples en familles", () => {
    const g = [{ ...individu("m"), uni: true }, individu("f"), individu("m")];
    expect(familles(g)).toEqual([[0, 1], [2]]);
  });

  it("relie les enfants au milieu de l'union de leurs parents", () => {
    const { traits, places } = disposer(ARBRE_DEFAUT);
    expect(places).toHaveLength(5);
    const pere = places[0]!;
    const mere = places[1]!;
    const milieu = (pere.x + mere.x) / 2;
    // union, descente, trait de fratrie, puis un trait par enfant
    expect(traits).toHaveLength(1 + 2 + 3);
    expect(traits[1]).toMatchObject({ x1: milieu, x2: milieu, y1: pere.y });
  });

  it("déplace et retire un individu en gardant les filiations", () => {
    const a = normaliserArbre({
      generations: [
        [individu("m"), individu("f"), individu("m")],
        [individu("f", 2), individu("m", 0)],
      ],
    });
    const d = deplacerIndividu(a, 0, 2, -1);
    expect(d.generations[1]!.map((i) => i.parent)).toEqual([1, 0]);
    const r = retirerIndividu(a, 0, 0);
    expect(r.generations[1]!.map((i) => i.parent)).toEqual([1, null]);
  });

  it("liste les symboles présents pour la légende", () => {
    expect(symbolesUtilises(ARBRE_DEFAUT)).toEqual([
      { sexe: "m", etat: "sain" },
      { sexe: "f", etat: "sain" },
      { sexe: "f", etat: "atteint" },
    ]);
  });
});

describe("échiquier de croisement", () => {
  it("déduit le génotype des gamètes", () => {
    expect(genotype("A", "a")).toBe("A//a");
    expect(genotype("A B", "a b")).toBe("A//a;B//b");
    expect(genotype("AB", "ab")).toBe("AB//ab");
    expect(couples("A//a;B//b")).toEqual([["A", "a"], ["B", "b"]]);
    expect(couples("[A]")).toEqual([["[A]"]]);
  });

  it("ramène les cases à la taille de l'échiquier", () => {
    const e = normaliserEchiquier({
      colonnes: [{ g: "A" }, { g: "a" }, { g: "b" }],
      lignes: [{ g: "a", f: 7 }],
      cases: [[{ geno: "A//a", pheno: "[A]" }]],
    });
    expect(e.cases).toEqual([[{ geno: "A//a", pheno: "[A]" }, { geno: "", pheno: "" }, { geno: "", pheno: "" }]]);
    expect(e.lignes[0]!.f).toBe("");
    expect(normaliserEchiquier({}).colonnes).toHaveLength(1);
  });

  it("ajoute et retire des gamètes avec leurs cases", () => {
    const e = insererGamete(ECHIQUIER_DEFAUT, "colonne");
    expect(e.cases.map((l) => l.length)).toEqual([3, 3]);
    const r = retirerGamete(e, "ligne", 0);
    expect(r.lignes).toHaveLength(1);
    expect(r.cases).toHaveLength(1);
    expect(retirerGamete(r, "ligne", 0)).toBe(r);
  });
});

describe("repères sur une image", () => {
  it("borne les coordonnées et ignore les repères sans position", () => {
    const r = normaliserReperes([{ x: 1.5, y: -1, texte: "noyau" }, { x: "a", y: 0 }, null]);
    expect(r).toEqual([{ x: 1, y: 0, tx: 1, ty: 0, texte: "noyau" }]);
  });

  it("donne au nouveau repère le premier numéro libre", () => {
    const existants = normaliserReperes([{ x: 0.2, y: 0.2, texte: "1" }, { x: 0.3, y: 0.3, texte: "3" }]);
    const r = nouveauRepere(0.8, 0.5, existants);
    expect(r.texte).toBe("2");
    expect(r.tx).toBeGreaterThan(r.x);
  });

  it("garde les repères d'une image et les blocs de génétique au nettoyage", () => {
    const doc = nettoyerDocument({
      type: "doc",
      content: [
        {
          type: "image",
          attrs: { cle: "m/11111111-1111-1111-1111-111111111111.webp", reperes: [{ x: 0.5, y: 0.5, texte: "1" }] },
        },
        { type: "image", attrs: { cle: "m/11111111-1111-1111-1111-111111111111.webp" } },
        { type: "arbre", attrs: ARBRE_DEFAUT },
        { type: "echiquier", attrs: ECHIQUIER_DEFAUT },
      ],
    });
    expect(doc.content![0]!.attrs!.reperes).toHaveLength(1);
    expect(doc.content![1]!.attrs).not.toHaveProperty("reperes");
    expect(doc.content![2]!.attrs).toEqual(ARBRE_DEFAUT);
    expect(doc.content![3]!.attrs).toEqual(ECHIQUIER_DEFAUT);
  });
});
