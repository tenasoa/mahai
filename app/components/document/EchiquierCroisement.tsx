import { couples, genotype, type Echiquier } from "~/lib/document/genetique";
import { Tex } from "./Tex";

/**
 * Échiquier de croisement : gamètes d'un parent en colonnes, de l'autre en lignes, et dans chaque
 * case le génotype (chromosomes homologues séparés par un double trait) et le phénotype.
 */

/** Texte simple tel quel (allèles droits) ; LaTeX seulement s'il en contient (X^A, \overline{a}…). */
const T = ({ texte }: { texte: string }) =>
  !texte ? null : /[\\^_{}]/.test(texte) ? <Tex latex={`\\mathrm{${texte}}`} /> : <>{texte}</>;

/** « A//a;B//b » : chaque gène en deux lignes séparées par le double trait. */
export function Genotype({ geno }: { geno: string }) {
  return (
    <span className="genotype">
      {couples(geno).map((c, i) =>
        c.length === 2 ? (
          <span key={i} className="couple">
            <span className="homologue haut">
              <T texte={c[0]} />
            </span>
            <span className="homologue">
              <T texte={c[1]} />
            </span>
          </span>
        ) : (
          <span key={i} className="couple">
            <T texte={c[0]} />
          </span>
        ),
      )}
    </span>
  );
}

function Gamete({ g, f }: { g: string; f: string }) {
  return (
    <>
      <span className="gamete">
        <T texte={g} />
      </span>
      {f ? (
        <span className="frequence">
          <T texte={f} />
        </span>
      ) : null}
    </>
  );
}

export function EchiquierCroisement({ e }: { e: Echiquier }) {
  return (
    <table className="echiquier">
      <thead>
        <tr>
          <th scope="col" className="coin">
            <span className="nom-colonnes">{e.nomColonnes}</span>
            <span className="nom-lignes">{e.nomLignes}</span>
          </th>
          {e.colonnes.map((c, j) => (
            <th key={j} scope="col">
              <Gamete {...c} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {e.lignes.map((l, i) => (
          <tr key={i}>
            <th scope="row">
              <Gamete {...l} />
            </th>
            {e.colonnes.map((c, j) => {
              const cas = e.cases[i]?.[j];
              const geno = cas?.geno.trim() || (c.g.trim() && l.g.trim() ? genotype(c.g, l.g) : "");
              return (
                <td key={j}>
                  {geno ? <Genotype geno={geno} /> : null}
                  {cas?.pheno ? (
                    <span className="phenotype">{cas.pheno}</span>
                  ) : null}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
