import {
  TAILLE,
  MARGE_H,
  PAS_Y,
  disposer,
  libelleSymbole,
  romain,
  symbolesUtilises,
  type Arbre,
  type Etat,
  type Sexe,
} from "~/lib/document/genetique";

/**
 * Arbre généalogique dessiné en SVG (sur le serveur comme dans l'éditeur) : carrés pour les
 * hommes, cercles pour les femmes, losanges pour un sexe inconnu ; symbole plein si atteint.
 */

type Forme = { sexe: Exclude<Sexe, "vide">; etat: Etat; decede?: boolean; x: number; y: number; r: number };

function Symbole({ sexe, etat, decede, x, y, r }: Forme) {
  const classe = `symbole${etat === "atteint" ? " plein" : ""}`;
  const forme =
    sexe === "m" ? (
      <rect x={x - r} y={y - r} width={2 * r} height={2 * r} className={classe} />
    ) : sexe === "f" ? (
      <circle cx={x} cy={y} r={r} className={classe} />
    ) : (
      <polygon points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`} className={classe} />
    );
  // Hétérozygote : moitié gauche pleine.
  const moitie =
    etat !== "heterozygote" ? null : sexe === "m" ? (
      <rect x={x - r} y={y - r} width={r} height={2 * r} className="plein" />
    ) : sexe === "f" ? (
      <path d={`M ${x} ${y - r} A ${r} ${r} 0 0 0 ${x} ${y + r} Z`} className="plein" />
    ) : (
      <polygon points={`${x},${y - r} ${x - r},${y} ${x},${y + r}`} className="plein" />
    );
  return (
    <g>
      {forme}
      {moitie}
      {etat === "heterozygote" ? (
        // Contour redessiné par-dessus la moitié pleine.
        sexe === "m" ? (
          <rect x={x - r} y={y - r} width={2 * r} height={2 * r} className="contour" />
        ) : sexe === "f" ? (
          <circle cx={x} cy={y} r={r} className="contour" />
        ) : (
          <polygon points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`} className="contour" />
        )
      ) : null}
      {etat === "conductrice" ? <circle cx={x} cy={y} r={r / 4} className="plein" /> : null}
      {decede ? <line x1={x - r - 5} y1={y + r + 5} x2={x + r + 5} y2={y - r - 5} className="trait" /> : null}
    </g>
  );
}

function MiniSymbole(f: Omit<Forme, "x" | "y" | "r">) {
  return (
    <svg viewBox="-20 -20 40 40" width="22" height="22" aria-hidden="true" className="arbre">
      <Symbole {...f} x={0} y={0} r={13} />
    </svg>
  );
}

export function ArbreGenealogique({ arbre }: { arbre: Arbre }) {
  const { places, traits, largeur, hauteur } = disposer(arbre);
  const r = TAILLE / 2;
  const decedes = places.some((p) => p.ind.decede);
  const legende = arbre.legende ? symbolesUtilises(arbre) : [];
  const nombre = places.length;

  return (
    <>
      <svg
        viewBox={`0 0 ${largeur} ${hauteur}`}
        width={largeur}
        className="arbre"
        role="img"
        aria-label={`Arbre généalogique : ${arbre.generations.length} génération${arbre.generations.length > 1 ? "s" : ""}, ${nombre} individu${nombre > 1 ? "s" : ""}`}
      >
        {arbre.generations.map((_, g) => (
          <text key={g} x={6} y={MARGE_H + r + g * PAS_Y + 5} className="generation">
            {romain(g)}
          </text>
        ))}
        {traits.map((t, k) =>
          t.double ? (
            <g key={k}>
              <line x1={t.x1} y1={t.y1 - 2.5} x2={t.x2} y2={t.y2 - 2.5} className="trait" />
              <line x1={t.x1} y1={t.y1 + 2.5} x2={t.x2} y2={t.y2 + 2.5} className="trait" />
            </g>
          ) : (
            <line key={k} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className="trait" />
          ),
        )}
        {places.map((p) => (
          <g key={`${p.g}-${p.i}`}>
            <Symbole sexe={p.ind.sexe as Exclude<Sexe, "vide">} etat={p.ind.etat} decede={p.ind.decede} x={p.x} y={p.y} r={r} />
            {p.numero ? (
              <text x={p.x} y={p.y + r + 14} className="numero">
                {p.numero}
              </text>
            ) : null}
            {p.ind.nom ? (
              <text x={p.x} y={p.y + r + (p.numero ? 27 : 14)} className="nom">
                {p.ind.nom}
              </text>
            ) : null}
          </g>
        ))}
      </svg>
      {legende.length || (arbre.legende && decedes) ? (
        <ul className="legende-arbre" aria-label="Légende">
          {legende.map(({ sexe, etat }) => (
            <li key={`${sexe}-${etat}`}>
              <MiniSymbole sexe={sexe} etat={etat} />
              {libelleSymbole(sexe, etat)}
            </li>
          ))}
          {decedes ? (
            <li>
              <MiniSymbole sexe="i" etat="sain" decede />
              Décédé(e)
            </li>
          ) : null}
        </ul>
      ) : null}
    </>
  );
}
