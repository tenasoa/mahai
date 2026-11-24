/**
 * Matières et leur couleur d'identification.
 * Les classes Tailwind sont écrites en entier pour être détectées au build.
 */
export const MATIERES = [
  { id: "maths", label: "Maths", tile: "bg-maths" },
  { id: "francais", label: "Français", tile: "bg-francais" },
  { id: "physique", label: "Physique-chimie", tile: "bg-physique" },
  { id: "svt", label: "SVT", tile: "bg-svt" },
  { id: "histoire", label: "Histoire-géo", tile: "bg-histoire" },
] as const;

export type MatiereId = (typeof MATIERES)[number]["id"];

export function trouverMatiere(id: string | null | undefined) {
  return MATIERES.find((m) => m.id === id);
}
