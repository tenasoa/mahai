import { useEffect, useRef, useState } from "react";

import { dessinerMolecule } from "~/lib/document/charger.client";

/**
 * Molécule (formule topologique dessinée par SmilesDrawer dans le navigateur).
 * Sans JavaScript, ou si le dessin échoue, la description SMILES reste lisible.
 */
export function Molecule({
  smiles,
  nom,
  carbones,
  onErreur,
}: {
  smiles: string;
  nom: string;
  carbones: boolean;
  onErreur?: (message: string | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dessine, setDessine] = useState(false);
  useEffect(() => {
    let annule = false;
    if (!smiles.trim()) {
      if (ref.current) ref.current.innerHTML = "";
      setDessine(false);
      onErreur?.(null);
      return;
    }
    const delai = setTimeout(() => {
      dessinerMolecule(smiles, carbones)
        .then((svg) => {
          if (annule || !ref.current) return;
          ref.current.innerHTML = svg;
          setDessine(true);
          onErreur?.(null);
        })
        .catch((e: unknown) => {
          if (annule) return;
          if (ref.current) ref.current.innerHTML = "";
          setDessine(false);
          onErreur?.(e instanceof Error ? e.message : "Formule invalide.");
        });
    }, 150);
    return () => {
      annule = true;
      clearTimeout(delai);
    };
  }, [smiles, carbones, onErreur]);
  return (
    <figure className="molecule">
      {/* Conteneur réservé au dessin : React n'y touche pas. */}
      <div ref={ref} role="img" aria-label={nom || "Molécule"} />
      {dessine || !smiles ? null : <p className="smiles">{smiles}</p>}
      {nom ? <figcaption>{nom}</figcaption> : null}
    </figure>
  );
}
