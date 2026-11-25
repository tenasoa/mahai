import { useEffect, useRef, useState } from "react";
import { Node, mergeAttributes, type Editor } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";

import { dessinerDiagramme } from "~/lib/document/charger.client";
import { creerColoration } from "~/lib/document/coloration";
import { ENCADRES, LANGAGES, type GenreEncadre } from "~/lib/document/outils";
import { urlMedia } from "~/lib/medias/medias";
import { Commandes, Poignee } from "./noeuds";

/**
 * Blocs des outils de l'éditeur : image, document numéroté, encadré, note, extrait à lignes
 * numérotées, code (avec pseudo-code français) et diagramme Mermaid.
 * Chaque bloc doit aussi exister dans `nettoyer.ts` (liste blanche) et `RenduDocument`.
 */

const champ =
  "h-9 min-w-0 rounded-full border-2 border-transparent bg-transparent px-2 text-sm hover:border-line focus:border-control";

/* ---------- Image ---------- */

/** Réduit l'image (1600 px de large au plus) et la convertit en WebP avant l'envoi. */
async function preparerImage(fichier: File): Promise<{ blob: Blob; largeur: number; hauteur: number }> {
  const bitmap = await createImageBitmap(fichier);
  const echelle = Math.min(1, 1600 / bitmap.width);
  const largeur = Math.round(bitmap.width * echelle);
  const hauteur = Math.round(bitmap.height * echelle);
  // Les GIF peuvent être animés : on les garde tels quels.
  if (fichier.type === "image/gif") return { blob: fichier, largeur, hauteur };
  const canvas = document.createElement("canvas");
  canvas.width = largeur;
  canvas.height = hauteur;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // fond blanc pour les PNG transparents (impression)
  ctx.fillRect(0, 0, largeur, hauteur);
  ctx.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close();
  const webp = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, "image/webp", 0.85));
  const blob = webp && (webp.size < fichier.size || echelle < 1) ? webp : fichier;
  return { blob, largeur, hauteur };
}

export async function envoyerImage(fichier: File) {
  const { blob, largeur, hauteur } = await preparerImage(fichier);
  const corps = new FormData();
  corps.set("fichier", blob, "image");
  corps.set("largeur", String(largeur));
  corps.set("hauteur", String(hauteur));
  const reponse = await fetch("/admin/medias", { method: "POST", body: corps });
  const json = (await reponse.json().catch(() => ({}))) as { cle?: string; erreur?: string };
  if (!reponse.ok || !json.cle) throw new Error(json.erreur ?? "L'envoi de l'image a échoué.");
  return { cle: json.cle, largeur, hauteur };
}

/** Ouvre le sélecteur de fichier, envoie l'image et l'insère au curseur. */
export function choisirEtInsererImage(editor: Editor, onErreur: (message: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/png,image/jpeg,image/webp,image/gif";
  input.onchange = async () => {
    const fichier = input.files?.[0];
    if (!fichier) return;
    try {
      const { cle, largeur, hauteur } = await envoyerImage(fichier);
      editor
        .chain()
        .focus()
        .insertContent({ type: "image", attrs: { cle, alt: "", largeur, hauteur } })
        .run();
    } catch (e) {
      onErreur(e instanceof Error ? e.message : "L'envoi de l'image a échoué.");
    }
  };
  input.click();
}

function VueImage(props: ReactNodeViewProps) {
  const { cle, alt, largeur, hauteur } = props.node.attrs as {
    cle: string;
    alt: string;
    largeur: number | null;
    hauteur: number | null;
  };
  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Image</span>
        <input
          value={alt}
          onChange={(e) => props.updateAttributes({ alt: e.target.value })}
          placeholder="Description (pour l'accessibilité)"
          maxLength={300}
          aria-label="Description de l'image"
          className={`${champ} flex-1`}
        />
        <Commandes props={props} libelle="l'image" />
      </div>
      <img
        src={urlMedia(cle)}
        alt={alt}
        width={largeur ?? undefined}
        height={hauteur ?? undefined}
        className="mx-auto h-auto max-w-full"
        contentEditable={false}
        draggable={false}
      />
    </NodeViewWrapper>
  );
}

export const ImageSujet = Node.create({
  name: "image",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      cle: { default: "" },
      alt: { default: "" },
      largeur: { default: null },
      hauteur: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="image"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "image" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueImage);
  },
});

/* ---------- Document numéroté ---------- */

function VueDocument(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="figure" className="bloc-outil bloc-document">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="document-numero font-bold" />
        <input
          value={(props.node.attrs.legende as string) ?? ""}
          onChange={(e) => props.updateAttributes({ legende: e.target.value })}
          placeholder="Légende (facultative)"
          maxLength={300}
          aria-label="Légende du document"
          className={`${champ} flex-1`}
        />
        <Commandes props={props} libelle="le document" />
      </div>
      <NodeViewContent className="contenu-bloc" />
    </NodeViewWrapper>
  );
}

export const DocumentNumerote = Node.create({
  name: "documentNumerote",
  group: "block",
  content: "block+",
  draggable: true,
  defining: true,
  addAttributes() {
    return { legende: { default: "" } };
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="document"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "document" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueDocument);
  },
});

/* ---------- Encadré ---------- */

function VueEncadre(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="aside" className="bloc-outil bloc-encadre">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <select
          value={props.node.attrs.genre as string}
          onChange={(e) => props.updateAttributes({ genre: e.target.value })}
          aria-label="Type d'encadré"
          className={`${champ} font-bold`}
        >
          {(Object.keys(ENCADRES) as GenreEncadre[]).map((g) => (
            <option key={g} value={g}>
              {ENCADRES[g]}
            </option>
          ))}
        </select>
        <span className="flex-1" />
        <Commandes props={props} libelle="l'encadré" />
      </div>
      <NodeViewContent className="contenu-bloc" />
    </NodeViewWrapper>
  );
}

export const Encadre = Node.create({
  name: "encadre",
  group: "block",
  content: "block+",
  draggable: true,
  defining: true,
  addAttributes() {
    return { genre: { default: "donnees" } };
  },
  parseHTML() {
    return [{ tag: 'aside[data-type="encadre"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["aside", mergeAttributes(HTMLAttributes, { "data-type": "encadre" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueEncadre);
  },
});

/* ---------- Note de bas de page ---------- */

function VueNote(props: ReactNodeViewProps) {
  const texte = (props.node.attrs.texte as string) ?? "";
  return (
    <NodeViewWrapper as="span" className="note-editeur">
      <button
        type="button"
        title={texte || "Note vide : cliquer pour l'écrire"}
        onClick={() => {
          const nouveau = window.prompt("Texte de la note de bas de page", texte);
          if (nouveau === null) return;
          if (nouveau.trim() === "") props.deleteNode();
          else props.updateAttributes({ texte: nouveau.trim().slice(0, 1000) });
        }}
        className="note-appel"
        aria-label={`Note : ${texte}`}
      />
    </NodeViewWrapper>
  );
}

export const Note = Node.create({
  name: "note",
  group: "inline",
  inline: true,
  atom: true,
  addAttributes() {
    return { texte: { default: "" } };
  },
  parseHTML() {
    return [{ tag: 'span[data-type="note"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-type": "note" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueNote);
  },
});

export function insererNote(editor: Editor) {
  const texte = window.prompt("Texte de la note de bas de page");
  if (!texte?.trim()) return;
  editor.chain().focus().insertContent({ type: "note", attrs: { texte: texte.trim().slice(0, 1000) } }).run();
}

/* ---------- Extrait à lignes numérotées ---------- */

function VueExtrait(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="figure" className="bloc-outil bloc-extrait">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Extrait</span>
        <input
          value={(props.node.attrs.source as string) ?? ""}
          onChange={(e) => props.updateAttributes({ source: e.target.value })}
          placeholder="Source : auteur, œuvre, année"
          maxLength={300}
          aria-label="Source de l'extrait"
          className={`${champ} flex-1`}
        />
        <Commandes props={props} libelle="l'extrait" />
      </div>
      <NodeViewContent className="lignes-extrait" />
    </NodeViewWrapper>
  );
}

export const Extrait = Node.create({
  name: "extrait",
  group: "block",
  content: "ligne+",
  draggable: true,
  defining: true,
  addAttributes() {
    return { source: { default: "" } };
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="extrait"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "extrait" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueExtrait);
  },
});

/** Une ligne d'extrait. Entrée sur une dernière ligne vide : on sort de l'extrait. */
export const Ligne = Node.create({
  name: "ligne",
  content: "inline*",
  marks: "_",
  defining: true,
  parseHTML() {
    return [{ tag: 'p[data-type="ligne"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes, { "data-type": "ligne" }), 0];
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        if (!empty || $from.parent.type.name !== "ligne" || $from.parent.content.size > 0) return false;
        const extrait = $from.node($from.depth - 1);
        if ($from.index($from.depth - 1) !== extrait.childCount - 1 || extrait.childCount < 2) return false;
        const debutLigne = $from.before();
        const apresExtrait = $from.after($from.depth - 1);
        return editor
          .chain()
          .command(({ tr }) => {
            tr.delete(debutLigne, debutLigne + $from.parent.nodeSize);
            return true;
          })
          .insertContentAt(apresExtrait - $from.parent.nodeSize, { type: "paragraph" })
          .focus(apresExtrait - $from.parent.nodeSize + 1)
          .run();
      },
    };
  },
});

/* ---------- Code ---------- */


function VueCode(props: ReactNodeViewProps) {
  const langage = (props.node.attrs.language as string | null) ?? "plaintext";
  const numeros = props.node.attrs.numeros === true;
  return (
    <NodeViewWrapper className="bloc-outil bloc-code">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <select
          value={langage}
          onChange={(e) => props.updateAttributes({ language: e.target.value })}
          aria-label="Langage"
          className={`${champ} font-bold`}
        >
          {LANGAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nom}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-muted">
          <input
            type="checkbox"
            checked={numeros}
            onChange={(e) => props.updateAttributes({ numeros: e.target.checked })}
            className="size-4 accent-ink"
          />
          Numéros de ligne
        </label>
        <span className="flex-1" />
        <Commandes props={props} libelle="le code" />
      </div>
      <pre spellCheck={false}>
        <NodeViewContent<"code"> as="code" className={`hljs language-${langage}`} />
      </pre>
    </NodeViewWrapper>
  );
}

export const Code = CodeBlockLowlight.extend({
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      numeros: { default: false },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueCode);
  },
});

let extensionCode: ReturnType<typeof Code.configure> | null = null;

/**
 * Bloc de code configuré. Créé à la première ouverture de l'éditeur (dans le navigateur) :
 * enregistrer les grammaires au chargement du module coûterait du CPU à chaque démarrage du Worker.
 */
export function codeConfigure() {
  extensionCode ??= Code.configure({
    lowlight: creerColoration(),
    defaultLanguage: "plaintext",
    enableTabIndentation: true,
  });
  return extensionCode;
}

/* ---------- Diagramme (Mermaid) ---------- */

/** Aperçu d'un diagramme : SVG produit par Mermaid (texte nettoyé, mode strict). */
export function ApercuDiagramme({ source }: { source: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  useEffect(() => {
    let annule = false;
    if (!source.trim()) {
      if (ref.current) ref.current.innerHTML = "";
      setErreur(null);
      return;
    }
    const delai = setTimeout(async () => {
      try {
        const svg = await dessinerDiagramme(source);
        if (!annule && ref.current) {
          ref.current.innerHTML = svg;
          setErreur(null);
        }
      } catch (e) {
        if (!annule) setErreur(e instanceof Error ? e.message.split("\n")[0]! : "Diagramme invalide.");
      }
    }, 250);
    return () => {
      annule = true;
      clearTimeout(delai);
    };
  }, [source]);
  return (
    <>
      <div ref={ref} className="diagramme" />
      {erreur ? <p className="text-sm text-ink-2">Erreur de syntaxe : {erreur}</p> : null}
    </>
  );
}

export type OuvrirDiagramme = (source: string, pos?: number) => void;

function VueDiagramme(props: ReactNodeViewProps) {
  const source = (props.node.attrs.source as string) ?? "";
  const ouvrir = (props.extension.options as { ouvrir?: OuvrirDiagramme }).ouvrir;
  return (
    <NodeViewWrapper className="bloc-outil">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Diagramme</span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => ouvrir?.(source, props.getPos())}
          className="min-h-9 rounded-full bg-soft px-3 text-sm font-medium hover:bg-line"
        >
          Modifier
        </button>
        <Commandes props={props} libelle="le diagramme" />
      </div>
      <div contentEditable={false}>
        <ApercuDiagramme source={source} />
      </div>
    </NodeViewWrapper>
  );
}

export const Diagramme = Node.create<{ ouvrir?: OuvrirDiagramme }>({
  name: "diagramme",
  group: "block",
  atom: true,
  draggable: true,
  addOptions() {
    return { ouvrir: undefined };
  },
  addAttributes() {
    return { source: { default: "" } };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="diagramme"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "diagramme" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueDiagramme);
  },
});
