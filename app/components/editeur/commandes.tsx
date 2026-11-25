import { useEffect, useRef } from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

import { normaliser } from "~/lib/contenu/texte";
import type { OutilId } from "~/lib/document/outils";
import { insererNote } from "./blocs";
import { insererExercice, insererQuestion, insererSousQuestion } from "./noeuds";

/**
 * Commandes d'insertion, partagées par le menu « / » (dans le texte) et le bouton « Insérer ».
 * Une commande liée à un outil n'apparaît que si la matière a cet outil dans son profil.
 */

export type ContexteCommande = {
  editor: Editor;
  ouvrirFormule: (bloc: boolean, chimie: boolean) => void;
  choisirImage: () => void;
  ouvrirDiagramme: () => void;
};

export type Commande = {
  id: string;
  titre: string;
  aide: string;
  motsCles: string;
  outil?: OutilId;
  executer: (c: ContexteCommande) => void;
};

const vide = { type: "paragraph" };

export const COMMANDES: Commande[] = [
  { id: "titre", titre: "Titre", aide: "Grand titre de partie", motsCles: "h2 partie", executer: ({ editor }) => editor.chain().focus().setHeading({ level: 2 }).run() },
  { id: "sous-titre", titre: "Sous-titre", aide: "Titre de section", motsCles: "h3", executer: ({ editor }) => editor.chain().focus().setHeading({ level: 3 }).run() },
  { id: "exercice", titre: "Exercice", aide: "Nouvel exercice numéroté", motsCles: "probleme partie", executer: ({ editor }) => insererExercice(editor) },
  { id: "question", titre: "Question", aide: "Question numérotée", motsCles: "", executer: ({ editor }) => insererQuestion(editor) },
  { id: "sous-question", titre: "Sous-question", aide: "a), b), c)…", motsCles: "", executer: ({ editor }) => insererSousQuestion(editor) },
  { id: "liste", titre: "Liste à puces", aide: "", motsCles: "puces", executer: ({ editor }) => editor.chain().focus().toggleBulletList().run() },
  { id: "liste-numerotee", titre: "Liste numérotée", aide: "", motsCles: "numeros", executer: ({ editor }) => editor.chain().focus().toggleOrderedList().run() },
  { id: "tableau", titre: "Tableau", aide: "3 × 3 avec en-tête", motsCles: "table donnees", executer: ({ editor }) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { id: "formule", titre: "Formule", aide: "Dans le texte", motsCles: "maths latex equation", executer: ({ ouvrirFormule }) => ouvrirFormule(false, false) },
  { id: "formule-centree", titre: "Formule centrée", aide: "Sur sa propre ligne", motsCles: "maths latex equation bloc", executer: ({ ouvrirFormule }) => ouvrirFormule(true, false) },
  { id: "chimie", titre: "Formule chimique", aide: "Équation, isotope, ion", motsCles: "ce reaction molecule", outil: "chimie", executer: ({ ouvrirFormule }) => ouvrirFormule(false, true) },
  { id: "image", titre: "Image", aide: "Photo, schéma, carte (5 Mo max.)", motsCles: "photo schema carte figure", outil: "image", executer: ({ choisirImage }) => choisirImage() },
  { id: "document", titre: "Document numéroté", aide: "« Document 1 » avec légende", motsCles: "figure annexe legende", outil: "document", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "documentNumerote", attrs: { legende: "" }, content: [vide] }).run() },
  { id: "encadre", titre: "Encadré", aide: "On donne, Rappel, Définition…", motsCles: "donnees rappel definition remarque", outil: "encadre", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "encadre", attrs: { genre: "donnees" }, content: [vide] }).run() },
  { id: "note", titre: "Note de bas de page", aide: "Numérotée automatiquement", motsCles: "footnote renvoi", outil: "note", executer: ({ editor }) => insererNote(editor) },
  { id: "extrait", titre: "Extrait à lignes numérotées", aide: "Texte, poème", motsCles: "texte poeme citation commentaire", outil: "extrait", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "extrait", attrs: { source: "" }, content: [{ type: "ligne" }] }).run() },
  { id: "code", titre: "Code", aide: "Python, C, Java, SQL…", motsCles: "programme informatique source", outil: "code", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language: "python", numeros: true } }).run() },
  { id: "algo", titre: "Algorithme", aide: "Pseudo-code en français", motsCles: "pseudo code algorithmique", outil: "algo", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "codeBlock", attrs: { language: "algo", numeros: true } }).run() },
  { id: "diagramme", titre: "Diagramme", aide: "Organigramme, UML, automate", motsCles: "mermaid uml graphe organigramme sequence etat", outil: "diagramme", executer: ({ ouvrirDiagramme }) => ouvrirDiagramme() },
];

export function commandesDisponibles(outils: readonly OutilId[], requete = ""): Commande[] {
  const q = normaliser(requete);
  return COMMANDES.filter((c) => !c.outil || outils.includes(c.outil)).filter(
    (c) => !q || normaliser(`${c.titre} ${c.motsCles}`).includes(q),
  );
}

/* ---------- Menu « / » ---------- */

export type EtatMenu = {
  commandes: Commande[];
  rect: DOMRect | null;
  choisir: (c: Commande) => void;
};

type OptionsSlash = {
  commandes: (requete: string) => Commande[];
  executer: (c: Commande) => void;
  surEtat: (etat: EtatMenu | null) => void;
  surTouche: (e: KeyboardEvent) => boolean;
};

export const CommandeSlash = Extension.create<OptionsSlash>({
  name: "commandeSlash",
  addOptions() {
    return { commandes: () => [], executer: () => {}, surEtat: () => {}, surTouche: () => false };
  },
  addProseMirrorPlugins() {
    const o = this.options;
    return [
      Suggestion<Commande, Commande>({
        editor: this.editor,
        char: "/",
        items: ({ query }) => o.commandes(query),
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: Commande }) => {
          editor.chain().focus().deleteRange(range).run();
          o.executer(props);
        },
        render: () => {
          const publier = (p: { items: Commande[]; clientRect?: (() => DOMRect | null) | null; command: (c: Commande) => void }) =>
            o.surEtat({ commandes: p.items, rect: p.clientRect?.() ?? null, choisir: p.command });
          return {
            onStart: publier,
            onUpdate: publier,
            onKeyDown: ({ event }) => o.surTouche(event),
            onExit: () => o.surEtat(null),
          };
        },
      }),
    ];
  },
});

/** Liste de commandes (menu « / » ou panneau « Insérer »). */
export function ListeCommandes({
  commandes,
  actif,
  onChoisir,
  onSurvol,
}: {
  commandes: Commande[];
  actif: number;
  onChoisir: (c: Commande) => void;
  onSurvol?: (i: number) => void;
}) {
  const liste = useRef<HTMLUListElement>(null);
  useEffect(() => {
    liste.current?.children[actif]?.scrollIntoView({ block: "nearest" });
  }, [actif]);
  if (commandes.length === 0) {
    return <p className="px-3 py-2 text-sm text-muted">Aucun outil ne correspond.</p>;
  }
  return (
    <ul ref={liste} role="listbox" aria-label="Insérer" className="flex max-h-80 flex-col overflow-y-auto">
      {commandes.map((c, i) => (
        <li key={c.id} role="option" aria-selected={i === actif}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => onSurvol?.(i)}
            onClick={() => onChoisir(c)}
            className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left ${
              i === actif ? "bg-soft" : ""
            }`}
          >
            <span className="text-sm font-bold">{c.titre}</span>
            {c.aide ? <span className="text-xs text-muted">{c.aide}</span> : null}
          </button>
        </li>
      ))}
    </ul>
  );
}
