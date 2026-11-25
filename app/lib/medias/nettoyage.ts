/**
 * Images inutilisées : envoyées dans R2 mais citées par aucun énoncé ni corrigé (image retirée
 * d'un sujet, sujet supprimé, envoi abandonné). Logique pure, testable sans R2 ni D1.
 */

/** Une image envoyée il y a moins longtemps n'est jamais supprimée : son sujet est peut-être en cours d'écriture. */
export const DELAI_GRACE_MS = 24 * 60 * 60 * 1000;

const CLE_DANS_TEXTE = /m\/[0-9a-f-]{36}\.(?:png|jpg|webp|gif)/g;

/** Clés de médias citées dans un texte (document JSON brut d'un énoncé ou d'un corrigé). */
export function clesCitees(texte: string | null | undefined): string[] {
  return texte ? (texte.match(CLE_DANS_TEXTE) ?? []) : [];
}

export type Fichier = {
  cle: string;
  taille: number;
  creeLe: number; // ms
  /** Faux si la fiche `media` existe sans fichier dans R2 (envoi interrompu). */
  dansR2: boolean;
};

export type Inventaire = {
  utilises: number;
  /** Inutilisés depuis plus que le délai de grâce : supprimables. */
  inutilises: Fichier[];
  /** Inutilisés mais récents : gardés pour l'instant. */
  recents: Fichier[];
  tailleInutilises: number;
};

export function classer(fichiers: Fichier[], citees: ReadonlySet<string>, maintenant: number): Inventaire {
  const inventaire: Inventaire = { utilises: 0, inutilises: [], recents: [], tailleInutilises: 0 };
  for (const f of fichiers) {
    if (citees.has(f.cle)) {
      inventaire.utilises++;
    } else if (maintenant - f.creeLe < DELAI_GRACE_MS) {
      inventaire.recents.push(f);
    } else {
      inventaire.inutilises.push(f);
      inventaire.tailleInutilises += f.taille;
    }
  }
  inventaire.inutilises.sort((a, b) => a.creeLe - b.creeLe);
  return inventaire;
}

/** « 1,4 Mo », « 320 ko ». */
export function taille(octets: number): string {
  if (octets < 1024 * 1024) return `${Math.max(1, Math.round(octets / 1024))} ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
