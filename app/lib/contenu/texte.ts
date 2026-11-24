/** Outils de texte pour la recherche et les adresses. */

/** Minuscules, sans accents ni ponctuation, espaces simples : « Mathématiques — BAC » → « mathematiques bac ». */
export function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Mots d'une recherche, sans doublons, 8 au maximum. */
export function motsRecherche(q: string): string[] {
  return [...new Set(normaliser(q).split(" ").filter(Boolean))].slice(0, 8);
}

/** Adresse lisible : « BAC 2024 Maths série C » → « bac-2024-maths-serie-c ». */
export function slugifier(texte: string): string {
  return normaliser(texte).replace(/ /g, "-").slice(0, 80).replace(/-+$/, "") || "sujet";
}
