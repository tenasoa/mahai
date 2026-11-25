import type { ReactNode } from "react";

import { echelle, nombreStat, parts, type Statistique } from "~/lib/document/statistique";

/**
 * Dessin SVG d'un diagramme statistique (rendu serveur, identique dans l'éditeur et chez
 * l'élève). Barres et secteurs aux couleurs des tuiles (fond pastel, contour ink), courbes aux
 * couleurs des tracés : classes `.statistique …` dans app.css, jamais de couleur en dur.
 */

const LARGEUR = 600;
const MARGE = 14;

type Pt = [number, number];

function Legende({ noms, x, y, ligne = false }: { noms: string[]; x: number; y: number; ligne?: boolean }) {
  let curseur = x;
  return (
    <g>
      {noms.map((nom, i) => {
        const debut = curseur;
        curseur += 26 + nom.length * 6.6 + 14;
        return (
          <g key={i}>
            {ligne ? (
              <line x1={debut} x2={debut + 18} y1={y} y2={y} className={`ligne l${i}`} />
            ) : (
              <rect x={debut} y={y - 7} width="14" height="14" rx="3" className={`barre s${i}`} />
            )}
            <text x={debut + (ligne ? 24 : 20)} y={y} dominantBaseline="central" className="legende">
              {nom}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Axe vertical gradué (traits de la grille compris). */
function AxeY({
  min,
  max,
  pas,
  Y,
  x,
  x2,
  droite = false,
  facteur = 1,
}: {
  min: number;
  max: number;
  pas: number;
  Y: (v: number) => number;
  x: number;
  x2: number;
  droite?: boolean;
  facteur?: number;
}) {
  const valeurs: number[] = [];
  for (let v = min; v <= max + pas / 1000; v += pas) valeurs.push(Math.round(v * 1e6) / 1e6);
  return (
    <g>
      {valeurs.map((v) => (
        <g key={v}>
          {droite ? null : <line x1={x} x2={x2} y1={Y(v)} y2={Y(v)} className={v === 0 ? "zero" : "grille"} />}
          <text x={droite ? x + 6 : x - 6} y={Y(v)} textAnchor={droite ? "start" : "end"} dominantBaseline="central" className="graduation">
            {nombreStat(v * facteur)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Étiquettes des catégories sous l'axe, inclinées si elles ne tiennent pas. */
function Categories({ noms, X, y, largeur }: { noms: string[]; X: (i: number) => number; y: number; largeur: number }) {
  const incliner = noms.some((n) => n.length * 6.2 > largeur - 4);
  return (
    <g>
      {noms.map((n, i) =>
        incliner ? (
          <text key={i} x={X(i)} y={y} transform={`rotate(-40 ${X(i)} ${y})`} textAnchor="end" className="categorie">
            {n}
          </text>
        ) : (
          <text key={i} x={X(i)} y={y + 4} textAnchor="middle" className="categorie">
            {n}
          </text>
        ),
      )}
    </g>
  );
}

const hauteurCategories = (noms: string[], largeur: number) =>
  noms.some((n) => n.length * 6.2 > largeur - 4) ? Math.min(90, 10 + Math.max(...noms.map((n) => n.length)) * 4.6) : 22;

function BarresOuCourbe({ s }: { s: Statistique }) {
  const series = s.series;
  const toutes = series.flatMap((x) => x.valeurs).filter((v): v is number => v !== null);
  const e = echelle(Math.min(0, ...toutes), Math.max(0, ...toutes));
  const n = Math.max(1, s.categories.length);
  const gauche = MARGE + 8 + Math.max(...[e.min, e.max].map((v) => nombreStat(v).length)) * 6.6;
  const droite = LARGEUR + MARGE;
  const legende = series.length > 1 ? 26 : 0;
  const haut = MARGE + legende + (s.unite ? 20 : 6);
  const largeurCat = (droite - gauche) / n;
  const bas = haut + 240;
  const total = bas + hauteurCategories(s.categories, largeurCat) + MARGE;
  const Y = (v: number) => haut + ((e.max - v) / (e.max - e.min)) * (bas - haut);
  const Xc = (i: number) => gauche + largeurCat * (i + 0.5);
  const elements: ReactNode[] = [];

  if (s.genre === "barres") {
    const groupe = largeurCat * 0.72;
    const l = groupe / Math.max(1, series.length);
    series.forEach((serie, j) =>
      serie.valeurs.forEach((v, i) => {
        if (v === null) return;
        const x = Xc(i) - groupe / 2 + j * l;
        const y = Math.min(Y(v), Y(0));
        elements.push(
          <g key={`${j}-${i}`}>
            <rect x={x} y={y} width={Math.max(1, l - 2)} height={Math.max(0.5, Math.abs(Y(v) - Y(0)))} className={`barre s${j}`} />
            {s.valeurs && l >= 16 ? (
              <text x={x + (l - 2) / 2} y={v >= 0 ? Y(v) - 5 : Y(v) + 12} textAnchor="middle" className="valeur">
                {nombreStat(v)}
              </text>
            ) : null}
          </g>,
        );
      }),
    );
  } else {
    series.forEach((serie, j) => {
      // Une valeur manquante coupe la courbe.
      const morceaux: Pt[][] = [[]];
      serie.valeurs.forEach((v, i) => {
        if (v === null) morceaux.push([]);
        else morceaux.at(-1)!.push([Xc(i), Y(v)]);
      });
      morceaux
        .filter((m) => m.length > 1)
        .forEach((m, k) =>
          elements.push(
            <path key={`${j}-l${k}`} d={m.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("")} className={`ligne l${j}`} />,
          ),
        );
      serie.valeurs.forEach((v, i) => {
        if (v === null) return;
        elements.push(
          <g key={`${j}-p${i}`}>
            <circle cx={Xc(i)} cy={Y(v)} r="3.5" className={`point l${j}`} />
            {s.valeurs ? (
              <text x={Xc(i)} y={Y(v) - 8} textAnchor="middle" className="valeur">
                {nombreStat(v)}
              </text>
            ) : null}
          </g>,
        );
      });
    });
  }

  return (
    <svg viewBox={`0 0 ${LARGEUR + 2 * MARGE} ${total}`} className="statistique" role="img" aria-label={s.alt || "Diagramme"}>
      {legende ? <Legende noms={series.map((x, i) => x.nom || `Série ${i + 1}`)} x={gauche} y={MARGE + 8} ligne={s.genre === "courbe"} /> : null}
      {s.unite ? (
        <text x={gauche - 6} y={haut - 12} textAnchor="start" className="unite">
          {s.unite}
        </text>
      ) : null}
      <AxeY {...e} Y={Y} x={gauche} x2={droite} />
      <line x1={gauche} x2={gauche} y1={haut} y2={bas} className="axe" />
      {elements}
      <Categories noms={s.categories} X={Xc} y={bas + 14} largeur={largeurCat} />
    </svg>
  );
}

function Secteurs({ s }: { s: Statistique }) {
  const valeurs = s.series[0]?.valeurs ?? [];
  const p = parts(valeurs);
  const R = 120;
  const cx = MARGE + R + 10;
  const cy = MARGE + R + 10;
  const lignes = s.categories.length;
  const total = Math.max(cy + R + MARGE + 10, MARGE + 20 + lignes * 24);
  let angle = -Math.PI / 2;
  const point = (a: number, r = R): Pt => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  return (
    <svg viewBox={`0 0 ${LARGEUR + 2 * MARGE} ${total}`} className="statistique" role="img" aria-label={s.alt || "Diagramme en secteurs"}>
      {p.map((part, i) => {
        if (part <= 0) return null;
        const debut = angle;
        angle += part * 2 * Math.PI;
        const milieu = (debut + angle) / 2;
        const etiquette = point(milieu, R * 0.66);
        const forme =
          part >= 0.9999 ? (
            <circle cx={cx} cy={cy} r={R} className={`barre s${i % 8}`} />
          ) : (
            <path
              d={`M${cx} ${cy}L${point(debut).map((v) => v.toFixed(1)).join(" ")}A${R} ${R} 0 ${part > 0.5 ? 1 : 0} 1 ${point(angle)
                .map((v) => v.toFixed(1))
                .join(" ")}Z`}
              className={`barre s${i % 8}`}
            />
          );
        return (
          <g key={i}>
            {forme}
            {part >= 0.05 ? (
              <text x={etiquette[0]} y={etiquette[1]} textAnchor="middle" dominantBaseline="central" className="valeur fort">
                {nombreStat(Math.round(part * 1000) / 10)} %
              </text>
            ) : null}
          </g>
        );
      })}
      {s.categories.map((c, i) => {
        const y = MARGE + 22 + i * 24;
        const x = cx + R + 40;
        const v = valeurs[i];
        return (
          <g key={`l${i}`}>
            <rect x={x} y={y - 7} width="14" height="14" rx="3" className={`barre s${i % 8}`} />
            <text x={x + 22} y={y} dominantBaseline="central" className="legende">
              {c || `Catégorie ${i + 1}`}
              {s.valeurs && v !== null && v !== undefined ? (
                <tspan className="discret">
                  {" "}
                  · {nombreStat(v)}
                  {s.unite ? ` ${s.unite}` : ""}
                </tspan>
              ) : null}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Pyramide({ s }: { s: Statistique }) {
  const [hommes, femmes] = s.series;
  const toutes = [...(hommes?.valeurs ?? []), ...(femmes?.valeurs ?? [])].filter((v): v is number => v !== null).map(Math.abs);
  const e = echelle(0, Math.max(0, ...toutes), 4);
  const n = Math.max(1, s.categories.length);
  const centre = (LARGEUR + 2 * MARGE) / 2;
  const milieu = 34 + Math.max(0, ...s.categories.map((c) => c.length)) * 3.2; // demi-largeur de la colonne des âges
  const demi = centre - MARGE - milieu - 4;
  const haut = MARGE + 30;
  const hauteurBarre = Math.min(22, Math.max(8, 300 / n));
  const bas = haut + n * hauteurBarre;
  const total = bas + 34 + (s.unite ? 18 : 0) + MARGE;
  const L = (v: number) => (Math.abs(v) / e.max) * demi;
  // Catégories de la plus jeune (en bas) à la plus âgée (en haut).
  const Y = (i: number) => bas - (i + 1) * hauteurBarre;
  const graduations: number[] = [];
  for (let v = 0; v <= e.max + e.pas / 1000; v += e.pas) graduations.push(Math.round(v * 1e6) / 1e6);
  return (
    <svg viewBox={`0 0 ${LARGEUR + 2 * MARGE} ${total}`} className="statistique" role="img" aria-label={s.alt || "Pyramide des âges"}>
      <text x={centre - milieu - 4} y={MARGE + 8} textAnchor="end" className="legende fort">
        {hommes?.nom || "Hommes"}
      </text>
      <text x={centre + milieu + 4} y={MARGE + 8} textAnchor="start" className="legende fort">
        {femmes?.nom || "Femmes"}
      </text>
      {graduations.map((v) => (
        <g key={v}>
          <line x1={centre - milieu - L(v)} x2={centre - milieu - L(v)} y1={haut} y2={bas} className="grille" />
          <line x1={centre + milieu + L(v)} x2={centre + milieu + L(v)} y1={haut} y2={bas} className="grille" />
          <text x={centre - milieu - L(v)} y={bas + 16} textAnchor="middle" className="graduation">
            {nombreStat(v)}
          </text>
          <text x={centre + milieu + L(v)} y={bas + 16} textAnchor="middle" className="graduation">
            {nombreStat(v)}
          </text>
        </g>
      ))}
      {s.categories.map((c, i) => {
        const h = hommes?.valeurs[i];
        const f = femmes?.valeurs[i];
        return (
          <g key={i}>
            {h !== null && h !== undefined ? (
              <rect x={centre - milieu - L(h)} y={Y(i) + 1} width={L(h)} height={hauteurBarre - 2} className="barre s0" />
            ) : null}
            {f !== null && f !== undefined ? (
              <rect x={centre + milieu} y={Y(i) + 1} width={L(f)} height={hauteurBarre - 2} className="barre s1" />
            ) : null}
            <text x={centre} y={Y(i) + hauteurBarre / 2} textAnchor="middle" dominantBaseline="central" className="categorie">
              {c}
            </text>
          </g>
        );
      })}
      {s.unite ? (
        <text x={centre} y={bas + 36} textAnchor="middle" className="unite">
          {s.unite}
        </text>
      ) : null}
    </svg>
  );
}

/** Diagramme ombrothermique : précipitations en barres, températures en courbe, échelle P = 2T. */
function Ombrothermique({ s }: { s: Statistique }) {
  const [pluie, temperature] = s.series;
  const P = (pluie?.valeurs ?? []).filter((v): v is number => v !== null);
  const T = (temperature?.valeurs ?? []).filter((v): v is number => v !== null);
  const e = echelle(Math.min(0, ...T.map((t) => 2 * t)), Math.max(0, ...P, ...T.map((t) => 2 * t)));
  const n = Math.max(1, s.categories.length);
  const gauche = MARGE + 8 + Math.max(...[e.min, e.max].map((v) => nombreStat(v).length)) * 6.6;
  const droite = LARGEUR + MARGE - 8 - Math.max(...[e.min / 2, e.max / 2].map((v) => nombreStat(v).length)) * 6.6;
  const haut = MARGE + 46;
  const bas = haut + 240;
  const largeurCat = (droite - gauche) / n;
  const total = bas + hauteurCategories(s.categories, largeurCat) + MARGE;
  const Y = (v: number) => haut + ((e.max - v) / (e.max - e.min)) * (bas - haut);
  const Xc = (i: number) => gauche + largeurCat * (i + 0.5);
  const morceaux: Pt[][] = [[]];
  (temperature?.valeurs ?? []).forEach((t, i) => {
    if (t === null) morceaux.push([]);
    else morceaux.at(-1)!.push([Xc(i), Y(2 * t)]);
  });
  return (
    <svg viewBox={`0 0 ${LARGEUR + 2 * MARGE} ${total}`} className="statistique" role="img" aria-label={s.alt || "Diagramme ombrothermique"}>
      <Legende noms={[pluie?.nom || "Précipitations"]} x={gauche} y={MARGE + 8} />
      <g transform={`translate(${Math.max(gauche + 190, droite - 190)} 0)`}>
        <Legende noms={[temperature?.nom || "Températures"]} x={0} y={MARGE + 8} ligne />
      </g>
      <text x={gauche - 6} y={haut - 14} className="unite">
        {s.unite || "mm"}
      </text>
      <text x={droite + 6} y={haut - 14} textAnchor="end" className="unite">
        {s.unite2 || "°C"}
      </text>
      <AxeY {...e} Y={Y} x={gauche} x2={droite} />
      <AxeY {...e} Y={Y} x={droite} x2={droite} droite facteur={0.5} />
      <line x1={gauche} x2={gauche} y1={haut} y2={bas} className="axe" />
      <line x1={droite} x2={droite} y1={haut} y2={bas} className="axe" />
      {(pluie?.valeurs ?? []).map((v, i) =>
        v === null ? null : (
          <rect
            key={i}
            x={Xc(i) - largeurCat * 0.36}
            y={Math.min(Y(v), Y(0))}
            width={largeurCat * 0.72}
            height={Math.abs(Y(v) - Y(0))}
            className="barre s0"
          />
        ),
      )}
      {morceaux
        .filter((m) => m.length > 1)
        .map((m, k) => (
          <path key={k} d={m.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("")} className="ligne l1" />
        ))}
      {morceaux.flat().map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r="3" className="point l1" />
      ))}
      <Categories noms={s.categories} X={Xc} y={bas + 14} largeur={largeurCat} />
    </svg>
  );
}

export function SvgStatistique({ s }: { s: Statistique }) {
  if (s.genre === "secteurs") return <Secteurs s={s} />;
  if (s.genre === "pyramide") return <Pyramide s={s} />;
  if (s.genre === "ombrothermique") return <Ombrothermique s={s} />;
  return <BarresOuCourbe s={s} />;
}
