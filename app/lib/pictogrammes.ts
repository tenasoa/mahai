/**
 * Pictogrammes des matières (choisis dans /admin/listes, colonne `matiere.icone`).
 * Les tracés sont dans `app/components/ui/Pictogramme.tsx` ; ici les identifiants et les noms,
 * utilisables aussi côté serveur pour vérifier le formulaire.
 */
export const PICTOGRAMMES = {
  pi: "Pi (mathématiques)",
  calcul: "Opérations",
  equerre: "Équerre",
  graphique: "Courbe",
  lettres: "Lettres « Aa »",
  livre: "Livre ouvert",
  crayon: "Crayon",
  atome: "Atome",
  fiole: "Fiole",
  aimant: "Aimant",
  feuille: "Feuille",
  adn: "ADN",
  globe: "Globe",
  carte: "Carte",
  colonne: "Monument",
  sablier: "Sablier",
  drapeau: "Drapeau",
  bulle: "Bulle de dialogue",
  ampoule: "Ampoule",
  etoile: "Étoile",
  balance: "Balance",
  ordinateur: "Ordinateur",
  code: "Code",
  musique: "Musique",
  palette: "Palette",
  ballon: "Ballon",
} as const;

export type IdPictogramme = keyof typeof PICTOGRAMMES;

export const IDS_PICTOGRAMMES = Object.keys(PICTOGRAMMES) as IdPictogramme[];

export const estPictogramme = (v: unknown): v is IdPictogramme =>
  typeof v === "string" && Object.hasOwn(PICTOGRAMMES, v);
