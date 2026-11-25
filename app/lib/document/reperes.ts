/**
 * Repères posés sur une image (« Annotez le document ») : un point sur l'image, relié par un
 * trait à son étiquette (numéro ou nom). Coordonnées en fraction de la largeur et de la hauteur.
 */

export type Repere = { x: number; y: number; tx: number; ty: number; texte: string };

export const MAX_REPERES = 30;
const MAX_TEXTE = 40;

const fraction = (v: unknown, defaut: number) => {
  const n = typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? Math.round(Math.min(1, Math.max(0, n)) * 10_000) / 10_000 : defaut;
};

export function normaliserReperes(v: unknown): Repere[] {
  return (Array.isArray(v) ? v : []).slice(0, MAX_REPERES).flatMap((b) => {
    if (!b || typeof b !== "object") return [];
    const o = b as Record<string, unknown>;
    const x = fraction(o.x, NaN);
    const y = fraction(o.y, NaN);
    if (Number.isNaN(x) || Number.isNaN(y)) return [];
    return [{ x, y, tx: fraction(o.tx, x), ty: fraction(o.ty, y), texte: typeof o.texte === "string" ? o.texte.slice(0, MAX_TEXTE) : "" }];
  });
}

/** Nouveau repère au point cliqué, son étiquette décalée vers le bord le plus proche. */
export function nouveauRepere(x: number, y: number, existants: Repere[]): Repere {
  const tx = x < 0.5 ? Math.max(0.04, x - 0.14) : Math.min(0.96, x + 0.14);
  // Premier numéro libre.
  const pris = new Set(existants.map((r) => r.texte));
  let n = 1;
  while (pris.has(String(n))) n++;
  return normaliserReperes([{ x, y, tx, ty: y, texte: String(n) }])[0]!;
}
