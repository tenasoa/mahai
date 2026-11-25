import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { Placeholder } from "@tiptap/extensions";
import { BlockMath, InlineMath } from "@tiptap/extension-mathematics";
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";

import type { Noeud } from "~/lib/document/nettoyer";
import { OPTIONS_KATEX } from "~/lib/document/katex.client";
import { OUTILS, type OutilId } from "~/lib/document/outils";
import {
  Diagramme,
  DocumentNumerote,
  Encadre,
  Extrait,
  ImageSujet,
  Ligne,
  Note,
  choisirEtInsererImage,
  codeConfigure,
} from "./blocs";
import {
  CommandeSlash,
  ListeCommandes,
  commandesDisponibles,
  type Commande,
  type ContexteCommande,
  type EtatMenu,
} from "./commandes";
import { DialogueDiagramme, type DiagrammeEnCours } from "./DialogueDiagramme";
import { DialogueFormule, type FormuleEnCours } from "./DialogueFormule";
import {
  DocumentSujet,
  Exercice,
  Question,
  SeriesEditeur,
  insererExercice,
  insererQuestion,
  insererSousQuestion,
  type SerieEditeur,
} from "./noeuds";

const TOUS_LES_OUTILS = OUTILS.map((o) => o.id);

/**
 * Éditeur d'énoncé ou de corrigé (admin). Le document JSON part dans un champ caché `name` ;
 * le serveur le nettoie (`lireDocument`) avant de l'enregistrer.
 * `outils` : outils proposés pour la matière (menu « / » et bouton « Insérer »).
 */
export function EditeurRiche({
  name,
  initial,
  libelle,
  placeholder,
  series = [],
  outils = TOUS_LES_OUTILS,
}: {
  name: string;
  initial: Noeud | null;
  libelle: string;
  placeholder: string;
  series?: SerieEditeur[];
  outils?: OutilId[];
}) {
  const [json, setJson] = useState(() => (initial ? JSON.stringify(initial) : ""));
  const [formule, setFormule] = useState<FormuleEnCours | null>(null);
  const [diagramme, setDiagramme] = useState<DiagrammeEnCours | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [menu, setMenu] = useState<EtatMenu | null>(null);
  const [actif, setActif] = useState(0);
  const [panneau, setPanneau] = useState(false);

  // L'éditeur est créé une seule fois : il lit les valeurs courantes par des références.
  const outilsRef = useRef(outils);
  outilsRef.current = outils;
  const menuRef = useRef({ menu, actif });
  menuRef.current = { menu, actif };
  const contexteRef = useRef<ContexteCommande | null>(null);

  const ouvrirFormule = useCallback(
    (bloc: boolean) => (node: { attrs: Record<string, unknown> }, pos: number) =>
      setFormule({ latex: String(node.attrs.latex ?? ""), bloc, pos }),
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      DocumentSujet,
      StarterKit.configure({
        document: false,
        codeBlock: false,
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Subscript,
      Superscript,
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: `${placeholder} Tape « / » pour insérer un outil.` }),
      InlineMath.configure({ katexOptions: OPTIONS_KATEX, onClick: ouvrirFormule(false) }),
      BlockMath.configure({
        katexOptions: { ...OPTIONS_KATEX, displayMode: true },
        onClick: ouvrirFormule(true),
      }),
      Exercice,
      Question,
      ImageSujet,
      DocumentNumerote,
      Encadre,
      Note,
      Extrait,
      Ligne,
      codeConfigure(),
      Diagramme.configure({ ouvrir: (source, pos) => setDiagramme({ source, pos }) }),
      CommandeSlash.configure({
        commandes: (requete) => commandesDisponibles(outilsRef.current, requete),
        executer: (c) => {
          if (contexteRef.current) c.executer(contexteRef.current);
        },
        surEtat: (etat) => {
          setMenu(etat);
          if (!etat) setActif(0);
          else setActif((i) => Math.min(i, Math.max(0, etat.commandes.length - 1)));
        },
        surTouche: (e) => {
          const { menu: m, actif: i } = menuRef.current;
          if (!m || m.commandes.length === 0) return false;
          if (e.key === "ArrowDown") {
            setActif((i + 1) % m.commandes.length);
            return true;
          }
          if (e.key === "ArrowUp") {
            setActif((i - 1 + m.commandes.length) % m.commandes.length);
            return true;
          }
          if (e.key === "Enter" || e.key === "Tab") {
            m.choisir(m.commandes[i]!);
            return true;
          }
          return e.key === "Escape";
        },
      }),
    ],
    content: initial ?? undefined,
    editorProps: {
      attributes: { class: "contenu editeur-sujet", "aria-label": libelle, "aria-multiline": "true" },
    },
    onUpdate: ({ editor }) => setJson(editor.isEmpty ? "" : JSON.stringify(editor.getJSON())),
  });

  contexteRef.current = editor
    ? {
        editor,
        ouvrirFormule: (bloc, chimie) => setFormule({ latex: "", bloc, chimie }),
        choisirImage: () => {
          setErreur(null);
          choisirEtInsererImage(editor, setErreur);
        },
        ouvrirDiagramme: () => setDiagramme({ source: "" }),
      }
    : null;

  function executer(c: Commande) {
    setPanneau(false);
    if (contexteRef.current) c.executer(contexteRef.current);
  }

  function validerFormule(latex: string, bloc: boolean) {
    if (!editor || !formule) return;
    const chaine = editor.chain().focus();
    if (formule.pos === undefined) {
      if (bloc) chaine.insertBlockMath({ latex }).run();
      else chaine.insertInlineMath({ latex }).run();
    } else if (formule.bloc) {
      chaine.updateBlockMath({ latex, pos: formule.pos }).run();
    } else {
      chaine.updateInlineMath({ latex, pos: formule.pos }).run();
    }
    setFormule(null);
  }

  function supprimerFormule() {
    if (!editor || formule?.pos === undefined) return;
    const chaine = editor.chain().focus();
    if (formule.bloc) chaine.deleteBlockMath({ pos: formule.pos }).run();
    else chaine.deleteInlineMath({ pos: formule.pos }).run();
    setFormule(null);
  }

  function validerDiagramme(source: string) {
    if (!editor || !diagramme) return;
    const pos = diagramme.pos;
    if (pos === undefined) {
      editor.chain().focus().insertContent({ type: "diagramme", attrs: { source } }).run();
    } else {
      editor
        .chain()
        .command(({ tr }) => {
          tr.setNodeAttribute(pos, "source", source);
          return true;
        })
        .run();
    }
    setDiagramme(null);
  }

  // Ferme le panneau « Insérer » au clic à l'extérieur.
  const zonePanneau = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!panneau) return;
    const fermer = (e: MouseEvent) => {
      if (!zonePanneau.current?.contains(e.target as globalThis.Node)) setPanneau(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, [panneau]);

  return (
    <SeriesEditeur.Provider value={series}>
      <div className="flex flex-col rounded-3xl border-2 border-line focus-within:border-control">
        <span className="sr-only">{libelle}</span>
        {editor ? (
          <div ref={zonePanneau} className="relative">
            <BarreOutils
              editor={editor}
              outils={outils}
              onFormule={(bloc, chimie) => setFormule({ latex: "", bloc, chimie })}
              panneau={panneau}
              onPanneau={() => setPanneau((p) => !p)}
            />
            {panneau ? (
              <div className="absolute top-full right-2 z-20 mt-1 w-72 rounded-2xl border-2 border-line bg-surface p-1.5">
                <ListeCommandes commandes={commandesDisponibles(outils)} actif={-1} onChoisir={executer} />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="h-14 border-b-2 border-line" />
        )}
        {erreur ? (
          <p role="alert" className="mx-4 mt-3 rounded-card bg-erreur px-4 py-2 text-sm font-medium">
            {erreur}
          </p>
        ) : null}
        <EditorContent editor={editor} className="min-h-64 px-4 py-4" />
        <input type="hidden" name={name} value={json} />
      </div>
      {menu && menu.rect ? (
        <div
          className="fixed z-30 w-72 rounded-2xl border-2 border-line bg-surface p-1.5"
          style={{
            top: Math.min(menu.rect.bottom + 6, window.innerHeight - 340),
            left: Math.max(8, Math.min(menu.rect.left, window.innerWidth - 296)),
          }}
        >
          <ListeCommandes
            commandes={menu.commandes}
            actif={actif}
            onSurvol={setActif}
            onChoisir={(c) => menu.choisir(c)}
          />
        </div>
      ) : null}
      <DialogueFormule
        formule={formule}
        onValider={validerFormule}
        onSupprimer={supprimerFormule}
        onFermer={() => setFormule(null)}
      />
      <DialogueDiagramme diagramme={diagramme} onValider={validerDiagramme} onFermer={() => setDiagramme(null)} />
    </SeriesEditeur.Provider>
  );
}

/* ---------- Barre d'outils ---------- */

function Outil({
  actif,
  onClick,
  titre,
  children,
  desactive,
}: {
  actif?: boolean;
  onClick: () => void;
  titre: string;
  children: ReactNode;
  desactive?: boolean;
}) {
  return (
    <button
      type="button"
      title={titre}
      aria-label={titre}
      aria-pressed={actif === undefined ? undefined : actif}
      disabled={desactive}
      onMouseDown={(e) => e.preventDefault()} // garde la sélection dans l'éditeur
      onClick={onClick}
      className={`inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-2.5 text-sm disabled:opacity-35 ${
        actif ? "bg-ink text-white" : "hover:bg-soft"
      }`}
    >
      {children}
    </button>
  );
}

const Separateur = () => <span aria-hidden="true" className="mx-1 h-6 w-0.5 shrink-0 bg-line" />;

function BarreOutils({
  editor,
  outils,
  onFormule,
  panneau,
  onPanneau,
}: {
  editor: Editor;
  outils: OutilId[];
  onFormule: (bloc: boolean, chimie: boolean) => void;
  panneau: boolean;
  onPanneau: () => void;
}) {
  const etat = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      gras: e.isActive("bold"),
      italique: e.isActive("italic"),
      souligne: e.isActive("underline"),
      exposant: e.isActive("superscript"),
      indice: e.isActive("subscript"),
      puces: e.isActive("bulletList"),
      numeros: e.isActive("orderedList"),
      titre: e.isActive("heading", { level: 2 }),
      sousTitre: e.isActive("heading", { level: 3 }),
      tableau: e.isActive("table"),
      annuler: e.can().undo(),
      retablir: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Mise en forme"
      className="sticky top-0 z-10 flex flex-col gap-1 rounded-t-3xl border-b-2 border-line bg-surface px-2 py-1.5"
    >
      <div className="flex items-center gap-0.5 overflow-x-auto">
        <Outil titre="Annuler" desactive={!etat.annuler} onClick={() => c().undo().run()}>
          ↶
        </Outil>
        <Outil titre="Rétablir" desactive={!etat.retablir} onClick={() => c().redo().run()}>
          ↷
        </Outil>
        <Separateur />
        <Outil titre="Titre" actif={etat.titre} onClick={() => c().toggleHeading({ level: 2 }).run()}>
          <span className="font-extrabold">T</span>
        </Outil>
        <Outil titre="Sous-titre" actif={etat.sousTitre} onClick={() => c().toggleHeading({ level: 3 }).run()}>
          <span className="font-bold">t</span>
        </Outil>
        <Outil titre="Gras" actif={etat.gras} onClick={() => c().toggleBold().run()}>
          <span className="font-extrabold">G</span>
        </Outil>
        <Outil titre="Italique" actif={etat.italique} onClick={() => c().toggleItalic().run()}>
          <span className="font-serif italic">I</span>
        </Outil>
        <Outil titre="Souligné" actif={etat.souligne} onClick={() => c().toggleUnderline().run()}>
          <span className="underline underline-offset-2">S</span>
        </Outil>
        <Outil titre="Exposant" actif={etat.exposant} onClick={() => c().toggleSuperscript().run()}>
          x²
        </Outil>
        <Outil titre="Indice" actif={etat.indice} onClick={() => c().toggleSubscript().run()}>
          x₂
        </Outil>
        <Separateur />
        <Outil titre="Liste à puces" actif={etat.puces} onClick={() => c().toggleBulletList().run()}>
          • —
        </Outil>
        <Outil titre="Liste numérotée" actif={etat.numeros} onClick={() => c().toggleOrderedList().run()}>
          1. —
        </Outil>
        <Outil
          titre="Tableau"
          actif={etat.tableau}
          onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          ▦
        </Outil>
      </div>

      <div className="flex items-center gap-0.5 overflow-x-auto">
        <Outil titre="Formule dans le texte" onClick={() => onFormule(false, false)}>
          <span className="font-serif italic">f(x)</span>
        </Outil>
        <Outil titre="Formule centrée" onClick={() => onFormule(true, false)}>
          <span className="font-serif">∑</span>
        </Outil>
        {outils.includes("chimie") ? (
          <Outil titre="Formule chimique" onClick={() => onFormule(false, true)}>
            H₂O
          </Outil>
        ) : null}
        <Separateur />
        <Outil titre="Ajouter un exercice" onClick={() => insererExercice(editor)}>
          + Exercice
        </Outil>
        <Outil titre="Ajouter une question" onClick={() => insererQuestion(editor)}>
          + Question
        </Outil>
        <Outil titre="Ajouter une sous-question" onClick={() => insererSousQuestion(editor)}>
          + Sous-question
        </Outil>
        <Separateur />
        <button
          type="button"
          aria-expanded={panneau}
          aria-haspopup="listbox"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onPanneau}
          className={`inline-flex min-h-10 shrink-0 items-center rounded-full border-2 px-3.5 text-sm font-bold ${
            panneau ? "border-ink bg-soft" : "border-line hover:border-control"
          }`}
        >
          Insérer…
        </button>
      </div>

      {etat.tableau ? (
        <div className="flex items-center gap-0.5 overflow-x-auto text-xs">
          <Outil titre="Ajouter une ligne" onClick={() => c().addRowAfter().run()}>
            + Ligne
          </Outil>
          <Outil titre="Ajouter une colonne" onClick={() => c().addColumnAfter().run()}>
            + Colonne
          </Outil>
          <Outil titre="Supprimer la ligne" onClick={() => c().deleteRow().run()}>
            − Ligne
          </Outil>
          <Outil titre="Supprimer la colonne" onClick={() => c().deleteColumn().run()}>
            − Colonne
          </Outil>
          <Outil titre="Fusionner ou séparer les cellules" onClick={() => c().mergeOrSplit().run()}>
            Fusionner
          </Outil>
          <Outil titre="Ligne d'en-tête" onClick={() => c().toggleHeaderRow().run()}>
            En-tête
          </Outil>
          <Outil titre="Supprimer le tableau" onClick={() => c().deleteTable().run()}>
            Supprimer
          </Outil>
        </div>
      ) : null}
    </div>
  );
}
