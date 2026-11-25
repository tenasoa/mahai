/**
 * Bibliothèques lourdes chargées seulement dans le navigateur, à la demande.
 * Fichier `.client` : React Router l'exclut du code du serveur (Worker plus léger).
 */

let mermaid: Promise<typeof import("mermaid").default> | null = null;
let compteurMermaid = 0;

export function chargerMermaid() {
  mermaid ??= import("mermaid").then(({ default: m }) => {
    m.initialize({
      startOnLoad: false,
      securityLevel: "strict", // texte nettoyé, pas de liens ni de scripts
      theme: "neutral",
      fontFamily: "Lexend Variable, system-ui, sans-serif",
    });
    return m;
  });
  return mermaid;
}

/** Dessine un diagramme Mermaid ; renvoie le SVG, ou lève une erreur de syntaxe. */
export async function dessinerDiagramme(source: string): Promise<string> {
  const m = await chargerMermaid();
  const id = `diagramme-${++compteurMermaid}`;
  try {
    const { svg } = await m.render(id, source);
    return svg;
  } finally {
    // Mermaid laisse parfois un élément temporaire en cas d'erreur.
    document.getElementById(`d${id}`)?.remove();
  }
}

let coloration: Promise<ReturnType<typeof import("./coloration").creerColoration>> | null = null;

export function chargerColoration() {
  coloration ??= import("./coloration").then((m) => m.creerColoration());
  return coloration;
}

export async function chargerMathlive() {
  const [module] = await Promise.all([import("mathlive"), import("mathlive/fonts.css")]);
  module.MathfieldElement.fontsDirectory = null; // polices chargées par fonts.css
  module.MathfieldElement.soundsDirectory = null;
  return module;
}
