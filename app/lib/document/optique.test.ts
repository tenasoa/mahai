import { describe, expect, it } from "vitest";

import { nettoyerDocument, texteBrut } from "./nettoyer";
import { OPTIQUE_DEFAUT, disposer, images, normaliserOptique, type Conjugue, type Optique } from "./optique";

const montage = (p: Partial<Optique>): Optique => ({ ...OPTIQUE_DEFAUT, ...p });
const fini = (c: Conjugue | undefined) => {
  if (!c || c.infini) throw new Error("image à l'infini");
  return c;
};

describe("images", () => {
  it("lentille convergente, objet avant F : image réelle et renversée", () => {
    const im = fini(images(montage({}))[0]);
    expect(im.x).toBeCloseTo(50 / 3, 6); // OA' = f'·OA / (f' + OA) = 10·(−25)/(−15)
    expect(im.h).toBeCloseTo(-8 / 3, 6); // γ = OA'/OA = −2/3
    expect(im.reelle).toBe(true);
  });

  it("loupe : objet entre F et O, image virtuelle droite et agrandie", () => {
    const im = fini(images(montage({ objet: { genre: "reel", x: -6, h: 2, angle: 0 } }))[0]);
    expect(im.x).toBeCloseTo(-15, 6);
    expect(im.h).toBeCloseTo(5, 6);
    expect(im.reelle).toBe(false);
  });

  it("lentille divergente : image virtuelle entre F' et O", () => {
    const im = fini(images(montage({ lentilles: [{ x: 0, f: -10 }], objet: { genre: "reel", x: -20, h: 4, angle: 0 } }))[0]);
    expect(im.x).toBeCloseTo(-20 / 3, 6);
    expect(im.h).toBeCloseTo(4 / 3, 6);
    expect(im.reelle).toBe(false);
  });

  it("objet dans le plan focal : image à l'infini ; objet à l'infini : image dans le plan focal", () => {
    expect(images(montage({ objet: { genre: "reel", x: -10, h: 2, angle: 0 } }))[0]!.infini).toBe(true);
    const im = fini(images(montage({ objet: { genre: "infini", x: 0, h: 0, angle: 45 } }))[0]);
    expect(im.x).toBeCloseTo(10, 6);
    expect(im.h).toBeCloseTo(10, 6);
  });

  it("deux lentilles : l'image de la première sert d'objet à la seconde ; lunette afocale", () => {
    const [a, b] = images(montage({ lentilles: [{ x: 0, f: 8 }, { x: 36, f: 6 }], objet: { genre: "reel", x: -12, h: 2, angle: 0 } }));
    expect(fini(a).x).toBeCloseTo(24, 6);
    expect(fini(a).h).toBeCloseTo(-4, 6);
    expect(fini(b).x).toBeCloseTo(48, 6); // O₂A₁ = −12 → O₂A' = 12, γ₂ = −1
    expect(fini(b).h).toBeCloseTo(4, 6);
    const afocale = images(montage({ lentilles: [{ x: 0, f: 40 }, { x: 45, f: 5 }], objet: { genre: "infini", x: 0, h: 0, angle: 3 } }));
    expect(afocale[1]!.infini).toBe(true);
  });
});

describe("disposer", () => {
  it("les rayons émergents passent par l'image (réelle ou virtuelle)", () => {
    for (const objet of [
      { genre: "reel" as const, x: -25, h: 4, angle: 0 },
      { genre: "reel" as const, x: -6, h: 2, angle: 0 },
    ]) {
      const o = montage({ objet });
      const im = fini(images(o)[0]);
      const d = disposer(o);
      const emergents = d.segments.filter((s) => s.x1 === 0 && !s.pointille);
      expect(emergents).toHaveLength(3);
      for (const s of emergents) {
        const pente = (s.y2 - s.y1) / (s.x2 - s.x1);
        expect(s.y1 + pente * (im.x - s.x1)).toBeCloseTo(im.h, 6);
      }
      expect(d.segments.some((s) => s.pointille)).toBe(!im.reelle);
      expect(d.fleches.map((f) => f.nomTete)).toEqual(["B", "B'"]);
    }
  });

  it("sans rayons ni image : objet seul, foyers nommés ; graduations bornées", () => {
    const d = disposer(montage({ rayons: false, image: false, graduation: 5 }));
    expect(d.segments).toEqual([]);
    expect(d.fleches).toHaveLength(1);
    expect(d.reperes.map((r) => r.nom)).toEqual(["O", "F", "F'"]);
    expect(d.graduations.every((g) => g % 5 === 0)).toBe(true);
    expect(disposer(montage({ graduation: 0.001 })).graduations).toEqual([]);
  });

  it("plusieurs lentilles : noms indicés et image intermédiaire", () => {
    const d = disposer(montage({ lentilles: [{ x: 36, f: 6 }, { x: 0, f: 8 }], objet: { genre: "reel", x: -12, h: 2, angle: 0 } }));
    expect(d.lentilles.map((l) => l.nom)).toEqual(["L₁", "L₂"]);
    expect(d.fleches.map((f) => f.nomPied)).toEqual(["A", "A₁", "A'"]);
  });
});

describe("normaliserOptique et nettoyage", () => {
  it("borne les valeurs, refuse une focale nulle, garde le texte cherchable", () => {
    const o = normaliserOptique({ lentilles: [{ x: "5", f: 0 }, { x: 1e9, f: -3 }, {}, {}], objet: { genre: "pirate", x: 1 }, rayons: true });
    expect(o.lentilles).toEqual([{ x: 5, f: 10 }, { x: 1000, f: -3 }, { x: 0, f: 10 }]);
    expect(o.objet.genre).toBe("aucun");
    expect(o.rayons).toBe(true);
    const doc = nettoyerDocument({ type: "doc", content: [{ type: "optique", attrs: { ...OPTIQUE_DEFAUT, pirate: 1 } }] });
    expect("pirate" in doc.content![0]!.attrs!).toBe(false);
    expect(texteBrut(doc)).toContain("lentille convergente");
  });
});
