# 🎯 Stratégie Complète : Normalisation du Système de Prix (Ar ↔ cr)

> **Statut:** Proposition de stratégie complète  
> **Date:** 24 avril 2026  
> **Objectif:** Unifier le système de prix Ar (Ariary) et cr (crédits) avec conversions logiques

---

## 📊 État Actuel (Problèmes Identifiés)

### Dualité de Devises Non Liée
| Contexte | Devise | Problème |
|----------|--------|---------|
| **Création sujet** (`SubjectSubmission`) | Ar | Prix d'achat fixé par contributeur |
| **Sujet publié** (`Subject`) | cr | Pas de conversion → valeur aléatoire |
| **Packs de crédits** (`CreditPack`) | Ar | Taux fixe mais non configurable (50 Ar = 1 cr) |
| **Table Admin** | cr uniquement | Pas de vision en Ar → confusion |

### Conséquences
- ❌ Contributeur rentre **5 000 Ar** → Sujet publié à **5 000 cr** (devrait être 100 cr)
- ❌ Admin ne voit que les cr, impossible de gérer les prix en Ar
- ❌ Packs de crédit figés → impossible d'ajuster le taux de conversion

---

## 🏗️ Architecture Proposée

### 1. **Couche Configuration Centralisée** (Base de Données)

Créer une table `CurrencyConfig` pour gérer les taux de conversion :

```sql
CREATE TABLE "CurrencyConfig" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    arPerCredit DECIMAL(10,4) NOT NULL DEFAULT 50.0,  -- 1 cr = 50 Ar
    platformFeePercent DECIMAL(5,2) NOT NULL DEFAULT 30.0,  -- 30% de frais plateforme
    activeAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    
    -- Audit
    updatedBy TEXT REFERENCES "User"(id),
    note TEXT
);

CREATE UNIQUE INDEX idx_currency_active ON "CurrencyConfig"(activeAt) 
    WHERE activeAt <= NOW() 
    ORDER BY activeAt DESC LIMIT 1;
```

### 2. **Service Utilitaire de Conversion** (Backend)

Fichier: `lib/currency-converter.ts`

```typescript
export class CurrencyConverter {
  // Convertir Ar → crédits
  static arToCredits(ar: number, exchangeRate: number): number {
    return Math.round(ar / exchangeRate);
  }
  
  // Convertir crédits → Ar
  static creditsToAr(credits: number, exchangeRate: number): number {
    return credits * exchangeRate;
  }
  
  // Calculer revenu contributeur après frais plateforme (30%)
  static calculateContributorRevenue(priceInAr: number, platformFeePercent: number): number {
    return Math.round(priceInAr * (1 - platformFeePercent / 100));
  }
}
```

### 3. **Schéma Base de Données Modifié**

#### a) Table `SubjectSubmission` (avant publication)
```sql
-- Garder les champs existants pour l'édition en Ar
ALTER TABLE "SubjectSubmission" ADD COLUMN IF NOT EXISTS (
    prixEnAr INTEGER NOT NULL DEFAULT 0,  -- Prix d'achat en Ar
    prixEnCredits INTEGER,                 -- Calculé avant validation
    estimatedContributorRevenue INTEGER,   -- 70% du prix Ar
    conversionRate DECIMAL(10,4)           -- Taux utilisé à la création
);
```

#### b) Table `Subject` (après publication)
```sql
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS (
    priceInAr INTEGER NOT NULL DEFAULT 0,  -- Prix d'origine en Ar
    priceInCredits INTEGER NOT NULL,       -- Équivalent en crédits
    conversionRate DECIMAL(10,4),          -- Taux de conversion appliqué
    contributorRevenuInAr INTEGER          -- Revenu estimé du contributeur
);

-- Garder credits pour compatibilité temporaire (à dépublisher)
```

#### c) Modifier `CreditPack`
```sql
ALTER TABLE "CreditPack" ADD COLUMN IF NOT EXISTS (
    creditsAmount INTEGER NOT NULL,        -- Nombre de crédits
    arAmount INTEGER NOT NULL,             -- Prix en Ar
    conversionRate DECIMAL(10,4),          -- Taux appliqué
    bonusCredits INTEGER DEFAULT 0,        -- Crédits bonus
    isActive BOOLEAN DEFAULT true,
    displayOrder INTEGER DEFAULT 999
);
```

---

## 📄 Nouvelles Pages Admin

### Page 1: **Configuration des Taux** (`/admin/configuration`)

#### Tab: Conversion (Nouveau)
```
┌─────────────────────────────────────────┐
│ CONFIGURATION DES TAUX DE CHANGE        │
├─────────────────────────────────────────┤
│                                         │
│  Taux Actuel:  1 cr = [50] Ar          │ (Input numérique)
│                                         │
│  Frais Plateforme: [30] %               │
│  (Prélèvement sur prix Ar des sujets)   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ HISTORIQUE DES CHANGEMENTS      │   │
│  ├─────────────────────────────────┤   │
│  │ Date       │ Taux │ Frais │ Par │   │
│  │ 24/04 10h  │ 50   │ 30%   │ ADM │   │
│  │ 20/04 15h  │ 50   │ 30%   │ ADM │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Sauvegarder] [Annuler]               │
└─────────────────────────────────────────┘
```

**Fichier:** `app/admin/configuration/page.tsx`  
**Actions:** `app/admin/configuration/actions.ts`

---

### Page 2: **Tab Packs de Crédits** (Amélioration Existante)

**Route:** `/admin/configuration?tab=packs` (existante)

#### UI Améliorée avec Conversions Logiques
```
┌──────────────────────────────────────────────────┐
│ PACKS DE CRÉDITS (Tab dans Configuration)        │
├──────────────────────────────────────────────────┤
│                                                  │
│  Pack 1: [50] cr @ [2500] Ar                     │
│          Bonus: [10] cr                          │
│          [Éditer] [Supprimer]                    │
│                                                  │
│  Pack 2: [150] cr @ [7500] Ar                    │
│          Bonus: [25] cr                          │
│          [Éditer] [Supprimer]                    │
│                                                  │
│  Pack 3: [300] cr @ [15000] Ar                   │
│          Bonus: [50] cr                          │
│          [Éditer] [Supprimer]                    │
│                                                  │
│  Pack 4: [500] cr @ [25000] Ar                   │
│          Bonus: [75] cr                          │
│          [Éditer] [Supprimer]                    │
│                                                  │
│  ─────────────────────────────────────────────   │
│  [+ Ajouter un Pack]                             │
│                                                  │
│  ℹ️ Basé sur taux: 1 cr = 50 Ar (actuel)         │
│  (Taux configurable dans Tab "Conversion")       │
└──────────────────────────────────────────────────┘
```

**Fichier:** `app/admin/configuration/page.tsx` (tab "packs" existante à améliorer)

---

## 🔄 Flux de Traitement des Prix

### 1️⃣ **Lors de la Création du Sujet** (Contributeur)

```
Contributeur rentre: 5000 Ar
         ↓
[Lire CurrencyConfig taux actuel = 50]
         ↓
Calculer crédits = 5000 / 50 = 100 cr
         ↓
Calculer revenu contributeur = 5000 * 0.7 = 3500 Ar
         ↓
Afficher en temps réel:
  • Prix d'achat: 100 cr (5000 Ar)
  • Votre revenu: 3500 Ar
  • Frais plateforme: 1500 Ar
```

**Fichier modifié:** `components/editor/PricingSidebar.tsx`

### 2️⃣ **Lors de l'Approbation du Sujet** (Admin)

```
SubjectSubmission approuvée
         ↓
Créer Subject avec:
  • priceInAr = 5000
  • priceInCredits = 100
  • conversionRate = 50 (snapshot)
  • contributorRevenuInAr = 3500
```

### 3️⃣ **Lors de l'Achat par l'Utilisateur**

```
Utilisateur a 150 cr
         ↓
Voir sujet @ 100 cr
         ↓
[Acheter] → débiter 100 cr
         ↓
Contributeur reçoit 3500 Ar (crédité aux prochains payouts)
```

---

## 📋 Tableau de Modification des Fichiers

| Fichier/Table | Action | Détails |
|---|---|---|
| `schema.prisma` | **Modifier** | Ajouter `CurrencyConfig`, modifier `Subject`, `SubjectSubmission` |
| `lib/currency-converter.ts` | **Créer** | Service de conversion centralisé |
| `components/editor/PricingSidebar.tsx` | **Modifier** | Affichage en temps réel Ar + cr |
| `app/contributeur/sujets/editor-actions.ts` | **Modifier** | Sauvegarder prix Ar + calculer cr |
| `app/admin/configuration/page.tsx` | **Modifier** | Ajouter Tab "Conversion" + améliorer Tab "Packs" |
| `app/api/admin/currency-config/route.ts` | **Créer** | API pour taux de change |
| `app/api/admin/credit-packs/route.ts` | **Modifier** | Améliorer API packs (si nécessaire)

---

## 🚀 Plan d'Implémentation (Phases)

### Phase 1: Fondations (1-2 heures)
- [ ] Modifier `schema.prisma`
- [ ] Créer `lib/currency-converter.ts`
- [ ] Créer APIs (`app/api/admin/currency-config/route.ts`)

### Phase 2: Interface Admin (1-2 heures)
- [ ] Créer Tab "Conversion" dans `app/admin/configuration/page.tsx`
- [ ] Améliorer Tab "Packs de crédits" existant avec affichage Ar + cr
- [ ] Ajouter références entre les deux tabs

### Phase 3: Logique Contributeur (1-2 heures)
- [ ] Modifier `PricingSidebar.tsx`
- [ ] Mettre à jour `editor-actions.ts`
- [ ] Ajouter affichage conversions en temps réel

### Phase 4: Validation & Tests (1 heure)
- [ ] Tester les conversions (Ar ↔ cr)
- [ ] Tester création sujet avec prix Ar
- [ ] Vérifier cohérence prix dans les tables admin

---

## 🎓 Bénéfices de Cette Stratégie

✅ **Transparence** : Contributeur voit prix Ar + revenu estimé  
✅ **Flexibilité** : Admin peut ajuster taux sans modifier code  
✅ **Traçabilité** : Historique de tous les changements de taux  
✅ **Cohérence** : Tous les prix dans une devise de référence  
✅ **Scalabilité** : Prêt pour multi-devise future  
✅ **Audit** : Snapshot du taux au moment du changement  

---

## ❓ Questions de Clarification Restantes

1. **Taux de conversion** : Toujours 1 cr = 50 Ar fixe ? Ou doit pouvoir varier dans le Tab Conversion ?
2. **Frais plateforme** : Les 30% sont-ils fixes ou configurables dans le Tab Conversion ?
3. **Payout contributeur** : Ils reçoivent en Ar ou on crédite des cr à leur portefeuille ?

---

## 💾 Prochaines Étapes

**✅ Plan affiné et optimisé :**
- Route `/admin/configuration?tab=packs` existante → à améliorer
- Pas de migration des prix (sujets de test à supprimer)
- 4 phases d'implémentation (3 phases précédentes compressées)

**➡️ Répondez aux 3 questions restantes et je lance l'implémentation directe !**
