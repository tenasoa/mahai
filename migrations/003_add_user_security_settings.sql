-- Mah.AI - Migration: Add security settings columns to User
-- Date: 2026-03-18
-- Run in Supabase SQL Editor

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "securityTwoFactorEnabled" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "securityLoginAlertEnabled" BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS "securityUnknownDeviceBlock" BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN IF NOT EXISTS "securityRecoveryEmailEnabled" BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN IF NOT EXISTS "securitySessionTimeoutMinutes" INTEGER DEFAULT 120 NOT NULL,
ADD COLUMN IF NOT EXISTS "securitySettingsUpdatedAt" TIMESTAMPTZ;

ALTER TABLE "User"
DROP CONSTRAINT IF EXISTS "User_securitySessionTimeoutMinutes_check";

ALTER TABLE "User"
ADD CONSTRAINT "User_securitySessionTimeoutMinutes_check"
CHECK ("securitySessionTimeoutMinutes" BETWEEN 15 AND 1440);

COMMENT ON COLUMN "User"."securityTwoFactorEnabled" IS 'Préférence utilisateur pour activer 2FA';
COMMENT ON COLUMN "User"."securityLoginAlertEnabled" IS 'Envoi d''alertes email sur nouvelle connexion';
COMMENT ON COLUMN "User"."securityUnknownDeviceBlock" IS 'Blocage des connexions depuis appareil inconnu';
COMMENT ON COLUMN "User"."securityRecoveryEmailEnabled" IS 'Autorise la récupération du compte par email';
COMMENT ON COLUMN "User"."securitySessionTimeoutMinutes" IS 'Durée d''expiration automatique de session';
COMMENT ON COLUMN "User"."securitySettingsUpdatedAt" IS 'Dernière mise à jour des réglages sécurité';
