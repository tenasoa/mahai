import { describe, expect, it } from "vitest";

import { DELAI_GRACE_MS, classer, clesCitees, taille, type Fichier } from "./nettoyage";

const A = "m/11111111-1111-1111-1111-111111111111.webp";
const B = "m/22222222-2222-2222-2222-222222222222.png";
const C = "m/33333333-3333-3333-3333-333333333333.jpg";

describe("clesCitees", () => {
  it("trouve les images et les schémas dans le JSON brut", () => {
    const doc = JSON.stringify({
      type: "doc",
      content: [
        { type: "image", attrs: { cle: A, alt: "" } },
        { type: "documentNumerote", content: [{ type: "schema", attrs: { cle: B } }] },
      ],
    });
    expect(clesCitees(doc)).toEqual([A, B]);
    expect(clesCitees(null)).toEqual([]);
    expect(clesCitees('"m/pas-une-cle.webp"')).toEqual([]);
  });
});

describe("classer", () => {
  const maintenant = 10 * DELAI_GRACE_MS;
  const fichier = (cle: string, age: number, octets = 100): Fichier => ({
    cle,
    taille: octets,
    creeLe: maintenant - age,
    dansR2: true,
  });

  it("garde les images citées et les envois récents", () => {
    const r = classer(
      [fichier(A, 5 * DELAI_GRACE_MS), fichier(B, 2 * DELAI_GRACE_MS, 300), fichier(C, 1000)],
      new Set([A]),
      maintenant,
    );
    expect(r.utilises).toBe(1);
    expect(r.inutilises.map((f) => f.cle)).toEqual([B]);
    expect(r.recents.map((f) => f.cle)).toEqual([C]);
    expect(r.tailleInutilises).toBe(300);
  });

  it("ne supprime jamais une image citée, même ancienne", () => {
    const r = classer([fichier(A, 100 * DELAI_GRACE_MS)], new Set([A]), maintenant);
    expect(r.inutilises).toEqual([]);
  });
});

it("affiche la taille", () => {
  expect(taille(200)).toBe("1 ko");
  expect(taille(320 * 1024)).toBe("320 ko");
  expect(taille(1.45 * 1024 * 1024)).toBe("1,4 Mo");
});
