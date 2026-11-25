import { pointsPour, texteBrut, type Noeud } from "./nettoyer";

/**
 * Plan d'un énoncé : titres de partie, exercices et questions de premier niveau, avec leur
 * barème. Sert au sommaire de lecture, à l'aperçu du catalogue et au plan de l'éditeur.
 * Les identifiants sont ceux que `RenduDocument` pose sur les mêmes éléments (avec `ancre`).
 */

export type EntreePlan = {
  id: string;
  titre: string;
  points: number | null;
  genre: "partie" | "exercice" | "question";
  questions: { id: string; titre: string; points: number | null }[];
};

const LONGUEUR_EXTRAIT = 48;

/** Début du texte d'une question, pour la reconnaître dans le sommaire. */
function extrait(n: Noeud): string {
  const texte = texteBrut(n).replace(/\s+/g, " ").trim();
  return texte.length > LONGUEUR_EXTRAIT ? `${texte.slice(0, LONGUEUR_EXTRAIT - 1).trimEnd()}…` : texte;
}

export const idExercice = (k: number) => `exercice-${k}`;
export const idPartie = (k: number) => `partie-${k}`;
export const idQuestion = (k: number, parent?: string) => `${parent ? `${parent}-` : ""}question-${k}`;

export function planDocument(doc: Noeud | null | undefined, serie?: string | null): EntreePlan[] {
  if (!doc) return [];
  const plan: EntreePlan[] = [];
  let exercices = 0;
  let parties = 0;
  let questions = 0;
  for (const n of doc.content ?? []) {
    if (n.type === "heading" && (n.attrs?.level ?? 2) === 2) {
      const titre = texteBrut(n).trim();
      if (!titre) continue;
      plan.push({ id: idPartie(++parties), titre, points: null, genre: "partie", questions: [] });
    } else if (n.type === "exercice") {
      const id = idExercice(++exercices);
      const titre = String(n.attrs?.titre ?? "").trim();
      let j = 0;
      plan.push({
        id,
        titre: `Exercice ${exercices}${titre ? ` — ${titre}` : ""}`,
        points: pointsPour(n.attrs, serie),
        genre: "exercice",
        questions: (n.content ?? [])
          .filter((q) => q.type === "question")
          .map((q) => {
            j++;
            return { id: idQuestion(j, id), titre: `${j}. ${extrait(q)}`, points: pointsPour(q.attrs, serie) };
          }),
      });
    } else if (n.type === "question") {
      questions++;
      plan.push({ id: idQuestion(questions), titre: `${questions}. ${extrait(n)}`, points: pointsPour(n.attrs, serie), genre: "question", questions: [] });
    }
  }
  return plan;
}

/** « 4 pts », « 0,5 pt ». */
export function pts(n: number): string {
  return `${String(n).replace(".", ",")} pt${n > 1 ? "s" : ""}`;
}
