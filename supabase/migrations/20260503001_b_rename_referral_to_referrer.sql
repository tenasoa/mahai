-- ============================================================================
-- Phase 2a — Correctif noms de settings parrainage
-- ============================================================================
-- Le code applicatif utilise déjà la clé canonique REFERRER_BONUS_AR (celui
-- qui parraine = referrer). Ma migration précédente (20260503_credits_cleanup)
-- avait créé REFERRAL_BONUS_AR par erreur de nommage.
--
-- Cette migration aligne la DB sur le code : RENAME ou DELETE.
-- Idempotente.
-- ============================================================================

BEGIN;

-- Si REFERRAL_BONUS_AR existe (créée par 20260503), on la renomme en REFERRER_BONUS_AR.
-- Si REFERRER_BONUS_AR existe déjà, on garde, et on supprime éventuellement
-- le doublon REFERRAL_BONUS_AR.
DO $$
DECLARE
  has_referral_ar BOOLEAN;
  has_referrer_ar BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM "SystemSetting" WHERE key = 'REFERRAL_BONUS_AR')
    INTO has_referral_ar;
  SELECT EXISTS (SELECT 1 FROM "SystemSetting" WHERE key = 'REFERRER_BONUS_AR')
    INTO has_referrer_ar;

  IF has_referral_ar AND NOT has_referrer_ar THEN
    -- Renommer REFERRAL_BONUS_AR → REFERRER_BONUS_AR
    UPDATE "SystemSetting"
    SET key = 'REFERRER_BONUS_AR'
    WHERE key = 'REFERRAL_BONUS_AR';
    RAISE NOTICE 'Renamed REFERRAL_BONUS_AR -> REFERRER_BONUS_AR.';
  ELSIF has_referral_ar AND has_referrer_ar THEN
    -- Doublon : on garde REFERRER_BONUS_AR (celui que le code utilise) et
    -- on supprime REFERRAL_BONUS_AR. La valeur de REFERRER_BONUS_AR est
    -- considérée comme la source de vérité.
    DELETE FROM "SystemSetting" WHERE key = 'REFERRAL_BONUS_AR';
    RAISE NOTICE 'Removed duplicate REFERRAL_BONUS_AR (kept REFERRER_BONUS_AR).';
  ELSIF NOT has_referral_ar AND NOT has_referrer_ar THEN
    -- Aucune des deux : on insère REFERRER_BONUS_AR avec valeur par défaut
    INSERT INTO "SystemSetting" (key, value, type, label, description, category, "isEditable")
    VALUES (
      'REFERRER_BONUS_AR',
      '1000',
      'number',
      'Bonus de parrainage parrain (Ar)',
      'Solde Ariary offert au parrain quand son filleul effectue son premier achat',
      'referral',
      true
    )
    ON CONFLICT (key) DO NOTHING;
    RAISE NOTICE 'Inserted default REFERRER_BONUS_AR=1000.';
  END IF;
END $$;

COMMIT;
