import { useId, type ReactNode } from "react";

import {
  cadreFigure,
  calculerFigure,
  couperAuCadre,
  directionNom,
  distance,
  mesuresFigure,
  voisins,
  type Cadre,
  type CalculFigure,
  type Figure,
  type Vec,
} from "~/lib/document/geometrie";

/**
 * Dessin SVG d'une figure de géométrie (rendu serveur, identique dans l'éditeur et chez l'élève).
 * Couleurs par classes CSS (`.geometrie …` dans app.css), jamais en dur.
 */

/** « A1' » → A, indice 1, prime. */
function NomPoint({ nom, x, y }: { nom: string; x: number; y: number }) {
  const m = /^(.)(\d*)('*)$/.exec(nom);
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" className="nom">
      {m ? (
        <>
          {m[1]}
          {m[3] ? "′".repeat(m[3].length) : null}
          {m[2] ? (
            <tspan dy="4" fontSize="0.72em">
              {m[2]}
            </tspan>
          ) : null}
        </>
      ) : (
        nom
      )}
    </text>
  );
}

/** Texte libre : « d_1 » ou « C_{f} » → indice. */
function Texte({ texte, x, y, ancre = "middle" }: { texte: string; x: number; y: number; ancre?: "start" | "middle" | "end" }) {
  if (!texte) return null;
  const m = /^([^_]*)_\{?([^}]*)\}?(.*)$/.exec(texte);
  return (
    <text x={x} y={y} textAnchor={ancre} dominantBaseline="central" className="etiquette">
      {m ? (
        <>
          {m[1]}
          <tspan dy="4" fontSize="0.75em">
            {m[2]}
          </tspan>
          {m[3] ? <tspan dy="-4">{m[3]}</tspan> : null}
        </>
      ) : (
        texte
      )}
    </text>
  );
}

const unitaire = (v: Vec): Vec => {
  const n = Math.hypot(v[0], v[1]);
  return n ? [v[0] / n, v[1] / n] : [1, 0];
};

export type ProprietesFigure = {
  f: Figure;
  /** Cadre imposé (pendant qu'on déplace un point dans l'éditeur, pour que la figure ne bouge pas). */
  cadre?: Cadre;
  /** Éditeur : les points libres peuvent être saisis (`data-point`). */
  interactif?: boolean;
  calcul?: CalculFigure;
};

export function SvgFigure({ f, cadre: impose, interactif = false, calcul: donne }: ProprietesFigure) {
  const id = `f${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const calcul = donne ?? calculerFigure(f);
  const cadre = impose ?? cadreFigure(f, calcul);
  const { k, largeur, hauteur, X, Y } = mesuresFigure(cadre);
  const px = (p: Vec): Vec => [X(p[0]), Y(p[1])];
  const pos = (nom: string) => px(calcul.positions.get(nom)!);

  // Centre de la figure (en pixels), pour écarter les noms et les longueurs vers l'extérieur.
  const tous = [...calcul.positions.values()];
  const centreFigure: Vec = tous.length
    ? [tous.reduce((s, p) => s + p[0], 0) / tous.length, tous.reduce((s, p) => s + p[1], 0) / tous.length]
    : [(cadre.xmin + cadre.xmax) / 2, (cadre.ymin + cadre.ymax) / 2];
  const centre = px(centreFigure);

  /** Normale (pixels) au segment [ab], tournée vers l'extérieur de la figure. */
  const normaleExterieure = (a: Vec, b: Vec): Vec => {
    const u = unitaire([b[0] - a[0], b[1] - a[1]]);
    let n: Vec = [-u[1], u[0]];
    const milieu: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (n[0] * (centre[0] - milieu[0]) + n[1] * (centre[1] - milieu[1]) > 0) n = [-n[0], -n[1]];
    return n;
  };

  const classe = (couleur: number, pointille: boolean) => `trace c${couleur}${pointille ? " pointille" : ""}`;

  const dessins: ReactNode[] = [];
  const codages: ReactNode[] = [];
  const textes: ReactNode[] = [];

  f.elements.forEach((e, i) => {
    if (calcul.erreursElements[i]) return;
    const r = e.refs.map(pos);
    const cle = `e${i}`;

    if (e.type === "segment" || e.type === "vecteur") {
      const [a, b] = r as [Vec, Vec];
      dessins.push(
        <line
          key={cle}
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          className={classe(e.couleur, e.pointille)}
          markerEnd={e.type === "vecteur" ? `url(#${id}-fleche)` : undefined}
        />,
      );
      const n = normaleExterieure(a, b);
      const m: Vec = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (e.codage > 0 && e.type === "segment") {
        const u = unitaire([b[0] - a[0], b[1] - a[1]]);
        // Petits traits obliques, espacés de 4 px, au milieu du segment.
        const oblique: Vec = unitaire([n[0] * 0.94 + u[0] * 0.34, n[1] * 0.94 + u[1] * 0.34]);
        const traits = Array.from({ length: e.codage }, (_, j) => {
          const d = (j - (e.codage - 1) / 2) * 4.5;
          const c: Vec = [m[0] + u[0] * d, m[1] + u[1] * d];
          return `M${(c[0] - oblique[0] * 6).toFixed(1)} ${(c[1] - oblique[1] * 6).toFixed(1)}L${(c[0] + oblique[0] * 6).toFixed(1)} ${(c[1] + oblique[1] * 6).toFixed(1)}`;
        });
        codages.push(<path key={cle} d={traits.join("")} className="codage" />);
      }
      if (e.texte) {
        const ecart = e.codage > 0 ? 18 : 13;
        const t: Vec = [m[0] + n[0] * ecart, m[1] + n[1] * ecart];
        textes.push(<Texte key={cle} texte={e.texte} x={t[0]} y={t[1]} />);
        if (e.type === "vecteur") {
          const l = 4 + e.texte.length * 4.5;
          textes.push(
            <path
              key={`${cle}-f`}
              d={`M${t[0] - l} ${t[1] - 11}H${t[0] + l}m-4 -3l4 3l-4 3`}
              className="fleche-nom"
            />,
          );
        }
      }
      return;
    }

    if (e.type === "droite" || e.type === "demi-droite") {
      const a = calcul.positions.get(e.refs[0]!)!;
      const b = calcul.positions.get(e.refs[1]!)!;
      const morceau = couperAuCadre(a, b, cadre, e.type === "demi-droite");
      if (!morceau) return;
      const [p, q] = morceau.map(px) as [Vec, Vec];
      dessins.push(<line key={cle} x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} className={classe(e.couleur, e.pointille)} />);
      if (e.texte) {
        const n = normaleExterieure(p, q);
        const t: Vec = [p[0] + (q[0] - p[0]) * 0.88 + n[0] * 12, p[1] + (q[1] - p[1]) * 0.88 + n[1] * 12];
        textes.push(<Texte key={cle} texte={e.texte} x={t[0]} y={t[1]} />);
      }
      return;
    }

    if (e.type === "polygone") {
      const d = `${r.map((p, j) => `${j ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("")}Z`;
      dessins.push(<path key={cle} d={d} className={`${classe(e.couleur, e.pointille)}${e.remplir ? " remplir" : ""}`} />);
      if (e.texte) {
        const g: Vec = [r.reduce((s, p) => s + p[0], 0) / r.length, r.reduce((s, p) => s + p[1], 0) / r.length];
        textes.push(<Texte key={cle} texte={e.texte} x={g[0]} y={g[1]} />);
      }
      return;
    }

    if (e.type === "cercle") {
      const c = r[0]!;
      const rayon = e.refs[1] ? distance(c, r[1]!) : e.rayon * k;
      dessins.push(<circle key={cle} cx={c[0]} cy={c[1]} r={rayon} className={classe(e.couleur, e.pointille)} />);
      if (e.texte) {
        textes.push(<Texte key={cle} texte={e.texte} x={c[0] + rayon * 0.74 + 8} y={c[1] - rayon * 0.74 - 8} ancre="start" />);
      }
      return;
    }

    // Angle : A, sommet O, B.
    const [a, o, b] = r as [Vec, Vec, Vec];
    const ua = unitaire([a[0] - o[0], a[1] - o[1]]);
    const ub = unitaire([b[0] - o[0], b[1] - o[1]]);
    let bissectrice: Vec = [ua[0] + ub[0], ua[1] + ub[1]];
    if (Math.hypot(...bissectrice) < 1e-6) bissectrice = [-ua[1], ua[0]];
    bissectrice = unitaire(bissectrice);
    let rayonTexte: number;
    if (e.droit) {
      const s = 11;
      codages.push(
        <path
          key={cle}
          d={`M${o[0] + ua[0] * s} ${o[1] + ua[1] * s}L${o[0] + (ua[0] + ub[0]) * s} ${o[1] + (ua[1] + ub[1]) * s}L${o[0] + ub[0] * s} ${o[1] + ub[1] * s}`}
          className={`angle c${e.couleur}`}
        />,
      );
      rayonTexte = 26;
    } else {
      const sens = ua[0] * ub[1] - ua[1] * ub[0] > 0 ? 1 : 0;
      const arcs = Math.max(1, e.codage);
      const d = Array.from({ length: arcs }, (_, j) => {
        const R = 18 + j * 4;
        return `M${(o[0] + ua[0] * R).toFixed(1)} ${(o[1] + ua[1] * R).toFixed(1)}A${R} ${R} 0 0 ${sens} ${(o[0] + ub[0] * R).toFixed(1)} ${(o[1] + ub[1] * R).toFixed(1)}`;
      }).join("");
      codages.push(<path key={cle} d={d} className={`angle c${e.couleur}`} />);
      rayonTexte = 18 + (arcs - 1) * 4 + 14;
    }
    if (e.texte) {
      textes.push(
        <Texte key={cle} texte={e.texte} x={o[0] + bissectrice[0] * rayonTexte} y={o[1] + bissectrice[1] * rayonTexte} />,
      );
    }
  });

  // Quadrillage d'une unité, s'il reste lisible.
  const grille: ReactNode[] = [];
  if (f.quadrillage && k >= 8) {
    for (let x = Math.ceil(cadre.xmin); x <= cadre.xmax; x++) {
      grille.push(<line key={`x${x}`} x1={X(x)} x2={X(x)} y1={Y(cadre.ymax)} y2={Y(cadre.ymin)} />);
    }
    for (let y = Math.ceil(cadre.ymin); y <= cadre.ymax; y++) {
      grille.push(<line key={`y${y}`} x1={X(cadre.xmin)} x2={X(cadre.xmax)} y1={Y(y)} y2={Y(y)} />);
    }
  }

  const autour = voisins(f, calcul);

  return (
    <svg
      viewBox={`0 0 ${largeur} ${hauteur.toFixed(1)}`}
      className="geometrie"
      role="img"
      aria-label={f.alt || "Figure de géométrie"}
    >
      <defs>
        <marker id={`${id}-fleche`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="pointe" />
        </marker>
      </defs>
      {grille.length ? <g className="grille">{grille}</g> : null}
      <g>{dessins}</g>
      <g>{codages}</g>
      <g>
        {f.points.map((p, i) => {
          if (calcul.erreursPoints[i]) return null;
          const reel = calcul.positions.get(p.nom)!;
          const [x, y] = px(reel);
          const d = directionNom(p, reel, autour.get(p.nom), centreFigure);
          const ecartX = 10 + p.nom.length * 3;
          return (
            <g key={p.nom} data-point={interactif && p.type === "libre" ? p.nom : undefined} className={interactif && p.type === "libre" ? "mobile" : undefined}>
              {interactif && p.type === "libre" ? <circle cx={x} cy={y} r="11" className="prise" /> : null}
              {p.marque === "croix" ? (
                <path d={`M${x - 3.5} ${y - 3.5}l7 7m0 -7l-7 7`} className="croix" />
              ) : p.marque === "point" ? (
                <circle cx={x} cy={y} r="2.8" className="point" />
              ) : null}
              {d ? <NomPoint nom={p.nom} x={x + d[0] * ecartX} y={y - d[1] * 13} /> : null}
            </g>
          );
        })}
      </g>
      <g>{textes}</g>
    </svg>
  );
}
