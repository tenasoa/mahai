import { useEffect, useRef } from "react";

import { dessinerFormule } from "~/lib/document/katex.client";

/**
 * Formule LaTeX : le texte brut est rendu côté serveur (lisible sans JavaScript), puis KaTeX le
 * dessine dans le navigateur (trop coûteux en CPU pour un Worker).
 */
export function Tex({ latex, bloc = false }: { latex: string; bloc?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) void dessinerFormule(ref.current, latex, bloc);
  }, [latex, bloc]);
  return (
    <span ref={ref} className="tex" data-bloc={bloc ? "" : undefined}>
      {latex}
    </span>
  );
}
