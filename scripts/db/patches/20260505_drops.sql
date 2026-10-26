ALTER TABLE "User" DROP COLUMN IF EXISTS credits;
ALTER TABLE "Subject" DROP COLUMN IF EXISTS credits;
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "priceInAr";        -- Redondant avec prix
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "priceInCredits";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "contributorRevenuInAr";
ALTER TABLE "Purchase" DROP COLUMN IF EXISTS "creditsAmount";
ALTER TABLE "Purchase" DROP COLUMN IF EXISTS amount;             -- Redondant avec amountAr
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "prixEnCredits";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "estimatedContributorRevenue";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "prixEnAr";  -- Redondant avec prix
ALTER TABLE "CreditPack" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "CreditPack" DROP COLUMN IF EXISTS price;              -- Remplacé par arAmount
ALTER TABLE "UserReferral" DROP COLUMN IF EXISTS "referrerBonusCredits";
ALTER TABLE "UserReferral" DROP COLUMN IF EXISTS "referredBonusCredits";
