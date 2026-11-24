import { describe, expect, it } from "vitest";

import { motsRecherche, normaliser, slugifier } from "./texte";

describe("texte", () => {
  it("normalise accents, casse et ponctuation", () => {
    expect(normaliser("Mathématiques — BAC série C")).toBe("mathematiques bac serie c");
  });
  it("découpe une recherche en mots uniques", () => {
    expect(motsRecherche("BAC bac 2024  Maths!")).toEqual(["bac", "2024", "maths"]);
  });
  it("fabrique une adresse lisible", () => {
    expect(slugifier("BAC 2024 — Maths série C")).toBe("bac-2024-maths-serie-c");
    expect(slugifier("!!!")).toBe("sujet");
  });
});
