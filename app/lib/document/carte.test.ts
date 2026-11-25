import { describe, expect, it } from "vitest";

import { cheminLisse, echangerEntrees, normaliserCarte, pointeFleche, retirerEntree, texteCarte } from "./carte";
import { nettoyerDocument } from "./nettoyer";

const CLE = "m/0b5c3a3e-2f43-4d38-9d2e-6d0c4b3a2f10.webp";

describe("normaliserCarte", () => {
  it("garde les figurés valides et retire les autres", () => {
    const c = normaliserCarte({
      cle: CLE,
      largeur: 1200,
      hauteur: 900,
      legende: [
        { genre: "titre", texte: "I. Un territoire" },
        { genre: "zone", motif: "hachures", couleur: 2, texte: "Rizières" },
        { genre: "point", motif: "inconnu", couleur: 99, texte: "Port" },
        { genre: "cercle", texte: "?" },
      ],
      traces: [
        { e: 1, pts: [0.1, 0.1, 0.5, 0.1, 0.3, 0.4] },
        { e: 1, pts: [0.1, 0.1, 0.5, 0.1] }, // zone à deux points : retirée
        { e: 2, pts: [1.4, -2, 0.5, 0.5] }, // ramené dans le cadre, un seul point
        { e: 0, pts: [0.2, 0.2] }, // titre : pas de figuré
        { e: 7, pts: [0.2, 0.2] },
      ],
      noms: [{ x: 0.5, y: 0.5, texte: "Toamasina", style: "mer" }, { x: "a", y: 0 }],
    });
    expect(c.legende.map((e) => e.genre)).toEqual(["titre", "zone", "point"]);
    expect(c.legende[2]).toEqual({ genre: "point", motif: "rond", couleur: 0, texte: "Port" });
    expect(c.traces).toEqual([
      { e: 1, pts: [0.1, 0.1, 0.5, 0.1, 0.3, 0.4] },
      { e: 2, pts: [1, 0] },
    ]);
    expect(c.noms).toEqual([{ x: 0.5, y: 0.5, texte: "Toamasina", style: "mer" }]);
    expect([c.largeur, c.hauteur]).toEqual([1200, 900]);
  });

  it("fond blanc en 4:3 sans image", () => {
    const c = normaliserCarte({ largeur: 300, hauteur: 2000 });
    expect([c.cle, c.largeur, c.hauteur]).toEqual([null, 1000, 750]);
  });
});

describe("légende", () => {
  const c = normaliserCarte({
    legende: [
      { genre: "zone", texte: "A" },
      { genre: "ligne", texte: "B" },
      { genre: "point", texte: "C" },
    ],
    traces: [
      { e: 0, pts: [0, 0, 1, 0, 1, 1] },
      { e: 1, pts: [0, 0, 1, 1] },
      { e: 2, pts: [0.5, 0.5] },
    ],
  });

  it("retirer une ligne retire ses figurés et renumérote", () => {
    const r = retirerEntree(c, 1);
    expect(r.legende.map((e) => e.texte)).toEqual(["A", "C"]);
    expect(r.traces.map((t) => t.e)).toEqual([0, 1]);
    expect(r.traces[1]!.pts).toEqual([0.5, 0.5]);
  });

  it("échanger deux lignes garde chaque figuré avec sa ligne", () => {
    const r = echangerEntrees(c, 0, 2);
    expect(r.legende.map((e) => e.texte)).toEqual(["C", "B", "A"]);
    expect(r.traces.map((t) => r.legende[t.e]!.texte)).toEqual(["A", "B", "C"]);
  });
});

describe("dessin", () => {
  it("chemin lissé : droit avec deux points, courbes au-delà", () => {
    expect(cheminLisse([[0, 0], [10, 0]])).toBe("M0 0L10 0");
    const d = cheminLisse([[0, 0], [10, 10], [20, 0]]);
    expect(d.startsWith("M0 0C")).toBe(true);
    expect(d.endsWith("20 0")).toBe(true);
  });

  it("pointe de flèche au bout, base en retrait", () => {
    const { triangle, base } = pointeFleche([[0, 0], [100, 0]], 20, 10);
    expect(triangle[0]).toEqual([100, 0]);
    expect(base).toEqual([80, 0]);
    expect(triangle[1]![0]).toBe(80);
    expect(Math.abs(triangle[1]![1] - triangle[2]![1])).toBe(10);
  });
});

describe("nettoyage", () => {
  it("refuse une clé qui n'est pas celle d'un envoi, garde les textes cherchables", () => {
    const doc = nettoyerDocument({
      type: "doc",
      content: [
        {
          type: "carte",
          attrs: { cle: "../secret.png", titre: "Madagascar", legende: [{ genre: "point", texte: "Port" }], noms: [{ x: 0.2, y: 0.3, texte: "Mahajanga" }] },
        },
      ],
    });
    const attrs = doc.content![0]!.attrs!;
    expect(attrs.cle).toBeNull();
    expect(texteCarte(normaliserCarte(attrs))).toBe("Madagascar Port Mahajanga");
  });
});
