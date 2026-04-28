-- Migration: Initialisation des paramètres de parrainage
-- Date: 2026-04-28
-- Description: Crée les entrées SystemSetting pour gérer les bonus de parrainage

-- Vérifier si la table SystemSetting existe et la créer si nécessaire
CREATE TABLE IF NOT EXISTS "SystemSetting" (
  "id" SERIAL PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "value" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('string', 'number', 'boolean', 'json')),
  "description" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initialiser les paramètres de parrainage (INSERT OR IGNORE)
INSERT INTO "SystemSetting" ("key", "value", "type", "description")
VALUES
  ('WELCOME_BONUS_CREDITS', '10', 'number', 'Crédits bonus à l''inscription (email vérifié)'),
  ('REFERRAL_BONUS_CREDITS', '20', 'number', 'Crédits bonus pour le parrain au 1er achat du filleul'),
  ('REFERRED_BONUS_CREDITS', '10', 'number', 'Crédits bonus pour le filleul à l''inscription')
ON CONFLICT("key") DO NOTHING;

COMMENT ON TABLE "SystemSetting" IS 'Paramètres système configurables de l''application';
COMMENT ON COLUMN "SystemSetting"."key" IS 'Clé unique du paramètre';
COMMENT ON COLUMN "SystemSetting"."value" IS 'Valeur du paramètre (stockée en TEXT, type indiqué par colonne type)';
COMMENT ON COLUMN "SystemSetting"."type" IS 'Type de la valeur: string, number, boolean, json';
