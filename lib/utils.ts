import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate un montant en Ariary, devise unique de Mah.AI.
 * Exemple : formatAr(12000) → "12 000 Ar".
 *
 * Source unique pour l'affichage monétaire — remplace les variantes
 * dupliquées (`Intl.NumberFormat(...) + ' Ar'`, `toLocaleString('fr-FR') + ' Ar'`).
 */
export function formatAr(amount: number | string | null | undefined): string {
  const value = Number(amount ?? 0)
  const safe = Number.isFinite(value) ? value : 0
  return `${new Intl.NumberFormat("fr-FR").format(safe)} Ar`
}
