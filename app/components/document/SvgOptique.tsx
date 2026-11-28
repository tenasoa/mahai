import { useId } from "react";

import { disposer, type Optique } from "~/lib/document/optique";

/**
 * Banc d'optique dessiné en SVG (sur le serveur et dans l'éditeur) : axe optique, lentilles
 * (flèches vers l'extérieur : convergente ; vers l'intérieur : divergente), foyers, objet et
 * images, rayons de construction. Les hauteurs gardent l'échelle des longueurs quand le dessin
 * reste lisible ; sinon elles sont agrandies (comme dans les schémas des manuels).
 */

const L = 640;
const MARGE = 30;
const HAUT = 34;
const LIGNE = 21;

type Etiquette = { px: number; nom: string; dessous: boolean; rang: number };

/** Noms posés sur l'axe sans se chevaucher : confondus → « F' = A' », trop proches → ligne suivante. */
function placer(items: { px: number; nom: string; dessous: boolean }[]): Etiquette[] {
  const fusion: { px: number; nom: string; dessous: boolean }[] = [];
  for (const e of items) {
    const deja = fusion.find((f) => f.dessous === e.dessous && Math.abs(f.px - e.px) < 4);
    if (deja) deja.nom += ` = ${e.nom}`;
    else fusion.push({ ...e });
  }
  const fins: Record<string, number[]> = { true: [], false: [] };
  return fusion
    .sort((a, b) => a.px - b.px)
    .map((e) => {
      const demi = e.nom.length * 6 + 3; // largeur prévue pour les noms agrandis du téléphone
      const lignes = fins[String(e.dessous)]!;
      let rang = lignes.findIndex((fin) => e.px - demi > fin);
      if (rang < 0) rang = lignes.length;
      lignes[rang] = e.px + demi;
      return { ...e, rang };
    });
}

export function SvgOptique({ o }: { o: Optique }) {
  const id = `op${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const d = disposer(o);
  const sx = (L - 2 * MARGE) / (d.xmax - d.xmin);
  const hDessin = Math.min(340, Math.max(190, 2 * d.ymax * sx));
  const sy = hDessin / (2 * d.ymax);
  const X = (x: number) => MARGE + (x - d.xmin) * sx;
  const Y = (y: number) => HAUT + hDessin / 2 - y * sy;
  const axe = Y(0);
  const yL = d.hauteurLentille;

  const etiquettes = placer([
    ...d.reperes.map((r) => ({ px: X(r.x), nom: r.nom, dessous: true })),
    ...d.fleches.map((f) => ({ px: X(f.x), nom: f.nomPied, dessous: f.h >= 0 })),
  ]);
  const rangs = Math.max(0, ...etiquettes.filter((e) => e.dessous).map((e) => e.rang)) + 1;
  const H = HAUT + hDessin + 14 + rangs * LIGNE + (d.imageInfinie && o.image ? LIGNE : 0);

  return (
    <svg viewBox={`0 0 ${L} ${H.toFixed(1)}`} className="optique" role="img" aria-label={o.alt || "Schéma d'optique"}>
      <defs>
        <marker id={`${id}-p`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" className="pointe" />
        </marker>
        <clipPath id={`${id}-c`}>
          <rect x="0" y={HAUT - 6} width={L} height={hDessin + 12} />
        </clipPath>
      </defs>

      <line x1={4} y1={axe} x2={L - 4} y2={axe} className="axe" markerEnd={`url(#${id}-p)`} />
      {d.graduations.map((g) => (
        <line key={g} x1={X(g)} x2={X(g)} y1={axe - 3} y2={axe + 3} className="graduation" />
      ))}

      <g clipPath={`url(#${id}-c)`}>
        {d.segments.map((s, i) => {
          const x1 = X(s.x1);
          const y1 = Y(s.y1);
          const x2 = X(s.x2);
          const y2 = Y(s.y2);
          const a = Math.atan2(y2 - y1, x2 - x1);
          const [c, n] = [Math.cos(a), Math.sin(a)];
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          return (
            <g key={i} className={`rayon c${(s.rayon % 3) + 1}`}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className={s.pointille ? "pointille" : undefined} />
              {s.fleche && Math.hypot(x2 - x1, y2 - y1) > 50 ? (
                <path d={`M${mx + 5 * c} ${my + 5 * n}L${mx - 5 * c - 4 * n} ${my - 5 * n + 4 * c}L${mx - 5 * c + 4 * n} ${my - 5 * n - 4 * c}z`} className="tete" />
              ) : null}
            </g>
          );
        })}
      </g>

      {d.reperes.map((r, i) => (
        <line key={i} x1={X(r.x)} x2={X(r.x)} y1={axe - 5} y2={axe + 5} className="repere" />
      ))}

      {d.lentilles.map((l, i) => {
        const x = X(l.x);
        const h = Y(yL);
        const b = Y(-yL);
        const v = l.f > 0 ? 8 : -8;
        return (
          <g key={i} className="lentille">
            <line x1={x} y1={h} x2={x} y2={b} />
            <path d={`M${x - 7} ${h + v}L${x} ${h}L${x + 7} ${h + v}M${x - 7} ${b - v}L${x} ${b}L${x + 7} ${b - v}`} />
            <text x={x} y={h - (l.f > 0 ? 10 : 16)} textAnchor="middle" className="nom">
              {l.nom}
            </text>
          </g>
        );
      })}

      {d.fleches.map((f, i) => {
        const x = X(f.x);
        const haut = f.h >= 0;
        return (
          <g key={i} className={`objet${f.principale ? "" : " intermediaire"}`}>
            <line x1={x} y1={axe} x2={x} y2={Y(f.h)} className={f.pointille ? "pointille" : undefined} markerEnd={`url(#${id}-p)`} />
            <text x={x + 7} y={Y(f.h) + (haut ? -6 : 16)} textAnchor="start" className="nom">
              {f.nomTete}
            </text>
          </g>
        );
      })}

      {etiquettes.map((e, i) => (
        <text key={i} x={e.px} y={e.dessous ? axe + 19 + e.rang * LIGNE : axe - 9 - e.rang * LIGNE} textAnchor="middle" className="nom">
          {e.nom}
        </text>
      ))}

      {d.imageInfinie && o.image ? (
        <text x={L - MARGE} y={H - 6} textAnchor="end" className="note">
          Image à l'infini (rayons émergents parallèles)
        </text>
      ) : null}
    </svg>
  );
}
