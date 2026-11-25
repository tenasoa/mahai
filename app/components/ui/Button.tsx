import { Link } from "react-router";

type Variant = "primary" | "secondary";

const BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-bold no-underline transition-colors";

const VARIANTS: Record<Variant, string> = {
  // L'unique pastille sombre de l'écran : une seule par écran.
  primary: "bg-ink text-white hover:bg-ink-2",
  secondary: "bg-soft text-ink font-medium hover:bg-line",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({
  to,
  variant = "primary",
  className = "",
  children,
}: CommonProps & { to: string }) {
  return (
    <Link to={to} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: CommonProps & React.ComponentProps<"button">) {
  return (
    <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
