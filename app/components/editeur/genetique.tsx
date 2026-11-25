import { useState, type KeyboardEvent } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";

import { ArbreGenealogique } from "~/components/document/ArbreGenealogique";
import { EchiquierCroisement } from "~/components/document/EchiquierCroisement";
import {
  ARBRE_DEFAUT,
  ECHIQUIER_DEFAUT,
  MAX_GAMETES,
  MAX_GENERATIONS,
  MAX_PAR_GENERATION,
  deplacerIndividu,
  familles,
  genotype,
  individu,
  insererGamete,
  normaliserArbre,
  normaliserEchiquier,
  retirerGamete,
  retirerGeneration,
  retirerIndividu,
  romain,
  type Echiquier,
  type Etat,
  type Individu,
  type Numerotation,
  type Sexe,
} from "~/lib/document/genetique";
import { Commandes, Poignee } from "./noeuds";

/** Blocs de génétique (SVT) : arbre généalogique et échiquier de croisement. */

const bouton = "min-h-9 rounded-full bg-soft px-3 text-sm font-medium hover:bg-line";
const petitBouton = "min-h-8 min-w-8 rounded-full text-sm text-muted hover:bg-soft disabled:opacity-30";
const petitChamp = "h-8 min-w-0 rounded-lg border-2 border-line bg-surface px-1.5 text-sm focus:border-ink";

const sansEntree = (e: KeyboardEvent) => {
  if (e.key === "Enter") e.preventDefault();
};

/** Relit le nœud au moment du changement (saisies rapides : pas d'état périmé). */
function useChanger<T>(props: ReactNodeViewProps, normaliser: (a: Record<string, unknown> | undefined) => T) {
  return (f: (t: T) => T) => {
    const pos = props.getPos();
    const noeud = typeof pos === "number" ? props.editor.state.doc.nodeAt(pos) : null;
    props.updateAttributes(f(normaliser(noeud?.attrs ?? props.node.attrs)) as Record<string, unknown>);
  };
}

/* ---------- Arbre généalogique ---------- */

const NOMS_SEXE: Record<Sexe, string> = { m: "□ Homme", f: "○ Femme", i: "◇ Inconnu", vide: "Case vide" };
const NOMS_ETAT: Record<Etat, string> = {
  sain: "Sain",
  atteint: "Atteint",
  heterozygote: "Hétérozygote (½)",
  conductrice: "Conductrice (point)",
};

/** Repère d'un individu dans l'éditeur (« II-3 »), quelle que soit la numérotation affichée. */
function reperes(g: Individu[], n: number): string[] {
  let k = 0;
  return g.map((ind) => (ind.sexe === "vide" ? "vide" : `${romain(n)}-${++k}`));
}

function VueArbre(props: ReactNodeViewProps) {
  const arbre = normaliserArbre(props.node.attrs);
  const changer = useChanger(props, normaliserArbre);
  const [apercu, setApercu] = useState(true);

  const majIndividu = (g: number, i: number, partiel: Partial<Individu>) =>
    changer((a) => ({
      ...a,
      generations: a.generations.map((liste, n) => (n === g ? liste.map((ind, k) => (k === i ? { ...ind, ...partiel } : ind)) : liste)),
    }));
  const ajouterIndividu = (g: number) =>
    changer((a) => ({
      ...a,
      generations: a.generations.map((liste, n) => {
        if (n !== g || liste.length >= MAX_PAR_GENERATION) return liste;
        // Même parents que le dernier : un frère ou une sœur.
        const dernier = liste[liste.length - 1];
        return [...liste, individu(dernier?.sexe === "m" ? "f" : "m", dernier?.parent ?? null)];
      }),
    }));
  const ajouterGeneration = () =>
    changer((a) => {
      if (a.generations.length >= MAX_GENERATIONS) return a;
      const parents = familles(a.generations[a.generations.length - 1]!)[0];
      return { ...a, generations: [...a.generations, [individu("m", parents?.[0] ?? null)]] };
    });

  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false} onKeyDown={sansEntree}>
        <Poignee />
        <span className="text-sm font-bold">Arbre généalogique</span>
        <span className="flex-1" />
        <select
          value={arbre.numerotation}
          onChange={(e) => changer((a) => ({ ...a, numerotation: e.target.value as Numerotation }))}
          aria-label="Numérotation des individus"
          className={petitChamp}
        >
          <option value="generation">Numéros par génération</option>
          <option value="continue">Numéros continus</option>
          <option value="aucune">Sans numéros</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm">
          <input type="checkbox" checked={arbre.legende} onChange={(e) => changer((a) => ({ ...a, legende: e.target.checked }))} />
          Légende
        </label>
        <button type="button" onClick={() => setApercu(!apercu)} aria-pressed={apercu} className={bouton}>
          Aperçu
        </button>
        <Commandes props={props} libelle="l'arbre" />
      </div>
      <div contentEditable={false} className="contenu flex flex-col gap-3" onKeyDown={sansEntree}>
        {arbre.generations.map((gen, g) => {
          const noms = reperes(gen, g);
          const avant = arbre.generations[g - 1];
          const choixParents = avant ? familles(avant) : [];
          const nomsAvant = avant ? reperes(avant, g - 1) : [];
          return (
            <fieldset key={g} className="flex flex-col gap-2 rounded-card border-2 border-line p-2">
              <legend className="flex items-center gap-1 px-1 text-sm font-bold">
                Génération {romain(g)}
                {arbre.generations.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => changer((a) => retirerGeneration(a, g))}
                    aria-label={`Supprimer la génération ${romain(g)}`}
                    title="Supprimer la génération"
                    className={petitBouton}
                  >
                    ✕
                  </button>
                ) : null}
              </legend>
              <ul className="liste-outil flex flex-wrap items-start gap-2">
                {gen.map((ind, i) => {
                  const suivant = gen[i + 1];
                  const peutUnir = ind.sexe !== "vide" && suivant && suivant.sexe !== "vide";
                  return (
                    <li key={i} className="flex w-44 flex-col gap-1 rounded-xl bg-soft p-2">
                      <div className="flex items-center gap-0.5">
                        <span className="flex-1 text-sm font-bold">{noms[i]}</span>
                        <button type="button" onClick={() => changer((a) => deplacerIndividu(a, g, i, -1))} disabled={i === 0} aria-label={`Déplacer ${noms[i]} à gauche`} className={petitBouton}>
                          ◀
                        </button>
                        <button type="button" onClick={() => changer((a) => deplacerIndividu(a, g, i, 1))} disabled={i === gen.length - 1} aria-label={`Déplacer ${noms[i]} à droite`} className={petitBouton}>
                          ▶
                        </button>
                        {gen.length > 1 ? (
                          <button type="button" onClick={() => changer((a) => retirerIndividu(a, g, i))} aria-label={`Supprimer ${noms[i]}`} title="Supprimer" className={petitBouton}>
                            ✕
                          </button>
                        ) : null}
                      </div>
                      <select value={ind.sexe} onChange={(e) => majIndividu(g, i, { sexe: e.target.value as Sexe })} aria-label={`Sexe de ${noms[i]}`} className={petitChamp}>
                        {(Object.keys(NOMS_SEXE) as Sexe[]).map((s) => (
                          <option key={s} value={s}>
                            {NOMS_SEXE[s]}
                          </option>
                        ))}
                      </select>
                      {ind.sexe !== "vide" ? (
                        <>
                          <select value={ind.etat} onChange={(e) => majIndividu(g, i, { etat: e.target.value as Etat })} aria-label={`Phénotype de ${noms[i]}`} className={petitChamp}>
                            {(Object.keys(NOMS_ETAT) as Etat[]).map((s) => (
                              <option key={s} value={s}>
                                {NOMS_ETAT[s]}
                              </option>
                            ))}
                          </select>
                          {g > 0 ? (
                            <select
                              value={ind.parent === null ? "" : String(choixParents.find((f) => f.includes(ind.parent!))?.[0] ?? "")}
                              onChange={(e) => majIndividu(g, i, { parent: e.target.value === "" ? null : Number(e.target.value) })}
                              aria-label={`Parents de ${noms[i]}`}
                              className={petitChamp}
                            >
                              <option value="">Parents : aucun</option>
                              {choixParents.map((f) => (
                                <option key={f[0]} value={f[0]}>
                                  Parents : {f.map((k) => nomsAvant[k]).join(" × ")}
                                </option>
                              ))}
                            </select>
                          ) : null}
                          <input
                            value={ind.nom}
                            onChange={(e) => majIndividu(g, i, { nom: e.target.value })}
                            placeholder="Génotype, prénom…"
                            aria-label={`Texte sous ${noms[i]}`}
                            maxLength={20}
                            className={petitChamp}
                          />
                          <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" checked={ind.decede} onChange={(e) => majIndividu(g, i, { decede: e.target.checked })} />
                            Décédé(e)
                          </label>
                          {peutUnir ? (
                            <label className="flex items-center gap-1 text-xs">
                              <input type="checkbox" checked={ind.uni} onChange={(e) => majIndividu(g, i, { uni: e.target.checked })} />
                              Uni(e) à {noms[i + 1]}
                            </label>
                          ) : null}
                          {ind.uni ? (
                            <label className="flex items-center gap-1 text-xs">
                              <input type="checkbox" checked={ind.consanguin} onChange={(e) => majIndividu(g, i, { consanguin: e.target.checked })} />
                              Union consanguine
                            </label>
                          ) : null}
                        </>
                      ) : null}
                    </li>
                  );
                })}
                {gen.length < MAX_PAR_GENERATION ? (
                  <li className="flex items-center self-center">
                    <button type="button" onClick={() => ajouterIndividu(g)} className={bouton}>
                      + Individu
                    </button>
                  </li>
                ) : null}
              </ul>
            </fieldset>
          );
        })}
        {arbre.generations.length < MAX_GENERATIONS ? (
          <button type="button" onClick={ajouterGeneration} className={`${bouton} self-start`}>
            + Génération
          </button>
        ) : null}
        {apercu ? (
          <div className="figure-arbre overflow-x-auto">
            <ArbreGenealogique arbre={arbre} />
          </div>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

const attributs = (defaut: Record<string, unknown>) => () =>
  Object.fromEntries(Object.entries(defaut).map(([cle, v]) => [cle, { default: v }]));

export const ArbreSujet = Node.create({
  name: "arbre",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes: attributs(ARBRE_DEFAUT as unknown as Record<string, unknown>),
  parseHTML() {
    return [{ tag: 'figure[data-type="arbre"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["figure", mergeAttributes(HTMLAttributes, { "data-type": "arbre" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueArbre);
  },
});

/* ---------- Échiquier de croisement ---------- */

function VueEchiquier(props: ReactNodeViewProps) {
  const e = normaliserEchiquier(props.node.attrs);
  const changer = useChanger(props, normaliserEchiquier);
  const [apercu, setApercu] = useState(true);

  const majGamete = (sens: "colonnes" | "lignes", k: number, partiel: Partial<Echiquier["colonnes"][number]>) =>
    changer((a) => ({ ...a, [sens]: a[sens].map((x, j) => (j === k ? { ...x, ...partiel } : x)) }));
  const majCase = (i: number, j: number, partiel: Partial<Echiquier["cases"][number][number]>) =>
    changer((a) => ({
      ...a,
      cases: a.cases.map((l, n) => (n === i ? l.map((c, m) => (m === j ? { ...c, ...partiel } : c)) : l)),
    }));

  // Fonction et non composant : un composant déclaré ici serait recréé à chaque frappe (focus perdu).
  function entete(sens: "colonnes" | "lignes", k: number) {
    const g = e[sens][k]!;
    const nombre = e[sens].length;
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-0.5">
          <input
            value={g.g}
            onChange={(ev) => majGamete(sens, k, { g: ev.target.value })}
            aria-label={`Gamète ${k + 1} (${sens === "colonnes" ? "colonne" : "ligne"})`}
            placeholder="A"
            spellCheck={false}
            className={`${petitChamp} w-20 font-mono`}
          />
          {nombre > 1 ? (
            <button
              type="button"
              onClick={() => changer((a) => retirerGamete(a, sens === "colonnes" ? "colonne" : "ligne", k))}
              aria-label={`Retirer le gamète ${k + 1}`}
              title="Retirer"
              className={petitBouton}
            >
              ✕
            </button>
          ) : null}
        </div>
        <input
          value={g.f}
          onChange={(ev) => majGamete(sens, k, { f: ev.target.value })}
          aria-label={`Fréquence du gamète ${k + 1}`}
          placeholder="fréquence"
          spellCheck={false}
          className={`${petitChamp} w-20 text-xs`}
        />
      </div>
    );
  }

  return (
    <NodeViewWrapper className="bloc-outil" data-drag-handle="">
      <div className="entete-bloc" contentEditable={false}>
        <Poignee />
        <span className="text-sm font-bold">Échiquier de croisement</span>
        <span className="flex-1" />
        {e.colonnes.length < MAX_GAMETES ? (
          <button type="button" onClick={() => changer((a) => insererGamete(a, "colonne"))} className={bouton}>
            + Colonne
          </button>
        ) : null}
        {e.lignes.length < MAX_GAMETES ? (
          <button type="button" onClick={() => changer((a) => insererGamete(a, "ligne"))} className={bouton}>
            + Ligne
          </button>
        ) : null}
        <button type="button" onClick={() => setApercu(!apercu)} aria-pressed={apercu} className={bouton}>
          Aperçu
        </button>
        <Commandes props={props} libelle="l'échiquier" />
      </div>
      <div contentEditable={false} className="contenu flex flex-col gap-3" onKeyDown={sansEntree}>
        <div className="overflow-x-auto">
          <table className="edition-variations">
            <tbody>
              <tr>
                <th scope="col">
                  <div className="flex flex-col gap-0.5">
                    <input
                      value={e.nomColonnes}
                      onChange={(ev) => changer((a) => ({ ...a, nomColonnes: ev.target.value }))}
                      aria-label="Titre des colonnes"
                      placeholder="Gamètes ♂"
                      className={`${petitChamp} w-28`}
                    />
                    <input
                      value={e.nomLignes}
                      onChange={(ev) => changer((a) => ({ ...a, nomLignes: ev.target.value }))}
                      aria-label="Titre des lignes"
                      placeholder="Gamètes ♀"
                      className={`${petitChamp} w-28`}
                    />
                  </div>
                </th>
                {e.colonnes.map((_, j) => (
                  <th key={j} scope="col">
                    {entete("colonnes", j)}
                  </th>
                ))}
              </tr>
              {e.lignes.map((l, i) => (
                <tr key={i}>
                  <th scope="row">
                    {entete("lignes", i)}
                  </th>
                  {e.colonnes.map((c, j) => {
                    const cas = e.cases[i]![j]!;
                    return (
                      <td key={j}>
                        <div className="flex flex-col gap-0.5">
                          <input
                            value={cas.geno}
                            onChange={(ev) => majCase(i, j, { geno: ev.target.value })}
                            aria-label={`Génotype, ligne ${i + 1}, colonne ${j + 1}`}
                            placeholder={c.g && l.g ? genotype(c.g, l.g) : "génotype"}
                            spellCheck={false}
                            className={`${petitChamp} w-28 font-mono`}
                          />
                          <input
                            value={cas.pheno}
                            onChange={(ev) => majCase(i, j, { pheno: ev.target.value })}
                            aria-label={`Phénotype, ligne ${i + 1}, colonne ${j + 1}`}
                            placeholder="[phénotype]"
                            className={`${petitChamp} w-28`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">
          Génotype vide : déduit des gamètes. « A//a » sépare les chromosomes homologues, « ; » les gènes
          (« A//a;B//b »). Gamètes « A B » (gènes indépendants) ou « AB » (gènes liés). LaTeX accepté : X^A, \overline{"{a}"}.
        </p>
        {apercu ? (
          <div className="overflow-x-auto">
            <EchiquierCroisement e={e} />
          </div>
        ) : null}
      </div>
    </NodeViewWrapper>
  );
}

export const EchiquierSujet = Node.create({
  name: "echiquier",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes: attributs(ECHIQUIER_DEFAUT as unknown as Record<string, unknown>),
  parseHTML() {
    return [{ tag: 'div[data-type="echiquier"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "echiquier" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(VueEchiquier);
  },
});
