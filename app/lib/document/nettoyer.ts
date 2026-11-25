/**
 * Format des énoncés et corrigés : document JSON de TipTap (ProseMirror).
 *
 * Tout document reçu du navigateur passe par `nettoyerDocument` avant d'être enregistré : seuls
 * les types de nœuds, marques et attributs connus sont gardés, avec des valeurs vérifiées. C'est
 * ce qui rend sûr l'affichage côté élève (voir `RenduDocument`), y compris quand les
 * contributeurs pourront écrire des sujets.
 */

import { normaliserKarnaugh } from "./karnaugh";
import { ENCADRES, IDS_LANGAGES } from "./outils";

export type Marque = { type: string; attrs?: Record<string, unknown> };
export type Noeud = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Noeud[];
  marks?: Marque[];
  text?: string;
};

type Attrs = Record<string, unknown> | undefined;
/** `attrs` renvoie `null` quand le nœud est invalide : il est alors supprimé. */
type Regle = { attrs?: (a: Attrs) => Record<string, unknown> | undefined | null };

const entier = (v: unknown, min: number, max: number): number | undefined => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? n : undefined;
};

const points = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
  return Number.isFinite(n) && n >= 0 && n <= 1000 ? Math.round(n * 100) / 100 : null;
};

const chaine = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** Barème propre à chaque série (clé = identifiant de série), quand il diffère. */
const pointsParSerie = (v: unknown): Record<string, number> | undefined => {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const propre: Record<string, number> = {};
  for (const [cle, val] of Object.entries(v).slice(0, 20)) {
    if (!/^[a-z0-9-]{1,40}$/.test(cle)) continue;
    const p = points(val);
    if (p !== null) propre[cle] = p;
  }
  return Object.keys(propre).length ? propre : undefined;
};

/** Attributs de barème : `points` commun, `pointsSeries` seulement s'il existe. */
const bareme = (a: Attrs) => {
  const series = pointsParSerie(a?.pointsSeries);
  return series ? { points: points(a?.points), pointsSeries: series } : { points: points(a?.points) };
};

/** Clé d'un fichier envoyé dans R2 (voir app/routes/admin.medias.ts). */
export const CLE_MEDIA = /^m\/[0-9a-f-]{36}\.(png|jpg|webp|gif)$/;

const cellule: Regle = {
  attrs: (a) => ({
    colspan: entier(a?.colspan, 1, 20) ?? 1,
    rowspan: entier(a?.rowspan, 1, 50) ?? 1,
  }),
};

export const NOEUDS: Record<string, Regle> = {
  doc: {},
  paragraph: {},
  text: {},
  heading: { attrs: (a) => ({ level: entier(a?.level, 2, 4) ?? 2 }) },
  bulletList: {},
  orderedList: { attrs: (a) => ({ start: entier(a?.start, 1, 1000) ?? 1 }) },
  listItem: {},
  blockquote: {},
  codeBlock: {
    attrs: (a) => ({
      language: typeof a?.language === "string" && IDS_LANGAGES.includes(a.language) ? a.language : null,
      numeros: a?.numeros === true,
    }),
  },
  horizontalRule: {},
  hardBreak: {},
  table: {},
  tableRow: {},
  tableHeader: cellule,
  tableCell: cellule,
  inlineMath: { attrs: (a) => ({ latex: chaine(a?.latex, 2000) }) },
  blockMath: { attrs: (a) => ({ latex: chaine(a?.latex, 4000) }) },
  /** Exercice : titre facultatif et barème ; contient du texte et des questions. */
  exercice: {
    attrs: (a) => ({ titre: chaine(a?.titre, 200).trim(), ...bareme(a) }),
  },
  /** Question (ou sous-question si elle est dans une question) avec son barème. */
  question: { attrs: bareme },
  /** Image stockée dans R2 ; supprimée si la clé n'est pas celle d'un envoi. */
  image: {
    attrs: (a) => {
      const cle = chaine(a?.cle, 80);
      if (!CLE_MEDIA.test(cle)) return null;
      return {
        cle,
        alt: chaine(a?.alt, 300).trim(),
        largeur: entier(a?.largeur, 1, 8000) ?? null,
        hauteur: entier(a?.hauteur, 1, 8000) ?? null,
      };
    },
  },
  /** « Document N » avec légende : contient image, tableau, texte… */
  documentNumerote: { attrs: (a) => ({ legende: chaine(a?.legende, 300).trim() }) },
  encadre: {
    attrs: (a) => ({
      genre: typeof a?.genre === "string" && a.genre in ENCADRES ? a.genre : "donnees",
    }),
  },
  /** Note de bas de page (nœud en ligne, numéroté à l'affichage). */
  note: { attrs: (a) => ({ texte: chaine(a?.texte, 1000).trim() }) },
  /** Extrait à lignes numérotées : une `ligne` par ligne du texte. */
  extrait: { attrs: (a) => ({ source: chaine(a?.source, 300).trim() }) },
  ligne: {},
  /** Diagramme Mermaid (source texte, dessiné dans le navigateur). */
  diagramme: { attrs: (a) => ({ source: chaine(a?.source, 10_000) }) },
  /** Schéma (Excalidraw) : image PNG dans R2, la scène modifiable est incluse dans le PNG. */
  schema: {
    attrs: (a) => {
      const cle = chaine(a?.cle, 80);
      if (!CLE_MEDIA.test(cle) || !cle.endsWith(".png")) return null;
      return {
        cle,
        alt: chaine(a?.alt, 300).trim(),
        largeur: entier(a?.largeur, 1, 8000) ?? null,
        hauteur: entier(a?.hauteur, 1, 8000) ?? null,
      };
    },
  },
  /** Chronogramme WaveDrom (source WaveJSON, dessiné dans le navigateur). */
  chronogramme: { attrs: (a) => ({ source: chaine(a?.source, 10_000) }) },
  /** Tableau de Karnaugh. */
  karnaugh: { attrs: (a) => normaliserKarnaugh(a) },
};

const MARQUES: Record<string, Regle> = {
  bold: {},
  italic: {},
  underline: {},
  strike: {},
  code: {},
  subscript: {},
  superscript: {},
  link: {
    attrs: (a) => {
      const href = chaine(a?.href, 2000).trim();
      return /^(https?:\/\/|mailto:)/i.test(href) ? { href } : undefined;
    },
  },
};

const LIMITE_NOEUDS = 20_000;
const LIMITE_PROFONDEUR = 30;
const LIMITE_TEXTE = 200_000;

export class DocumentInvalide extends Error {}

export function nettoyerDocument(brut: unknown): Noeud {
  let compte = 0;
  let caracteres = 0;

  function marques(liste: unknown): Marque[] | undefined {
    if (!Array.isArray(liste)) return undefined;
    const propres: Marque[] = [];
    for (const m of liste) {
      const type = (m as Marque)?.type;
      const regle = typeof type === "string" ? MARQUES[type] : undefined;
      if (!regle) continue;
      if (regle.attrs) {
        const attrs = regle.attrs((m as Marque).attrs);
        if (!attrs) continue; // lien refusé : on garde le texte sans le lien
        propres.push({ type, attrs });
      } else {
        propres.push({ type });
      }
    }
    return propres.length ? propres : undefined;
  }

  function noeud(n: unknown, profondeur: number): Noeud | null {
    if (++compte > LIMITE_NOEUDS) throw new DocumentInvalide("Document trop long.");
    if (profondeur > LIMITE_PROFONDEUR) throw new DocumentInvalide("Document trop imbriqué.");
    if (!n || typeof n !== "object") return null;
    const { type } = n as Noeud;
    const regle = typeof type === "string" ? NOEUDS[type] : undefined;
    if (!regle) return null;

    if (type === "text") {
      const texte = (n as Noeud).text;
      if (typeof texte !== "string" || texte.length === 0) return null;
      caracteres += texte.length;
      if (caracteres > LIMITE_TEXTE) throw new DocumentInvalide("Document trop long.");
      const m = marques((n as Noeud).marks);
      return m ? { type, text: texte, marks: m } : { type, text: texte };
    }

    const propre: Noeud = { type };
    const attrs = regle.attrs?.((n as Noeud).attrs);
    if (attrs === null) return null;
    if (attrs) propre.attrs = attrs;
    const enfants = (n as Noeud).content;
    if (Array.isArray(enfants)) {
      const liste = enfants
        .map((e) => noeud(e, profondeur + 1))
        .filter((e): e is Noeud => e !== null);
      if (liste.length) propre.content = liste;
    }
    return propre;
  }

  const racine = noeud(brut, 0);
  if (!racine || racine.type !== "doc") throw new DocumentInvalide("Document illisible.");
  return racine;
}

/** Lit un document JSON envoyé par un formulaire ; `null` si vide. */
export function lireDocument(json: FormDataEntryValue | null): Noeud | null {
  if (typeof json !== "string" || json.trim() === "") return null;
  let brut: unknown;
  try {
    brut = JSON.parse(json);
  } catch {
    throw new DocumentInvalide("Document illisible.");
  }
  const doc = nettoyerDocument(brut);
  return estVide(doc) ? null : doc;
}

const BLOCS_SANS_TEXTE = new Set([
  "exercice",
  "image",
  "diagramme",
  "documentNumerote",
  "encadre",
  "schema",
  "chronogramme",
  "karnaugh",
]);

/** Vrai si le document ne contient ni texte, ni formule, ni bloc (exercice, image, diagramme…). */
export function estVide(doc: Noeud): boolean {
  return texteBrut(doc).trim() === "" && !contient(doc, (n) => BLOCS_SANS_TEXTE.has(n.type));
}

function contient(n: Noeud, test: (n: Noeud) => boolean): boolean {
  return test(n) || (n.content ?? []).some((e) => contient(e, test));
}

/** Texte brut (formules en LaTeX), pour la recherche et l'IA. */
export function texteBrut(n: Noeud): string {
  if (n.type === "text") return n.text ?? "";
  if (n.type === "inlineMath" || n.type === "blockMath") return ` ${String(n.attrs?.latex ?? "")} `;
  if (n.type === "note") return ` ${String(n.attrs?.texte ?? "")} `;
  if (n.type === "image" || n.type === "schema") return ` ${String(n.attrs?.alt ?? "")} `;
  if (n.type === "exercice") {
    const titre = String(n.attrs?.titre ?? "");
    return `${titre}\n${(n.content ?? []).map(texteBrut).join("\n")}`;
  }
  const enLigne = new Set(["paragraph", "heading", "ligne", "codeBlock"]);
  const separateur = enLigne.has(n.type) ? "" : "\n";
  const interieur = (n.content ?? []).map(texteBrut).join(separateur);
  return n.type === "hardBreak" ? "\n" : interieur;
}

/** Points d'un exercice ou d'une question pour une série (barème commun sinon). */
export function pointsPour(attrs: Attrs, serie?: string | null): number | null {
  const parSerie = attrs?.pointsSeries as Record<string, number> | undefined;
  const p = serie && parSerie && typeof parSerie[serie] === "number" ? parSerie[serie] : attrs?.points;
  return typeof p === "number" ? p : null;
}

/** Total des points des exercices (ou des questions s'il n'y a pas de barème d'exercice). */
export function totalPoints(doc: Noeud, serie?: string | null): number | null {
  let total = 0;
  let trouve = false;
  const parcourir = (n: Noeud) => {
    const p = n.type === "exercice" || n.type === "question" ? pointsPour(n.attrs, serie) : null;
    if (p !== null) {
      total += p;
      trouve = true;
      return; // les sous-éléments sont comptés dans le barème du parent
    }
    (n.content ?? []).forEach(parcourir);
  };
  parcourir(doc);
  return trouve ? Math.round(total * 100) / 100 : null;
}
