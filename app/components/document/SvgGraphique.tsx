import { useId } from "react";

import {
  contourAire,
  echantillonner,
  graduations,
  nombreFr,
  type Graphique,
  type Point2,
} from "~/lib/document/graphique";

/**
 * Dessin SVG d'un graphique (rendu serveur, identique dans l'éditeur et chez l'élève).
 * Couleurs par classes CSS (`.graphique …` dans app.css), jamais en dur.
 */

const LARGEUR = 520;
const MARGE = 24;

/** « C_f » ou « C_{f} » → C avec f en indice. */
function Etiquette({ texte, x, y, ancre = "start" }: { texte: string; x: number; y: number; ancre?: "start" | "middle" | "end" }) {
  if (!texte) return null;
  const m = /^([^_]*)_\{?([^}]*)\}?$/.exec(texte);
  return (
    <text x={x} y={y} textAnchor={ancre} className="etiquette">
      {m ? (
        <>
          {m[1]}
          <tspan dy="4" fontSize="0.75em">
            {m[2]}
          </tspan>
        </>
      ) : (
        texte
      )}
    </text>
  );
}

export function SvgGraphique({ g }: { g: Graphique }) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const largeurX = g.xmax - g.xmin;
  const hauteurY = g.ymax - g.ymin;
  const hauteur = g.orthonorme ? Math.min(720, Math.max(140, (LARGEUR * hauteurY) / largeurX)) : 340;
  const X = (x: number) => MARGE + ((x - g.xmin) / largeurX) * LARGEUR;
  const Y = (y: number) => MARGE + ((g.ymax - y) / hauteurY) * hauteur;
  const chemin = (pts: Point2[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join("");

  // Axes : passent par l'origine si elle est visible, sinon au bord de la fenêtre.
  const axeX = g.ymin <= 0 && 0 <= g.ymax ? 0 : g.ymin;
  const axeY = g.xmin <= 0 && 0 <= g.xmax ? 0 : g.xmin;
  const gx = graduations(g.xmin, g.xmax, g.pasX);
  const gy = graduations(g.ymin, g.ymax, g.pasY);
  const origine = axeX === 0 && axeY === 0;
  const droite = MARGE + LARGEUR;
  const bas = MARGE + hauteur;

  const traces = g.courbes.map((c) => echantillonner(g, c));

  /** Position de l'étiquette d'une courbe : vers la fin de sa partie visible. */
  function placeEtiquette(morceaux: Point2[][]): Point2 | null {
    const visibles = morceaux.flat().filter(([x, y]) => y >= g.ymin && y <= g.ymax && x >= g.xmin && x <= g.xmax);
    return visibles[Math.floor(visibles.length * 0.85)] ?? null;
  }

  return (
    <svg
      viewBox={`0 0 ${LARGEUR + 2 * MARGE} ${hauteur + 2 * MARGE}`}
      className="graphique"
      role="img"
      aria-label={g.alt || "Graphique"}
    >
      <defs>
        <clipPath id={`${id}-fenetre`}>
          <rect x={MARGE} y={MARGE} width={LARGEUR} height={hauteur} />
        </clipPath>
        <marker id={`${id}-fleche`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="pointe" />
        </marker>
      </defs>

      {g.grille ? (
        <g className="grille">
          {gx.map((v) => (
            <line key={`x${v}`} x1={X(v)} x2={X(v)} y1={MARGE} y2={bas} />
          ))}
          {gy.map((v) => (
            <line key={`y${v}`} x1={MARGE} x2={droite} y1={Y(v)} y2={Y(v)} />
          ))}
        </g>
      ) : null}

      <g clipPath={`url(#${id}-fenetre)`}>
        {g.aires.map((aire, i) => {
          const contour = contourAire(g, aire);
          const c = g.courbes[aire.courbe];
          return contour ? <path key={i} d={`${chemin(contour)}Z`} className={`aire trace-${c?.couleur ?? 0}`} /> : null;
        })}
        {g.asymptotes.map((s, i) =>
          s.sens === "verticale" ? (
            <line key={i} x1={X(s.valeur)} x2={X(s.valeur)} y1={MARGE} y2={bas} className="asymptote" />
          ) : (
            <line key={i} x1={MARGE} x2={droite} y1={Y(s.valeur)} y2={Y(s.valeur)} className="asymptote" />
          ),
        )}
      </g>

      <g className="axes">
        <line x1={MARGE} x2={droite + 6} y1={Y(axeX)} y2={Y(axeX)} markerEnd={`url(#${id}-fleche)`} />
        <line x1={X(axeY)} x2={X(axeY)} y1={bas} y2={MARGE - 6} markerEnd={`url(#${id}-fleche)`} />
        {gx.map((v) => (
          <g key={`x${v}`}>
            <line x1={X(v)} x2={X(v)} y1={Y(axeX) - 3} y2={Y(axeX) + 3} />
            {v === axeY || X(v) > droite - 10 ? null : (
              <text x={X(v)} y={Y(axeX) + 15} textAnchor="middle" className="graduation">
                {nombreFr(v)}
              </text>
            )}
          </g>
        ))}
        {gy.map((v) => (
          <g key={`y${v}`}>
            <line x1={X(axeY) - 3} x2={X(axeY) + 3} y1={Y(v)} y2={Y(v)} />
            {v === axeX || Y(v) < MARGE + 10 ? null : (
              <text x={X(axeY) - 6} y={Y(v) + 4} textAnchor="end" className="graduation">
                {nombreFr(v)}
              </text>
            )}
          </g>
        ))}
        {origine ? (
          <text x={X(0) - 6} y={Y(0) + 15} textAnchor="end" className="graduation">
            O
          </text>
        ) : null}
        <Etiquette texte={g.nomX} x={droite + 2} y={Y(axeX) - 8} ancre="end" />
        <Etiquette texte={g.nomY} x={X(axeY) + 8} y={MARGE + 6} />
      </g>

      <g clipPath={`url(#${id}-fenetre)`}>
        {g.cercles.map((c, i) => (
          <ellipse
            key={i}
            cx={X(c.x)}
            cy={Y(c.y)}
            rx={(c.r / largeurX) * LARGEUR}
            ry={(c.r / hauteurY) * hauteur}
            className="trace trace-0"
          />
        ))}
        {traces.map((morceaux, i) =>
          morceaux.map((pts, j) => (
            <path
              key={`${i}-${j}`}
              d={chemin(pts)}
              className={`trace trace-${g.courbes[i]!.couleur}${g.courbes[i]!.pointille ? " pointille" : ""}`}
            />
          )),
        )}
        {g.points.map((p, i) =>
          p.projections ? (
            <path
              key={i}
              d={`M${X(p.x)} ${Y(p.y)}V${Y(axeX)}M${X(p.x)} ${Y(p.y)}H${X(axeY)}`}
              className="projection"
            />
          ) : null,
        )}
        {g.segments.map((s, i) => (
          <line
            key={i}
            x1={X(s.x1)}
            y1={Y(s.y1)}
            x2={X(s.x2)}
            y2={Y(s.y2)}
            className="segment"
            markerEnd={s.vecteur ? `url(#${id}-fleche)` : undefined}
          />
        ))}
      </g>

      <g>
        {traces.map((morceaux, i) => {
          const pos = placeEtiquette(morceaux);
          const c = g.courbes[i]!;
          if (!pos || !c.nom) return null;
          const proche = X(pos[0]) > droite - 40;
          return (
            <Etiquette key={i} texte={c.nom} x={X(pos[0]) + (proche ? -8 : 8)} y={Y(pos[1]) - 8} ancre={proche ? "end" : "start"} />
          );
        })}
        {g.cercles.map((c, i) =>
          c.nom ? <Etiquette key={i} texte={c.nom} x={X(c.x + c.r * Math.SQRT1_2) + 4} y={Y(c.y + c.r * Math.SQRT1_2) - 4} /> : null,
        )}
        {g.segments.map((s, i) =>
          s.nom ? <Etiquette key={i} texte={s.nom} x={(X(s.x1) + X(s.x2)) / 2 + 6} y={(Y(s.y1) + Y(s.y2)) / 2 - 6} /> : null,
        )}
        {g.points.map((p, i) => {
          if (p.x < g.xmin || p.x > g.xmax || p.y < g.ymin || p.y > g.ymax) return null;
          return (
            <g key={i}>
              <circle cx={X(p.x)} cy={Y(p.y)} r="3" className="point" />
              <Etiquette texte={p.nom} x={X(p.x) + 6} y={Y(p.y) - 6} />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
