import { Node, mergeAttributes, type Editor } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";

import { GrilleKarnaugh } from "~/components/document/GrilleKarnaugh";
import { dessinerChronogramme } from "~/lib/document/charger.client";
import { VALEURS_CASE, lignesTableVerite, normaliserKarnaugh } from "~/lib/document/karnaugh";
import { urlMedia } from "~/lib/medias/medias";
import { ApercuSource } from "./blocs";
import { Commandes, Poignee } from "./noeuds";

/**
 * Blocs d'électronique : tableau de Karnaugh, table de vérité, chronogramme (WaveDrom)
 * et schéma (Excalidraw, enregistré en PNG dans R2 avec la scène incluse).
 */

const champ =
  "h-9 min-w-0 rounded-full border-2 border-transparent bg-transparent px-2 text-sm hover:border-line focus:border-control";
const bouton = "min-h-9 rounded-full bg-soft px-3 text-sm font-medium hover:bg-line";

/* ---------- Tableau de Karnaugh ---------- */

function VueKarnaugh(props: ReactNodeViewProps) {
  // Noms bruts (en cours de saisie) ; valeurs complétées à la bonne longueur.
  const propre = normaliserKarnaugh(props.node.attrs);
  const brutes = props.node.attrs.variables as unknown;
  const k = {
    ...propre,
    variables: Array.isArray(brutes) && brutes.length === propre.variables.length ? (brutes as string[]) : propre.variables,
    sortie: typeof props.node.attrs.sortie === "string" ? props.node.attrs.sortie : propre.sortie,
  };
  const n = k.variables.length;

  function changerNombre(nombre: number) {
    const noms = ["A", "B", "C", "D"];
    const variables = Array.from({ length: nombre }, (_, i) => k.variables[i] ?? noms[i]!);
    props.updateAttributes({ variables, valeurs: ".".repeat(1 << nombre) });
  }

  function changerNom(i: number, nom: string) {
    const variables = [...k.variables];
    variables[i] = nom.replace(/\s/g, "").slice(0, 8);
    props.updateAttributes({ variables });
  }

  function changerCase(m: number) {
    // Valeurs lues dans le document au moment du clic (clics rapides : pas d'état périmé).
    const pos = props.getPos();
    const noeud = typeof pos === "number" ? props.editor.state.doc.nodeAt(pos) : null;
    const { valeurs } = normaliserKarnaugh(noeud?.attrs ?? props.node.attrs);
    const actuelle = VALEURS_CASE.indexOf((valeurs[m] ?? ".") as (typeof VALEURS_CASE)[number]);
    const suivante = VALEURS_CASE[(actuelle + 1) % VALEURS_CASE.length]!;
    props.updateAttributes({ valeurs: valeurs.slice(0, m) + suivante + valeurs.slice(m + 1) });
  }

  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Karnaugh</span>
        <select
          value={n}
          onChange={(e) => changerNombre(Number(e.target.value))}
          aria-label="Nombre de variables"
          className={champ}
        >
          {[2, 3, 4].map((v) => (
            <option key={v} value={v}>
              {v} variables
            </option>
          ))}
        </select>
        {k.variables.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={(e) => changerNom(i, e.target.value)}
            aria-label={`Variable ${i + 1}`}
            maxLength={8}
            className={`${champ} w-12 text-center font-bold`}
          />
        ))}
        <span className="text-sm text-muted">→</span>
        <input
          value={k.sortie}
          onChange={(e) => props.updateAttributes({ sortie: e.target.value.replace(/\s/g, "").slice(0, 8) })}
          aria-label="Sortie"
          maxLength={8}
          className={`${champ} w-12 text-center font-bold`}
        />
        <span className="flex-1" />
        <Commandes props={props} libelle="le tableau" />
      </div>
      <div contentEditable={false} className="contenu overflow-x-auto">
        <GrilleKarnaugh k={k} onCase={changerCase} />
        <p className="mt-1 text-xs text-muted">Clique sur une case : vide → 0 → 1 → X (indifférent).</p>
      </div>
    </NodeViewWrapper>
  );
}

export const KarnaughSujet = Node.create({
  name: "karnaugh",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      variables: { default: ["A", "B", "C"] },
      sortie: { default: "S" },
      valeurs: { default: "........" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="karnaugh"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "karnaugh" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueKarnaugh);
  },
});

/* ---------- Table de vérité ---------- */

const cellule = (type: "tableHeader" | "tableCell", texte: string) => ({
  type,
  content: [{ type: "paragraph", content: texte ? [{ type: "text", text: texte }] : [] }],
});

/** Insère un tableau avec toutes les combinaisons des entrées et une colonne de sortie vide. */
export function insererTableVerite(editor: Editor) {
  const reponse = window.prompt("Entrées de la table de vérité (1 à 5, séparées par des espaces)", "A B C");
  if (reponse === null) return;
  const entrees = reponse
    .split(/[\s,;]+/)
    .map((v) => v.trim().slice(0, 8))
    .filter(Boolean)
    .slice(0, 5);
  if (entrees.length === 0) return;
  const lignes = lignesTableVerite(entrees);
  editor
    .chain()
    .focus()
    .insertContent({
      type: "table",
      content: [
        { type: "tableRow", content: [...entrees, "S"].map((t) => cellule("tableHeader", t)) },
        ...lignes.map((l) => ({
          type: "tableRow",
          content: [...l.map((b) => cellule("tableCell", b)), cellule("tableCell", "")],
        })),
      ],
    })
    .run();
}

/* ---------- Chronogramme (WaveDrom) ---------- */

export function ApercuChronogramme({ source }: { source: string }) {
  return <ApercuSource source={source} dessiner={dessinerChronogramme} />;
}

export type OuvrirSource = (source: string, pos?: number) => void;

function VueChronogramme(props: ReactNodeViewProps) {
  const source = (props.node.attrs.source as string) ?? "";
  const ouvrir = (props.extension.options as { ouvrir?: OuvrirSource }).ouvrir;
  return (
    <NodeViewWrapper className="bloc-outil">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Chronogramme</span>
        <span className="flex-1" />
        <button type="button" onClick={() => ouvrir?.(source, props.getPos())} className={bouton}>
          Modifier
        </button>
        <Commandes props={props} libelle="le chronogramme" />
      </div>
      <div contentEditable={false}>
        <ApercuChronogramme source={source} />
      </div>
    </NodeViewWrapper>
  );
}

export const Chronogramme = Node.create<{ ouvrir?: OuvrirSource }>({
  name: "chronogramme",
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
    return [{ tag: 'div[data-type="chronogramme"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "chronogramme" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueChronogramme);
  },
});

/* ---------- Schéma (Excalidraw) ---------- */

export type OuvrirSchema = (cle: string | null, pos?: number) => void;

function VueSchema(props: ReactNodeViewProps) {
  const { cle, alt, largeur, hauteur } = props.node.attrs as {
    cle: string;
    alt: string;
    largeur: number | null;
    hauteur: number | null;
  };
  const ouvrir = (props.extension.options as { ouvrir?: OuvrirSchema }).ouvrir;
  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Schéma</span>
        <input
          value={alt}
          onChange={(e) => props.updateAttributes({ alt: e.target.value })}
          placeholder="Description (pour l'accessibilité)"
          maxLength={300}
          aria-label="Description du schéma"
          className={`${champ} flex-1`}
        />
        <button type="button" onClick={() => ouvrir?.(cle, props.getPos())} className={bouton}>
          Modifier
        </button>
        <Commandes props={props} libelle="le schéma" />
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

export const Schema = Node.create<{ ouvrir?: OuvrirSchema }>({
  name: "schema",
  group: "block",
  atom: true,
  draggable: true,
  addOptions() {
    return { ouvrir: undefined };
  },
  addAttributes() {
    return {
      cle: { default: "" },
      alt: { default: "" },
      largeur: { default: null },
      hauteur: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="schema"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "schema" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueSchema);
  },
});
