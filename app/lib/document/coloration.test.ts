import { describe, expect, it } from "vitest";

import { creerColoration } from "./coloration";

type Hast = { type: string; value?: string; properties?: { className?: string[] }; children?: Hast[] };

function classesDe(n: Hast, mot: string): string[] {
  if (n.type === "element" && n.children?.some((c) => c.type === "text" && c.value === mot)) {
    return n.properties?.className ?? [];
  }
  return (n.children ?? []).flatMap((c) => classesDe(c, mot));
}

describe("pseudo-code français", () => {
  const lowlight = creerColoration();
  const arbre = lowlight.highlight(
    "algo",
    "Algorithme Somme\nVariables i, s : entier\nDébut\n  s ← 0\n  Pour i de 1 à 10 Faire\n    s ← s + i\n  FinPour\n  Écrire(s) // affiche 55\nFin",
  ) as unknown as Hast;

  it("reconnaît les mots-clés, même accentués", () => {
    expect(classesDe(arbre, "Algorithme")).toContain("hljs-keyword");
    expect(classesDe(arbre, "Début")).toContain("hljs-keyword");
    expect(classesDe(arbre, "Écrire")).toContain("hljs-keyword");
    expect(classesDe(arbre, "entier")).toContain("hljs-type");
  });

  it("reconnaît l'affectation et les commentaires", () => {
    expect(classesDe(arbre, "←")).toContain("hljs-operator");
    expect(classesDe(arbre, "// affiche 55")).toContain("hljs-comment");
  });
});
