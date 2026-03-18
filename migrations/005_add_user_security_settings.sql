-- ═══════════════════════════════════════════════
-- MIGRATION: Ajout des paramètres de sécurité utilisateur
-- Date: 2026-03-18
-- Description: Ajoute les colonnes pour les paramètres de sécurité dans la table User
-- ═══════════════════════════════════════════════

-- Ajout des colonnes de paramètres de sécurité
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "securityTwoFactorEnabled" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "securityLoginAlertEnabled" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "securityUnknownDeviceBlock" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "securityRecoveryEmailEnabled" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "securitySessionTimeoutMinutes" INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS "securitySettingsUpdatedAt" TIMESTAMP(3);

-- Ajout de commentaires pour documenter les colonnes
COMMENT ON COLUMN "User"."securityTwoFactorEnabled" IS 'Authentification à deux facteurs (2FA)';
COMMENT ON COLUMN "User"."securityLoginAlertEnabled" IS 'Alertes de connexion par email';
COMMENT ON COLUMN "User"."securityUnknownDeviceBlock" IS 'Blocage des appareils inconnus';
COMMENT ON COLUMN "User"."securityRecoveryEmailEnabled" IS 'Récupération de compte par email';
COMMENT ON COLUMN "User"."securitySessionTimeoutMinutes" IS 'Délai d''expiration de session en minutes';
COMMENT ON COLUMN "User"."securitySettingsUpdatedAt" IS 'Date de dernière mise à jour des paramètres de sécurité';

-- Index pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_user_security_2fa ON "User"("securityTwoFactorEnabled");
CREATE INDEX IF NOT EXISTS idx_user_security_settings_updated ON "User"("securitySettingsUpdatedAt");
