import type { ReactNode } from "react";

/** Champs compacts de l'admin : libellé visible, erreur reliée au champ. */

const controle =
  "min-h-12 w-full rounded-full border-2 border-control bg-soft px-4 text-base outline-none focus:border-ink aria-invalid:border-erreur";

function Cadre({
  id,
  label,
  erreur,
  aide,
  children,
  className = "",
}: {
  id: string;
  label: string;
  erreur?: string;
  aide?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {erreur ? (
        <p id={`${id}-erreur`} className="px-2 text-sm font-medium text-ink">
          <span aria-hidden="true" className="mr-1.5 inline-block size-2.5 rounded-[3px] bg-erreur" />
          {erreur}
        </p>
      ) : aide ? (
        <p className="px-2 text-sm text-muted">{aide}</p>
      ) : null}
    </div>
  );
}

export function Texte({
  id,
  label,
  erreur,
  aide,
  className,
  ...input
}: {
  id: string;
  label: string;
  erreur?: string;
  aide?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Cadre id={id} label={label} erreur={erreur} aide={aide} className={className}>
      <input
        id={id}
        name={id}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? `${id}-erreur` : undefined}
        className={controle}
        {...input}
      />
    </Cadre>
  );
}

export function Choix({
  id,
  label,
  erreur,
  options,
  vide,
  className,
  ...select
}: {
  id: string;
  label: string;
  erreur?: string;
  options: { valeur: string; libelle: string }[];
  vide?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <Cadre id={id} label={label} erreur={erreur} className={className}>
      <select
        id={id}
        name={id}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={erreur ? `${id}-erreur` : undefined}
        className={`${controle} appearance-auto`}
        {...select}
      >
        {vide !== undefined ? <option value="">{vide}</option> : null}
        {options.map((o) => (
          <option key={o.valeur} value={o.valeur}>
            {o.libelle}
          </option>
        ))}
      </select>
    </Cadre>
  );
}
