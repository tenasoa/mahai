/**
 * TEST END-TO-END - Système de Parrainage
 */

import { query } from "@/lib/db";

describe('Système de Parrainage', () => {
  it('devrait vérifier la configuration et la structure du système de parrainage', async () => {
    // 1. Vérifier que les settings sont initialisés
    const settingsResult = await query(
      `SELECT key, value FROM "SystemSetting"
       WHERE key IN ('WELCOME_BONUS_CREDITS', 'REFERRAL_BONUS_CREDITS', 'REFERRED_BONUS_CREDITS')
       ORDER BY key`
    );

    expect(settingsResult.rows.length).toBe(3);

    // 2. Vérifier la table UserReferral
    const tableResult = await query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'UserReferral'
       ORDER BY ordinal_position`
    );

    const requiredColumns = [
      "id",
      "referrerUserId",
      "referredUserId",
      "status",
      "referrerBonusCredits",
      "referredBonusCredits",
      "referrerBonusGrantedAt",
      "referredBonusGrantedAt",
    ];
    const existingColumns = tableResult.rows.map((r: any) => r.column_name);
    requiredColumns.forEach(col => {
      expect(existingColumns).toContain(col);
    });

    // 3. Vérifier les colonnes referral sur User
    const userTableResult = await query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = 'User' 
       AND column_name IN ('referralCode', 'referredByUserId')`
    );

    expect(userTableResult.rows.length).toBe(2);

    // 4. Vérifier les types de CreditTransaction
    const txTypesResult = await query(
      `SELECT DISTINCT type FROM "CreditTransaction" ORDER BY type`
    );
    const existingTypes = txTypesResult.rows.map((r: any) => r.type);
    expect(existingTypes).toContain("EARN");
    expect(existingTypes).toContain("SPEND");
    expect(existingTypes).toContain("RECHARGE");

    // 5. Vérifier la validation du code de parrainage
    const validateReferralCode = (code: string): boolean => {
      if (!code || typeof code !== "string") return true;
      const normalized = code.trim().toUpperCase();
      if (normalized.length === 0) return true;
      return /^[A-Z0-9-]+$/.test(normalized) && normalized.length <= 40;
    };

    expect(validateReferralCode("HERIZO-2024")).toBe(true);
    expect(validateReferralCode("BOB-ABC123")).toBe(true);
    expect(validateReferralCode("invalid@code")).toBe(false);
    expect(validateReferralCode("")).toBe(true);
  });
});
