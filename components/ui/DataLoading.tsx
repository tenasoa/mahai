"use client";

import { cn } from "@/lib/utils";

interface DataLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  centered?: boolean;
}

/**
 * Composant de loading pour les chargements de données (tables, listes, historiques)
 * Style: Animation de barres avec anneaux orbitaux (inspiré du design luxury)
 */
export function DataLoading({
  message = "Chargement...",
  size = "md",
  className,
  centered = true,
}: DataLoadingProps) {
  const sizeClasses = {
    sm: "scale-75",
    md: "scale-100",
    lg: "scale-125",
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center gap-4",
        sizeClasses[size],
        className,
      )}
    >
      {/* Loader avec anneaux orbitaux */}
      <div className="relative w-[46px] h-[46px]" aria-hidden="true">
        {/* Anneau extérieur */}
        <span
          className="absolute inset-0 rounded-full border border-[var(--b2)] border-t-[var(--gold)] animate-[spin_1.05s_linear_infinite]"
          style={{ animationDuration: "1.05s" }}
        />
        {/* Anneau intérieur */}
        <span
          className="absolute rounded-full border border-[var(--b2)] border-t-[var(--gold-lo)] opacity-65 animate-[spin_1.55s_linear_infinite_reverse]"
          style={{ inset: "7px" }}
        />
        {/* Point central */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className="w-[6px] h-[6px] rounded-full bg-[var(--gold)] animate-[gemPulse_1.4s_ease-in-out_infinite]"
            style={{
              boxShadow: "0 0 12px var(--gold-glow)",
            }}
          />
        </span>
      </div>

      {/* Animation de barres */}
      <div className="flex items-end gap-[4px] h-[18px]" aria-hidden="true">
        {[10, 16, 12, 18].map((height, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-[var(--gold)] opacity-45 animate-[barAnim_1.2s_ease-in-out_infinite]"
            style={{
              height: `${height}px`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Message */}
      {message && (
        <p className="text-[var(--text-3)] text-sm font-[family-name:var(--mono)] tracking-wide">
          {message}
        </p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div
        className="flex items-center justify-center py-12"
        role="status"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite">
      {content}
    </div>
  );
}

/**
 * Variante inline pour les tableaux et listes
 */
export function DataLoadingInline({
  message = "Chargement des données...",
  className,
}: Omit<DataLoadingProps, "size" | "centered">) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 py-8 px-4",
        "text-[var(--text-3)] text-sm",
        className,
      )}
    >
      {/* Spinner simple */}
      <div className="relative w-5 h-5" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border-2 border-[var(--b2)] border-t-[var(--gold)] animate-spin" />
      </div>
      <span className="font-[family-name:var(--mono)] text-xs tracking-wide">
        {message}
      </span>
    </div>
  );
}

/**
 * Variante pour les cellules de tableau (skeleton row)
 */
// Valeurs pré-calculées pour éviter Math.random() pendant le render (règle react-hooks/purity)
const SKELETON_WIDTHS = [40, 35, 28, 22, 45, 30, 25, 38].map((w) => `${w}%`);
const SKELETON_OPACITIES = [0.7, 0.6, 0.8, 0.65, 0.75, 0.55, 0.7, 0.6];

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-4 px-4 animate-pulse">
      {Array.from({ length: columns }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded bg-[var(--surface)]"
          style={{
            width:
              i === 0 ? "40%" : SKELETON_WIDTHS[i % SKELETON_WIDTHS.length],
            opacity: SKELETON_OPACITIES[i % SKELETON_OPACITIES.length],
          }}
        />
      ))}
    </div>
  );
}
