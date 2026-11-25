import { useEffect, useRef, useState } from "react";

import { Tex } from "~/components/document/RenduDocument";
import { chargerMathlive } from "~/lib/document/charger.client";

/**
 * Saisie d'une formule.
 * - Maths : éditeur visuel MathLive (clavier mathématique sur téléphone), LaTeX modifiable à côté.
 * - Chimie : notation mhchem `\ce{…}` (équations, isotopes, ions), avec aperçu KaTeX.
 * MathLive n'est chargé qu'à l'ouverture, et seulement dans l'admin.
 */

export type FormuleEnCours = {
  latex: string;
  bloc: boolean;
  /** Position du nœud modifié ; absente pour une nouvelle formule. */
  pos?: number;
  chimie?: boolean;
};

type Mathfield = HTMLElement & { value: string; mathVirtualKeyboardPolicy: string };

const CHIMIE: { libelle: string; texte: string; aide: string }[] = [
  { libelle: "→", texte: " -> ", aide: "Réaction" },
  { libelle: "⇌", texte: " <=> ", aide: "Équilibre" },
  { libelle: "↑", texte: " ^", aide: "Gaz dégagé" },
  { libelle: "↓", texte: " v", aide: "Précipité" },
  { libelle: "Isotope", texte: "^{227}_{90}Th", aide: "Noyau : nombre de masse et numéro atomique" },
  { libelle: "Ion", texte: "Fe^{3+}", aide: "Charge d'un ion" },
  { libelle: "e⁻", texte: "e-", aide: "Électron" },
  { libelle: "État", texte: "_{(aq)}", aide: "État physique" },
  { libelle: "Δ", texte: " ->[\\Delta] ", aide: "Flèche avec condition" },
];

function insererDans(zone: HTMLTextAreaElement, texte: string): string {
  let { selectionStart: debut, selectionEnd: fin } = zone;
  const { value } = zone;
  // Curseur après « \ce{…} » : on écrit dans le bloc, avant l'accolade fermante.
  if (debut === value.length && value.endsWith("}")) debut = fin = value.length - 1;
  const nouveau = value.slice(0, debut) + texte + value.slice(fin);
  requestAnimationFrame(() => {
    zone.focus();
    zone.setSelectionRange(debut + texte.length, debut + texte.length);
  });
  return nouveau;
}

const bouton =
  "inline-flex min-h-10 items-center justify-center rounded-full border-2 border-line px-3.5 text-sm font-medium hover:border-control";

export function DialogueFormule({
  formule,
  onValider,
  onSupprimer,
  onFermer,
}: {
  formule: FormuleEnCours | null;
  onValider: (latex: string, bloc: boolean) => void;
  onSupprimer: () => void;
  onFermer: () => void;
}) {
  const dialogue = useRef<HTMLDialogElement>(null);
  const zoneVisuelle = useRef<HTMLDivElement>(null);
  const zoneTexte = useRef<HTMLTextAreaElement>(null);
  const champ = useRef<Mathfield | null>(null);
  const [latex, setLatex] = useState("");
  const [bloc, setBloc] = useState(false);
  const [chimie, setChimie] = useState(false);
  const [visuelPret, setVisuelPret] = useState(false);
  const latexCourant = useRef(latex);
  latexCourant.current = latex;

  // Ouverture / fermeture.
  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (formule) {
      setLatex(formule.chimie && !formule.latex ? "\\ce{}" : formule.latex);
      setBloc(formule.bloc);
      setChimie(formule.chimie ?? formule.latex.includes("\\ce"));
      if (!d.open) d.showModal();
    } else if (d.open) {
      d.close();
    }
  }, [formule]);

  // Éditeur visuel MathLive, en mode maths seulement.
  useEffect(() => {
    if (!formule || chimie) return;
    let annule = false;
    void (async () => {
      const { MathfieldElement } = await chargerMathlive();
      if (annule || !zoneVisuelle.current) return;
      const mf = new MathfieldElement() as unknown as Mathfield;
      mf.mathVirtualKeyboardPolicy = "auto";
      mf.value = latexCourant.current;
      mf.setAttribute("aria-label", "Formule");
      mf.className = "champ-formule";
      mf.addEventListener("input", () => setLatex(mf.value));
      zoneVisuelle.current.replaceChildren(mf);
      champ.current = mf;
      setVisuelPret(true);
      mf.focus();
    })();
    return () => {
      annule = true;
      champ.current = null;
      setVisuelPret(false);
      zoneVisuelle.current?.replaceChildren();
    };
  }, [formule, chimie]);

  function changerTexte(valeur: string) {
    setLatex(valeur);
    if (champ.current && champ.current.value !== valeur) champ.current.value = valeur;
  }

  function passerEnChimie(oui: boolean) {
    if (oui && !latex.includes("\\ce")) setLatex(latex ? `\\ce{${latex}}` : "\\ce{}");
    setChimie(oui);
  }

  const nouveau = formule?.pos === undefined;

  function valider() {
    if (latex.trim()) onValider(latex.trim(), bloc);
    else onFermer();
  }

  return (
    <dialog
      ref={dialogue}
      onClose={onFermer}
      aria-labelledby="titre-formule"
      className="m-auto w-[min(100vw-1.5rem,40rem)] rounded-3xl border-2 border-line bg-surface p-0 text-ink backdrop:bg-ink/40"
    >
      {/* Pas de <form> : le dialogue est placé dans le formulaire du sujet. */}
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="titre-formule" className="text-lg font-extrabold">
            {nouveau ? "Nouvelle formule" : "Modifier la formule"}
          </h2>
          <div role="group" aria-label="Type de formule" className="flex rounded-full bg-soft p-1">
            {[
              { oui: false, libelle: "Maths" },
              { oui: true, libelle: "Chimie" },
            ].map((m) => (
              <button
                key={m.libelle}
                type="button"
                aria-pressed={chimie === m.oui}
                onClick={() => passerEnChimie(m.oui)}
                className={`min-h-9 rounded-full px-4 text-sm font-bold ${
                  chimie === m.oui ? "bg-surface text-ink" : "text-muted"
                }`}
              >
                {m.libelle}
              </button>
            ))}
          </div>
        </div>

        {chimie ? (
          <div className="flex flex-wrap gap-1.5">
            {CHIMIE.map((c) => (
              <button
                key={c.libelle}
                type="button"
                title={c.aide}
                className={bouton}
                onClick={() => {
                  const zone = zoneTexte.current;
                  if (!zone) return;
                  // Dans \ce{…} : on insère avant l'accolade fermante si le curseur est hors du bloc.
                  changerTexte(insererDans(zone, c.texte));
                }}
              >
                {c.libelle}
              </button>
            ))}
          </div>
        ) : (
          <div className="min-h-14 rounded-2xl border-2 border-control px-3 py-2 text-xl focus-within:border-ink">
            {visuelPret ? null : <span className="text-sm text-muted">Chargement de l'éditeur…</span>}
            {/* Rempli par MathLive hors de React : ne jamais y mettre d'enfant React. */}
            <div ref={zoneVisuelle} />
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {chimie ? "Notation (mhchem)" : "LaTeX"}
          <textarea
            ref={zoneTexte}
            value={latex}
            onChange={(e) => changerTexte(e.target.value)}
            rows={chimie ? 3 : 2}
            onKeyDown={(e) => {
              // Ctrl+Entrée valide ; Entrée seule ne doit pas envoyer le formulaire du sujet.
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                valider();
              }
            }}
            spellCheck={false}
            autoCapitalize="off"
            className="rounded-2xl border-2 border-control bg-soft px-3 py-2 font-mono text-sm focus:border-ink"
          />
        </label>

        {chimie ? (
          <div className="min-h-12 overflow-x-auto rounded-2xl bg-soft px-3 py-3 text-center">
            {latex.trim() ? <Tex key={latex} latex={latex} bloc /> : <span className="text-sm text-muted">Aperçu</span>}
          </div>
        ) : null}

        {nouveau ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={bloc}
              onChange={(e) => setBloc(e.target.checked)}
              className="size-5 accent-ink"
            />
            Centrée sur sa propre ligne
          </label>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2">
          {nouveau ? null : (
            <button
              type="button"
              onClick={onSupprimer}
              className="mr-auto min-h-12 rounded-full px-4 text-sm font-medium text-ink-2 underline underline-offset-4"
            >
              Supprimer la formule
            </button>
          )}
          <button
            type="button"
            onClick={onFermer}
            className="min-h-12 rounded-full bg-soft px-6 font-medium hover:bg-line"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={valider}
            className="min-h-12 rounded-full bg-ink px-6 font-bold text-white hover:bg-ink-2"
          >
            {nouveau ? "Insérer" : "Enregistrer"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
