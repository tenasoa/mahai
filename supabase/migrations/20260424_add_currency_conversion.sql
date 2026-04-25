/**
 * Migration SQL pour ajouter la gestion des conversions Ar ↔ cr
 * Date: 24 avril 2026
 */

-- 1. Créer la table CurrencyConfig pour la configuration centralisée des taux
CREATE TABLE IF NOT EXISTS "CurrencyConfig" (
  id TEXT PRIMARY KEY,
  "arPerCredit" DECIMAL(10, 4) NOT NULL DEFAULT 50.0,
  "platformFeePercent" DECIMAL(5, 2) NOT NULL DEFAULT 30.0,
  "activeAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedBy" TEXT REFERENCES "User"(id),
  note TEXT
);

-- Index pour obtenir rapidement la config active
CREATE INDEX IF NOT EXISTS "idx_currency_config_active" ON "CurrencyConfig"("activeAt" DESC);

-- 2. Ajouter les colonnes de conversion à SubjectSubmission
ALTER TABLE "SubjectSubmission" ADD COLUMN IF NOT EXISTS "prixEnAr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SubjectSubmission" ADD COLUMN IF NOT EXISTS "prixEnCredits" INTEGER;
ALTER TABLE "SubjectSubmission" ADD COLUMN IF NOT EXISTS "estimatedContributorRevenue" INTEGER;
ALTER TABLE "SubjectSubmission" ADD COLUMN IF NOT EXISTS "conversionRate" DECIMAL(10, 4);

-- 3. Ajouter les colonnes de conversion à Subject
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "priceInAr" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "priceInCredits" INTEGER;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "conversionRate" DECIMAL(10, 4);
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "contributorRevenuInAr" INTEGER;

-- 4. Améliorer la table CreditPack avec conversions
ALTER TABLE "CreditPack" ADD COLUMN IF NOT EXISTS "conversionRate" DECIMAL(10, 4);

-- 5. Insérer la configuration par défaut
INSERT INTO "CurrencyConfig" (id, "arPerCredit", "platformFeePercent") 
VALUES (gen_random_uuid(), 50.0, 30.0)
ON CONFLICT DO NOTHING;

-- 6. Ajouter des commentaires aux colonnes
COMMENT ON COLUMN "CurrencyConfig"."arPerCredit" IS '1 crédit = X Ariary';
COMMENT ON COLUMN "CurrencyConfig"."platformFeePercent" IS 'Frais plateforme en pourcentage (ex: 30%)';
COMMENT ON COLUMN "SubjectSubmission"."prixEnAr" IS 'Prix d''achat en Ariary (saisi par le contributeur)';
COMMENT ON COLUMN "SubjectSubmission"."prixEnCredits" IS 'Prix équivalent en crédits (calculé)';
COMMENT ON COLUMN "Subject"."priceInAr" IS 'Prix original en Ariary (snapshot)';
COMMENT ON COLUMN "Subject"."priceInCredits" IS 'Prix en crédits (snapshot)';
COMMENT ON COLUMN "Subject"."conversionRate" IS 'Taux de conversion utilisé (snapshot)';
COMMENT ON COLUMN "Subject"."contributorRevenuInAr" IS 'Revenu estimé du contributeur en Ar';
