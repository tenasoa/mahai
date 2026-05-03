import { query } from './db'

export type SettingType = 'string' | 'number' | 'boolean' | 'json'

export async function getSystemSetting<T = string>(key: string, defaultValue: T): Promise<T> {
  try {
    const result = await query(
      'SELECT value, type FROM "SystemSetting" WHERE key = $1 LIMIT 1',
      [key]
    )

    if (result.rows.length === 0) {
      return defaultValue
    }

    const { value, type } = result.rows[0]

    switch (type) {
      case 'number':
        return Number(value) as unknown as T
      case 'boolean':
        return (value === 'true') as unknown as T
      case 'json':
        try {
          return JSON.parse(value) as T
        } catch {
          return defaultValue
        }
      default:
        return value as unknown as T
    }
  } catch (error) {
    console.error(`Error fetching system setting ${key}:`, error)
    return defaultValue
  }
}

/**
 * Récupère les bonus de parrainage en Ariary.
 *
 * Defaults (utilisés si la SystemSetting n'existe pas en DB) :
 *   - Welcome   : 500 Ar  (10 cr × 50 historique)
 *   - Referrer  : 1000 Ar (20 cr × 50)
 *   - Referred  : 500 Ar  (10 cr × 50)
 *
 * Note : on garde temporairement les champs `welcomeBonus` / `referrerBonus`
 * / `referredBonus` (en crédits, deprecated) avec valeur 0 pour compat
 * d'API avec d'éventuels appelants legacy. Ils seront supprimés en
 * Phase 4 du refactoring.
 */
export async function getReferralSettings() {
  const [welcomeBonusAr, referrerBonusAr, referredBonusAr] = await Promise.all([
    getSystemSetting('WELCOME_BONUS_AR', 500),
    getSystemSetting('REFERRER_BONUS_AR', 1000),
    getSystemSetting('REFERRED_BONUS_AR', 500),
  ])

  return {
    welcomeBonusAr,
    referrerBonusAr,
    referredBonusAr,
    // Champs deprecated — gardés pour compat, à supprimer en Phase 4.
    welcomeBonus: 0,
    referrerBonus: 0,
    referredBonus: 0,
  }
}

/**
 * Récupère le pourcentage de frais plateforme (0-100).
 * Remplace l'ancienne table CurrencyConfig.platformFeePercent.
 */
export async function getPlatformFeePercent(defaultValue = 30): Promise<number> {
  const value = await getSystemSetting<number>('PLATFORM_FEE_PERCENT', defaultValue)
  return Math.max(0, Math.min(100, Number(value) || defaultValue))
}

/**
 * Met à jour le pourcentage de frais plateforme.
 */
export async function setPlatformFeePercent(percent: number): Promise<void> {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent * 100) / 100))
  await query(
    `INSERT INTO "SystemSetting" (key, value, type, label, description, category, "isEditable")
     VALUES ('PLATFORM_FEE_PERCENT', $1, 'number',
             'Frais plateforme (%)',
             'Pourcentage prélevé sur chaque vente de sujet par la plateforme (0-100).',
             'finance', true)
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [safePercent.toString()]
  )
}
