import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { champ } from "./DialogueGraphique";

/**
 * Cadre commun des dialogues d'un bloc dessiné (frise, diagramme statistique) : modèles en
 * haut, formulaire à gauche, aperçu à droite (le même SVG que chez l'élève), description pour
 * les lecteurs d'écran, puis Annuler / Insérer.
 */
export function DialogueDessin({
  ouvert,
  titre,
  modeles,
  formulaire,
  apercu,
  alt,
  onAlt,
  exempleAlt,
  nouveau,
  onValider,
  onFermer,
}: {
  ouvert: boolean;
  titre: string;
  modeles?: ReactNode;
  formulaire: ReactNode;
  apercu: ReactNode;
  alt: string;
  onAlt: (alt: string) => void;
  exempleAlt: string;
  nouveau: boolean;
  onValider: () => void;
  onFermer: () => void;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialogue.current;
    if (ouvert && d && !d.open) d.showModal();
  }, [ouvert]);
  if (!ouvert) return null;

  // Portail vers <body> : hors du formulaire du sujet (Entrée dans un champ ne l'envoie pas).
  return createPortal(
    <dialog
      ref={dialogue}
      onClose={onFermer}
      aria-labelledby="titre-dessin"
      className="m-auto w-[min(100vw-1.5rem,76rem)] rounded-3xl border-2 border-line bg-surface p-0 text-ink backdrop:bg-ink/40"
    >
      <div className="flex max-h-[calc(100dvh-4rem)] flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="titre-dessin" className="text-lg font-extrabold">
            {titre}
          </h2>
          <span className="flex-1" />
          {modeles ? (
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Modèles">
              {modeles}
            </div>
          ) : null}
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:overflow-hidden">
          <div className="flex flex-col gap-3 md:overflow-y-auto md:pr-1">{formulaire}</div>
          <div className="flex flex-col gap-2 md:overflow-y-auto">
            <div className="rounded-2xl border-2 border-line p-2">{apercu}</div>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Description (pour les lecteurs d'écran)
              <input value={alt} onChange={(e) => onAlt(e.target.value)} maxLength={300} placeholder={exempleAlt} className={champ} />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={onFermer} className="min-h-12 rounded-full bg-soft px-6 font-medium hover:bg-line">
            Annuler
          </button>
          <button type="button" onClick={onValider} className="min-h-12 rounded-full bg-ink px-6 font-bold text-white hover:bg-ink-2">
            {nouveau ? "Insérer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}

export function BoutonModele({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="min-h-9 rounded-full border-2 border-line px-3 text-sm font-medium hover:border-control">
      {children}
    </button>
  );
}
