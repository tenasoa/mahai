import { useEffect, useState } from "react";

import { SvgFrise } from "~/components/document/SvgFrise";
import { FRISE_DEFAUT, LIMITES_FRISE, normaliserFrise, type Frise } from "~/lib/document/frise";
import { BoutonModele, DialogueDessin } from "./DialogueDessin";
import { Nombre, Section, Supprimer, champ, ligne } from "./DialogueGraphique";

/** Éditeur d'une frise chronologique : échelle, périodes, événements, aperçu en direct. */

export type FriseEnCours = { attrs: Record<string, unknown> | null; pos?: number };

const COULEURS = ["Bleu", "Rose", "Vert", "Jaune", "Orange", "Violet"];

const MODELES: { nom: string; f: Omit<Frise, "alt"> }[] = [
  { nom: "XXe siècle", f: FRISE_DEFAUT },
  {
    nom: "Madagascar",
    f: {
      debut: 1880,
      fin: 1980,
      pas: 10,
      periodes: [
        { debut: 1896, fin: 1960, texte: "Colonisation française", couleur: 3 },
        { debut: 1960, fin: 1972, texte: "Première République", couleur: 2 },
      ],
      evenements: [
        { date: 1896, texte: "Madagascar devient colonie française" },
        { date: 1947, texte: "Insurrection" },
        { date: 1960, texte: "Indépendance" },
      ],
    },
  },
  {
    nom: "Antiquité romaine",
    f: {
      debut: -600,
      fin: 600,
      pas: 100,
      periodes: [
        { debut: -509, fin: -27, texte: "République romaine", couleur: 0 },
        { debut: -27, fin: 476, texte: "Empire romain", couleur: 4 },
      ],
      evenements: [
        { date: -52, texte: "Bataille d'Alésia" },
        { date: 476, texte: "Fin de l'Empire romain d'Occident" },
      ],
    },
  },
  { nom: "Vide", f: { debut: 1900, fin: 2000, pas: 10, periodes: [], evenements: [] } },
];

export function DialogueFrise({
  frise,
  onValider,
  onFermer,
}: {
  frise: FriseEnCours | null;
  onValider: (f: Frise) => void;
  onFermer: () => void;
}) {
  const [f, setF] = useState<Frise>(FRISE_DEFAUT);
  useEffect(() => {
    if (frise) setF(frise.attrs ? normaliserFrise(frise.attrs) : FRISE_DEFAUT);
  }, [frise]);

  const apercu = normaliserFrise(f);
  const majPeriode = (i: number, p: Partial<Frise["periodes"][number]>) =>
    setF((a) => ({ ...a, periodes: a.periodes.map((x, j) => (j === i ? { ...x, ...p } : x)) }));
  const majEvenement = (i: number, p: Partial<Frise["evenements"][number]>) =>
    setF((a) => ({ ...a, evenements: a.evenements.map((x, j) => (j === i ? { ...x, ...p } : x)) }));
  const milieu = Math.round((f.debut + f.fin) / 2);

  return (
    <DialogueDessin
      ouvert={Boolean(frise)}
      titre={frise?.pos === undefined ? "Nouvelle frise" : "Modifier la frise"}
      nouveau={frise?.pos === undefined}
      modeles={MODELES.map((m) => (
        <BoutonModele key={m.nom} onClick={() => setF({ ...m.f, alt: f.alt })}>
          {m.nom}
        </BoutonModele>
      ))}
      formulaire={
        <>
          <Section titre="Échelle">
            <div className={ligne}>
              <span className="text-sm text-muted">De</span>
              <Nombre libelle="Première année" valeur={f.debut} onChange={(n) => setF((a) => ({ ...a, debut: Math.round(n ?? 0) }))} className="w-20" />
              <span className="text-sm text-muted">à</span>
              <Nombre libelle="Dernière année" valeur={f.fin} onChange={(n) => setF((a) => ({ ...a, fin: Math.round(n ?? 0) }))} className="w-20" />
              <span className="text-sm text-muted">graduée tous les</span>
              <Nombre libelle="Pas des graduations (années)" valeur={f.pas} onChange={(n) => setF((a) => ({ ...a, pas: Math.round(n ?? 1) }))} className="w-16" />
              <span className="text-sm text-muted">ans</span>
            </div>
            <p className="text-xs text-muted">Avant notre ère : année négative (−52 s'affiche « 52 av. J.-C. »).</p>
            {f.debut >= f.fin ? (
              <p role="alert" className="text-sm text-ink-2">
                La première année doit précéder la dernière (échelle par défaut affichée).
              </p>
            ) : null}
          </Section>

          <Section
            titre="Périodes"
            ajouter={
              f.periodes.length < LIMITES_FRISE.periodes
                ? () =>
                    setF((a) => ({
                      ...a,
                      periodes: [...a.periodes, { debut: milieu, fin: milieu + a.pas, texte: "", couleur: a.periodes.length % COULEURS.length }],
                    }))
                : undefined
            }
          >
            {f.periodes.map((p, i) => (
              <div key={i} className={ligne}>
                <Nombre libelle="Début de la période" valeur={p.debut} onChange={(n) => majPeriode(i, { debut: Math.round(n ?? 0) })} className="w-20" />
                <span className="text-sm text-muted">→</span>
                <Nombre libelle="Fin de la période" valeur={p.fin} onChange={(n) => majPeriode(i, { fin: Math.round(n ?? 0) })} className="w-20" />
                <input
                  value={p.texte}
                  onChange={(e) => majPeriode(i, { texte: e.target.value })}
                  maxLength={LIMITES_FRISE.texte}
                  aria-label="Nom de la période"
                  placeholder="Nom de la période"
                  className={`${champ} flex-1`}
                />
                <select value={p.couleur} onChange={(e) => majPeriode(i, { couleur: Number(e.target.value) })} aria-label="Couleur" className={champ}>
                  {COULEURS.map((c, k) => (
                    <option key={k} value={k}>
                      {c}
                    </option>
                  ))}
                </select>
                <Supprimer onClick={() => setF((a) => ({ ...a, periodes: a.periodes.filter((_, j) => j !== i) }))} quoi={`la période ${p.texte || i + 1}`} />
              </div>
            ))}
          </Section>

          <Section
            titre="Événements"
            ajouter={
              f.evenements.length < LIMITES_FRISE.evenements
                ? () => setF((a) => ({ ...a, evenements: [...a.evenements, { date: milieu, texte: "" }] }))
                : undefined
            }
          >
            {f.evenements.map((e, i) => (
              <div key={i} className={ligne}>
                <Nombre libelle="Date de l'événement" valeur={e.date} onChange={(n) => majEvenement(i, { date: Math.round(n ?? 0) })} className="w-20" />
                <input
                  value={e.texte}
                  onChange={(ev) => majEvenement(i, { texte: ev.target.value })}
                  maxLength={LIMITES_FRISE.texte}
                  aria-label="Événement"
                  placeholder="Événement"
                  className={`${champ} flex-1`}
                />
                <Supprimer onClick={() => setF((a) => ({ ...a, evenements: a.evenements.filter((_, j) => j !== i) }))} quoi={`l'événement ${e.texte || i + 1}`} />
              </div>
            ))}
            {f.evenements.some((e) => e.date < apercu.debut || e.date > apercu.fin) ||
            f.periodes.some((p) => p.fin < apercu.debut || p.debut > apercu.fin) ? (
              <p className="text-xs text-muted">Ce qui sort de l'échelle n'est pas dessiné.</p>
            ) : null}
          </Section>
        </>
      }
      apercu={<SvgFrise f={apercu} />}
      alt={f.alt}
      onAlt={(alt) => setF((a) => ({ ...a, alt }))}
      exempleAlt="Frise de 1880 à 1980 : colonisation de 1896 à 1960, indépendance en 1960"
      onValider={() => onValider(apercu)}
      onFermer={onFermer}
    />
  );
}
