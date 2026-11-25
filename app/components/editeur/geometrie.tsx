import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";

import { SvgFigure } from "~/components/document/SvgFigure";
import { FIGURE_DEFAUT, normaliserFigure } from "~/lib/document/geometrie";
import { Commandes, Poignee } from "./noeuds";

/** Bloc « Figure de géométrie » (édité dans `DialogueFigure`). */

export type OuvrirFigure = (attrs: Record<string, unknown> | null, pos?: number) => void;

const bouton = "min-h-9 rounded-full bg-soft px-3 text-sm font-medium hover:bg-line";

function VueFigure(props: ReactNodeViewProps) {
  const ouvrir = (props.extension.options as { ouvrir?: OuvrirFigure }).ouvrir;
  const f = normaliserFigure(props.node.attrs);
  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Figure de géométrie</span>
        <span className="flex-1" />
        <button type="button" onClick={() => ouvrir?.(props.node.attrs, props.getPos())} className={bouton}>
          Modifier
        </button>
        <Commandes props={props} libelle="la figure" />
      </div>
      <div contentEditable={false} className="figure-geometrie" onDoubleClick={() => ouvrir?.(props.node.attrs, props.getPos())}>
        <SvgFigure f={f} />
      </div>
    </NodeViewWrapper>
  );
}

export const GeometrieSujet = Node.create<{ ouvrir?: OuvrirFigure }>({
  name: "geometrie",
  group: "block",
  atom: true,
  draggable: true,
  addOptions() {
    return { ouvrir: undefined };
  },
  addAttributes() {
    return Object.fromEntries(Object.entries(FIGURE_DEFAUT).map(([cle, defaut]) => [cle, { default: defaut }]));
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="geometrie"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "geometrie" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueFigure);
  },
});
