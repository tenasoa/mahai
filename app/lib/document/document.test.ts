import { describe, expect, it } from "vitest";

import {
  DocumentInvalide,
  lireDocument,
  nettoyerDocument,
  texteBrut,
  totalPoints,
  type Noeud,
} from "./nettoyer";

const p = (...content: Noeud[]): Noeud => ({ type: "paragraph", content });
const t = (text: string, marks?: Noeud["marks"]): Noeud => (marks ? { type: "text", text, marks } : { type: "text", text });

describe("nettoyage des documents", () => {
  it("garde un document valide tel quel", () => {
    const doc: Noeud = {
      type: "doc",
      content: [
        {
          type: "exercice",
          attrs: { titre: "Chute libre", points: 5 },
          content: [
            p(t("Une bille tombe sans vitesse initiale.")),
            {
              type: "question",
              attrs: { points: 2 },
              content: [p(t("Calculer "), { type: "inlineMath", attrs: { latex: "v(t)" } })],
            },
          ],
        },
        { type: "blockMath", attrs: { latex: "\\ce{2H2 + O2 -> 2H2O}" } },
      ],
    };
    expect(nettoyerDocument(doc)).toEqual(doc);
  });

  it("supprime les nœuds, marques et attributs inconnus", () => {
    const propre = nettoyerDocument({
      type: "doc",
      content: [
        { type: "script", content: [t("alert(1)")] },
        { type: "paragraph", attrs: { onclick: "x", style: "color:red" }, content: [t("ok", [{ type: "bold" }, { type: "evil" }])] },
        { type: "heading", attrs: { level: 1 }, content: [t("Titre")] },
      ],
    });
    expect(propre).toEqual({
      type: "doc",
      content: [
        { type: "paragraph", content: [t("ok", [{ type: "bold" }])] },
        { type: "heading", attrs: { level: 2 }, content: [t("Titre")] },
      ],
    });
  });

  it("refuse les liens dangereux mais garde le texte", () => {
    const propre = nettoyerDocument({
      type: "doc",
      content: [
        p(
          t("piège", [{ type: "link", attrs: { href: "javascript:alert(1)" } }]),
          t("doc", [{ type: "link", attrs: { href: "https://exemple.test", target: "_top" } }]),
        ),
      ],
    });
    expect(propre.content![0]!.content).toEqual([
      t("piège"),
      t("doc", [{ type: "link", attrs: { href: "https://exemple.test" } }]),
    ]);
  });

  it("borne les barèmes et les valeurs", () => {
    const propre = nettoyerDocument({
      type: "doc",
      content: [
        { type: "exercice", attrs: { titre: 42, points: "2,5" } },
        { type: "question", attrs: { points: -3 } },
        { type: "question", attrs: { points: "beaucoup" } },
      ],
    });
    expect(propre.content!.map((n) => n.attrs)).toEqual([
      { titre: "", points: 2.5 },
      { points: null },
      { points: null },
    ]);
  });

  it("refuse un document trop imbriqué ou illisible", () => {
    let profond: Noeud = p(t("x"));
    for (let i = 0; i < 40; i++) profond = { type: "blockquote", content: [profond] };
    expect(() => nettoyerDocument({ type: "doc", content: [profond] })).toThrow(DocumentInvalide);
    expect(() => nettoyerDocument({ type: "paragraph" })).toThrow(DocumentInvalide);
    expect(() => lireDocument("{pas du json")).toThrow(DocumentInvalide);
  });

  it("considère un document sans contenu comme vide", () => {
    expect(lireDocument(JSON.stringify({ type: "doc", content: [p()] }))).toBeNull();
    expect(lireDocument("")).toBeNull();
  });
});

describe("texte et barème", () => {
  const doc = nettoyerDocument({
    type: "doc",
    content: [
      {
        type: "exercice",
        attrs: { titre: "Énergie", points: 6 },
        content: [{ type: "question", attrs: { points: 2 }, content: [p(t("Calculer "), { type: "inlineMath", attrs: { latex: "E_c" } })] }],
      },
      { type: "exercice", attrs: { titre: "", points: null }, content: [{ type: "question", attrs: { points: 4 } }] },
    ],
  });

  it("extrait le texte avec les formules", () => {
    const texte = texteBrut(doc);
    expect(texte).toContain("Énergie");
    expect(texte).toContain("Calculer");
    expect(texte).toContain("E_c");
  });

  it("additionne le barème sans compter deux fois", () => {
    expect(totalPoints(doc)).toBe(10);
  });

  it("applique le barème propre à une série", () => {
    const parSerie = nettoyerDocument({
      type: "doc",
      content: [
        { type: "question", attrs: { points: null, pointsSeries: { "bac-a1": 1, "bac-a2": "0,75", "Mauvaise Clé": 3 } } },
        { type: "question", attrs: { points: 2 } },
      ],
    });
    expect(parSerie.content![0]!.attrs).toEqual({ points: null, pointsSeries: { "bac-a1": 1, "bac-a2": 0.75 } });
    expect(totalPoints(parSerie, "bac-a1")).toBe(3);
    expect(totalPoints(parSerie, "bac-a2")).toBe(2.75);
    expect(totalPoints(parSerie)).toBe(2);
  });
});
