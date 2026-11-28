import { useEffect, useRef } from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

import { normaliser } from "~/lib/contenu/texte";
import type { OutilId } from "~/lib/document/outils";
import { insererNote } from "./blocs";
import { insererTableVerite } from "./electronique";
import { ARBRE_DEFAUT, ECHIQUIER_DEFAUT } from "~/lib/document/genetique";
import { VARIATIONS_DEFAUT, ligneSigne } from "~/lib/document/variations";
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
  ouvrirChronogramme: () => void;
  ouvrirSchema: () => void;
  ouvrirGraphique: () => void;
  ouvrirFigure: () => void;
  ouvrirFrise: () => void;
  ouvrirStatistique: () => void;
  ouvrirCarte: () => void;
  ouvrirProba: () => void;
  ouvrirOptique: () => void;
  ouvrirAvancement: () => void;
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
  { id: "schema", titre: "Schéma (électricité, mécanique)", aide: "Circuits, portes logiques, forces, ressorts, poulies", motsCles: "circuit electronique electrique composant resistance transistor porte mecanique force vecteur ressort poulie plan incline pendule solide champ magnetique aimant plaques laplace", outil: "schema", executer: ({ ouvrirSchema }) => ouvrirSchema() },
  { id: "chronogramme", titre: "Chronogramme", aide: "Signaux, horloge, bus (WaveDrom)", motsCles: "signal horloge timing bascule wavedrom logigramme", outil: "chronogramme", executer: ({ ouvrirChronogramme }) => ouvrirChronogramme() },
  { id: "karnaugh", titre: "Tableau de Karnaugh", aide: "2 à 4 variables", motsCles: "logique simplification booleen", outil: "logique", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "karnaugh", attrs: { variables: ["A", "B", "C"], sortie: "S", valeurs: "........" } }).run() },
  { id: "graphique", titre: "Graphique", aide: "Courbes, points, vecteurs dans un repère", motsCles: "courbe fonction repere plan coordonnees vecteur droite parabole", outil: "graphique", executer: ({ ouvrirGraphique }) => ouvrirGraphique() },
  { id: "geometrie", titre: "Figure de géométrie", aide: "Triangle, cercle, constructions, codage", motsCles: "geometrie triangle cercle polygone angle droite segment milieu hauteur mediane thales pythagore parallelogramme", outil: "geometrie", executer: ({ ouvrirFigure }) => ouvrirFigure() },
  { id: "avancement", titre: "Tableau d'avancement", aide: "Réaction chimique, x max, réactif limitant", motsCles: "chimie avancement reaction reactif limitant quantite matiere mol xmax stoechiometrie", outil: "avancement", executer: ({ ouvrirAvancement }) => ouvrirAvancement() },
  { id: "optique", titre: "Optique", aide: "Lentilles, objet, image et rayons", motsCles: "physique optique lentille convergente divergente foyer image objet rayon loupe lunette microscope conjugaison grandissement", outil: "optique", executer: ({ ouvrirOptique }) => ouvrirOptique() },
  { id: "probabilites", titre: "Arbre de probabilités", aide: "Épreuves successives, issues", motsCles: "maths probabilite arbre pondere evenement issue conditionnelle", outil: "probabilites", executer: ({ ouvrirProba }) => ouvrirProba() },
  { id: "frise", titre: "Frise chronologique", aide: "Périodes et événements datés", motsCles: "histoire chronologie dates periode evenement siecle", outil: "frise", executer: ({ ouvrirFrise }) => ouvrirFrise() },
  { id: "statistique", titre: "Diagramme statistique", aide: "Barres, courbe, secteurs, pyramide, ombrothermique", motsCles: "geographie histogramme barres camembert secteurs pyramide ages population climat ombrothermique courbe evolution", outil: "statistique", executer: ({ ouvrirStatistique }) => ouvrirStatistique() },
  { id: "carte", titre: "Carte à légender", aide: "Croquis : zones, flèches, lieux, légende", motsCles: "geographie croquis schema carte fond legende figure zone fleche flux ville port", outil: "carte", executer: ({ ouvrirCarte }) => ouvrirCarte() },
  { id: "variations", titre: "Tableau de variations", aide: "Signe de f′ et variations de f", motsCles: "fonction derivee etude croissante", outil: "variations", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "variations", attrs: VARIATIONS_DEFAUT }).run() },
  { id: "signes", titre: "Tableau de signes", aide: "Signe d'une expression", motsCles: "signe inequation produit quotient", outil: "variations", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "variations", attrs: { nomX: "x", x: ["-\\infty", "", "+\\infty"], lignes: [ligneSigne(3, "f(x)")] } }).run() },
  { id: "molecule", titre: "Molécule", aide: "Formule topologique (SMILES)", motsCles: "chimie organique smiles topologique semi developpee", outil: "molecule", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "molecule", attrs: { smiles: "CCO", nom: "Éthanol", carbones: false } }).run() },
  { id: "arbre", titre: "Arbre généalogique", aide: "Générations, unions, individus atteints", motsCles: "genetique pedigree famille heredite svt maladie", outil: "genetique", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "arbre", attrs: ARBRE_DEFAUT }).run() },
  { id: "echiquier", titre: "Échiquier de croisement", aide: "Gamètes, génotypes et phénotypes", motsCles: "genetique croisement punnett gametes genotype phenotype svt dihybridisme", outil: "genetique", executer: ({ editor }) => editor.chain().focus().insertContent({ type: "echiquier", attrs: ECHIQUIER_DEFAUT }).run() },
  { id: "table-verite", titre: "Table de vérité", aide: "Toutes les combinaisons des entrées", motsCles: "logique booleen combinatoire", outil: "logique", executer: ({ editor }) => insererTableVerite(editor) },
];

export function commandesDisponibles(outils: readonly OutilId[], requete = ""): Commande[] {
  const q = normaliser(requete);
  const proposees = COMMANDES.filter((c) => !c.outil || outils.includes(c.outil)).filter(
    (c) => !q || normaliser(`${c.titre} ${c.motsCles}`).includes(q),
  );
  if (!q) return proposees;
  // Le titre compte plus que les mots-clés : « /schema » propose d'abord « Schéma électrique ».
  const rang = (c: Commande) => {
    const titre = normaliser(c.titre);
    return titre.startsWith(q) ? 0 : titre.includes(q) ? 1 : 2;
  };
  return proposees.sort((a, b) => rang(a) - rang(b));
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
