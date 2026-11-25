/** Champ de recherche visible à cette largeur d'écran (téléphone et ordinateur en ont chacun un). */
export function champRecherche(): HTMLInputElement | null {
  const champs = document.querySelectorAll<HTMLInputElement>("input[data-recherche]");
  return Array.from(champs).find((c) => c.offsetParent !== null) ?? null;
}
