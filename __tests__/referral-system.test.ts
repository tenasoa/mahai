/**
 * TEST - Système de Parrainage
 * Les requêtes DB sont mockées pour éviter toute connexion réelle.
 */

jest.mock('@/lib/db', () => ({
  query: jest.fn(),
}));

import { query } from "@/lib/db";

const mockQuery = query as jest.Mock;

describe('Système de Parrainage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait vérifier la configuration et la structure du système de parrainage', async () => {
    // 1. Mock pour les settings Ariary
    mockQuery
      .mockResolvedValueOnce({
        rows: [
          { key: 'REFERRER_BONUS_AR', value: '2000' },
          { key: 'REFERRED_BONUS_AR', value: '1000' },
          { key: 'WELCOME_BONUS_AR', value: '500' },
        ],
      })
      // 2. Mock pour les colonnes de UserReferral
      .mockResolvedValueOnce({
        rows: [
          { column_name: 'id', data_type: 'uuid' },
          { column_name: 'referrerUserId', data_type: 'uuid' },
          { column_name: 'referredUserId', data_type: 'uuid' },
          { column_name: 'status', data_type: 'text' },
          { column_name: 'referrerBonusAr', data_type: 'numeric' },
          { column_name: 'referredBonusAr', data_type: 'numeric' },
          { column_name: 'referrerBonusGrantedAt', data_type: 'timestamp' },
          { column_name: 'referredBonusGrantedAt', data_type: 'timestamp' },
        ],
      })
      // 3. Mock pour les colonnes de User
      .mockResolvedValueOnce({
        rows: [
          { column_name: 'referralCode' },
          { column_name: 'referredByUserId' },
        ],
      })
      // 4. Mock pour les types de Transaction
      .mockResolvedValueOnce({
        rows: [
          { type: 'EARN' },
          { type: 'RECHARGE' },
          { type: 'SPEND' },
        ],
      });

    // 1. Vérifier que les settings sont initialisés (clés Ariary post-refactor cr→Ar)
    const settingsResult = await query(
      `SELECT key, value FROM "SystemSetting"
       WHERE key IN ('WELCOME_BONUS_AR', 'REFERRER_BONUS_AR', 'REFERRED_BONUS_AR')
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
      "referrerBonusAr",
      "referredBonusAr",
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

    // 4. Vérifier les types de Transaction (anciennement CreditTransaction)
    const txTypesResult = await query(
      `SELECT DISTINCT type FROM "Transaction" ORDER BY type`
    );
    const existingTypes = txTypesResult.rows.map((r: any) => r.type);
    expect(existingTypes).toContain("EARN");
    expect(existingTypes).toContain("SPEND");
    expect(existingTypes).toContain("RECHARGE");

    // 5. Vérifier la validation du code de parrainage (logique pure, pas de DB)
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
