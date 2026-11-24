import { describe, expect, it } from "vitest";

import { duree, lireFormulaireSujet, texteRecherche, type Listes } from "./formulaire";

const listes: Listes = {
  examens: [{ id: "bac", nom: "BAC" }],
  series: [
    { id: "bac-a1", examenId: "bac", nom: "A1" },
    { id: "bac-a2", examenId: "bac", nom: "A2" },
  ],
  matieres: [{ id: "maths", nom: "Maths" }],
};

const enonce = JSON.stringify({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Soit la suite U." }] }],
});

function formulaire(champs: Record<string, string | string[]>) {
  const f = new FormData();
  for (const [k, v] of Object.entries(champs)) {
    for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
  }
  return f;
}

describe("formulaire de sujet", () => {
  it("lit un sujet valide avec plusieurs séries", () => {
    const r = lireFormulaireSujet(
      formulaire({
        titre: " Mathématiques ",
        examenId: "bac",
        matiereId: "maths",
        series: ["bac-a1", "bac-a2", "bac-inconnue"],
        "coefficient-bac-a1": "1",
        "coefficient-bac-a2": "3",
        annee: "2021",
        dureeHeures: "2",
        dureeMinutes: "15",
        codeMatiere: "009",
        enonce,
      }),
      listes,
      2026,
    );
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.donnees.titre).toBe("Mathématiques");
    expect(r.donnees.series).toEqual([
      { serieId: "bac-a1", coefficient: 1 },
      { serieId: "bac-a2", coefficient: 3 },
    ]);
    expect(r.donnees.dureeMinutes).toBe(135);
    expect(r.donnees.codeMatiere).toBe("009");
    expect(texteRecherche(r.donnees, listes)).toBe(
      "mathematiques bac maths serie a1 serie a2 2021 soit la suite u",
    );
  });

  it("signale les champs manquants ou invalides", () => {
    const r = lireFormulaireSujet(
      formulaire({ titre: "", examenId: "bepc", matiereId: "maths", annee: "1800", enonce: "" }),
      listes,
      2026,
    );
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.erreurs).sort()).toEqual(["annee", "enonce", "examenId", "titre"]);
  });
});

describe("durée", () => {
  it("s'affiche en heures et minutes", () => {
    expect(duree(135)).toBe("2 h 15");
    expect(duree(120)).toBe("2 h");
    expect(duree(45)).toBe("45 min");
    expect(duree(null)).toBeNull();
  });
});
