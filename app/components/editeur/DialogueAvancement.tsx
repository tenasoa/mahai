import { useEffect, useState } from "react";

import { TableauAvancement } from "~/components/document/TableauAvancement";
import {
  AVANCEMENT_DEFAUT,
  LIMITES_AVANCEMENT,
  UNITES_AVANCEMENT,
  normaliserAvancement,
  type Avancement,
  type Espece,
} from "~/lib/document/avancement";
import { BoutonModele, DialogueDessin } from "./DialogueDessin";
import { Nombre, Section, Supprimer, champ } from "./DialogueGraphique";

/** Éditeur d'un tableau d'avancement : espèces, quantités initiales, lignes déduites. */

export type AvancementEnCours = { attrs: Record<string, unknown> | null; pos?: number };

const e = (formule: string, coef: number, reactif: boolean): Espece => ({ formule, coef, reactif, initial: "" });

// Équations seules : les quantités sont celles de l'énoncé, saisies par l'auteur.
const MODELES: { nom: string; especes: Espece[] }[] = [
  { nom: "A + B → C", especes: AVANCEMENT_DEFAUT.especes },
  { nom: "Combustion du méthane", especes: [e("CH4", 1, true), e("O2", 2, true), e("CO2", 1, false), e("H2O", 2, false)] },
  { nom: "Vide", especes: [e("", 1, true), e("", 1, false)] },
];

export function DialogueAvancement({
  avancement,
  onValider,
  onFermer,
}: {
  avancement: AvancementEnCours | null;
  onValider: (t: Avancement) => void;
  onFermer: () => void;
}) {
  const [t, setT] = useState<Avancement>(AVANCEMENT_DEFAUT);
  useEffect(() => {
    if (avancement) setT(avancement.attrs ? normaliserAvancement(avancement.attrs) : AVANCEMENT_DEFAUT);
  }, [avancement]);

  const maj = (i: number, p: Partial<Espece>) => setT((a) => ({ ...a, especes: a.especes.map((x, j) => (j === i ? { ...x, ...p } : x)) }));
  const ajouter = (reactif: boolean) =>
    setT((a) => {
      const especes = [...a.especes, e("", 1, reactif)];
      return { ...a, especes: [...especes.filter((x) => x.reactif), ...especes.filter((x) => !x.reactif)] };
    });
  const plein = t.especes.length >= LIMITES_AVANCEMENT.especes;

  return (
    <DialogueDessin
      ouvert={Boolean(avancement)}
      titre={avancement?.pos === undefined ? "Nouveau tableau d'avancement" : "Modifier le tableau d'avancement"}
      nouveau={avancement?.pos === undefined}
      modeles={MODELES.map((m) => (
        <BoutonModele key={m.nom} onClick={() => setT((a) => ({ ...a, especes: m.especes }))}>
          {m.nom}
        </BoutonModele>
      ))}
      formulaire={
        <>
          <p className="text-xs text-muted">
            Formules comme dans <code>\ce</code> : <code>H2O</code>, <code>Cu^2+</code>, <code>SO4^2-</code>. Quantités : <code>0,5</code>,{" "}
            <code>2,0e-3</code>, <code>n_1</code>, <code>excès</code> ; vide = à compléter par l'élève.
          </p>
          {[true, false].map((reactif) => (
            <Section key={String(reactif)} titre={reactif ? "Réactifs" : "Produits"} ajouter={plein ? undefined : () => ajouter(reactif)}>
              {t.especes.map((x, i) =>
                x.reactif === reactif ? (
                  <div key={i} className="flex flex-wrap items-center gap-1.5">
                    <Nombre libelle="Coefficient" valeur={x.coef} onChange={(n) => maj(i, { coef: Math.max(1, Math.round(n ?? 1)) })} className="w-12" />
                    <input
                      value={x.formule}
                      onChange={(ev) => maj(i, { formule: ev.target.value })}
                      maxLength={LIMITES_AVANCEMENT.texte}
                      aria-label="Formule"
                      placeholder="Formule"
                      className={`${champ} w-28`}
                    />
                    <span className="text-sm text-muted">n₀ =</span>
                    <input
                      value={x.initial}
                      onChange={(ev) => maj(i, { initial: ev.target.value })}
                      maxLength={LIMITES_AVANCEMENT.texte}
                      aria-label={`Quantité initiale de ${x.formule || "l'espèce"}`}
                      placeholder="à compléter"
                      className={`${champ} w-32`}
                    />
                    <Supprimer onClick={() => setT((a) => ({ ...a, especes: a.especes.filter((_, j) => j !== i) }))} quoi={x.formule || "cette espèce"} />
                  </div>
                ) : null,
              )}
            </Section>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              Unité
              <select value={t.unite} onChange={(ev) => setT((a) => ({ ...a, unite: ev.target.value }))} className={champ}>
                {UNITES_AVANCEMENT.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={t.enCours} onChange={(ev) => setT((a) => ({ ...a, enCours: ev.target.checked }))} className="size-5" />
              Remplir « en cours »
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={t.final} onChange={(ev) => setT((a) => ({ ...a, final: ev.target.checked }))} className="size-5" />
              Remplir l'état final
            </label>
          </div>
          <p className="text-xs text-muted">
            x<sub>max</sub> et le réactif limitant sont calculés quand toutes les quantités initiales des réactifs sont des nombres.
          </p>
        </>
      }
      apercu={
        <div className="overflow-x-auto">
          <TableauAvancement t={normaliserAvancement(t)} />
        </div>
      }
      alt={t.alt}
      onAlt={(alt) => setT((a) => ({ ...a, alt }))}
      exempleAlt="Tableau d'avancement de la combustion du méthane"
      onValider={() => onValider(normaliserAvancement(t))}
      onFermer={onFermer}
    />
  );
}

