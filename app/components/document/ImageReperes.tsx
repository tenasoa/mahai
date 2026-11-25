import type { PointerEvent, Ref } from "react";

import type { Repere } from "~/lib/document/reperes";

/**
 * Image avec repères : un point sur l'image relié par un trait à son étiquette. Les positions
 * sont en pourcentage, les étiquettes gardent la même taille de texte quelle que soit l'image.
 */

export type Poignees = {
  /** Début d'un déplacement (éditeur) : `quoi` = le point ou l'étiquette. */
  surPoignee: (e: PointerEvent, i: number, quoi: "point" | "etiquette") => void;
  surClic: (e: PointerEvent<HTMLDivElement>) => void;
  surDeplacement: (e: PointerEvent<HTMLDivElement>) => void;
  surFin: (e: PointerEvent<HTMLDivElement>) => void;
};

const pc = (v: number) => `${v * 100}%`;

export function ImageReperes({
  src,
  alt,
  largeur,
  hauteur,
  reperes,
  poignees,
  conteneur,
}: {
  src: string;
  alt: string;
  largeur?: number;
  hauteur?: number;
  reperes: Repere[];
  poignees?: Poignees;
  conteneur?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={conteneur}
      className={`image-reperes${poignees ? " edition" : ""}`}
      style={largeur ? { maxWidth: `${largeur}px` } : undefined}
      onPointerDown={poignees?.surClic}
      onPointerMove={poignees?.surDeplacement}
      onPointerUp={poignees?.surFin}
      onPointerCancel={poignees?.surFin}
    >
      <img src={src} alt={alt} width={largeur} height={hauteur} loading="lazy" decoding="async" draggable={false} />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {reperes.map((r, i) => (
          <line key={i} x1={r.x * 100} y1={r.y * 100} x2={r.tx * 100} y2={r.ty * 100} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      {reperes.map((r, i) => (
        <span
          key={`p${i}`}
          className="point-repere"
          style={{ left: pc(r.x), top: pc(r.y) }}
          onPointerDown={poignees ? (e) => poignees.surPoignee(e, i, "point") : undefined}
        />
      ))}
      {reperes.map((r, i) =>
        r.texte || poignees ? (
          <span
            key={`e${i}`}
            className="etiquette-repere"
            style={{ left: pc(r.tx), top: pc(r.ty) }}
            onPointerDown={poignees ? (e) => poignees.surPoignee(e, i, "etiquette") : undefined}
          >
            {r.texte || "…"}
          </span>
        ) : null,
      )}
    </div>
  );
}
