/**
 * Service centralisé pour la gestion des frais plateforme
 * Système unifié en Ariary uniquement (crédits supprimés)
 */

export interface PlatformFeeConfig {
  platformFeePercent: number // % de frais plateforme (ex: 30)
}

export class CurrencyConverter {
  // Système unifié en Ariary : aucune conversion de devise. Cette classe
  // ne gère plus que le calcul des frais plateforme.

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
