import { binaire, disposition, minterme, type Karnaugh } from "~/lib/document/karnaugh";

/**
 * Tableau de Karnaugh : lignes et colonnes en code de Gray. Lecture seule côté élève ;
 * dans l'éditeur, `onCase` rend chaque case cliquable (vide → 0 → 1 → X).
 */
export function GrilleKarnaugh({
  k,
  onCase,
}: {
  k: Karnaugh;
  onCase?: (minterme: number) => void;
}) {
  const n = k.variables.length;
  const { bitsLignes, bitsColonnes, lignes, colonnes } = disposition(n);
  const varsLignes = k.variables.slice(0, bitsLignes).join("");
  const varsColonnes = k.variables.slice(bitsLignes).join("");
  return (
    <table className="karnaugh">
      <caption>
        Tableau de Karnaugh de {k.sortie}
      </caption>
      <thead>
        <tr>
          <th scope="col" className="coin">
            <span className="haut">{varsColonnes}</span>
            <span className="bas">{varsLignes}</span>
          </th>
          {colonnes.map((c) => (
            <th key={c} scope="col">
              {binaire(c, bitsColonnes)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lignes.map((l) => (
          <tr key={l}>
            <th scope="row">{binaire(l, bitsLignes)}</th>
            {colonnes.map((c) => {
              const m = minterme(l, c, bitsColonnes);
              const v = k.valeurs[m] === "." ? "" : (k.valeurs[m] ?? "");
              return (
                <td key={c}>
                  {onCase ? (
                    <button
                      type="button"
                      onClick={() => onCase(m)}
                      aria-label={`Case ${binaire(m, n)} : ${v || "vide"}`}
                    >
                      {v}
                    </button>
                  ) : (
                    v
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
