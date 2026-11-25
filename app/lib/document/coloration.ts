/**
 * Coloration syntaxique des blocs de code (lowlight = highlight.js sans DOM).
 * Ajoute « algo » : le pseudo-code en français des cours d'algorithmique.
 */
import { common, createLowlight } from "lowlight";

type Hljs = Parameters<Parameters<ReturnType<typeof createLowlight>["register"]>[1]>[0];

/** Pseudo-code français : Algorithme, Début, Si … Alors, Pour … Faire, Tant que, ← … */
export function algoFrancais(hljs: Hljs) {
  return {
    name: "Algorithme",
    case_insensitive: true,
    unicodeRegex: true,
    keywords: {
      $pattern: /[\p{L}_]+/u,
      keyword: [
        "algorithme", "début", "debut", "fin", "si", "alors", "sinon", "finsi", "fin_si",
        "pour", "de", "à", "a", "pas", "faire", "finpour", "fin_pour", "tant", "que", "tantque",
        "fintantque", "fin_tant_que", "répéter", "repeter", "jusqu", "jusqua", "selon", "cas",
        "autrement", "finselon", "retourner", "retourne", "fonction", "procédure", "procedure",
        "finfonction", "finprocédure", "var", "variable", "variables", "constante", "constantes",
        "type", "structure", "lire", "écrire", "ecrire", "afficher", "saisir", "et", "ou", "non",
        "mod", "div", "entrée", "sortie",
      ],
      type: [
        "entier", "entiers", "réel", "reel", "réels", "chaîne", "chaine", "caractère", "caractere",
        "booléen", "booleen", "tableau", "matrice", "enregistrement",
      ],
      literal: ["vrai", "faux", "nul"],
    },
    contains: [
      hljs.QUOTE_STRING_MODE,
      { scope: "string", begin: "'", end: "'" },
      hljs.C_NUMBER_MODE,
      hljs.C_LINE_COMMENT_MODE,
      { scope: "comment", begin: /\(\*/, end: /\*\)/ },
      { scope: "comment", begin: /\{/, end: /\}/ },
      { scope: "operator", begin: /←|<-|:=|≤|≥|≠|<=|>=|<>/ },
    ],
  };
}

export function creerColoration() {
  const lowlight = createLowlight(common);
  lowlight.register("algo", algoFrancais as never);
  return lowlight;
}
