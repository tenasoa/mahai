import { useId } from "react";

import { anneeFr, graduationsFrise, largeurTexte, ranger, type Frise } from "~/lib/document/frise";

/**
 * Dessin SVG d'une frise chronologique (rendu serveur, identique dans l'éditeur et chez l'élève).
 * Périodes en bandes au-dessus de l'axe, événements en dessous, rangés en lignes pour ne jamais
 * se chevaucher. Couleurs par classes CSS (`.frise …` dans app.css).
 */

const LARGEUR = 640;
const MARGE = 16;
const HAUTEUR_BANDE = 28;
const LIGNE_TEXTE = 17;
const MAX_CARACTERES = 24;

/** Coupe un texte en lignes d'au plus `MAX_CARACTERES` (3 lignes, la dernière abrégée). */
export function couper(texte: string): string[] {
  const lignes: string[] = [];
  let courante = "";
  for (const mot of texte.split(/\s+/).filter(Boolean)) {
    if (courante && (courante + " " + mot).length > MAX_CARACTERES) {
      lignes.push(courante);
      courante = mot;
    } else courante = courante ? `${courante} ${mot}` : mot;
  }
  if (courante) lignes.push(courante);
  if (lignes.length > 3) return [...lignes.slice(0, 2), `${lignes.slice(2).join(" ").slice(0, MAX_CARACTERES - 1)}…`];
  return lignes;
}

export function SvgFrise({ f }: { f: Frise }) {
  const id = `fr${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const gauche = MARGE + 8;
  const droite = LARGEUR + MARGE - 18;
  const X = (a: number) => gauche + ((a - f.debut) / (f.fin - f.debut)) * (droite - gauche);
  const dans = (a: number) => Math.min(droite, Math.max(gauche, X(a)));

  // Périodes : bande de la durée ; le nom à l'intérieur s'il tient, sinon juste après (ou juste
  // avant quand il sortirait du dessin à droite).
  const periodes = f.periodes
    .filter((p) => p.fin >= f.debut && p.debut <= f.fin)
    .map((p) => {
      const x1 = dans(p.debut);
      const x2 = Math.max(dans(p.fin), x1 + 4);
      const l = largeurTexte(p.texte, 12) + 12;
      const place: "dedans" | "apres" | "avant" =
        !p.texte || l <= x2 - x1 ? "dedans" : x2 + l <= LARGEUR + 2 * MARGE || x1 - l < 0 ? "apres" : "avant";
      const occupe: [number, number] =
        place === "dedans" ? [x1, x2] : place === "apres" ? [x1, Math.min(x2 + l, LARGEUR + 2 * MARGE)] : [x1 - l, x2];
      return { ...p, x1, x2, place, occupe };
    });
  const lignesPeriodes = ranger(periodes.map((p) => p.occupe));
  const nbLignesP = periodes.length ? Math.max(...lignesPeriodes) + 1 : 0;

  const axe = MARGE + nbLignesP * (HAUTEUR_BANDE + 6) + (nbLignesP ? 10 : 4);

  // Graduations : toutes marquées, mais une année écrite seulement toutes les `saut` graduations
  // quand les étiquettes (« 600 av. J.-C. ») se chevaucheraient. Largeurs estimées à la taille
  // du téléphone, la plus grande.
  const graduations = graduationsFrise(f);
  const ecartGraduations = (f.pas / (f.fin - f.debut)) * (droite - gauche);
  const plusLarge = Math.max(0, ...graduations.map((a) => largeurTexte(anneeFr(a), 14)));
  const besoin = (plusLarge + 8) / ecartGraduations;
  const saut = [1, 2, 3, 4, 5, 10, 20, 25, 50].find((s) => s >= besoin) ?? 50;

  // Événements : date en gras puis texte, centrés sous leur repère.
  const evenements = f.evenements
    .filter((e) => e.date >= f.debut && e.date <= f.fin)
    .sort((a, b) => a.date - b.date)
    .map((e) => {
      const lignes = couper(e.texte);
      const l = Math.max(largeurTexte(anneeFr(e.date), 13), ...lignes.map((t) => largeurTexte(t, 12))) + 8;
      const x = X(e.date);
      // Étiquette gardée dans le dessin.
      const centre = Math.min(LARGEUR + 2 * MARGE - l / 2 - 2, Math.max(l / 2 + 2, x));
      return { ...e, x, centre, l, lignes };
    });
  const lignesE = ranger(evenements.map((e) => [e.centre - e.l / 2, e.centre + e.l / 2]), 8);
  const nbLignesE = evenements.length ? Math.max(...lignesE) + 1 : 0;
  // Hauteur de chaque ligne d'événements : selon le texte le plus long qu'elle porte.
  const hauteurs = Array.from({ length: nbLignesE }, (_, l) =>
    Math.max(1, ...evenements.filter((_, i) => lignesE[i] === l).map((e) => e.lignes.length)) * LIGNE_TEXTE + LIGNE_TEXTE + 14,
  );
  const debutEvenements = axe + 40;
  const hautLigne = (l: number) => debutEvenements + hauteurs.slice(0, l).reduce((s, h) => s + h, 0);
  const hauteur = hautLigne(nbLignesE) + MARGE - 6;

  return (
    <svg viewBox={`0 0 ${LARGEUR + 2 * MARGE} ${hauteur}`} className="frise" role="img" aria-label={f.alt || "Frise chronologique"}>
      <defs>
        <marker id={`${id}-fleche`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0L10 5L0 10z" className="pointe" />
        </marker>
      </defs>

      {periodes.map((p, i) => {
        const y = axe - 10 - (lignesPeriodes[i]! + 1) * (HAUTEUR_BANDE + 6) + 6;
        return (
          <g key={`p${i}`}>
            <rect x={p.x1} y={y} width={p.x2 - p.x1} height={HAUTEUR_BANDE} rx="6" className={`periode c${p.couleur}`} />
            {p.texte ? (
              <text
                x={p.place === "dedans" ? (p.x1 + p.x2) / 2 : p.place === "apres" ? p.x2 + 6 : p.x1 - 6}
                y={y + HAUTEUR_BANDE / 2}
                textAnchor={p.place === "dedans" ? "middle" : p.place === "apres" ? "start" : "end"}
                dominantBaseline="central"
                className="nom-periode"
              >
                {p.texte}
              </text>
            ) : null}
            {/* Bornes de la période, en pointillés jusqu'à l'axe */}
            <path d={`M${p.x1} ${y + HAUTEUR_BANDE}V${axe}M${p.x2} ${y + HAUTEUR_BANDE}V${axe}`} className="borne" />
          </g>
        );
      })}

      <line x1={MARGE} x2={LARGEUR + MARGE} y1={axe} y2={axe} className="axe" markerEnd={`url(#${id}-fleche)`} />
      {graduations.map((a) => (
        <g key={`g${a}`}>
          <line x1={X(a)} x2={X(a)} y1={axe - 5} y2={axe + 5} className="graduation" />
          {Math.round(a / f.pas) % saut === 0 ? (
            <text
              x={X(a)}
              y={axe + 19}
              // Les étiquettes du bord restent dans le dessin.
              textAnchor={X(a) - largeurTexte(anneeFr(a), 14) / 2 < 0 ? "start" : X(a) + largeurTexte(anneeFr(a), 14) / 2 > LARGEUR + 2 * MARGE ? "end" : "middle"}
              className="annee"
            >
              {anneeFr(a)}
            </text>
          ) : null}
        </g>
      ))}

      {evenements.map((e, i) => {
        const y = hautLigne(lignesE[i]!);
        return (
          <g key={`e${i}`}>
            <path d={`M${e.x} ${axe}V${y - 4}`} className="repere" />
            <circle cx={e.x} cy={axe} r="4.5" className="evenement" />
            <text x={e.centre} y={y + 10} textAnchor="middle" className="date">
              {anneeFr(e.date)}
            </text>
            {e.lignes.map((t, j) => (
              <text key={j} x={e.centre} y={y + 10 + (j + 1) * LIGNE_TEXTE} textAnchor="middle" className="texte">
                {t}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
