-- Migration : Ajout du paramètre pour le bonus du filleul et correction des descriptions
-- Date : 2026-04-28

INSERT INTO "SystemSetting" ("key", "value", "type", "label", "description", "category", "isEditable")
VALUES 
  ('REFERRED_BONUS_CREDITS', '10', 'number', 'Bonus filleul', 'Crédits offerts au filleul lors de la confirmation de son compte', 'referral', true)
ON CONFLICT ("key") DO UPDATE 
SET "label" = EXCLUDED."label", 
    "description" = EXCLUDED."description";

UPDATE "SystemSetting"
SET "description" = 'Crédits offerts au parrain quand son filleul devient actif (premier achat de sujet)'
WHERE "key" = 'REFERRAL_BONUS_CREDITS';
