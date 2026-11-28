import { useEffect, useState } from "react";

import { SvgOptique } from "~/components/document/SvgOptique";
import { LIMITES_OPTIQUE, OPTIQUE_DEFAUT, ecrireNombre, images, normaliserOptique, type GenreObjet, type Lentille, type Optique } from "~/lib/document/optique";
import { BoutonModele, DialogueDessin } from "./DialogueDessin";
import { Nombre, Section, Supprimer, champ, ligne } from "./DialogueGraphique";

/** Éditeur d'un banc d'optique : lentilles, objet, options d'affichage ; aperçu et image calculée. */

export type OptiqueEnCours = { attrs: Record<string, unknown> | null; pos?: number };

const base = { foyers: true, graduation: 0, alt: "" };
const MODELES: { nom: string; o: Optique }[] = [
  { nom: "Convergente", o: { ...base, lentilles: [{ x: 0, f: 10 }], objet: { genre: "reel", x: -25, h: 4, angle: 10 }, rayons: true, image: true } },
  { nom: "Loupe", o: { ...base, lentilles: [{ x: 0, f: 10 }], objet: { genre: "reel", x: -6, h: 2, angle: 10 }, rayons: true, image: true } },
  { nom: "Divergente", o: { ...base, lentilles: [{ x: 0, f: -10 }], objet: { genre: "reel", x: -20, h: 4, angle: 10 }, rayons: true, image: true } },
  { nom: "Objet à l'infini", o: { ...base, lentilles: [{ x: 0, f: 10 }], objet: { genre: "infini", x: -25, h: 4, angle: 12 }, rayons: true, image: true } },
  {
    nom: "Deux lentilles",
    o: { ...base, lentilles: [{ x: 0, f: 8 }, { x: 36, f: 6 }], objet: { genre: "reel", x: -12, h: 2, angle: 10 }, rayons: true, image: true },
  },
  { nom: "À construire", o: { ...base, lentilles: [{ x: 0, f: 10 }], objet: { genre: "reel", x: -25, h: 4, angle: 10 }, rayons: false, image: false } },
];

const GENRES: { id: GenreObjet; nom: string }[] = [
  { id: "reel", nom: "Objet AB" },
  { id: "infini", nom: "Objet à l'infini" },
  { id: "aucun", nom: "Pas d'objet" },
];

/** Résultat pour le professeur : position, taille et nature de chaque image. */
function Resultats({ o }: { o: Optique }) {
  const ls = [...o.lentilles].sort((a, b) => a.x - b.x);
  const imgs = images({ ...o, lentilles: ls });
  if (!imgs.length) return null;
  return (
    <div className="rounded-2xl bg-soft p-3 text-sm" aria-live="polite">
      <p className="font-bold">Image calculée</p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {imgs.map((im, i) => {
          const nom = i === imgs.length - 1 ? "A'B'" : `A${i + 1}B${i + 1}`;
          const lentille = ls.length > 1 ? ` (par L${i + 1})` : "";
          if (im.infini) return <li key={i}>{nom}{lentille} : à l'infini</li>;
          const avant = i === 0 ? (o.objet.genre === "reel" ? o.objet.h : null) : (imgs[i - 1]!.infini ? null : (imgs[i - 1] as { h: number }).h);
          const gamma = avant ? im.h / avant : null;
          const sens = gamma === null ? "" : gamma < 0 ? ", renversée" : ", droite";
          return (
            <li key={i}>
              {nom}
              {lentille} : O{ls.length > 1 ? i + 1 : ""}A{i === imgs.length - 1 ? "'" : i + 1} = {ecrireNombre(im.x - ls[i]!.x)}, hauteur {ecrireNombre(im.h)}
              {gamma !== null ? `, γ = ${ecrireNombre(gamma)}` : ""} — {im.reelle ? "réelle" : "virtuelle"}
              {sens}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DialogueOptique({
  optique,
  onValider,
  onFermer,
}: {
  optique: OptiqueEnCours | null;
  onValider: (o: Optique) => void;
  onFermer: () => void;
}) {
  const [o, setO] = useState<Optique>(OPTIQUE_DEFAUT);
  useEffect(() => {
    if (optique) setO(optique.attrs ? normaliserOptique(optique.attrs) : OPTIQUE_DEFAUT);
  }, [optique]);

  const majLentille = (i: number, p: Partial<Lentille>) => setO((x) => ({ ...x, lentilles: x.lentilles.map((l, k) => (k === i ? { ...l, ...p } : l)) }));
  const majObjet = (p: Partial<Optique["objet"]>) => setO((x) => ({ ...x, objet: { ...x.objet, ...p } }));
  const derniere = o.lentilles[o.lentilles.length - 1]!;

  return (
    <DialogueDessin
      ouvert={Boolean(optique)}
      titre={optique?.pos === undefined ? "Nouveau schéma d'optique" : "Modifier le schéma d'optique"}
      nouveau={optique?.pos === undefined}
      modeles={MODELES.map((m) => (
        <BoutonModele key={m.nom} onClick={() => setO((x) => ({ ...m.o, alt: x.alt }))}>
          {m.nom}
        </BoutonModele>
      ))}
      formulaire={
        <>
          <p className="text-xs text-muted">
            Abscisses et hauteurs dans l'unité de l'énoncé (cm), mesurées sur l'axe orienté de gauche à droite. Distance focale f'
            positive : lentille convergente ; négative : divergente.
          </p>
          <Section
            titre="Lentilles"
            ajouter={o.lentilles.length < LIMITES_OPTIQUE.lentilles ? () => setO((x) => ({ ...x, lentilles: [...x.lentilles, { x: derniere.x + 20, f: 10 }] })) : undefined}
          >
            {o.lentilles.map((l, i) => (
              <div key={i} className={ligne}>
                <span className="w-8 text-sm font-bold">{o.lentilles.length > 1 ? `L${i + 1}` : "L"}</span>
                <span className="text-sm text-muted">position</span>
                <Nombre valeur={l.x} onChange={(n) => majLentille(i, { x: n ?? 0 })} libelle={`Position de la lentille ${i + 1}`} />
                <span className="text-sm text-muted">f' =</span>
                <Nombre valeur={l.f} onChange={(n) => n && majLentille(i, { f: n })} libelle={`Distance focale de la lentille ${i + 1}`} />
                <span className="text-xs text-muted">{l.f > 0 ? "convergente" : "divergente"}</span>
                {o.lentilles.length > 1 ? (
                  <Supprimer onClick={() => setO((x) => ({ ...x, lentilles: x.lentilles.filter((_, k) => k !== i) }))} quoi={`la lentille ${i + 1}`} />
                ) : null}
              </div>
            ))}
          </Section>
          <Section titre="Objet">
            <div className={ligne}>
              <select value={o.objet.genre} onChange={(e) => majObjet({ genre: e.target.value as GenreObjet })} aria-label="Genre d'objet" className={champ}>
                {GENRES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nom}
                  </option>
                ))}
              </select>
              {o.objet.genre === "reel" ? (
                <>
                  <span className="text-sm text-muted">A en</span>
                  <Nombre valeur={o.objet.x} onChange={(n) => majObjet({ x: n ?? 0 })} libelle="Position du point A" />
                  <span className="text-sm text-muted">hauteur AB</span>
                  <Nombre valeur={o.objet.h} onChange={(n) => majObjet({ h: n ?? 0 })} libelle="Hauteur de l'objet AB" />
                </>
              ) : o.objet.genre === "infini" ? (
                <>
                  <span className="text-sm text-muted">inclinaison des rayons</span>
                  <Nombre valeur={o.objet.angle} onChange={(n) => majObjet({ angle: n ?? 0 })} libelle="Inclinaison des rayons en degrés" />
                  <span className="text-sm text-muted">°</span>
                </>
              ) : null}
            </div>
          </Section>
          <fieldset className="flex flex-col gap-2 rounded-2xl border-2 border-line p-3">
            <legend className="px-1 text-sm font-bold">Afficher</legend>
            {(
              [
                ["foyers", "Centre optique et foyers (O, F, F')"],
                ["image", "Image (A'B'), en pointillés si elle est virtuelle"],
                ["rayons", "Rayons de construction (pour le corrigé)"],
              ] as const
            ).map(([cle, texte]) => (
              <label key={cle} className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={o[cle]} onChange={(e) => setO((x) => ({ ...x, [cle]: e.target.checked }))} className="size-5" />
                {texte}
              </label>
            ))}
            <div className={ligne}>
              <span className="text-sm font-medium">Graduations de l'axe tous les</span>
              <Nombre valeur={o.graduation || null} vide onChange={(n) => setO((x) => ({ ...x, graduation: Math.max(0, n ?? 0) }))} libelle="Pas des graduations" />
              <span className="text-sm text-muted">(vide : aucune)</span>
            </div>
          </fieldset>
          <Resultats o={o} />
        </>
      }
      apercu={<SvgOptique o={normaliserOptique(o)} />}
      alt={o.alt}
      onAlt={(alt) => setO((x) => ({ ...x, alt }))}
      exempleAlt="Lentille convergente de distance focale 10 cm, objet AB à 25 cm"
      onValider={() => onValider(normaliserOptique(o))}
      onFermer={onFermer}
    />
  );
}
