const PATHS = {
  accueil: (
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  ),
  recherche: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4-4" />
    </>
  ),
  photo: (
    <>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  profil: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1-4 4-6 8-6s7 2 8 6" />
    </>
  ),
  suivant: <path d="M9 6l6 6-6 6" />,
  retour: <path d="M15 6l-6 6 6 6" />,
  juste: <path d="M5 12l5 5 9-10" />,
  "a-revoir": <path d="M5 12h14" />,
  erreur: <path d="M6 6l12 12M18 6L6 18" />,
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 22,
  strokeWidth = 2,
  className,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}
