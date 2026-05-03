/**
 * Service centralisé pour la gestion des frais plateforme
 * Système unifié en Ariary uniquement (crédits supprimés)
 */

export interface PlatformFeeConfig {
  platformFeePercent: number // % de frais plateforme (ex: 30)
}

export class CurrencyConverter {
  // NOTE: Les méthodes de conversion crédits ↔ Ariary ont été supprimées.
  // Le système utilise uniquement l'Ariary comme devise.
  //
  // On garde des stubs no-op pour quelques méthodes encore appelées par l'UI,
  // afin de ne pas casser le build pendant la transition. À supprimer en
  // Phase 4 du refactoring.

  /** @deprecated No-op : la conversion crédit↔Ar a été supprimée. */
  static cacheRate(_rate: number): void {
    // Plus de cache de taux, le système est unifié en Ariary.
  }

  /** @deprecated Identité : 1 crédit historique = 1 unité Ar (système unifié). */
  static arToCredits(amountAr: number): number {
    return Math.round(Number(amountAr) || 0)
  }

  /** @deprecated Identité : 1 crédit = 1 Ar dans le système unifié. */
  static creditsToAr(credits: number): number {
    return Math.round(Number(credits) || 0)
  }

  /**
   * Calculer le revenu du contributeur après frais plateforme
   * @param priceInAr Prix en Ariary
   * @param platformFeePercent Pourcentage de frais (ex: 30)
   * @returns Revenu net en Ariary
   */
  static calculateContributorRevenue(priceInAr: number, platformFeePercent: number): number {
    const feePercent = Math.max(0, Math.min(100, platformFeePercent)) // 0-100%
    return Math.round(priceInAr * (1 - feePercent / 100))
  }

  /**
   * Calculer les frais plateforme
   * @param priceInAr Prix en Ariary
   * @param platformFeePercent Pourcentage de frais (ex: 30)
   * @returns Montant des frais en Ariary
   */
  static calculatePlatformFee(priceInAr: number, platformFeePercent: number): number {
    const feePercent = Math.max(0, Math.min(100, platformFeePercent))
    return Math.round(priceInAr * (feePercent / 100))
  }

  /**
   * Valider les paramètres de frais plateforme
   */
  static validate(
    platformFeePercent: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!Number.isFinite(platformFeePercent) || platformFeePercent < 0 || platformFeePercent > 100) {
      errors.push('Frais plateforme doit être entre 0 et 100%')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
