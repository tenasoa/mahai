import type { Couleur } from "~/db/schema";

/** Classes de tuile par couleur, écrites en entier pour être détectées par Tailwind. */
export const TUILES: Record<Couleur, string> = {
  maths: "bg-maths",
  francais: "bg-francais",
  physique: "bg-physique",
  svt: "bg-svt",
  histoire: "bg-histoire",
  violet: "bg-violet",
  turquoise: "bg-turquoise",
  sable: "bg-sable",
  citron: "bg-citron",
};

export const NOMS_COULEURS: Record<Couleur, string> = {
  maths: "Bleu",
  francais: "Rose",
  physique: "Orange",
  svt: "Vert",
  histoire: "Jaune",
  violet: "Violet",
  turquoise: "Turquoise",
  sable: "Sable",
  citron: "Citron",
};
