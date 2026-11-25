import { useEffect, useRef, useState } from "react";

import { ApercuDiagramme } from "./blocs";
import { ApercuChronogramme } from "./electronique";

/**
 * Saisie d'un bloc décrit par du texte : diagramme Mermaid ou chronogramme WaveDrom.
 * Modèles de départ, texte, aperçu en direct.
 */

export type GenreSource = "diagramme" | "chronogramme";
export type DiagrammeEnCours = { source: string; pos?: number; genre?: GenreSource };

const MODELES_MERMAID = [
  {
    nom: "Organigramme",
    source: `flowchart TD
  A([Début]) --> B[/Lire n/]
  B --> C{n > 0 ?}
  C -- Oui --> D[s ← s + n]
  C -- Non --> E[/Afficher s/]
  D --> B
  E --> F([Fin])`,
  },
  {
    nom: "Séquence",
    source: `sequenceDiagram
  participant C as Client
  participant S as Serveur
  C->>S: Requête HTTP
  S-->>C: Réponse 200`,
  },
  {
    nom: "Classes UML",
    source: `classDiagram
  class Etudiant {
    +String nom
    +int matricule
    +inscrire()
  }
  class Cours {
    +String intitule
  }
  Etudiant "*" --> "*" Cours : suit`,
  },
  {
    nom: "Automate / états",
    source: `stateDiagram-v2
  [*] --> q0
  q0 --> q1 : a
  q1 --> q1 : b
  q1 --> [*]`,
  },
  {
    nom: "Entité-association",
    source: `erDiagram
  ETUDIANT ||--o{ INSCRIPTION : fait
  COURS ||--o{ INSCRIPTION : concerne`,
  },
  {
    nom: "Graphe",
    source: `flowchart LR
  A --- B
  A --- C
  B --- D
  C --- D`,
  },
];

const MODELES_ONDES = [
  {
    nom: "Horloge et bascule D",
    source: `{ signal: [
  { name: "H", wave: "p......." },
  { name: "D", wave: "0.1..0.1" },
  { name: "Q", wave: "0..1..0." }
]}`,
  },
  {
    nom: "Compteur 2 bits",
    source: `{ signal: [
  { name: "H",  wave: "p......." },
  { name: "Q0", wave: "01010101" },
  { name: "Q1", wave: "0.1.0.1." }
]}`,
  },
  {
    nom: "Bus de données",
    source: `{ signal: [
  { name: "H",       wave: "p....." },
  { name: "Adresse", wave: "x.3.x.", data: ["0x2A"] },
  { name: "Données", wave: "x..4x.", data: ["0xFF"] },
  { name: "RD",      wave: "1.0.1." }
]}`,
  },
  {
    nom: "Logigramme",
    source: `{ assign: [
  ["S", ["|", ["&", "A", "B"], ["~", "C"]]]
]}`,
  },
  {
    nom: "Registre",
    source: `{ reg: [
  { bits: 8, name: "valeur" },
  { bits: 4, name: "registre" },
  { bits: 4, name: "opcode" }
]}`,
  },
];

const GENRES = {
  diagramme: {
    nouveau: "Nouveau diagramme",
    modifier: "Modifier le diagramme",
    modeles: MODELES_MERMAID,
    aide: { lien: "https://mermaid.js.org/intro/syntax-reference.html", texte: "Syntaxe Mermaid" },
    Apercu: ApercuDiagramme,
  },
  chronogramme: {
    nouveau: "Nouveau chronogramme",
    modifier: "Modifier le chronogramme",
    modeles: MODELES_ONDES,
    aide: { lien: "https://wavedrom.com/tutorial.html", texte: "Syntaxe WaveDrom" },
    Apercu: ApercuChronogramme,
  },
} as const;

export function DialogueDiagramme({
  diagramme,
  onValider,
  onFermer,
}: {
  diagramme: DiagrammeEnCours | null;
  onValider: (source: string) => void;
  onFermer: () => void;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const [source, setSource] = useState("");

  const genre = GENRES[diagramme?.genre ?? "diagramme"];
  const { Apercu } = genre;

  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (diagramme) {
      setSource(diagramme.source || GENRES[diagramme.genre ?? "diagramme"].modeles[0]!.source);
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [diagramme]);

  const nouveau = diagramme?.pos === undefined;

  return (
    <dialog
      ref={dialogue}
      onClose={onFermer}
      aria-labelledby="titre-diagramme"
      className="m-auto w-[min(100vw-1.5rem,56rem)] rounded-3xl border-2 border-line bg-surface p-0 text-ink backdrop:bg-ink/40"
    >
      {/* Pas de <form> : le dialogue est placé dans le formulaire du sujet. */}
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="titre-diagramme" className="text-lg font-extrabold">
            {nouveau ? genre.nouveau : genre.modifier}
          </h2>
          <a
            href={genre.aide.lien}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted underline underline-offset-4"
          >
            {genre.aide.texte}
          </a>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Modèles">
          {genre.modeles.map((m) => (
            <button
              key={m.nom}
              type="button"
              onClick={() => setSource(m.source)}
              className="min-h-10 rounded-full border-2 border-line px-3.5 text-sm font-medium hover:border-control"
            >
              {m.nom}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Description du diagramme
            <textarea
              value={source}
              onChange={(e) => setSource(e.target.value)}
              rows={12}
              spellCheck={false}
              autoCapitalize="off"
              className="rounded-2xl border-2 border-control bg-soft px-3 py-2 font-mono text-sm focus:border-ink"
            />
          </label>
          <div className="flex min-h-48 flex-col gap-1.5 text-sm font-medium">
            Aperçu
            <div className="flex-1 overflow-auto rounded-2xl border-2 border-line p-3">
              <Apercu source={source} />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={onFermer} className="min-h-12 rounded-full bg-soft px-6 font-medium hover:bg-line">
            Annuler
          </button>
          <button
            type="button"
            onClick={() => (source.trim() ? onValider(source.slice(0, 10_000)) : onFermer())}
            className="min-h-12 rounded-full bg-ink px-6 font-bold text-white hover:bg-ink-2"
          >
            {nouveau ? "Insérer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
