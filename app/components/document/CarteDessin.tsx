import { useId, type PointerEvent, type ReactNode, type Ref } from "react";

import { cheminLisse, pointeFleche, type Carte, type Entree } from "~/lib/document/carte";
import { urlMedia } from "~/lib/medias/medias";

/**
 * Carte à légender (croquis) : fond de carte, figurés en SVG par-dessus, noms de lieux en HTML
 * (même taille de texte quelle que soit la largeur) et légende. Rendu serveur, identique dans
 * l'éditeur et chez l'élève. Couleurs par classes CSS (`.croquis …` dans app.css).
 */

/** Largeur du dessin en unités SVG ; la hauteur suit les proportions du fond. */
const L = 1000;

/** Réglages de l'éditeur : poignées, tracé en cours, figuré choisi. */
export type EditionCarte = {
  conteneur: Ref<HTMLDivElement>;
  surAppui: (e: PointerEvent<HTMLDivElement>) => void;
  surDeplacement: (e: PointerEvent<HTMLDivElement>) => void;
  surFin: (e: PointerEvent<HTMLDivElement>) => void;
  /** Points du tracé en cours (x0, y0, x1, y1… en fraction), reliés en pointillés. */
  enCours?: number[];
  /** Indice du figuré choisi (mis en évidence). */
  choisi?: number | null;
  poignees: ReactNode;
};

const ETOILE = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const r = i % 2 ? 0.45 : 1;
  return [Math.cos(a) * r, Math.sin(a) * r] as const;
});

function Symbole({ motif, x, y, r }: { motif: string; x: number; y: number; r: number }) {
  if (motif === "carre") return <rect x={x - r * 0.85} y={y - r * 0.85} width={r * 1.7} height={r * 1.7} className="symbole" />;
  if (motif === "triangle")
    return <polygon points={`${x},${y - r * 1.1} ${x + r},${y + r * 0.7} ${x - r},${y + r * 0.7}`} className="symbole" />;
  if (motif === "etoile")
    return <polygon points={ETOILE.map(([a, b]) => `${x + a * r * 1.25},${y + b * r * 1.25}`).join(" ")} className="symbole" />;
  return <circle cx={x} cy={y} r={r} className="symbole" />;
}

/** Remplissage d'une zone : aplat, ou motif défini dans `<defs>`. */
const remplissage = (id: string, i: number, e: Entree) =>
  e.motif === "hachures" || e.motif === "points" ? { fill: `url(#${id}-m${i})` } : undefined;

/** Flèche (tracé lissé + pointe) ; `ech` = facteur de taille (1 sur la carte). */
function Fleche({ p, epaisse, ech = 1 }: { p: [number, number][]; epaisse: boolean; ech?: number }) {
  const { triangle, base } = pointeFleche(p, (epaisse ? 44 : 26) * ech, (epaisse ? 52 : 24) * ech);
  return (
    <>
      <path d={cheminLisse([...p.slice(0, -1), base])} className={`fleche${epaisse ? " epaisse" : ""}`} style={ech !== 1 ? { strokeWidth: (epaisse ? 14 : 5) * ech } : undefined} />
      <polygon points={triangle.map(([x, y]) => `${x},${y}`).join(" ")} className="pointe" />
    </>
  );
}

/** Petit figuré de la légende. */
function Echantillon({ e, i, id }: { e: Entree; i: number; id: string }) {
  return (
    <svg viewBox="0 0 40 24" className={`figure-legende k${e.couleur}`} aria-hidden="true">
      {e.genre === "zone" ? (
        <rect x="2" y="3" width="36" height="18" rx="3" className={`zone ${e.motif}`} style={remplissage(id, i, e)} />
      ) : e.genre === "ligne" ? (
        <path d="M3 12H37" className={`ligne ${e.motif}`} style={{ strokeWidth: e.motif === "epais" ? 5 : 2.5 }} />
      ) : e.genre === "fleche" ? (
        <Fleche p={[[3, 12], [37, 12]]} epaisse={e.motif === "epaisse"} ech={e.motif === "epaisse" ? 0.4 : 0.55} />
      ) : (
        <Symbole motif={e.motif} x={20} y={12} r={6.5} />
      )}
    </svg>
  );
}

export function CarteDessin({ c, edition }: { c: Carte; edition?: EditionCarte }) {
  const id = `ca${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const H = Math.round((L * c.hauteur) / c.largeur);
  const P = (pts: number[]) => {
    const r: [number, number][] = [];
    for (let i = 0; i + 1 < pts.length; i += 2) r.push([pts[i]! * L, pts[i + 1]! * H]);
    return r;
  };
  // Zones dessous, puis lignes, flèches et points dessus.
  const ordre = ["zone", "ligne", "fleche", "point"];
  const traces = c.traces
    .map((t, i) => ({ ...t, i, entree: c.legende[t.e]! }))
    .sort((a, b) => ordre.indexOf(a.entree.genre) - ordre.indexOf(b.entree.genre));
  const motifs = c.legende.flatMap((e, i) => (e.genre === "zone" && (e.motif === "hachures" || e.motif === "points") ? [{ e, i }] : []));
  const description = c.alt || c.titre || "Carte";

  return (
    <div className="croquis">
      {c.titre ? <p className="titre-croquis">{c.titre}</p> : null}
      <div
        ref={edition?.conteneur}
        className={`fond-croquis${c.cle ? "" : " vierge"}${edition ? " edition" : ""}`}
        style={{ aspectRatio: `${c.largeur} / ${c.hauteur}` }}
        onPointerDown={edition?.surAppui}
        onPointerMove={edition?.surDeplacement}
        onPointerUp={edition?.surFin}
        onPointerCancel={edition?.surFin}
      >
        {c.cle ? (
          <img src={urlMedia(c.cle)} alt="" width={c.largeur} height={c.hauteur} loading="lazy" decoding="async" draggable={false} />
        ) : null}
        <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={description}>
          <defs>
            {motifs.map(({ e, i }) => (
              <pattern key={i} id={`${id}-m${i}`} patternUnits="userSpaceOnUse" width="12" height="12" patternTransform={e.motif === "hachures" ? "rotate(45)" : undefined}>
                <g className={`k${e.couleur}`}>
                  {e.motif === "hachures" ? <path d="M0 0V12" className="hachure" /> : <circle cx="6" cy="6" r="2.4" className="semis" />}
                </g>
              </pattern>
            ))}
          </defs>
          {traces.map((t) => {
            const e = t.entree;
            const p = P(t.pts);
            const choisi = edition?.choisi === t.i ? " choisi" : "";
            return (
              <g key={t.i} className={`k${e.couleur}${choisi}`}>
                {e.genre === "zone" ? (
                  <polygon points={p.map(([x, y]) => `${x},${y}`).join(" ")} className={`zone ${e.motif}`} style={remplissage(id, t.e, e)} />
                ) : e.genre === "ligne" ? (
                  <polyline points={p.map(([x, y]) => `${x},${y}`).join(" ")} className={`ligne ${e.motif}`} />
                ) : e.genre === "fleche" ? (
                  <Fleche p={p} epaisse={e.motif === "epaisse"} />
                ) : (
                  <Symbole motif={e.motif} x={p[0]![0]} y={p[0]![1]} r={14} />
                )}
              </g>
            );
          })}
          {edition?.enCours && edition.enCours.length >= 4 ? (
            <polyline points={P(edition.enCours).map(([x, y]) => `${x},${y}`).join(" ")} className="en-cours" />
          ) : null}
        </svg>
        {c.noms.map((n, i) =>
          n.texte ? (
            <span key={i} className={`nom-croquis ${n.style}`} style={{ left: `${n.x * 100}%`, top: `${n.y * 100}%` }}>
              {n.texte}
            </span>
          ) : null,
        )}
        {edition?.poignees}
      </div>

      {c.legende.length ? (
        <ul className="legende-croquis" aria-label="Légende">
          {c.legende.map((e, i) =>
            e.genre === "titre" ? (
              <li key={i} className="partie">
                {e.texte}
              </li>
            ) : (
              <li key={i}>
                <Echantillon e={e} i={i} id={id} />
                <span>{e.texte}</span>
              </li>
            ),
          )}
        </ul>
      ) : null}
    </div>
  );
}
