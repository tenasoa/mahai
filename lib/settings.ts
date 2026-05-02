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

export async function getReferralSettings() {
  const [
    welcomeBonus, referrerBonus, referredBonus,
    welcomeBonusAr, referrerBonusAr, referredBonusAr
  ] = await Promise.all([
    getSystemSetting('WELCOME_BONUS_CREDITS', 10),        // @deprecated
    getSystemSetting('REFERRAL_BONUS_CREDITS', 20),       // @deprecated
    getSystemSetting('REFERRED_BONUS_CREDITS', 10),       // @deprecated
    getSystemSetting('WELCOME_BONUS_AR', 500),            // 10 crédits * 50 Ar
    getSystemSetting('REFERRER_BONUS_AR', 1000),          // 20 crédits * 50 Ar
    getSystemSetting('REFERRED_BONUS_AR', 500),           // 10 crédits * 50 Ar
  ])

  return {
    // Anciennes valeurs en crédits (deprecated)
    welcomeBonus,
    referrerBonus,
    referredBonus,
    // Nouvelles valeurs en Ariary
    welcomeBonusAr,
    referrerBonusAr,
    referredBonusAr,
  }
}
