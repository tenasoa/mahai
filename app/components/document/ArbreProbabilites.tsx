import { disposer, produit, virguleTex, type ArbreProba } from "~/lib/document/probabilites";
import { Tex } from "./Tex";

/**
 * Arbre de probabilités (élève et éditeur) : branches en SVG étiré sur la largeur (traits
 * d'épaisseur constante), noms et probabilités en HTML par-dessus, en LaTeX. Les lignes ont une
 * hauteur fixe en pixels : le texte garde sa taille sur téléphone. Chaque étiquette a un fond
 * qui masque le trait sous elle.
 */
export function ArbreProbabilites({ a }: { a: ArbreProba }) {
  const { noeuds, profondeur, hauteur, yRacine } = disposer(a);
  const colonnes = profondeur + 0.5 + (a.issues ? 1 : 0);
  const pas = 94 / colonnes;
  const X = (d: number) => 3 + d * pas;
  const pc = (y: number) => `${(y / hauteur) * 100}%`;

  return (
    <div className="arbre-proba" role="group" aria-label={a.alt || "Arbre de probabilités"} style={{ height: hauteur, maxWidth: `${(colonnes + 0.5) * 8.5}rem` }}>
      <svg viewBox={`0 0 100 ${hauteur}`} preserveAspectRatio="none" aria-hidden="true">
        {noeuds.map((n, i) => (
          <line key={i} x1={X(n.profondeur - 1)} y1={n.yParent} x2={X(n.profondeur)} y2={n.y} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <span className="racine" style={{ left: `${X(0)}%`, top: pc(yRacine) }} />
      {noeuds.map((n, i) => (
        <span key={`p${i}`} className="proba" style={{ left: `${(X(n.profondeur - 1) + X(n.profondeur)) / 2}%`, top: pc((n.yParent + n.y) / 2) }}>
          {n.p ? <Tex latex={virguleTex(n.p)} /> : null}
        </span>
      ))}
      {noeuds.map((n, i) => (
        <span key={`n${i}`} className="evenement" style={{ left: `${X(n.profondeur)}%`, top: pc(n.y) }}>
          {n.nom ? <Tex latex={virguleTex(n.nom)} /> : null}
        </span>
      ))}
      {a.issues
        ? noeuds.map((n, i) => {
            const r = n.feuille ? produit(n.chemin) : null;
            return r ? (
              <span key={`i${i}`} className="issue" style={{ left: `${X(profondeur) + pas * 0.45}%`, top: pc(n.y) }}>
                <Tex latex={r} />
              </span>
            ) : null;
          })
        : null}
    </div>
  );
}
