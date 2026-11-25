/** Vrai si l'élément reçoit du texte : les raccourcis d'une lettre ne s'y appliquent pas. */
export const champSaisi = (el: Element | null) =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement ||
  (el instanceof HTMLElement && el.isContentEditable);

/** Lecture et écriture dans le stockage du navigateur, sans erreur s'il est bloqué. */
export function lireLocal(cle: string): string | null {
  try {
    return window.localStorage.getItem(cle);
  } catch {
    return null;
  }
}

export function ecrireLocal(cle: string, valeur: string | null) {
  try {
    if (valeur === null) window.localStorage.removeItem(cle);
    else window.localStorage.setItem(cle, valeur);
  } catch {
    // Stockage indisponible (navigation privée) : la préférence vaut pour cette visite seulement.
  }
}
