# Supabase Migrations - Credits to Ariary Migration

## Overview

This directory contains the migration files for the **Credits → Ariary** currency migration completed on May 3, 2026.

## Migration History

### Phase 1: Foundation (2026-04-24 to 2026-05-02)

| File | Description | Status |
|------|-------------|--------|
| `20260423_subject_submission.sql` | Initial subject submission system | ✅ Applied |
| `20260424_add_currency_conversion.sql` | Currency conversion table (now deprecated) | ⚠️ Legacy |
| `20260424_subject_submission_revision.sql` | Submission system revisions | ✅ Applied |
| `20260425_notifications_unified.sql` | Unified notification system | ✅ Applied |
| `20260425_subject_download_tracking.sql` | Download tracking | ✅ Applied |
| `20260425_subject_full_metadata.sql` | Full metadata support | ✅ Applied |
| `20260426_ai_correction.sql` | AI correction system | ✅ Applied |
| `20260427_ai_providers.sql` | AI provider configuration | ✅ Applied |
| `20260428_admin_audit_log.sql` | Admin audit logging | ✅ Applied |
| `20260428_extend_examen_type_enum.sql` | Extended exam types | ✅ Applied |

### Phase 2: Credits → Ariary Migration (2026-05-02 to 2026-05-04)

| File | Description | Status |
|------|-------------|--------|
| `20260501_add_openai_ai_provider.sql` | OpenAI provider support | ✅ Applied |
| `20260502_add_submission_admin_columns.sql` | Admin columns for submissions | ✅ Applied |
| `20260502_remove_credits_use_ariary_only.sql` | **Main migration** - Replace credits with Ariary | ✅ Applied |
| `20260503_b_rename_referral_to_referrer.sql` | Fix referral settings key names | ✅ Applied |
| `20260503_credits_cleanup_pre_drop.sql` | Cleanup before column drops | ✅ Applied |
| `20260504_phase2_settings_to_ariary.sql` | System settings migration | ✅ Applied |
| `20260504_add_referral_bonus_ar_columns.sql` | Add missing UserReferral columns | ✅ Applied |

### Phase 3: Final Cleanup (Pending - 48h after production stability)

**⚠️ DO NOT APPLY YET** - Wait 48h after production deployment without errors.

```sql
-- Migration: 20260505_credits_drop_columns.sql (to be created)
-- Actions:
-- 1. DROP COLUMN "credits" FROM "User"
-- 2. DROP COLUMN "credits" FROM "Subject"
-- 3. DROP COLUMN "creditsAmount" FROM "Purchase"
-- 4. DROP TABLE "CreditTransaction"
-- 5. DROP TABLE "CurrencyConfig" (if not already dropped)
-- 6. DELETE FROM "SystemSetting" WHERE key LIKE '%_CREDITS%'
```

## Post-Migration Checklist

- [x] All TypeScript files migrated
- [x] All React components updated
- [x] All API routes updated
- [x] All database types updated (`balanceAr`, `amountAr`, `prix`)
- [x] Realtime subscriptions migrated to `Transaction` table
- [x] Test files updated
- [x] Documentation updated (CLAUDE.md)
- [x] Legacy docs removed (STRATEGIE_CONVERSION_PRIX.md)
- [x] Build passes (`npm run build`)
- [x] TypeScript check passes (`npx tsc --noEmit`)

## Deprecated Elements (for reference)

| Old | New | Notes |
|-----|-----|-------|
| `User.credits` | `User.balanceAr` | User balance in Ariary |
| `Subject.credits` | `Subject.prix` | Subject price in Ariary |
| `Purchase.creditsAmount` | `Purchase.amountAr` | Purchase amount in Ariary |
| `CreditTransaction` | `Transaction` | All transactions table |
| `CreditTransaction.creditsAmount` | `Transaction.amountAr` | Transaction amount |
| `WELCOME_BONUS_CREDITS` | `WELCOME_BONUS_AR` | Setting key |
| `REFERRAL_BONUS_CREDITS` | `REFERRER_BONUS_AR` | Setting key |
| `REFERRED_BONUS_CREDITS` | `REFERRED_BONUS_AR` | Setting key |
| `CurrencyConfig` | `SystemSetting` | Platform fee config |
| `50 Ar = 1 cr` | N/A | Fixed conversion rate applied during migration |

## Verification Commands

```bash
# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Tests (requires DB connection)
npm test

# Grep for any remaining credit references
grep -rn "crédit\|credit" actions app components lib --include="*.ts" --include="*.tsx"
```

## Rollback Procedure

If critical issues occur within 48h of migration:

1. Restore Supabase snapshot taken before migration
2. Redeploy previous code version (pre-migration commit)
3. Notify users of temporary maintenance

## Contact

For issues related to this migration, refer to:
- Migration plan: `docs/plans/2026-05-03-credits-to-ariary-migration.md`
- Original issue tracking: GitHub issues
