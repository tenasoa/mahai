import { describe, expect, it } from "vitest";

import type { Noeud } from "./nettoyer";
import { planDocument, pts } from "./plan";

const p = (texte: string): Noeud => ({ type: "paragraph", content: [{ type: "text", text: texte }] });
const q = (texte: string, attrs: Record<string, unknown> = {}): Noeud => ({ type: "question", attrs, content: [p(texte)] });

describe("planDocument", () => {
  it("relève parties, exercices et questions avec leur barème", () => {
    const doc: Noeud = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Partie A" }] },
        { type: "heading", attrs: { level: 2 }, content: [] },
        {
          type: "exercice",
          attrs: { titre: "Suites", points: 5, pointsSeries: { c: 6 } },
          content: [q("Montrer que la suite est croissante.", { points: 3 }), p("Rappel"), q("Limite ?")],
        },
        q("Question libre", { points: 1 }),
      ],
    };
    const plan = planDocument(doc);
    expect(plan.map((e) => [e.id, e.titre, e.points])).toEqual([
      ["partie-1", "Partie A", null],
      ["exercice-1", "Exercice 1 — Suites", 5],
      ["question-1", "1. Question libre", 1],
    ]);
    expect(plan[1]!.questions).toEqual([
      { id: "exercice-1-question-1", titre: "1. Montrer que la suite est croissante.", points: 3 },
      { id: "exercice-1-question-2", titre: "2. Limite ?", points: null },
    ]);
    expect(planDocument(doc, "c")[1]!.points).toBe(6);
  });

  it("raccourcit les longues questions et accepte un document vide", () => {
    const long = "a".repeat(80);
    expect(planDocument({ type: "doc", content: [q(long)] })[0]!.titre.endsWith("…")).toBe(true);
    expect(planDocument(null)).toEqual([]);
  });

  it("écrit les points à la française", () => {
    expect(pts(0.5)).toBe("0,5 pt");
    expect(pts(4)).toBe("4 pts");
  });
});
