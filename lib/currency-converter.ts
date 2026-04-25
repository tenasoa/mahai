/**
 * Service centralisé pour la gestion des conversions Ar ↔ Crédits
 * Taux configurable : 1 crédit = X Ariary (défaut 50 Ar)
 */

export interface CurrencyConfig {
  id: string
  arPerCredit: number // 1 crédit = X Ariary
  platformFeePercent: number // % de frais plateforme
  createdAt: string
  updatedAt: string
  updatedBy?: string
  note?: string
}

export class CurrencyConverter {
  /**
   * Convertir Ariary → Crédits
   * @param arAmount Montant en Ariary
   * @param exchangeRate Taux de change (1 cr = X Ar)
   * @returns Nombre de crédits
   */
  static arToCredits(arAmount: number, exchangeRate: number): number {
    if (exchangeRate <= 0) throw new Error('Taux de change invalide')
    return Math.round(arAmount / exchangeRate)
  }

  /**
   * Convertir Crédits → Ariary
   * @param creditsAmount Nombre de crédits
   * @param exchangeRate Taux de change (1 cr = X Ar)
   * @returns Montant en Ariary
   */
  static creditsToAr(creditsAmount: number, exchangeRate: number): number {
    if (exchangeRate <= 0) throw new Error('Taux de change invalide')
    return Math.round(creditsAmount * exchangeRate)
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
   * Obtenir le taux de change actuel depuis le cache
   * À utiliser côté client après récupération via API
   */
  static getCachedRate(): number {
    if (typeof window === 'undefined') return 50 // Serveur
    const cached = sessionStorage.getItem('currencyRate')
    return cached ? parseInt(cached, 10) : 50
  }

  /**
   * Cacher le taux de change côté client
   */
  static cacheRate(rate: number): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currencyRate', String(rate))
    }
  }

  /**
   * Valider les paramètres de conversion
   */
  static validate(
    arPerCredit: number,
    platformFeePercent: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!Number.isFinite(arPerCredit) || arPerCredit <= 0) {
      errors.push('Taux de change doit être > 0')
    }

    if (!Number.isFinite(platformFeePercent) || platformFeePercent < 0 || platformFeePercent > 100) {
      errors.push('Frais plateforme doit être entre 0 et 100%')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
