# Plan — Migration définitive Crédits → Ariary uniquement

> Plan rédigé le 2026-05-03 — implémentation à valider avant exécution.

## Contexte & décisions validées

Le système actuel mélange 3 unités (crédits, Ariary, taux de conversion) ce qui crée des bugs récurrents (`column "notes" does not exist`, valeurs incohérentes `credits` vs `balanceAr`, packs avec champ `price` ambigu). Décision : **supprimer définitivement les crédits, tout en Ariary**.

**Paramètres validés par l'utilisateur :**
- Taux de conversion historique : **50 Ar = 1 crédit** (appliqué une fois lors de la migration)
- Tout converti en Ariary, **aucun crédit dans le code final**
- `CreditPack` est gardée mais ne stocke plus que de l'Ariary (le champ `credits` représente le **nombre d'unités du pack**, pas une devise — voir clarification ci-dessous)
- L'onglet « Conversion Ar ↔ cr » de `/admin/configuration` est **supprimé**

**Clarification importante sur `CreditPack.credits` :** ce champ représente la **taille du pack** (ex: 100, 500, 1000 unités) pas une devise. À la migration, on garde le concept de « pack » mais on bascule le **prix** (`price`) vers `arAmount` ou similaire, et on supprime tout calcul `credits × arPerCredit`.

---

## État du repo (déjà partiellement migré)

| Fichier | État |
|---|---|
| `lib/sql-queries.ts` | ✅ déjà à jour (`balanceAr`, `prix`, `amountAr`, `Transaction` type alias) |
| `lib/currency-converter.ts` | ✅ helpers `calculateContributorRevenue` / `calculatePlatformFee` OK |
| `actions/user.ts::purchaseCurrentUserSubject` | ✅ utilise `balanceAr` et `amountAr` |
| `actions/user.ts::grantReferrerBonusOnFirstPurchase` | ✅ calcule `bonusAr = bonus × 50` |
| `supabase/migrations/20260502_remove_credits_use_ariary_only.sql` | ⚠ existe mais incomplet (ne traite pas certaines colonnes obsolètes) |

À l'inverse :
- `actions/profile.ts::rechargeCreditsAction` débite encore `credits` (pas `balanceAr`)
- `actions/admin/credits.ts` : 3 fonctions à supprimer
- `actions/ai-correction.ts` : `creditsCost`, `viewerCredits`, `CreditTransaction` à renommer
- 15+ pages React utilisent encore `credits` ou « cr » dans le UI
- 8 composants partagés (LuxuryNavbar, TransactionsTab, etc.) à mettre à jour
- Onglet Conversion à supprimer

---

## Plan d'attaque en 5 phases (commits séparés)

### 🔧 Phase 1 — Préparation SQL (1 commit, 30 min)

**Objectif :** garantir qu'à la fin de la phase, la DB peut accepter à la fois l'ancien (crédits) et le nouveau (Ariary) — pont temporaire pour permettre un déploiement progressif.

**Actions :**

1. **Vérifier l'application** de `supabase/migrations/20260502_remove_credits_use_ariary_only.sql` (ajoute `balanceAr`, `prix`, `amountAr`)
2. **Créer une migration complémentaire** `20260503_credits_cleanup_pre_drop.sql` :
   - Crée la table `Transaction` à partir de `CreditTransaction` (CREATE TABLE IF NOT EXISTS … LIKE), copie le contenu, ajoute index
   - Active Realtime sur `Transaction` (`ALTER PUBLICATION supabase_realtime ADD TABLE "Transaction"`)
   - Renomme settings : `WELCOME_BONUS_CREDITS=10` → `WELCOME_BONUS_AR=500` (multiplie ×50)
   - Idem `REFERRAL_BONUS_CREDITS` → `REFERRAL_BONUS_AR`, `REFERRED_BONUS_CREDITS` → `REFERRED_BONUS_AR`
   - Renomme `AICorrection.creditsCost` → `costAr` (`ALTER TABLE … RENAME COLUMN`)
   - Renomme `CreditPack.price` → `arAmount` (idempotent, `IF EXISTS`)

3. **Backup snapshot Supabase** : aller sur Supabase Dashboard → Project → Database → Backups → snapshot manuel daté avant exécution

**Garde-fou :** la phase 1 ne supprime **rien**. L'ancien code continue de fonctionner (les colonnes `credits` restent en place). On peut rollback en restaurant le snapshot.

**Livrable :** `supabase/migrations/20260503_credits_cleanup_pre_drop.sql`

---

### 🔄 Phase 2 — Refactor du code (7 sous-commits)

**Stratégie :** un sous-commit par zone fonctionnelle, build vert entre chaque, pour pouvoir bisect en cas de régression.

#### Phase 2a — Auth + onboarding + parrainage (~30 min)

**Fichiers :**
- `actions/auth.ts` : remplacer `WELCOME_BONUS_CREDITS` → `WELCOME_BONUS_AR`, multiplier `value × 50` lors de l'octroi
- `actions/referral.ts` : `creditAmount` → `arAmount`, idem clés settings
- `actions/referral-settings.ts` : noms des clés
- `__tests__/referral-system.test.ts` : assertions `× 50`
- `migrations/014_init_referral_settings.sql` : seed corrigé

**Test de régression :** créer un compte, vérifier que `balanceAr += 500` (au lieu de `credits += 10`).

#### Phase 2b — Recharge + Mobile Money + packs (~1 h)

**Fichiers :**
- `actions/profile.ts::rechargeCreditsAction` :
  - Renommer en `rechargeBalanceAction`
  - Lire `arAmount` du pack au lieu de calculer `credits × arPerCredit`
  - INSERT dans `Transaction` (au lieu de `CreditTransaction`) avec `amountAr`
  - UPDATE `User.balanceAr` (au lieu de `credits`)
- `app/recharge/page.tsx` : afficher `pack.arAmount + pack.bonusAr`, pas de calcul de conversion
- `components/recharge/PaymentForm.tsx` : props `amountAr` au lieu de `credits/price`
- `components/recharge/BalanceCard.tsx` : props `balanceAr`
- `app/api/admin/credit-packs/route.ts` : whitelist colonnes adaptée à `arAmount`
- `app/api/config/credit-packs/route.ts` : retourne `{ id, name, arAmount, bonusAr, isPopular }`

**Test de régression :** cycle complet de recharge MVola en mode dev.

#### Phase 2c — Achat sujets + corrections IA (~1 h)

**Fichiers :**
- `actions/ai-correction.ts` :
  - `viewerCredits` → `viewerBalanceAr` (variable locale)
  - `creditsCost` → `costAr` partout (variable + colonne)
  - INSERT dans `Transaction` au lieu de `CreditTransaction`
  - `getAIPrices` retourne `priceSubmissionAr`, `priceDirectAr`
  - Vérifier que `processCorrection` UPDATE bien `User.balanceAr - costAr`
- `actions/user.ts::purchaseCurrentUserSubject` : déjà OK, vérifier le flow
- `app/sujet/[id]/page.tsx` : credits → balanceAr (15+ occurrences ligne 56, 100, 192-193, 272, 301-304, 452, 456, 476, 480, 498, 502, 506, 679, 825-826)
- `actions/examen.ts` : si débit pour examen, `creditsCount` → `amountAr`

**Test de régression :** acheter un sujet avec un compte test, vérifier débit Ar correct.

#### Phase 2d — UI étudiant (~1 h)

**Fichiers :**
- `app/dashboard/page.tsx` + `app/dashboard/DashboardClient.tsx` : afficher `balanceAr`, pas `credits`
- `app/catalogue/page.tsx` (lignes 446, 451) : prix sujet en Ar
- `app/sujet/[id]/page.tsx` (déjà partiellement fait phase 2c)
- `app/profil/page.tsx` (ligne 672) : solde Ar
- `app/parrainage/page.tsx` (lignes 74, 203) : bonus Ar
- `app/examens/[id]/correction/page.tsx` (lignes 30, 39, 106) : tarifs IA Ar

Remplacements UI strings :
- « Crédits » → « Solde » (ou « Ariary »)
- « 5 cr » → « 250 Ar »
- « par crédit » → « ar Ariary »

#### Phase 2e — UI admin + suppression Conversion (~1 h)

**Fichiers à supprimer :**
- `app/admin/credits/page.tsx` → renommer route en `/admin/transactions` + adapter le composant
- `components/admin/CreditsTable.tsx` → renommer `TransactionsTable.tsx`
- `app/api/admin/currency-config/route.ts` → supprimer (route + usages)

**Fichiers à modifier :**
- `app/admin/configuration/page.tsx` : retirer onglet Conversion (lignes 2783-2842, 2848-2884), retirer fetch `/api/admin/currency-config`
- `components/admin/AdminSidebar.tsx` : retirer lien `/admin/credits`, ajouter `/admin/transactions`
- `app/admin/page.tsx` : remplacer `Recent Credits` → `Recent Transactions`
- `app/admin/utilisateurs/[id]/page.tsx` : afficher `balanceAr`
- `app/admin/utilisateurs/[id]/UserActions.tsx` : ajustement de solde en Ar
- `app/admin/sujets/[id]/review/ReviewForm.tsx` : prix sujet en Ar

**Test de régression :** se connecter en admin, vérifier que tous les écrans affichent des Ariary, plus aucun « cr ».

#### Phase 2f — UI contributeur + retraits (~30 min)

**Fichiers :**
- `app/contributeur/layout.tsx` : `totalEarnings`, `monthEarnings` calculés en `amountAr` (déjà partiel ?)
- `app/contributeur/sujets/page.tsx` (lignes 24, 29) : revenus en Ar
- `app/contributeur/sujets/[id]/stats/SubjectStatsClient.tsx` (ligne 244) : montant Ar
- `app/contributeur/retraits/WithdrawalsClient.tsx` : déjà en Ar probablement
- `app/admin/retraits/WithdrawalsClient.tsx` (lignes 22, 352-353, 422) : finir migration

#### Phase 2g — Composants partagés + hooks Realtime (~30 min)

**Fichiers :**
- `components/layout/LuxuryNavbar.tsx` (ligne 190) : `appUser?.balanceAr ?? 0` + " Ar"
- `components/profile/TransactionsTab.tsx` (ligne 123) : `tx.amountAr` + " Ar"
- `components/profile/PurchasedSubjectsTab.tsx` (lignes 55-56) : `subject.amountAr`
- `components/layout/UserNotifications.tsx` (ligne 61) : `payload.new.amountAr`
- `lib/hooks/useTransactionsRealtime.ts` : subscribe `Transaction` au lieu de `CreditTransaction`
- `lib/hooks/useAdminTransactionsRealtime.ts` : idem
- `lib/hooks/useAuth.ts` : charger `balanceAr` au lieu de `credits` si applicable

---

### 🗑 Phase 3 — Migration SQL destructrice (1 commit, 15 min)

**⚠ À faire UNIQUEMENT après que le code de la Phase 2 tourne en production sans erreur pendant ≥48 h.**

**Migration `20260505_credits_drop_columns.sql` :**

```sql
-- 1. Supprimer les colonnes obsolètes
ALTER TABLE "User" DROP COLUMN IF EXISTS "credits";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "credits";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "priceInAr";  -- redondant avec prix
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "priceInCredits";
ALTER TABLE "Subject" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "Purchase" DROP COLUMN IF EXISTS "creditsAmount";
ALTER TABLE "Purchase" DROP COLUMN IF EXISTS "amount";  -- (redondant avec amountAr)
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "prixEnCredits";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "estimatedContributorRevenue";
ALTER TABLE "SubjectSubmission" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "CreditPack" DROP COLUMN IF EXISTS "conversionRate";
ALTER TABLE "CreditPack" DROP COLUMN IF EXISTS "price";  -- remplacé par arAmount

-- 2. Supprimer les anciennes tables
DROP TABLE IF EXISTS "CurrencyConfig";

-- 3. Renommer CreditTransaction en Transaction (si pas fait phase 1)
-- Ou simplement DROP CreditTransaction si Transaction a déjà toutes les données
DROP TABLE IF EXISTS "CreditTransaction";

-- 4. Supprimer les anciennes settings (déjà renommées en phase 1)
DELETE FROM "SystemSetting"
WHERE key IN ('WELCOME_BONUS_CREDITS', 'REFERRAL_BONUS_CREDITS', 'REFERRED_BONUS_CREDITS');
```

**Garde-fou :** snapshot Supabase obligatoire avant exécution. La migration est idempotente (`IF EXISTS`) donc rejouable.

---

### 📋 Phase 4 — Nettoyage final + tests (1 commit, 1 h)

**Actions :**
- Supprimer `docs/STRATEGIE_CONVERSION_PRIX.md`
- Mettre à jour `CLAUDE.md` (mentionner que tout est en Ariary)
- Vérifier `.env.example` (aucun `CREDIT*` env var)
- Grep final : `grep -rn "credits\|crédit" actions app components lib --include="*.ts" --include="*.tsx" | grep -v ".test." | grep -vi "comment"` → doit être vide
- `pnpm build` et `pnpm test` doivent être verts
- Supprimer les anciennes migrations obsolètes ou les marquer deprecated dans un README

---

## Ordre d'exécution & dépendances

```
Phase 1 (SQL pont) ──────────┐
   ↓                         │
Phase 2a (auth+referral) ────┤
Phase 2b (recharge) ─────────┤
Phase 2c (achat+IA) ─────────┤── Build vert obligatoire
Phase 2d (UI étudiant) ──────┤    entre chaque sous-commit
Phase 2e (UI admin) ─────────┤
Phase 2f (UI contributeur) ──┤
Phase 2g (composants) ───────┘
   ↓
[Tests E2E manuels obligatoires]
   ↓
[Déploiement prod, observer ≥48 h]
   ↓
Phase 3 (DROP destructeur)
   ↓
Phase 4 (cleanup doc + grep final)
```

---

## Risques identifiés

| # | Risque | Mitigation |
|---|---|---|
| 1 | Soldes orphelins (credits>0, balanceAr=0) | Phase 1 fait `UPDATE … SET balanceAr = balanceAr + credits×50 WHERE credits>0` |
| 2 | Transactions PENDING en cours pendant migration | Avant Phase 1 : `SELECT COUNT(*) FROM CreditTransaction WHERE status='PENDING'` — attendre que ça baisse à 0 (ou notifier admins) |
| 3 | Realtime cassé sur clients abonnés | Phase 1 active Realtime sur `Transaction` AVANT de supprimer celle de `CreditTransaction` (Phase 3) |
| 4 | Bookmarks admin sur `/admin/credits` | Phase 2e : route redirige vers `/admin/transactions` au lieu de 404 |
| 5 | `CreditPack.credits` confond unités et devise | Renommer en `packSize` ou `creditUnits` côté DB, mais l'utilisateur a confirmé garder `credits` comme nom de colonne tant qu'il ne sert plus de devise |
| 6 | Tests E2E cassés | Mettre à jour `__tests__/referral-system.test.ts` en Phase 2a |
| 7 | Régression UI silencieuse (oubli d'un « cr ») | Grep final phase 4 obligatoire |

---

## Estimation totale

| Phase | Effort |
|---|---|
| 1 — SQL pont + backup | 30 min |
| 2a — Auth + parrainage | 30 min |
| 2b — Recharge + packs | 1 h |
| 2c — Achat + IA | 1 h |
| 2d — UI étudiant | 1 h |
| 2e — UI admin + cleanup | 1 h |
| 2f — UI contributeur | 30 min |
| 2g — Composants + Realtime | 30 min |
| 3 — DROP destructeur | 15 min |
| 4 — Cleanup final | 1 h |
| **Total** | **~7 h** sur ~10 commits |

---

## Tests E2E manuels à exécuter avant Phase 3

1. **Inscription** : créer un compte → solde 500 Ar (welcome bonus)
2. **Recharge MVola** (mode dev) : pack 50 000 Ar + 5 000 bonus → solde 55 500 Ar
3. **Achat sujet** : sujet à 2 500 Ar → solde -2 500
4. **Correction IA** : exo soumis → débit `costAr` (3 Ar par exemple) — vérifier débit + ligne `Transaction` créée
5. **Parrainage** : nouveau compte avec code parrain → solde parrain +1 000 Ar à l'achat du filleul
6. **Retrait contributeur** : demande retrait → admin valide → balance Ar diminue
7. **Admin transactions** : voir l'historique avec montants Ar
8. **Toggle de thème** : tous les soldes affichés en Ar dans dark + light

---

## Quand reprendre ce plan

1. Backup Supabase fait
2. Pas de transactions PENDING en cours
3. Branche dédiée `refactor/credits-to-ariary` créée
4. Aucun autre PR en flight (pour éviter les conflits sur les fichiers refactorés massivement)

Démarrer par la **Phase 1** (préparation SQL), valider que le code actuel passe toujours, puis dérouler 2a → 2g séquentiellement.
