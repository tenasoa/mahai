/**
 * Outils de l'éditeur de sujets, activables par matière (profil réglé dans /admin/listes).
 * Le texte, les listes, les titres, les formules, les tableaux et la structure
 * Exercice → Question sont toujours disponibles.
 */
export const OUTILS = [
  { id: "image", nom: "Image", aide: "Photo, schéma scanné, carte" },
  { id: "document", nom: "Document numéroté", aide: "« Document 1 » avec légende" },
  { id: "encadre", nom: "Encadré", aide: "On donne, Rappel, Définition…" },
  { id: "note", nom: "Note de bas de page", aide: "Numérotée automatiquement" },
  { id: "extrait", nom: "Extrait à lignes numérotées", aide: "Texte, poème, commentaire" },
  { id: "chimie", nom: "Formule chimique", aide: "Équations, isotopes, ions" },
  { id: "code", nom: "Code", aide: "Programme avec coloration" },
  { id: "algo", nom: "Algorithme", aide: "Pseudo-code en français" },
  { id: "diagramme", nom: "Diagramme", aide: "Organigramme, UML, automate, séquence" },
  { id: "schema", nom: "Schéma électrique", aide: "Composants, circuits, portes logiques" },
  { id: "chronogramme", nom: "Chronogramme", aide: "Signaux, horloge, bus, logigramme" },
  { id: "logique", nom: "Logique combinatoire", aide: "Tableau de Karnaugh, table de vérité" },
  { id: "graphique", nom: "Graphique", aide: "Courbes, points, vecteurs dans un repère" },
  { id: "variations", nom: "Tableau de variations", aide: "Tableau de signes et de variations" },
  { id: "molecule", nom: "Molécule", aide: "Formule topologique (SMILES)" },
] as const;

export type OutilId = (typeof OUTILS)[number]["id"];

export const IDS_OUTILS: readonly string[] = OUTILS.map((o) => o.id);

/** Profil d'une matière ; `null` en base = tous les outils. */
export function outilsActifs(profil: string[] | null | undefined): OutilId[] {
  if (!profil) return OUTILS.map((o) => o.id);
  return OUTILS.map((o) => o.id).filter((id) => profil.includes(id));
}

/** Langages proposés pour les blocs de code (identifiants de highlight.js, + « algo »). */
export const LANGAGES = [
  { id: "algo", nom: "Algorithme (pseudo-code)" },
  { id: "python", nom: "Python" },
  { id: "c", nom: "C" },
  { id: "cpp", nom: "C++" },
  { id: "java", nom: "Java" },
  { id: "javascript", nom: "JavaScript" },
  { id: "typescript", nom: "TypeScript" },
  { id: "php", nom: "PHP" },
  { id: "sql", nom: "SQL" },
  { id: "xml", nom: "HTML / XML" },
  { id: "css", nom: "CSS" },
  { id: "bash", nom: "Shell (bash)" },
  { id: "csharp", nom: "C#" },
  { id: "go", nom: "Go" },
  { id: "rust", nom: "Rust" },
  { id: "kotlin", nom: "Kotlin" },
  { id: "r", nom: "R" },
  { id: "plaintext", nom: "Texte / console" },
] as const;

export const IDS_LANGAGES: readonly string[] = LANGAGES.map((l) => l.id);

/** Encadrés : genre → titre affiché. */
export const ENCADRES = {
  donnees: "On donne",
  rappel: "Rappel",
  definition: "Définition",
  remarque: "Remarque",
  attention: "Attention",
  consigne: "Consigne",
} as const;

export type GenreEncadre = keyof typeof ENCADRES;
