/** Touche du clavier (aide des raccourcis, sur ordinateur). */
export function Kbd({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <kbd
      aria-label={label}
      className="inline-flex h-6 min-w-6 items-center justify-center rounded-[7px] border border-control px-1.5 font-sans text-xs font-medium text-ink-2"
    >
      {children}
    </kbd>
  );
}
