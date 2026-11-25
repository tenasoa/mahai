import { cellules, type Avancement } from "~/lib/document/avancement";
import { Tex } from "./Tex";

/**
 * Tableau d'avancement (élève et éditeur). Une colonne par espèce ; dans la ligne de l'équation,
 * les signes « + » et « → » sont posés sur la séparation entre deux colonnes.
 */
export function TableauAvancement({ t }: { t: Avancement }) {
  const c = cellules(t);
  const n = t.especes.length;
  const T = ({ latex }: { latex: string }) => (latex ? <Tex latex={latex} /> : null);
  const lignes: { etat: string; x: string; valeurs: string[] }[] = [
    { etat: "État initial", x: "0", valeurs: c.initial },
    { etat: "En cours", x: "x", valeurs: c.enCours },
    { etat: "État final", x: c.xmax, valeurs: c.final },
  ];

  return (
    <table className="avancement" aria-label={t.alt || "Tableau d'avancement"}>
      <tbody>
        <tr className="ligne-equation">
          <th colSpan={2} scope="row">
            Équation de la réaction
          </th>
          {t.especes.map((e, i) => {
            const suivante = t.especes[i + 1];
            const signe = !suivante ? null : suivante.reactif === e.reactif ? "+" : "→";
            return (
              <td key={i}>
                <Tex latex={`\\ce{${e.coef > 1 ? e.coef : ""}${e.formule || "?"}}`} />
                {signe ? (
                  <span className="operateur">{signe}</span>
                ) : null}
              </td>
            );
          })}
        </tr>
        <tr className="ligne-titres">
          <th scope="col">État du système</th>
          <th scope="col">Avancement ({t.unite})</th>
          <th scope="colgroup" colSpan={n}>
            Quantités de matière ({t.unite})
          </th>
        </tr>
        {lignes.map((l) => (
          <tr key={l.etat}>
            <th scope="row">{l.etat}</th>
            <td className="x">
              <T latex={l.x} />
            </td>
            {l.valeurs.map((v, i) => (
              <td key={i} className={l.etat === "État final" && c.limitants.includes(i) ? "limitant" : undefined}>
                <T latex={v} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
