import type { Couleur } from "~/db/schema";
import { TUILES } from "~/lib/couleurs";
import { estPictogramme, type IdPictogramme } from "~/lib/pictogrammes";

/** Tracés 24 × 24, trait de 2, comme les icônes de l'interface (aucun remplissage). */
const TRACES: Record<IdPictogramme, React.ReactNode> = {
  pi: <path d="M4 7.5h16M9 7.5V19M15 7.5v8.5c0 1.7.8 3 2.6 3" />,
  calcul: <path d="M7 4v6M4 7h6M14 7h6M4.9 14.9l4.2 4.2M9.1 14.9l-4.2 4.2M14 15h6M14 19h6" />,
  equerre: <path d="M4 20V4l16 16zM8 16v-4.3l4.3 4.3zM4 8h2M4 12h2" />,
  graphique: <path d="M4 4v16h16M7.5 15.5l3.5-4.5 3 3 5-6.5" />,
  lettres: (
    <>
      <path d="M3 18l4.5-12L12 18M4.7 14h5.6M20.5 12v6" />
      <circle cx="17.5" cy="15" r="3" />
    </>
  ),
  livre: <path d="M12 6.5C10 5 7 4.5 3.5 4.5v14c3.5 0 6.5.5 8.5 2 2-1.5 5-2 8.5-2v-14C17 4.5 14 5 12 6.5zM12 6.5V20" />,
  crayon: <path d="M4 20l1.2-4.8L15.8 4.6a2 2 0 0 1 2.8 0l.8.8a2 2 0 0 1 0 2.8L8.8 18.8zM14 6.5l3.5 3.5" />,
  atome: (
    <>
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.8" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  fiole: <path d="M9 3h6M10 3v6.5L4.8 18.2A1.9 1.9 0 0 0 6.4 21h11.2a1.9 1.9 0 0 0 1.6-2.8L14 9.5V3M7.2 15h9.6" />,
  aimant: <path d="M5 4h4v8a3 3 0 0 0 6 0V4h4v8a7 7 0 0 1-14 0zM5 8h4M15 8h4" />,
  feuille: <path d="M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19l8.5-8.5" />,
  adn: <path d="M7 3c0 5 10 4 10 9s-10 4-10 9M17 3c0 5-10 4-10 9s10 4 10 9M8.5 6.5h7M8.5 17.5h7M10 12h4" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <path d="M3 12h18" />
    </>
  ),
  carte: <path d="M3 6.5L9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20zM9 4v13.5M15 6.5V20" />,
  colonne: <path d="M3 9l9-5 9 5zM5.5 9v8.5M10 9v8.5M14 9v8.5M18.5 9v8.5M4 17.5h16M3 20.5h18" />,
  sablier: <path d="M6 3h12M6 21h12M7.5 3c0 5 4.5 6 4.5 9s-4.5 4-4.5 9M16.5 3c0 5-4.5 6-4.5 9s4.5 4 4.5 9" />,
  drapeau: <path d="M5 21V3.5M5 4h13l-2.5 4.5L18 13H5" />,
  bulle: <path d="M4 5h16v11H10l-5 4v-4H4zM8 9.5h8M8 12.5h5" />,
  ampoule: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.8 10.6c.6.6.8 1.4.8 2.4h6c0-1 .2-1.8.8-2.4A6 6 0 0 0 12 3z" />,
  etoile: <path d="M12 3l2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.8z" />,
  balance: <path d="M12 4v16M7 20h10M5 7h14M12 4.5L5 7M12 4.5L19 7M5 7l-3 6.5a3 3 0 0 0 6 0zM19 7l-3 6.5a3 3 0 0 0 6 0z" />,
  ordinateur: <path d="M3 5h18v11H3zM8 20h8M12 16v4" />,
  code: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
  musique: (
    <>
      <path d="M9 18V5.5l11-2.5v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="17" cy="16" r="3" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-.8 2-1.8 0-1.2-1-1.5-1-2.6 0-.9.8-1.6 1.8-1.6H17a4 4 0 0 0 4-4C21 6.5 17 3 12 3z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  ballon: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5l4 3-1.5 4.5h-5L8 10.5zM12 3v4.5M16 10.5l4.5-1.5M14.5 15l2.5 4M9.5 15L7 19M8 10.5L3.5 9" />
    </>
  ),
};

/** Pictogramme seul, à la couleur du texte (décoratif : le nom de la matière est écrit à côté). */
export function Pictogramme({ id, taille = 24, className }: { id: string | null | undefined; taille?: number; className?: string }) {
  if (!estPictogramme(id)) return null;
  return (
    <svg
      width={taille}
      height={taille}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {TRACES[id]}
    </svg>
  );
}

/**
 * Petite tuile de matière : sa couleur et son pictogramme au centre (décorative).
 * `taille` en pixels ; le pictogramme en occupe un peu plus de la moitié.
 */
export function TuileMatiere({
  couleur,
  icone,
  taille,
  className = "",
}: {
  couleur: Couleur | null | undefined;
  icone: string | null | undefined;
  taille: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: taille, height: taille, borderRadius: Math.round(taille * 0.28) }}
      className={`${couleur ? TUILES[couleur] : "bg-soft"} inline-flex shrink-0 items-center justify-center text-ink ${className}`}
    >
      <Pictogramme id={icone} taille={Math.round(taille * 0.58)} />
    </span>
  );
}
