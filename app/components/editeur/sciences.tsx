import { Fragment, useState, type KeyboardEvent } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";

import { Molecule } from "~/components/document/Molecule";
import { SvgGraphique } from "~/components/document/SvgGraphique";
import { TableauVariations } from "~/components/document/TableauVariations";
import { GRAPHIQUE_DEFAUT, normaliserGraphique } from "~/lib/document/graphique";
import {
  MAX_LIGNES,
  MAX_X,
  MIN_X,
  POSITIONS,
  VARIATIONS_DEFAUT,
  insererX,
  ligneSigne,
  ligneVariation,
  normaliserVariations,
  retirerX,
  type CaseVariation,
  type Position,
  type Variations,
} from "~/lib/document/variations";
import { Commandes, Poignee } from "./noeuds";

/**
 * Blocs de sciences : graphique dans un repère (édité dans `DialogueGraphique`), tableau de
 * signes et de variations, molécule (SMILES).
 */

const champ =
  "h-9 min-w-0 rounded-full border-2 border-transparent bg-transparent px-2 text-sm hover:border-line focus:border-control";
const bouton = "min-h-9 rounded-full bg-soft px-3 text-sm font-medium hover:bg-line";
const petitChamp = "h-8 min-w-0 rounded-lg border-2 border-line bg-surface px-1.5 text-sm focus:border-ink";

/** Entrée dans un champ : ne pas envoyer le formulaire du sujet. */
const sansEntree = (e: KeyboardEvent) => {
  if (e.key === "Enter") e.preventDefault();
};

/* ---------- Graphique ---------- */

export type OuvrirGraphique = (attrs: Record<string, unknown> | null, pos?: number) => void;

function VueGraphique(props: ReactNodeViewProps) {
  const ouvrir = (props.extension.options as { ouvrir?: OuvrirGraphique }).ouvrir;
  const g = normaliserGraphique(props.node.attrs);
  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Graphique</span>
        <span className="flex-1" />
        <button type="button" onClick={() => ouvrir?.(props.node.attrs, props.getPos())} className={bouton}>
          Modifier
        </button>
        <Commandes props={props} libelle="le graphique" />
      </div>
      <div contentEditable={false} className="figure-graphique" onDoubleClick={() => ouvrir?.(props.node.attrs, props.getPos())}>
        <SvgGraphique g={g} />
      </div>
    </NodeViewWrapper>
  );
}

export const GraphiqueSujet = Node.create<{ ouvrir?: OuvrirGraphique }>({
  name: "graphique",
  group: "block",
  atom: true,
  draggable: true,
  addOptions() {
    return { ouvrir: undefined };
  },
  addAttributes() {
    return Object.fromEntries(Object.entries(GRAPHIQUE_DEFAUT).map(([cle, defaut]) => [cle, { default: defaut }]));
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="graphique"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "graphique" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueGraphique);
  },
});

/* ---------- Tableau de signes et de variations ---------- */

const NOMS_POSITION: Record<Position, string> = { h: "haut", m: "milieu", b: "bas" };
const FLECHE_POSITION: Record<Position, string> = { h: "↑", m: "→", b: "↓" };

/** « inf », « ∞ » → \infty (le reste est du LaTeX). */
const latexSaisi = (s: string) => s.replace(/∞|\binf\b/g, "\\infty");

function ChoixPosition({ valeur, onChange, libelle }: { valeur: Position; onChange: (p: Position) => void; libelle: string }) {
  return (
    <select value={valeur} onChange={(e) => onChange(e.target.value as Position)} aria-label={libelle} title={libelle} className={petitChamp}>
      {POSITIONS.map((p) => (
        <option key={p} value={p}>
          {FLECHE_POSITION[p]} {NOMS_POSITION[p]}
        </option>
      ))}
    </select>
  );
}

function VueVariations(props: ReactNodeViewProps) {
  const t = normaliserVariations(props.node.attrs);
  const n = t.x.length;
  const [apercu, setApercu] = useState(true);

  // Toujours relire le nœud au moment du changement (saisies rapides : pas d'état périmé).
  function changer(f: (t: Variations) => Variations) {
    const pos = props.getPos();
    const noeud = typeof pos === "number" ? props.editor.state.doc.nodeAt(pos) : null;
    const actuel = normaliserVariations(noeud?.attrs ?? props.node.attrs);
    props.updateAttributes(f(actuel));
  }
  const majX = (i: number, v: string) => changer((a) => ({ ...a, x: a.x.map((x, j) => (j === i ? latexSaisi(v) : x)) }));
  const majLigne = (i: number, f: (l: Variations["lignes"][number]) => Variations["lignes"][number]) =>
    changer((a) => ({ ...a, lignes: a.lignes.map((l, j) => (j === i ? f(l) : l)) }));
  const majCaseSigne = (i: number, k: number, v: string) =>
    majLigne(i, (l) => (l.type === "signe" ? { ...l, cases: l.cases.map((c, j) => (j === k ? v : c)) } : l));
  const majCaseVariation = (i: number, k: number, partiel: Partial<CaseVariation>) =>
    majLigne(i, (l) => (l.type === "variation" ? { ...l, cases: l.cases.map((c, j) => (j === k ? { ...c, ...partiel } : c)) } : l));
  const deplacer = (i: number, sens: -1 | 1) =>
    changer((a) => {
      const lignes = [...a.lignes];
      const j = i + sens;
      if (j < 0 || j >= lignes.length) return a;
      [lignes[i], lignes[j]] = [lignes[j]!, lignes[i]!];
      return { ...a, lignes };
    });

  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Tableau de variations</span>
        <span className="flex-1" />
        {t.lignes.length < MAX_LIGNES ? (
          <>
            <button type="button" onClick={() => changer((a) => ({ ...a, lignes: [...a.lignes, ligneSigne(n)] }))} className={bouton}>
              + Signes
            </button>
            <button type="button" onClick={() => changer((a) => ({ ...a, lignes: [...a.lignes, ligneVariation(n)] }))} className={bouton}>
              + Variations
            </button>
          </>
        ) : null}
        <button type="button" onClick={() => setApercu(!apercu)} aria-pressed={apercu} className={bouton}>
          Aperçu
        </button>
        <Commandes props={props} libelle="le tableau" />
      </div>
      <div contentEditable={false} className="contenu flex flex-col gap-3" onKeyDown={sansEntree}>
        <div className="overflow-x-auto">
          <table className="edition-variations">
            <tbody>
              <tr>
                <th scope="row">
                  <input
                    value={t.nomX}
                    onChange={(e) => changer((a) => ({ ...a, nomX: e.target.value }))}
                    aria-label="Nom de la variable"
                    className={`${petitChamp} w-16`}
                  />
                </th>
                {t.x.map((x, i) => (
                  <Fragment key={i}>
                    <td>
                      <div className="flex items-center gap-0.5">
                        <input
                          value={x}
                          onChange={(e) => majX(i, e.target.value)}
                          aria-label={`Valeur ${i + 1} de ${t.nomX || "x"}`}
                          placeholder={i === 0 ? "-inf" : i === n - 1 ? "+inf" : "1"}
                          spellCheck={false}
                          className={`${petitChamp} w-24 font-mono`}
                        />
                        {n > MIN_X ? (
                          <button
                            type="button"
                            onClick={() => changer((a) => retirerX(a, i))}
                            aria-label={`Retirer la valeur ${i + 1}`}
                            title="Retirer cette valeur"
                            className="min-h-8 min-w-7 rounded-full text-muted hover:bg-soft"
                          >
                            ✕
                          </button>
                        ) : null}
                      </div>
                    </td>
                    {i < n - 1 ? (
                      <td className="text-center">
                        {n < MAX_X ? (
                          <button
                            type="button"
                            onClick={() => changer((a) => insererX(a, i))}
                            aria-label={`Ajouter une valeur après la valeur ${i + 1}`}
                            title="Ajouter une valeur ici"
                            className="min-h-8 min-w-8 rounded-full bg-soft text-sm font-bold hover:bg-line"
                          >
                            +
                          </button>
                        ) : null}
                      </td>
                    ) : null}
                  </Fragment>
                ))}
              </tr>
              {t.lignes.map((l, i) => (
                <tr key={i}>
                  <th scope="row">
                    <div className="flex items-center gap-0.5">
                      <input
                        value={l.nom}
                        onChange={(e) => majLigne(i, (ancienne) => ({ ...ancienne, nom: e.target.value }))}
                        aria-label={`Nom de la ligne ${i + 1}`}
                        placeholder={l.type === "signe" ? "f'(x)" : "f"}
                        spellCheck={false}
                        className={`${petitChamp} w-16 font-mono`}
                      />
                      <span className="flex flex-col">
                        <button type="button" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter la ligne" className="text-xs text-muted disabled:opacity-30">
                          ▲
                        </button>
                        <button type="button" onClick={() => deplacer(i, 1)} disabled={i === t.lignes.length - 1} aria-label="Descendre la ligne" className="text-xs text-muted disabled:opacity-30">
                          ▼
                        </button>
                      </span>
                      <button
                        type="button"
                        onClick={() => changer((a) => ({ ...a, lignes: a.lignes.filter((_, j) => j !== i) }))}
                        aria-label={`Supprimer la ligne ${i + 1}`}
                        title="Supprimer la ligne"
                        className="min-h-8 min-w-7 rounded-full text-muted hover:bg-soft"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                  {l.type === "signe"
                    ? l.cases.map((c, k) => (
                        <td key={k}>
                          {k % 2 === 0 ? (
                            <select value={c} onChange={(e) => majCaseSigne(i, k, e.target.value)} aria-label={`Au point ${k / 2 + 1}`} className={`${petitChamp} w-full`}>
                              <option value="">(rien)</option>
                              <option value="0">0</option>
                              <option value="|">| trait</option>
                              <option value="||">|| interdite</option>
                            </select>
                          ) : (
                            <select value={c} onChange={(e) => majCaseSigne(i, k, e.target.value)} aria-label={`Signe sur l'intervalle ${(k + 1) / 2}`} className={`${petitChamp} w-full text-center font-bold`}>
                              <option value="">(rien)</option>
                              <option value="+">+</option>
                              <option value="-">−</option>
                            </select>
                          )}
                        </td>
                      ))
                    : l.cases.map((c, k) => (
                        <Fragment key={k}>
                          <td>
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-0.5">
                                <input
                                  value={c.v}
                                  onChange={(e) => majCaseVariation(i, k, { v: latexSaisi(e.target.value) })}
                                  aria-label={c.barre ? `Limite à gauche au point ${k + 1}` : `Valeur au point ${k + 1}`}
                                  placeholder={c.barre ? "à gauche" : "valeur"}
                                  spellCheck={false}
                                  className={`${petitChamp} w-20 font-mono`}
                                />
                                <ChoixPosition valeur={c.p} onChange={(p) => majCaseVariation(i, k, { p, ...(c.barre ? {} : { p2: p }) })} libelle="Position" />
                              </div>
                              {c.barre ? (
                                <div className="flex items-center gap-0.5">
                                  <input
                                    value={c.v2}
                                    onChange={(e) => majCaseVariation(i, k, { v2: latexSaisi(e.target.value) })}
                                    aria-label={`Limite à droite au point ${k + 1}`}
                                    placeholder="à droite"
                                    spellCheck={false}
                                    className={`${petitChamp} w-20 font-mono`}
                                  />
                                  <ChoixPosition valeur={c.p2} onChange={(p2) => majCaseVariation(i, k, { p2 })} libelle="Position à droite" />
                                </div>
                              ) : null}
                              <label className="flex items-center gap-1 text-xs text-muted">
                                <input
                                  type="checkbox"
                                  checked={c.barre}
                                  onChange={(e) => majCaseVariation(i, k, { barre: e.target.checked, p2: c.p })}
                                />
                                valeur interdite
                              </label>
                            </div>
                          </td>
                          {k < l.cases.length - 1 ? <td aria-hidden="true" className="text-center text-muted">↗↘</td> : null}
                        </Fragment>
                      ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Valeurs en LaTeX : « inf » devient \infty ; \frac{"{1}{2}"}, e^{"{2}"}, \sqrt{"{3}"}. Les flèches suivent les positions (bas → haut : croissante).
        </p>
        {apercu ? (
          <div className="overflow-x-auto">
            <TableauVariations t={t} />
          </div>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

export const VariationsSujet = Node.create({
  name: "variations",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      nomX: { default: VARIATIONS_DEFAUT.nomX },
      x: { default: VARIATIONS_DEFAUT.x },
      lignes: { default: VARIATIONS_DEFAUT.lignes },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="variations"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "variations" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueVariations);
  },
});

/* ---------- Molécule ---------- */

export const MOLECULES: { nom: string; smiles: string }[] = [
  { nom: "Méthane", smiles: "C" },
  { nom: "Éthanol", smiles: "CCO" },
  { nom: "Propan-2-ol", smiles: "CC(O)C" },
  { nom: "Éthanal", smiles: "CC=O" },
  { nom: "Propanone", smiles: "CC(=O)C" },
  { nom: "Acide éthanoïque", smiles: "CC(=O)O" },
  { nom: "Éthanoate d'éthyle", smiles: "CC(=O)OCC" },
  { nom: "Méthylamine", smiles: "CN" },
  { nom: "Éthanamide", smiles: "CC(=O)N" },
  { nom: "Éthène", smiles: "C=C" },
  { nom: "Éthyne", smiles: "C#C" },
  { nom: "Butane", smiles: "CCCC" },
  { nom: "2-méthylpropane", smiles: "CC(C)C" },
  { nom: "Cyclohexane", smiles: "C1CCCCC1" },
  { nom: "Benzène", smiles: "c1ccccc1" },
  { nom: "Phénol", smiles: "Oc1ccccc1" },
  { nom: "Glucose (forme linéaire)", smiles: "OCC(O)C(O)C(O)C(O)C=O" },
  { nom: "Glycine", smiles: "NCC(=O)O" },
  { nom: "Alanine", smiles: "CC(N)C(=O)O" },
  { nom: "Aspirine", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
];

function VueMolecule(props: ReactNodeViewProps) {
  const { smiles, nom, carbones } = props.node.attrs as { smiles: string; nom: string; carbones: boolean };
  const [erreur, setErreur] = useState<string | null>(null);
  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false} onKeyDown={sansEntree}>
        <Poignee />
        <span className="text-sm font-bold">Molécule</span>
        <select
          value=""
          onChange={(e) => {
            const m = MOLECULES.find((x) => x.smiles === e.target.value);
            if (m) props.updateAttributes({ smiles: m.smiles, nom: m.nom });
          }}
          aria-label="Molécules courantes"
          className={`${champ} max-w-40`}
        >
          <option value="">Modèles…</option>
          {MOLECULES.map((m) => (
            <option key={m.smiles} value={m.smiles}>
              {m.nom}
            </option>
          ))}
        </select>
        <input
          value={smiles}
          onChange={(e) => props.updateAttributes({ smiles: e.target.value.replace(/\s/g, "").slice(0, 500) })}
          placeholder="SMILES (CCO)"
          aria-label="Formule SMILES"
          aria-invalid={erreur ? true : undefined}
          spellCheck={false}
          autoCapitalize="off"
          className={`${champ} w-40 font-mono`}
        />
        <input
          value={nom}
          onChange={(e) => props.updateAttributes({ nom: e.target.value.slice(0, 200) })}
          placeholder="Nom ou légende"
          aria-label="Nom de la molécule"
          className={`${champ} min-w-32 flex-1`}
        />
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={carbones} onChange={(e) => props.updateAttributes({ carbones: e.target.checked })} />
          Carbones
        </label>
        <a
          href="https://fr.wikipedia.org/wiki/Simplified_Molecular_Input_Line_Entry_Specification"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted underline underline-offset-4"
        >
          Aide SMILES
        </a>
        <Commandes props={props} libelle="la molécule" />
      </div>
      <div contentEditable={false}>
        <Molecule smiles={smiles} nom={nom} carbones={carbones} onErreur={setErreur} />
        {erreur ? (
          <p role="alert" className="text-sm text-ink-2">
            {erreur}
          </p>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

export const MoleculeSujet = Node.create({
  name: "molecule",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      smiles: { default: "" },
      nom: { default: "" },
      carbones: { default: false },
    };
  },
  parseHTML() {
    return [{ tag: 'figure[data-type="molecule"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "molecule" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueMolecule);
  },
});
