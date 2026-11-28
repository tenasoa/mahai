/**
 * Les matières montrées en tête (tuiles, étiquettes, bande du téléphone) : seulement celles qui
 * ont des sujets, les plus fournies d'abord, au plus `max`. La matière choisie reste toujours
 * visible. Les autres se trouvent dans la liste complète « Toutes les matières ».
 */

export const MATIERES_EN_AVANT = 12;

export function matieresEnAvant<T extends { id: string }>(
  matieres: T[],
  nombre: (id: string) => number,
  max: number,
  choisie?: string | null,
): { visibles: T[]; avecSujets: T[] } {
  const avecSujets = matieres.filter((m) => nombre(m.id) > 0 || m.id === choisie);
  // Tri stable : à nombre égal, l'ordre de l'administration est gardé.
  const parNombre = [...avecSujets].sort((a, b) => nombre(b.id) - nombre(a.id));
  const visibles = parNombre.slice(0, max);
  const laChoisie = choisie ? avecSujets.find((m) => m.id === choisie) : undefined;
  if (laChoisie && !visibles.includes(laChoisie)) visibles[visibles.length - 1] = laChoisie;
  return { visibles, avecSujets };
}

/** Ordre alphabétique français (accents, majuscules) pour la liste complète. */
export const parNom = <T extends { nom: string }>(liste: T[]) =>
  [...liste].sort((a, b) => a.nom.localeCompare(b.nom, "fr", { sensitivity: "base" }));
