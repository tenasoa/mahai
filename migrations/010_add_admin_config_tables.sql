-- Migration : Tables de configuration admin pour la gestion dynamique
-- Date : 2026-04-21
-- Description : Création des tables pour les numéros marchand, packs de crédits et paramètres système

-- ============================================================
-- 1. TABLE MerchantPhone - Numéros de réception Mobile Banking
-- ============================================================
CREATE TABLE IF NOT EXISTS "MerchantPhone" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "operator" TEXT NOT NULL CHECK (operator IN ('mvola', 'orange', 'airtel')),
  "phone" TEXT NOT NULL,
  "label" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "isDefault" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par opérateur et statut
CREATE INDEX IF NOT EXISTS idx_merchant_phone_operator ON "MerchantPhone"("operator");
CREATE INDEX IF NOT EXISTS idx_merchant_phone_active ON "MerchantPhone"("isActive");

-- Contrainte unique : un seul numéro par défaut par opérateur
CREATE UNIQUE INDEX IF NOT EXISTS idx_merchant_phone_default 
ON "MerchantPhone"("operator") 
WHERE "isDefault" = true;

-- Données initiales
INSERT INTO "MerchantPhone" ("operator", "phone", "label", "isActive", "isDefault") VALUES
  ('orange', '032 17 560 02', 'Numéro principal Orange', true, true),
  ('mvola', '034 77 130 85', 'Numéro principal Mvola', true, true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE "MerchantPhone" IS 'Numéros de téléphone pour la réception des paiements Mobile Money';
COMMENT ON COLUMN "MerchantPhone"."operator" IS 'Opérateur mobile: mvola, orange, airtel';


-- ============================================================
-- 2. TABLE CreditPack - Packs de crédits configurables
-- ============================================================
CREATE TABLE IF NOT EXISTS "CreditPack" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "credits" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "bonus" INTEGER DEFAULT 0,
  "isPopular" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_credit_pack_active ON "CreditPack"("isActive");
CREATE INDEX IF NOT EXISTS idx_credit_pack_order ON "CreditPack"("sortOrder");

-- Données initiales
INSERT INTO "CreditPack" ("name", "credits", "price", "bonus", "isPopular", "isActive", "sortOrder") VALUES
  ('Pack Starter', 50, 2500, 0, false, true, 1),
  ('Pack Standard', 150, 7500, 10, true, true, 2),
  ('Pack Premium', 300, 15000, 25, false, true, 3),
  ('Pack Expert', 500, 25000, 75, false, true, 4)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE "CreditPack" IS 'Configuration des packs de crédits disponibles à l achat';
COMMENT ON COLUMN "CreditPack"."price" IS 'Prix en Ariary (Ar)';
COMMENT ON COLUMN "CreditPack"."bonus" IS 'Crédits bonus offerts avec ce pack';


-- ============================================================
-- 3. TABLE SystemSetting - Paramètres système
-- ============================================================
CREATE TABLE IF NOT EXISTS "SystemSetting" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT UNIQUE NOT NULL,
  "value" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  "label" TEXT,
  "description" TEXT,
  "category" TEXT NOT NULL DEFAULT 'general',
  "isEditable" BOOLEAN DEFAULT true,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par clé
CREATE INDEX IF NOT EXISTS idx_system_setting_key ON "SystemSetting"("key");
CREATE INDEX IF NOT EXISTS idx_system_setting_category ON "SystemSetting"("category");

-- Données initiales
INSERT INTO "SystemSetting" ("key", "value", "type", "label", "description", "category", "isEditable") VALUES
  ('WELCOME_BONUS_CREDITS', '10', 'number', 'Bonus de bienvenue', 'Crédits offerts aux nouveaux utilisateurs lors de l inscription', 'onboarding', true),
  ('REFERRAL_BONUS_CREDITS', '20', 'number', 'Bonus de parrainage', 'Crédits offerts au parrain quand son filleul s inscrit', 'referral', true),
  ('MIN_RECHARGE_AMOUNT', '1000', 'number', 'Montant minimum de recharge', 'Montant minimum en Ariary pour une recharge', 'payment', true),
  ('PAYMENT_VALIDATION_HOURS', '12', 'number', 'Délai de validation', 'Délai estimé de validation manuelle en heures', 'payment', true),
  ('MAINTENANCE_MODE', 'false', 'boolean', 'Mode maintenance', 'Désactive temporairement les paiements', 'system', true),
  ('PAYMENT_MESSAGE', 'Paiement sécurisé via Mobile Money · Validation manuelle sous 12h', 'string', 'Message de paiement', 'Message affiché dans la section de recharge', 'payment', true)
ON CONFLICT ("key") DO NOTHING;

COMMENT ON TABLE "SystemSetting" IS 'Paramètres de configuration dynamique du système';
