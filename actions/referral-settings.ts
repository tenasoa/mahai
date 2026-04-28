"use server";

import { query } from "@/lib/db";

/**
 * Initialise les paramètres de parrainage dans la table SystemSetting
 * Si les paramètres existent déjà, ils ne sont pas modifiés
 */
export async function initializeReferralSettings() {
  try {
    // Vérifier si les settings existent déjà
    const result = await query(
      `SELECT COUNT(*) as count FROM "SystemSetting" 
       WHERE key IN ('WELCOME_BONUS_CREDITS', 'REFERRAL_BONUS_CREDITS', 'REFERRED_BONUS_CREDITS')`
    );

    const existingCount = Number(result.rows[0]?.count || 0);

    // Si tous les settings existent, retourner
    if (existingCount === 3) {
      return {
        success: true,
        message: "Les paramètres de parrainage sont déjà initialisés",
        initialized: false,
      };
    }

    // Initialiser les paramètres
    await Promise.all([
      query(
        `INSERT INTO "SystemSetting" ("key", "value", "type", "description")
         VALUES ('WELCOME_BONUS_CREDITS', '10', 'number', 'Crédits bonus à l''inscription')
         ON CONFLICT("key") DO NOTHING`
      ),
      query(
        `INSERT INTO "SystemSetting" ("key", "value", "type", "description")
         VALUES ('REFERRAL_BONUS_CREDITS', '20', 'number', 'Crédits bonus pour le parrain au 1er achat du filleul')
         ON CONFLICT("key") DO NOTHING`
      ),
      query(
        `INSERT INTO "SystemSetting" ("key", "value", "type", "description")
         VALUES ('REFERRED_BONUS_CREDITS', '10', 'number', 'Crédits bonus pour le filleul à l''inscription')
         ON CONFLICT("key") DO NOTHING`
      ),
    ]);

    return {
      success: true,
      message: "Paramètres de parrainage initialisés avec succès",
      initialized: true,
    };
  } catch (error) {
    console.error("Erreur initializeReferralSettings:", error);
    return {
      success: false,
      error: "Impossible d'initialiser les paramètres de parrainage",
      initialized: false,
    };
  }
}

/**
 * Récupère les paramètres de parrainage actuels
 */
export async function getReferralSettingsForAdmin() {
  try {
    const result = await query(
      `SELECT key, value, type FROM "SystemSetting" 
       WHERE key IN ('WELCOME_BONUS_CREDITS', 'REFERRAL_BONUS_CREDITS', 'REFERRED_BONUS_CREDITS')
       ORDER BY key ASC`
    );

    const settings = result.rows.reduce(
      (acc, row) => {
        acc[row.key] = {
          value: row.type === "number" ? Number(row.value) : row.value,
          type: row.type,
        };
        return acc;
      },
      {} as Record<string, { value: number | string; type: string }>
    );

    return {
      success: true,
      settings,
    };
  } catch (error) {
    console.error("Erreur getReferralSettingsForAdmin:", error);
    return {
      success: false,
      error: "Impossible de récupérer les paramètres",
      settings: {},
    };
  }
}

/**
 * Met à jour un paramètre de parrainage
 */
export async function updateReferralSetting(
  key: "WELCOME_BONUS_CREDITS" | "REFERRAL_BONUS_CREDITS" | "REFERRED_BONUS_CREDITS",
  value: number
) {
  try {
    if (value < 0) {
      return {
        success: false,
        error: "La valeur ne peut pas être négative",
      };
    }

    await query(
      `UPDATE "SystemSetting" 
       SET value = $1, "updatedAt" = NOW() 
       WHERE key = $2`,
      [String(value), key]
    );

    return {
      success: true,
      message: `Paramètre ${key} mis à jour à ${value}`,
    };
  } catch (error) {
    console.error("Erreur updateReferralSetting:", error);
    return {
      success: false,
      error: "Impossible de mettre à jour le paramètre",
    };
  }
}
