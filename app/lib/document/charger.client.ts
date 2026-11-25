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

/* ---------- Chronogrammes (WaveDrom) ---------- */

let compteurOnde = 0;

/**
 * Dessine un chronogramme WaveDrom (WaveJSON, écrit en JSON5 comme dans la documentation).
 * Le SVG produit est passé par DOMPurify : WaveDrom n'échappe pas tout le texte.
 */
export async function dessinerChronogramme(source: string): Promise<string> {
  const [{ default: wavedrom }, { default: JSON5 }, { default: DOMPurify }] = await Promise.all([
    import("wavedrom"),
    import("json5"),
    import("dompurify"),
  ]);
  let objet: unknown;
  try {
    objet = JSON5.parse(source);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message.replace(/^JSON5: /, "") : "Description illisible.");
  }
  if (!objet || typeof objet !== "object") throw new Error("Description illisible.");
  const arbre = wavedrom.renderAny(++compteurOnde, objet, wavedrom.waveSkin);
  const svg = wavedrom.onml.stringify(arbre);
  if (!svg.startsWith("<svg")) throw new Error("Il faut une clé signal, assign ou reg.");
  // WaveDrom dessine les ondes avec <use xlink:href="#…"> : autorisé, mais seulement vers le SVG lui-même.
  DOMPurify.addHook("afterSanitizeAttributes", referencesLocales);
  try {
    return DOMPurify.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
      ADD_TAGS: ["use"],
      ADD_ATTR: ["xlink:href", "href"],
    });
  } finally {
    DOMPurify.removeHook("afterSanitizeAttributes", referencesLocales);
  }
}

function referencesLocales(noeud: Element) {
  if (noeud.nodeName.toLowerCase() !== "use") return;
  for (const nom of ["href", "xlink:href"]) {
    const cible = noeud.getAttribute(nom);
    if (cible !== null && !cible.startsWith("#")) noeud.removeAttribute(nom);
  }
}

/* ---------- Schémas (Excalidraw) ---------- */

export async function chargerExcalidraw() {
  // Polices servies par l'application (public/excalidraw/fonts), pas par un CDN.
  (window as unknown as { EXCALIDRAW_ASSET_PATH: string }).EXCALIDRAW_ASSET_PATH = "/excalidraw/";
  const [module] = await Promise.all([
    import("@excalidraw/excalidraw"),
    import("@excalidraw/excalidraw/index.css"),
  ]);
  return module;
}
