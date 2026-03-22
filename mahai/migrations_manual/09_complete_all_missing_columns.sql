-- ═══════════════════════════════════════════════════════════════
-- MIGRATION COMPLÈTE : Ajout de toutes les colonnes manquantes
-- Date: 2026-03-19
-- Exécuter CE SEUL script dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- 1. Table USER : colonnes de profil
-- ─────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "birthDate" TEXT,
  ADD COLUMN IF NOT EXISTS "nomComplet" TEXT,
  ADD COLUMN IF NOT EXISTS "pseudo" TEXT,
  ADD COLUMN IF NOT EXISTS "profilePicture" TEXT,
  ADD COLUMN IF NOT EXISTS "defaultOperator" TEXT DEFAULT 'MVOLA';

COMMENT ON COLUMN "User"."birthDate" IS 'Date de naissance au format ISO (YYYY-MM-DD)';
COMMENT ON COLUMN "User"."nomComplet" IS 'Nom complet affiché publiquement (prénom + nom)';
COMMENT ON COLUMN "User"."pseudo" IS 'Pseudonyme pour l''affichage dans l''interface';
COMMENT ON COLUMN "User"."profilePicture" IS 'URL de l''avatar utilisateur (stocké sur Vercel Blob)';
COMMENT ON COLUMN "User"."defaultOperator" IS 'Opérateur de paiement par défaut (MVOLA, ORANGE, AIRTEL)';

-- ─────────────────────────────────────────
-- 2. Table USER : colonnes de sécurité
-- ─────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "securityTwoFactorEnabled" BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "securityLoginAlertEnabled" BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "securityUnknownDeviceBlock" BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS "securityRecoveryEmailEnabled" BOOLEAN DEFAULT true NOT NULL,
  ADD COLUMN IF NOT EXISTS "securitySessionTimeoutMinutes" INTEGER DEFAULT 120 NOT NULL,
  ADD COLUMN IF NOT EXISTS "securitySettingsUpdatedAt" TIMESTAMPTZ;

-- Contrainte sur le timeout de session
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

-- ─────────────────────────────────────────
-- 3. Table CreditTransaction : metadata JSONB
-- ─────────────────────────────────────────
ALTER TABLE "CreditTransaction"
  ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}';

COMMENT ON COLUMN "CreditTransaction"."metadata" IS 'Données JSON supplémentaires (operator, phoneNumber, price, transferCode, etc.)';

-- ─────────────────────────────────────────
-- 4. Index pour les nouvelles colonnes
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_birthdate ON "User"("birthDate");
CREATE INDEX IF NOT EXISTS idx_user_pseudo ON "User"("pseudo");
CREATE INDEX IF NOT EXISTS idx_user_profilepicture ON "User"("profilePicture");
CREATE INDEX IF NOT EXISTS idx_user_nom ON "User"("nom");
CREATE INDEX IF NOT EXISTS idx_user_prenom ON "User"("prenom");

-- ─────────────────────────────────────────
-- 5. Migration des données existantes
-- ─────────────────────────────────────────

-- Initialiser nomComplet pour les utilisateurs existants
UPDATE "User"
SET "nomComplet" = TRIM(COALESCE("prenom", '') || ' ' || COALESCE("nom", ''))
WHERE "nomComplet" IS NULL AND ("prenom" IS NOT NULL OR "nom" IS NOT NULL);

-- Initialiser pseudo avec prenom pour les utilisateurs existants
UPDATE "User"
SET "pseudo" = "prenom"
WHERE "pseudo" IS NULL AND "prenom" IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════
-- TERMINÉ ! Toutes les colonnes manquantes ont été ajoutées.
-- ═══════════════════════════════════════════════════════════════
