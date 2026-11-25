import { describe, expect, it } from "vitest";

import { couper } from "~/components/document/SvgFrise";
import { anneeFr, graduationsFrise, normaliserFrise, ranger } from "./frise";
import { nettoyerDocument, texteBrut } from "./nettoyer";
import { echelle, lireTableau, nombreStat, normaliserStatistique, parts } from "./statistique";

describe("frise chronologique", () => {
  it("corrige une échelle invalide et borne les listes", () => {
    const f = normaliserFrise({
      debut: 2000,
      fin: 1900,
      pas: 0.001,
      periodes: [{ debut: 1950, fin: 1940, texte: "x".repeat(200), couleur: 42 }],
      evenements: Array.from({ length: 60 }, () => ({ date: "1960", texte: 3 })),
    });
    expect([f.debut, f.fin, f.pas]).toEqual([1900, 2000, 10]);
    expect(f.periodes[0]).toMatchObject({ debut: 1940, fin: 1950, couleur: 0 });
    expect(f.periodes[0]!.texte).toHaveLength(80);
    expect(f.evenements).toHaveLength(40);
    expect(f.evenements[0]).toEqual({ date: 1960, texte: "" });
  });

  it("écrit les années avant notre ère et gradue l'échelle", () => {
    expect(anneeFr(-52)).toBe("52 av. J.-C.");
    expect(anneeFr(1960)).toBe("1960");
    expect(graduationsFrise(normaliserFrise({ debut: -250, fin: 250, pas: 100 }))).toEqual([-200, -100, 0, 100, 200]);
  });

  it("range les étiquettes sans chevauchement", () => {
    expect(ranger([[0, 50], [40, 90], [100, 150], [45, 60]])).toEqual([0, 1, 0, 2]);
  });

  it("coupe les longs textes en trois lignes au plus", () => {
    expect(couper("Indépendance de Madagascar")).toEqual(["Indépendance de", "Madagascar"]);
    const long = couper("un deux trois quatre cinq six sept huit neuf dix onze douze treize quatorze quinze seize");
    expect(long).toHaveLength(3);
    expect(long[2]!.endsWith("…")).toBe(true);
  });
});

describe("diagramme statistique", () => {
  it("aligne les valeurs sur les catégories et limite les séries au genre", () => {
    const s = normaliserStatistique({
      genre: "secteurs",
      categories: ["A", "B", 2020],
      series: [
        { nom: "Part", valeurs: ["1,5", "x", 3, 99] },
        { nom: "En trop", valeurs: [1, 2, 3] },
      ],
    });
    expect(s.categories).toEqual(["A", "B", "2020"]);
    expect(s.series).toHaveLength(1);
    expect(s.series[0]!.valeurs).toEqual([1.5, null, 3]);
    expect(normaliserStatistique({ genre: "inconnu" }).genre).toBe("barres");
  });

  it("lit un tableau collé depuis un tableur", () => {
    const t = lireTableau("Année\tHommes\tFemmes\n2000\t1 200\t1 300,5\n2010\t\t1 400\n");
    expect(t).toEqual({
      categories: ["2000", "2010"],
      series: [
        { nom: "Hommes", valeurs: [1200, null] },
        { nom: "Femmes", valeurs: [1300.5, 1400] },
      ],
    });
    expect(lireTableau("une seule ligne")).toBeNull();
    expect(lireTableau("Pays;Part\nFrance;12\n")!.series[0]!.valeurs).toEqual([12]);
  });

  it("choisit une échelle ronde et calcule les parts", () => {
    expect(echelle(0, 87)).toEqual({ min: 0, max: 100, pas: 20 });
    expect(echelle(-12, 30)).toMatchObject({ min: -20, max: 30, pas: 10 });
    expect(parts([1, 3, null, -2])).toEqual([0.25, 0.75, 0, 0]);
    expect(nombreStat(1234.5)).toBe("1 234,5");
  });

  it("garde frise et diagramme dans un document nettoyé et indexe la frise", () => {
    const doc = nettoyerDocument({
      type: "doc",
      content: [
        { type: "frise", attrs: { debut: 1880, fin: 1980, evenements: [{ date: 1960, texte: "Indépendance", onclick: "x" }] } },
        { type: "statistique", attrs: { genre: "courbe", categories: ["1960"], series: [{ nom: "Population", valeurs: [5.1] }] } },
      ],
    });
    expect(doc.content).toHaveLength(2);
    expect(JSON.stringify(doc)).not.toContain("onclick");
    expect(texteBrut(doc)).toContain("1960 Indépendance");
  });
});
