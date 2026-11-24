/** Mise en forme des pages de texte long (confidentialité, conditions). */
export function PageTexte({
  titre,
  maj,
  children,
}: {
  titre: string;
  maj: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 text-base leading-relaxed text-ink-2 [&_a]:font-medium [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
      <header className="flex flex-col gap-1">
        <h1 className="text-[2rem] leading-tight font-extrabold tracking-tight text-ink">
          {titre}
        </h1>
        <p className="text-sm text-muted">Mise à jour le {maj}</p>
      </header>
      {children}
    </article>
  );
}
