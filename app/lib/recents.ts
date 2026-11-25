import { ecrireLocal, lireLocal } from "./clavier";

/**
 * Derniers sujets ouverts, gardés dans le navigateur (barre latérale sur ordinateur).
 * Rien n'est envoyé au serveur ; la liste suit l'appareil.
 */
export type SujetRecent = {
  slug: string;
  titre: string;
  matiereId: string;
  /** « BAC 2024 » */
  examen: string;
  dureeMinutes: number | null;
  /** Ouvert le (ms). */
  le: number;
};

const CLE = "mahai:recents";
export const MAX_RECENTS = 8;
/** Prévient les composants de la page qu'un sujet vient d'être ouvert. */
export const EVENEMENT_RECENTS = "mahai:recents";

export function lireRecents(): SujetRecent[] {
  try {
    const liste = JSON.parse(lireLocal(CLE) ?? "[]") as unknown;
    if (!Array.isArray(liste)) return [];
    return liste
      .filter(
        (s): s is SujetRecent =>
          typeof s?.slug === "string" && typeof s?.titre === "string" && typeof s?.matiereId === "string",
      )
      .slice(0, MAX_RECENTS);
  } catch {
    return [];
  }
}

/** Ajoute (ou remonte) un sujet en tête de liste. */
export function ajouterRecent(sujet: Omit<SujetRecent, "le">): SujetRecent[] {
  const suite = [{ ...sujet, le: Date.now() }, ...lireRecents().filter((s) => s.slug !== sujet.slug)].slice(0, MAX_RECENTS);
  ecrireLocal(CLE, JSON.stringify(suite));
  window.dispatchEvent(new Event(EVENEMENT_RECENTS));
  return suite;
}

export const cleExamen = (slug: string) => `mahai:examen:${slug}`;

/** Début du mode examen en cours pour ce sujet, s'il y en a un. */
export function debutExamen(slug: string): number | null {
  const t = Number(lireLocal(cleExamen(slug)));
  return t > 0 ? t : null;
}
