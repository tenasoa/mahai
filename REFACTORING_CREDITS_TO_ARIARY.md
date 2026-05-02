# Refactoring : Suppression des Crédits → Unification Ariary

## Résumé
Remplacer tout le système dual (Crédits + Ariary) par l'Ariary uniquement.
Taux de conversion utilisé pour la migration : **50 Ar = 1 crédit**

## Phase 1 - Base de données ✅
Fichier : `supabase/migrations/20260502_remove_credits_use_ariary_only.sql`

### Tables modifiées :
- [x] `User` : `credits` → `balanceAr`
- [x] `Subject` : Supprimer `credits` (garder `prix` en Ar)
- [x] `Purchase` : `credits` → `amountAr`
- [x] `ReferralCommission` : `creditAmount` → `arAmount`
- [x] `SubjectSubmission` : Déjà en Ar (vérifié)
- [x] `CurrencyConfig` : Supprimer table

### À exécuter :
```bash
supabase migration up
# ou manuellement dans Supabase Studio
```

## Phase 2 - Backend (Actions & API)

### Fichiers à modifier :
- [ ] `lib/currency-converter.ts` - Simplifier (supprimer conversion)
- [ ] `actions/recharge/` - Stripe crédite directement `balanceAr`
- [ ] `actions/user.ts` - `purchaseSubject` simplifié
- [ ] `actions/admin/submissions.ts` - Supprimer conversion
- [ ] `actions/referral.ts` - Commissions en Ar
- [ ] `app/api/webhooks/stripe/route.ts` - Créditer `balanceAr`

## Phase 3 - Frontend

### Pages à modifier :
- [ ] `app/recharge/page.tsx` - Afficher solde en Ar uniquement
- [ ] `app/dashboard/page.tsx` - Solde Ar
- [ ] `app/catalogue/page.tsx` - Prix en Ar
- [ ] `components/recharge/` - Composants simplifiés
- [ ] `components/catalogue/PaperCard.tsx` - Affichage prix

### Supprimer :
- Affichage "crédits"
- Convertisseurs de devises
- Selecteurs de mode (crédits/Ar)

## Phase 4 - Types & Interfaces

### Fichiers à mettre à jour :
- [ ] Types TypeScript (`credits` → `balanceAr`, etc.)
- [ ] Validation schemas (Zod)
- [ ] API Response types

## Phase 5 - Tests & Vérification

- [ ] Vérifier les achats fonctionnent
- [ ] Vérifier les recharges Stripe
- [ ] Vérifier les commissions parrainage
- [ ] Vérifier le dashboard contributeur

## Notes importantes

### Taux de conversion
- **Migration** : 1 crédit = 50 Ariary (valeur historique)
- **Futur** : Plus de conversion, tout est directement en Ar

### Impact utilisateur
- Les utilisateurs voient leur solde multiplié par 50
- Les prix restent les mêmes (déjà en Ar)
- Plus de confusion crédits/Ar

### Rollback
Si problème : restaurer depuis backup ou réexécuter migration inverse
