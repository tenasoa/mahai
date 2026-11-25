import { createContext, useContext } from "react";
import { Node, mergeAttributes, type Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";

/**
 * Blocs de structure d'un sujet : Exercice → Question → Sous-question, avec barème.
 * Numérotation automatique en CSS (compteurs), déplacement par la poignée ou les flèches.
 */

/** Séries du sujet en cours d'édition : une case de barème par série quand il y en a plusieurs. */
export type SerieEditeur = { id: string; nom: string };
export const SeriesEditeur = createContext<SerieEditeur[]>([]);

/** Le document accepte des blocs et des exercices ; un exercice ne contient pas d'exercice. */
export const DocumentSujet = Document.extend({ content: "(block | exercice)+" });

function deplacer(editor: Editor, getPos: () => number | undefined, sens: -1 | 1) {
  const pos = getPos();
  if (pos === undefined) return;
  const { state, view } = editor;
  const $pos = state.doc.resolve(pos);
  const parent = $pos.parent;
  const index = $pos.index();
  const noeud = parent.child(index);
  const voisinIndex = index + sens;
  if (voisinIndex < 0 || voisinIndex >= parent.childCount) return;
  const voisin = parent.child(voisinIndex);
  const tr = state.tr;
  if (sens === -1) {
    tr.delete(pos, pos + noeud.nodeSize).insert(pos - voisin.nodeSize, noeud);
  } else {
    tr.insert(pos + noeud.nodeSize + voisin.nodeSize, noeud).delete(pos, pos + noeud.nodeSize);
  }
  view.dispatch(tr.scrollIntoView());
}

export function Commandes({
  props,
  libelle,
}: {
  props: ReactNodeViewProps;
  libelle: string;
}) {
  const bouton =
    "inline-flex size-9 items-center justify-center rounded-full text-sm font-bold text-ink-2 hover:bg-line";
  return (
    <span className="flex items-center gap-0.5" contentEditable={false}>
      <button
        type="button"
        className={bouton}
        aria-label={`Monter ${libelle}`}
        onClick={() => deplacer(props.editor, props.getPos, -1)}
      >
        ↑
      </button>
      <button
        type="button"
        className={bouton}
        aria-label={`Descendre ${libelle}`}
        onClick={() => deplacer(props.editor, props.getPos, 1)}
      >
        ↓
      </button>
      <button
        type="button"
        className={bouton}
        aria-label={`Supprimer ${libelle}`}
        onClick={() => {
          if (window.confirm(`Supprimer ${libelle} et tout son contenu ?`)) props.deleteNode();
        }}
      >
        ×
      </button>
    </span>
  );
}

function CasePoints({
  valeur,
  libelle,
  onChange,
}: {
  valeur: number | null;
  libelle: string;
  onChange: (v: number | null) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={1000}
      step={0.25}
      inputMode="decimal"
      value={valeur ?? ""}
      placeholder="—"
      aria-label={libelle}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      className="h-9 w-16 rounded-full border-2 border-control bg-surface px-2 text-center text-sm text-ink tabular-nums"
    />
  );
}

/**
 * Barème : une case, ou une case par série. Si toutes les séries ont la même note, on garde un
 * barème commun (`points`) ; sinon `pointsSeries` porte la note de chacune.
 */
function ChampPoints({ props }: { props: ReactNodeViewProps }) {
  const series = useContext(SeriesEditeur);
  const points = props.node.attrs.points as number | null;
  const parSerie = (props.node.attrs.pointsSeries ?? null) as Record<string, number> | null;

  if (series.length < 2) {
    return (
      <label className="flex items-center gap-1.5 text-xs text-muted" contentEditable={false}>
        <CasePoints
          valeur={points}
          libelle="Points"
          onChange={(v) => props.updateAttributes({ points: v, pointsSeries: null })}
        />
        pts
      </label>
    );
  }

  const valeurDe = (id: string) => parSerie?.[id] ?? points;
  return (
    <span className="flex flex-wrap items-center gap-1.5 text-xs text-muted" contentEditable={false}>
      {series.map((s) => (
        <label key={s.id} className="flex items-center gap-1">
          {s.nom}
          <CasePoints
            valeur={valeurDe(s.id)}
            libelle={`Points en série ${s.nom}`}
            onChange={(v) => {
              const notes = Object.fromEntries(series.map((x) => [x.id, x.id === s.id ? v : valeurDe(x.id)]));
              const valeurs = Object.values(notes);
              if (valeurs.every((x) => x === valeurs[0])) {
                props.updateAttributes({ points: valeurs[0], pointsSeries: null });
              } else {
                const propres = Object.fromEntries(
                  Object.entries(notes).filter((e): e is [string, number] => e[1] !== null),
                );
                props.updateAttributes({ points: null, pointsSeries: propres });
              }
            }}
          />
        </label>
      ))}
      pts
    </span>
  );
}

export function Poignee() {
  return (
    <span
      data-drag-handle=""
      contentEditable={false}
      draggable
      title="Glisser pour déplacer"
      className="inline-flex size-9 cursor-grab items-center justify-center rounded-full text-muted hover:bg-line"
      aria-hidden="true"
    >
      ⠿
    </span>
  );
}

function VueExercice(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="section" data-type="exercice" className="bloc-exercice">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="titre-numero font-extrabold" />
        <input
          type="text"
          value={(props.node.attrs.titre as string) ?? ""}
          onChange={(e) => props.updateAttributes({ titre: e.target.value })}
          placeholder="Titre (facultatif)"
          maxLength={200}
          aria-label="Titre de l'exercice"
          className="h-9 min-w-0 flex-1 rounded-full border-2 border-transparent bg-transparent px-2 text-base font-bold hover:border-line focus:border-control"
        />
        <ChampPoints props={props} />
        <Commandes props={props} libelle="l'exercice" />
      </div>
      <NodeViewContent className="contenu-bloc" />
    </NodeViewWrapper>
  );
}

function VueQuestion(props: ReactNodeViewProps) {
  return (
    <NodeViewWrapper as="div" data-type="question" className="bloc-question">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="question-numero font-bold" />
        <span className="flex-1" />
        <ChampPoints props={props} />
        <Commandes props={props} libelle="la question" />
      </div>
      <NodeViewContent className="contenu-bloc" />
    </NodeViewWrapper>
  );
}

export const Exercice = Node.create({
  name: "exercice",
  group: "exercice",
  content: "block+",
  draggable: true,
  defining: true,
  addAttributes() {
    return {
      titre: { default: "" },
      points: { default: null },
      pointsSeries: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'section[data-type="exercice"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["section", mergeAttributes(HTMLAttributes, { "data-type": "exercice" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueExercice);
  },
});

export const Question = Node.create({
  name: "question",
  group: "block",
  content: "block+",
  draggable: true,
  defining: true,
  addAttributes() {
    return { points: { default: null }, pointsSeries: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="question"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "question" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueQuestion);
  },
});

const vide = { type: "paragraph" };
const nouvelleQuestion = () => ({ type: "question", attrs: { points: null }, content: [vide] });

/** Profondeur du plus proche ancêtre d'un type donné, ou -1. */
function ancetre(editor: Editor, type: string): number {
  const { $from } = editor.state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === type) return d;
  }
  return -1;
}

/** Position juste après le bloc de texte où se trouve le curseur (sans le couper). */
function apresLeBlocCourant(editor: Editor): number {
  const { $from } = editor.state.selection;
  return $from.depth > 0 ? $from.after($from.depth) : $from.pos;
}

/** Nouvel exercice après l'élément de premier niveau courant (un exercice ne s'imbrique pas). */
export function insererExercice(editor: Editor) {
  const { $from } = editor.state.selection;
  const pos = $from.depth >= 1 ? $from.after(1) : editor.state.doc.content.size;
  editor
    .chain()
    .focus()
    .insertContentAt(pos, { type: "exercice", attrs: { titre: "", points: null }, content: [nouvelleQuestion()] })
    .run();
}

/** Question au même niveau que la question courante (juste après elle). */
export function insererQuestion(editor: Editor) {
  const d = ancetre(editor, "question");
  const pos = d > 0 ? editor.state.selection.$from.after(d) : apresLeBlocCourant(editor);
  editor.chain().focus().insertContentAt(pos, nouvelleQuestion()).run();
}

/** Sous-question : à l'intérieur de la question courante, après le paragraphe du curseur. */
export function insererSousQuestion(editor: Editor) {
  editor.chain().focus().insertContentAt(apresLeBlocCourant(editor), nouvelleQuestion()).run();
}
