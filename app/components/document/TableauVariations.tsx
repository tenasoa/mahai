import { Fragment, useId, type ReactNode } from "react";

import type { CaseVariation, Position, Variations } from "~/lib/document/variations";
import { Tex } from "./Tex";

/**
 * Tableau de signes et de variations (élève et aperçu de l'éditeur).
 * Les textes sont du LaTeX ; les flèches sont des SVG qui occupent toute la case.
 */

const HAUTEUR: Record<Position, string> = { h: "18%", m: "50%", b: "82%" };

const T = ({ texte }: { texte: string }) => (texte ? <Tex latex={texte} /> : null);

/** Valeur placée en haut, au milieu ou en bas de sa case. */
function Place({ p, children }: { p: Position; children: ReactNode }) {
  return <span className={`place place-${p}`}>{children}</span>;
}

function CasePoint({ c }: { c: CaseVariation }) {
  if (!c.barre) {
    return (
      <td className="point">
        <Place p={c.p}>
          <T texte={c.v} />
        </Place>
      </td>
    );
  }
  return (
    <td className="point interdit">
      <span className="cote gauche">
        <Place p={c.p}>
          <T texte={c.v} />
        </Place>
      </span>
      <span className="cote droite">
        <Place p={c.p2}>
          <T texte={c.v2} />
        </Place>
      </span>
    </td>
  );
}

export function TableauVariations({ t }: { t: Variations }) {
  const id = `v${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const colonnes = 2 * t.x.length - 1;
  return (
    <table className="variations">
      <tbody>
        <tr className="ligne-x">
          <th scope="row">
            <T texte={t.nomX} />
          </th>
          {Array.from({ length: colonnes }, (_, k) => (
            <td key={k} className={k % 2 === 0 ? "point" : "intervalle"}>
              {k % 2 === 0 ? <T texte={t.x[k / 2]!} /> : null}
            </td>
          ))}
        </tr>
        {t.lignes.map((l, i) => (
          <tr key={i} className={l.type === "signe" ? "ligne-signe" : "ligne-variation"}>
            <th scope="row">
              <T texte={l.nom} />
            </th>
            {l.type === "signe"
              ? l.cases.map((c, k) =>
                  k % 2 === 0 ? (
                    <td key={k} className={`point${c === "|" || c === "0" ? " trait" : ""}${c === "||" ? " interdit" : ""}`}>
                      {c === "0" ? <span className="zero">0</span> : null}
                    </td>
                  ) : (
                    <td key={k} className="intervalle signe">
                      {c === "-" ? "−" : c}
                    </td>
                  ),
                )
              : l.cases.map((c, j) => (
                  <Fragment key={j}>
                    <CasePoint c={c} />
                    {j < l.cases.length - 1 ? (
                      <td className="intervalle">
                        <svg className="fleche" aria-hidden="true">
                          <defs>
                            <marker id={`${id}-${i}-${j}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                              <path d="M0 0L10 5L0 10z" className="pointe" />
                            </marker>
                          </defs>
                          <line
                            x1="10%"
                            y1={HAUTEUR[c.barre ? c.p2 : c.p]}
                            x2="90%"
                            y2={HAUTEUR[l.cases[j + 1]!.p]}
                            markerEnd={`url(#${id}-${i}-${j})`}
                          />
                        </svg>
                      </td>
                    ) : null}
                  </Fragment>
                ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
