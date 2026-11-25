import { useEffect, useState } from "react";

import { ArbreProbabilites } from "~/components/document/ArbreProbabilites";
import { LIMITES_PROBA, PROBA_DEFAUT, normaliserProba, type ArbreProba, type Branche } from "~/lib/document/probabilites";
import { BoutonModele, DialogueDessin } from "./DialogueDessin";
import { Section, Supprimer, champ, petit } from "./DialogueGraphique";

/** Éditeur d'un arbre de probabilités : branches imbriquées, aperçu en direct. */

export type ProbaEnCours = { attrs: Record<string, unknown> | null; pos?: number };

/** Arbre complet dont chaque niveau porte les mêmes événements (structure seule, sans probabilités). */
function complet(niveaux: string[][]): Branche[] {
  const [premier, ...suite] = niveaux;
  return (premier ?? []).map((nom) => ({ nom, p: "", enfants: suite.length ? complet(suite) : [] }));
}

const MODELES: { nom: string; branches: Branche[] }[] = [
  { nom: "2 × 2", branches: complet([["A", "\\overline{A}"], ["B", "\\overline{B}"]]) },
  { nom: "3 puis 2", branches: complet([["A", "B", "C"], ["D", "\\overline{D}"]]) },
  { nom: "2 × 2 × 2", branches: complet([["A", "\\overline{A}"], ["B", "\\overline{B}"], ["C", "\\overline{C}"]]) },
  { nom: "Vide", branches: complet([["", ""]]) },
];

type Ligne = { b: Branche; chemin: number[] };

function aplatir(bs: Branche[], chemin: number[] = []): Ligne[] {
  return bs.flatMap((b, i) => [{ b, chemin: [...chemin, i] }, ...aplatir(b.enfants, [...chemin, i])]);
}

/** Applique `f` à la liste qui contient la branche `chemin` (ses sœurs), à l'indice donné. */
function modifier(bs: Branche[], chemin: number[], f: (soeurs: Branche[], i: number) => Branche[]): Branche[] {
  const [i, ...reste] = chemin;
  if (i === undefined) return bs;
  if (!reste.length) return f(bs, i);
  return bs.map((b, k) => (k === i ? { ...b, enfants: modifier(b.enfants, reste, f) } : b));
}

const feuilles = (bs: Branche[]): number => bs.reduce((s, b) => s + (b.enfants.length ? feuilles(b.enfants) : 1), 0);

export function DialogueProba({
  proba,
  onValider,
  onFermer,
}: {
  proba: ProbaEnCours | null;
  onValider: (a: ArbreProba) => void;
  onFermer: () => void;
}) {
  const [a, setA] = useState<ArbreProba>(PROBA_DEFAUT);
  useEffect(() => {
    if (proba) setA(proba.attrs ? normaliserProba(proba.attrs) : PROBA_DEFAUT);
  }, [proba]);

  const plein = feuilles(a.branches) >= LIMITES_PROBA.feuilles;
  const maj = (chemin: number[], p: Partial<Branche>) =>
    setA((x) => ({ ...x, branches: modifier(x.branches, chemin, (s, i) => s.map((b, k) => (k === i ? { ...b, ...p } : b))) }));
  const retirer = (chemin: number[]) => setA((x) => ({ ...x, branches: modifier(x.branches, chemin, (s, i) => s.filter((_, k) => k !== i)) }));
  // Une feuille qui reçoit sa première sous-branche en reçoit deux (une épreuve a au moins deux issues).
  const sousBranche = (chemin: number[]) =>
    setA((x) => ({
      ...x,
      branches: modifier(x.branches, chemin, (s, i) =>
        s.map((b, k) =>
          k === i ? { ...b, enfants: [...b.enfants, ...(b.enfants.length ? [{ nom: "", p: "", enfants: [] }] : [{ nom: "", p: "", enfants: [] }, { nom: "", p: "", enfants: [] }])] } : b,
        ),
      ),
    }));

  return (
    <DialogueDessin
      ouvert={Boolean(proba)}
      titre={proba?.pos === undefined ? "Nouvel arbre de probabilités" : "Modifier l'arbre de probabilités"}
      nouveau={proba?.pos === undefined}
      modeles={MODELES.map((m) => (
        <BoutonModele key={m.nom} onClick={() => setA((x) => ({ ...x, branches: m.branches }))}>
          {m.nom}
        </BoutonModele>
      ))}
      formulaire={
        <>
          <p className="text-xs text-muted">
            Événements et probabilités en LaTeX : <code>\overline{"{A}"}</code>, <code>\frac{"{1}{3}"}</code>, <code>0,3</code>,{" "}
            <code>P_A(B)</code>. Laissez une probabilité vide pour la faire trouver.
          </p>
          <Section
            titre="Branches"
            ajouter={!plein && a.branches.length < LIMITES_PROBA.enfants ? () => setA((x) => ({ ...x, branches: [...x.branches, { nom: "", p: "", enfants: [] }] })) : undefined}
          >
            {aplatir(a.branches).map(({ b, chemin }) => {
              const profondeur = chemin.length;
              const nom = b.nom || `branche ${chemin.map((i) => i + 1).join(".")}`;
              return (
                <div key={chemin.join(".")} className="flex flex-wrap items-center gap-1.5" style={{ paddingLeft: `${(profondeur - 1) * 1.5}rem` }}>
                  <span className="text-muted" aria-hidden="true">
                    {profondeur > 1 ? "└" : "•"}
                  </span>
                  <input
                    value={b.nom}
                    onChange={(e) => maj(chemin, { nom: e.target.value })}
                    maxLength={LIMITES_PROBA.texte}
                    aria-label={`Événement (${nom})`}
                    placeholder="Événement"
                    className={`${champ} w-28`}
                  />
                  <span className="text-sm text-muted">p =</span>
                  <input
                    value={b.p}
                    onChange={(e) => maj(chemin, { p: e.target.value })}
                    maxLength={LIMITES_PROBA.texte}
                    aria-label={`Probabilité de ${nom}`}
                    placeholder="à trouver"
                    className={`${champ} w-24`}
                  />
                  {profondeur < LIMITES_PROBA.profondeur && !plein && b.enfants.length < LIMITES_PROBA.enfants ? (
                    <button type="button" onClick={() => sousBranche(chemin)} className={petit} title="Ajouter une épreuve après cette branche">
                      + Suite
                    </button>
                  ) : null}
                  <Supprimer onClick={() => retirer(chemin)} quoi={`${nom}${b.enfants.length ? " et ses sous-branches" : ""}`} />
                </div>
              );
            })}
          </Section>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={a.issues} onChange={(e) => setA((x) => ({ ...x, issues: e.target.checked }))} className="size-5" />
            Calculer la probabilité de chaque issue (quand celles du chemin sont connues)
          </label>
        </>
      }
      apercu={
        a.branches.length ? (
          <ArbreProbabilites a={normaliserProba(a)} />
        ) : (
          <p className="p-4 text-sm text-muted">Ajoutez une branche pour commencer.</p>
        )
      }
      alt={a.alt}
      onAlt={(alt) => setA((x) => ({ ...x, alt }))}
      exempleAlt="Arbre : A puis B, deux épreuves successives"
      onValider={() => onValider(normaliserProba(a))}
      onFermer={onFermer}
    />
  );
}
