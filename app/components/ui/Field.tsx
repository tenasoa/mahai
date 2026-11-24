/** Champ de formulaire : libellé visible, aide et erreur reliées au champ. */
export function Field({
  id,
  label,
  aide,
  ...input
}: {
  id: string;
  label: string;
  aide?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const aideId = aide ? `${id}-aide` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={aideId}
        className="min-h-13 rounded-full border-2 border-control bg-soft px-5 text-base outline-none focus:border-ink"
        {...input}
      />
      {aide ? (
        <p id={aideId} className="px-2 text-sm text-muted">
          {aide}
        </p>
      ) : null}
    </div>
  );
}

/** Message d'erreur de formulaire, annoncé aux lecteurs d'écran. */
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-card bg-erreur px-4 py-3 text-sm font-medium text-ink"
    >
      {message}
    </p>
  );
}

/** Message de confirmation de formulaire, annoncé aux lecteurs d'écran. */
export function FormSucces({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className="flex items-start gap-2 rounded-card bg-juste px-4 py-3 text-sm font-medium text-ink"
    >
      {message}
    </p>
  );
}
