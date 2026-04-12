# 🏃 Sprint 2 - Roadmap

**Date de création :** 23 mars 2026  
**Objectif :** Découper les fichiers CSS > 1000 lignes  
**Durée estimée :** 5 jours

---

## 📊 État Actuel

### Fichiers CSS > 1000 lignes

| Fichier | Lignes | Cible | Priorité |
|---------|--------|-------|----------|
| `profil.css` | 2105 | < 500 | 🔴 Haute |
| `catalogue.css` | 1800 | < 500 | 🔴 Haute |
| `recharge.css` | 1698 | < 500 | 🔴 Haute |
| `dashboard.css` | 918 | < 500 | 🟢 Basse (acceptable) |

---

## 📋 Phases du Sprint 2

### Phase 1 : Découpage recharge.css
**Durée :** 2 jours  
**Fichier :** `app/recharge/recharge.css` (1698 lignes)

**Composants à extraire :**
- `ProviderCard` - Carte fournisseur Mobile Money
- `PaymentForm` - Formulaire de paiement
- `TransactionHistory` - Historique des transactions
- `BalanceCard` - Carte de solde
- `RechargeConfirmation` - Modal de confirmation

**Structure cible :**
```
components/recharge/
├── ProviderCard/
│   ├── ProviderCard.tsx
│   └── ProviderCard.module.css
├── PaymentForm/
│   ├── PaymentForm.tsx
│   └── PaymentForm.module.css
├── TransactionHistory/
│   ├── TransactionHistory.tsx
│   └── TransactionHistory.module.css
├── BalanceCard/
│   ├── BalanceCard.tsx
│   └── BalanceCard.module.css
└── RechargeConfirmation/
    ├── RechargeConfirmation.tsx
    └── RechargeConfirmation.module.css
```

---

### Phase 2 : Découpage catalogue.css
**Durée :** 2 jours  
**Fichier :** `app/catalogue/catalogue.css` (1800 lignes)

**Composants à extraire :**
- `FilterPanel` - Panneau de filtres latéral
- `PaperCard` - Carte de sujet d'examen
- `ResultsBar` - Barre de résultats
- `ActiveFilters` - Filtres actifs
- `SortView` - Tri et vue
- `ExamTypePills` - Filtres types d'examen

**Structure cible :**
```
components/catalogue/
├── FilterPanel/
│   ├── FilterPanel.tsx
│   └── FilterPanel.module.css
├── PaperCard/
│   ├── PaperCard.tsx
│   └── PaperCard.module.css
├── ResultsBar/
│   ├── ResultsBar.tsx
│   └── ResultsBar.module.css
├── ActiveFilters/
│   ├── ActiveFilters.tsx
│   └── ActiveFilters.module.css
└── ExamTypePills/
    ├── ExamTypePills.tsx
    └── ExamTypePills.module.css
```

---

### Phase 3 : Découpage profil.css
**Durée :** 2 jours  
**Fichier :** `app/profil/profil.css` (2105 lignes)

**Composants à extraire :**
- `ProfileHeader` - En-tête de profil
- `ProfileCard` - Carte de profil
- `ProfileForm` - Formulaire de modification
- `AvatarUpload` - Upload d'avatar
- `CompletionProgress` - Barre de progression
- `ProfileBadge` - Badge de rôle

**Structure cible :**
```
components/profile/
├── ProfileHeader/
│   ├── ProfileHeader.tsx
│   └── ProfileHeader.module.css
├── ProfileCard/
│   ├── ProfileCard.tsx
│   └── ProfileCard.module.css
├── ProfileForm/
│   ├── ProfileForm.tsx
│   └── ProfileForm.module.css
├── AvatarUpload/
│   ├── AvatarUpload.tsx
│   └── AvatarUpload.module.css
└── CompletionProgress/
    ├── CompletionProgress.tsx
    └── CompletionProgress.module.css
```

---

### Phase 4 : Migration vers nouveaux composants
**Durée :** 2 jours

**Objectif :** Remplacer les anciens composants par les nouveaux

**Remplacements :**
| Ancien | Nouveau |
|--------|---------|
| `.btn-*` classes | `<Button variant="*" />` |
| `.card-*` classes | `<Card variant="*" />` |
| `.form-input` | `<Input />` |
| Modals custom | `<Modal />` |

---

### Phase 5 : Tests et Validation
**Durée :** 1 jour

**Tests requis :**
- [ ] Navigation clavier
- [ ] Dark mode sur tous les composants
- [ ] Mobile, tablette, desktop
- [ ] Audit Lighthouse (Performance ≥ 90, Accessibility ≥ 95)

---

## 📈 Métriques de Succès

| Métrique | Actuel | Cible |
|----------|--------|-------|
| Fichiers CSS > 1000 lignes | 4 | **0** |
| Lignes CSS totales | ~4500 | **~3000** |
| Composants réutilisables | 9 | **15+** |
| Lighthouse Performance | ~70 | **90+** |
| Lighthouse Accessibility | ~80 | **95+** |

---

## 🎯 Définition de "Terminé"

Pour chaque phase :
- [ ] Composants extraits et fonctionnels
- [ ] CSS Modules créés
- [ ] Tests manuels (light + dark mode)
- [ ] Tests accessibilité (clavier, screen reader)
- [ ] Tests responsive (mobile, tablette, desktop)
- [ ] Documentation mise à jour
- [ ] Aucun bug visuel introduit

---

## 📝 Notes

### Priorités
1. **recharge.css** - Le plus critique (flux de paiement)
2. **catalogue.css** - Page la plus visitée
3. **profil.css** - Le plus volumineux

### Risques
- ⚠️ Régressions visuelles possibles
- ⚠️ Fonctionnalités de paiement à tester rigoureusement
- ⚠️ Temps estimé peut varier selon complexité

### Atténuation
- ✅ Tests manuels après chaque composant
- ✅ Comparaison avant/après visuel
- ✅ Validation par un autre agent si disponible

---

**Sprint 2 : Démarrage le 23 mars 2026**

*Document de référence pour le Sprint 2*
