/**
 * Lecture et vérification du formulaire d'un sujet (admin). Sans accès à la base : testable seul.
 */
import { SOURCES_SUJET } from "~/db/schema";
import { normaliser } from "~/lib/contenu/texte";
import { DocumentInvalide, lireDocument, texteBrut, type Noeud } from "~/lib/document/nettoyer";

export type Listes = {
  examens: { id: string; nom: string }[];
  series: { id: string; examenId: string; nom: string }[];
  matieres: { id: string; nom: string }[];
};

export type DonneesSujet = {
  titre: string;
  examenId: string;
  matiereId: string;
  series: { serieId: string; coefficient: number | null }[];
  annee: number | null;
  session: string | null;
  niveau: string | null;
  dureeMinutes: number | null;
  codeMatiere: string | null;
  option: string | null;
  coefficient: number | null;
  source: (typeof SOURCES_SUJET)[number];
  enonce: Noeud;
  corrige: Noeud | null;
};

export type Erreurs = Partial<Record<string, string>>;

export type Resultat = { ok: true; donnees: DonneesSujet } | { ok: false; erreurs: Erreurs };

const texte = (f: FormData, nom: string, max: number): string | null => {
  const v = f.get(nom);
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t || null;
};

/** Entier dans [min, max] ; `null` si vide, `undefined` si invalide. */
const entier = (f: FormData, nom: string, min: number, max: number): number | null | undefined => {
  const v = f.get(nom);
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

export function lireFormulaireSujet(f: FormData, listes: Listes, anneeCourante: number): Resultat {
  const erreurs: Erreurs = {};

  const titre = texte(f, "titre", 200);
  if (!titre) erreurs.titre = "Donne un titre au sujet.";

  const examenId = texte(f, "examenId", 40);
  if (!examenId || !listes.examens.some((e) => e.id === examenId)) {
    erreurs.examenId = "Choisis un examen.";
  }
  const matiereId = texte(f, "matiereId", 40);
  if (!matiereId || !listes.matieres.some((m) => m.id === matiereId)) {
    erreurs.matiereId = "Choisis une matière.";
  }

  const series: DonneesSujet["series"] = [];
  for (const brut of new Set(f.getAll("series"))) {
    const s = listes.series.find((x) => x.id === brut && x.examenId === examenId);
    if (!s) continue;
    const coefficient = entier(f, `coefficient-${s.id}`, 1, 20);
    if (coefficient === undefined) erreurs[`coefficient-${s.id}`] = "Coefficient entre 1 et 20.";
    series.push({ serieId: s.id, coefficient: coefficient ?? null });
  }

  const annee = entier(f, "annee", 1960, anneeCourante + 1);
  if (annee === undefined) erreurs.annee = `Année entre 1960 et ${anneeCourante + 1}.`;

  const heures = entier(f, "dureeHeures", 0, 12);
  const minutes = entier(f, "dureeMinutes", 0, 59);
  if (heures === undefined || minutes === undefined) erreurs.duree = "Durée invalide.";
  const total = (heures ?? 0) * 60 + (minutes ?? 0);

  const coefficient = entier(f, "coefficient", 1, 20);
  if (coefficient === undefined) erreurs.coefficient = "Coefficient entre 1 et 20.";

  const source = texte(f, "source", 20) ?? "officiel";
  if (!(SOURCES_SUJET as readonly string[]).includes(source)) erreurs.source = "Source inconnue.";

  let enonce: Noeud | null = null;
  let corrige: Noeud | null = null;
  try {
    enonce = lireDocument(f.get("enonce"));
    if (!enonce) erreurs.enonce = "L'énoncé est vide.";
  } catch (e) {
    erreurs.enonce = e instanceof DocumentInvalide ? e.message : "Énoncé illisible.";
  }
  try {
    corrige = lireDocument(f.get("corrige"));
  } catch (e) {
    erreurs.corrige = e instanceof DocumentInvalide ? e.message : "Corrigé illisible.";
  }

  if (Object.keys(erreurs).length > 0 || !titre || !examenId || !matiereId || !enonce) {
    return { ok: false, erreurs };
  }
  return {
    ok: true,
    donnees: {
      titre,
      examenId,
      matiereId,
      series,
      annee: annee ?? null,
      session: texte(f, "session", 80),
      niveau: texte(f, "niveau", 80),
      dureeMinutes: total > 0 ? total : null,
      codeMatiere: texte(f, "codeMatiere", 20),
      option: texte(f, "option", 40),
      coefficient: coefficient ?? null,
      source: source as DonneesSujet["source"],
      enonce,
      corrige,
    },
  };
}

/** Texte indexé pour la recherche : titre, métadonnées et début de l'énoncé. */
export function texteRecherche(d: DonneesSujet, listes: Listes): string {
  const nom = (liste: { id: string; nom: string }[], id: string) =>
    liste.find((x) => x.id === id)?.nom ?? "";
  return normaliser(
    [
      d.titre,
      nom(listes.examens, d.examenId),
      nom(listes.matieres, d.matiereId),
      ...d.series.map((s) => `serie ${nom(listes.series, s.serieId)}`),
      d.annee ?? "",
      d.session ?? "",
      d.option ?? "",
      texteBrut(d.enonce).slice(0, 3000),
    ].join(" "),
  );
}

/** « 2 h 15 », « 2 h », « 45 min ». */
export function duree(minutes: number | null): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h} h ${String(m).padStart(2, "0")}` : `${h} h`;
}
