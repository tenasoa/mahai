/** État vide : informe sans alarmer, propose au plus une action. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-start gap-3 rounded-card border-2 border-line p-5">
      <span aria-hidden="true" className="grid w-10 grid-cols-2 gap-1">
        <span className="h-[18px] rounded-md bg-soft" />
        <span className="h-[18px] rounded-md bg-line" />
        <span className="h-[18px] rounded-md bg-line" />
        <span className="h-[18px] rounded-md bg-soft" />
      </span>
      <h2 className="text-base font-bold">{title}</h2>
      {children ? (
        <div className="text-sm leading-relaxed text-ink-2">{children}</div>
      ) : null}
      {action}
    </section>
  );
}
