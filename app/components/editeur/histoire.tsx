import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import type { ReactNode } from "react";

import { CarteDessin } from "~/components/document/CarteDessin";
import { SvgFrise } from "~/components/document/SvgFrise";
import { SvgStatistique } from "~/components/document/SvgStatistique";
import { CARTE_DEFAUT, normaliserCarte } from "~/lib/document/carte";
import { FRISE_DEFAUT, normaliserFrise } from "~/lib/document/frise";
import { STAT_DEFAUT, normaliserStatistique } from "~/lib/document/statistique";
import { Commandes, Poignee } from "./noeuds";

/** Blocs d'histoire-géographie : frise, diagramme statistique, carte à légender (édités dans un dialogue). */

export type OuvrirDessin = (attrs: Record<string, unknown> | null, pos?: number) => void;

const bouton = "min-h-9 rounded-full bg-soft px-3 text-sm font-medium hover:bg-line";

/** Bloc dessiné à partir de ses attributs, modifié dans un dialogue (« Modifier » ou double-clic). */
export function noeudDessin({
  nom,
  titre,
  libelle,
  classe,
  defaut,
  dessin,
}: {
  nom: string;
  titre: string;
  libelle: string;
  classe: string;
  defaut: object;
  dessin: (attrs: Record<string, unknown>) => ReactNode;
}) {
  function Vue(props: ReactNodeViewProps) {
    const ouvrir = (props.extension.options as { ouvrir?: OuvrirDessin }).ouvrir;
    const modifier = () => ouvrir?.(props.node.attrs, props.getPos());
    return (
      <NodeViewWrapper className="bloc-outil" data-drag-handle="">
        <div className="entete-bloc" contentEditable={false}>
          <Poignee />
          <span className="text-sm font-bold">{titre}</span>
          <span className="flex-1" />
          <button type="button" onClick={modifier} className={bouton}>
            Modifier
          </button>
          <Commandes props={props} libelle={libelle} />
        </div>
        <div contentEditable={false} className={classe} onDoubleClick={modifier}>
          {dessin(props.node.attrs)}
        </div>
      </NodeViewWrapper>
    );
  }

  return Node.create<{ ouvrir?: OuvrirDessin }>({
    name: nom,
    group: "block",
    atom: true,
    draggable: true,
    addOptions() {
      return { ouvrir: undefined };
    },
    addAttributes() {
      return Object.fromEntries(Object.entries(defaut).map(([cle, valeur]) => [cle, { default: valeur }]));
    },
    parseHTML() {
      return [{ tag: `figure[data-type="${nom}"]` }];
    },
    renderHTML({ HTMLAttributes }) {
      return ["figure", mergeAttributes(HTMLAttributes, { "data-type": nom })];
    },
    addNodeView() {
      return ReactNodeViewRenderer(Vue);
    },
  });
}

export const FriseSujet = noeudDessin({
  nom: "frise",
  titre: "Frise chronologique",
  libelle: "la frise",
  classe: "figure-frise",
  defaut: FRISE_DEFAUT,
  dessin: (attrs) => <SvgFrise f={normaliserFrise(attrs)} />,
});

export const StatistiqueSujet = noeudDessin({
  nom: "statistique",
  titre: "Diagramme statistique",
  libelle: "le diagramme",
  classe: "figure-statistique",
  defaut: STAT_DEFAUT,
  dessin: (attrs) => <SvgStatistique s={normaliserStatistique(attrs)} />,
});

export const CarteSujet = noeudDessin({
  nom: "carte",
  titre: "Carte à légender",
  libelle: "la carte",
  classe: "figure-carte",
  defaut: CARTE_DEFAUT,
  dessin: (attrs) => <CarteDessin c={normaliserCarte(attrs)} />,
});
