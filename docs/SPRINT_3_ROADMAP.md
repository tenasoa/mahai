# 🏃 Sprint 3 - Roadmap

**Date de création :** 23 mars 2026  
**Objectif :** Optimisation & Tests  
**Durée estimée :** 5 jours

---

## 📊 État Actuel

### Après Sprint 2

| Métrique | Valeur |
|----------|--------|
| Composants réutilisables | 22 |
| Lignes CSS totales | ~2200 |
| Fichiers CSS > 1000 lignes | 0 |
| Lighthouse Performance | ~70 |
| Lighthouse Accessibility | ~80 |
| Tests unitaires | 0% |

---

## 📋 Phases du Sprint 3

### Phase 1 : Tests Unitaires
**Durée :** 2 jours  
**Objectif :** 80% de coverage

**Tâches :**
- [ ] Configurer Jest + React Testing Library
- [ ] Tests pour composants UI (Button, Card, Input, Modal)
- [ ] Tests pour composants recharge
- [ ] Tests pour composants catalogue
- [ ] Tests pour composants profile

**Critères d'acceptation :**
- ✅ 80% de coverage minimum
- ✅ Tous les composants critiques testés
- ✅ Tests de accessibilité inclus

---

### Phase 2 : Optimisation Lighthouse
**Durée :** 1 jour  
**Objectif :** Performance ≥ 90, Accessibility ≥ 95

**Tâches :**
- [ ] Audit Lighthouse complet
- [ ] Optimisation images (lazy loading, WebP)
- [ ] Code splitting par page
- [ ] Optimisation polices (font-display: swap)
- [ ] Réduction bundle size

**Critères d'acceptation :**
- ✅ Performance ≥ 90
- ✅ Accessibility ≥ 95
- ✅ Best Practices ≥ 95
- ✅ SEO ≥ 90

---

### Phase 3 : Documentation Storybook
**Durée :** 2 jours  
**Objectif :** Tous les composants documentés

**Tâches :**
- [ ] Installer Storybook
- [ ] Stories pour composants UI
- [ ] Stories pour composants recharge
- [ ] Stories pour composants catalogue
- [ ] Stories pour composants profile
- [ ] Déployer Storybook

**Critères d'acceptation :**
- ✅ 100% des composants avec stories
- ✅ Variants documentés
- ✅ Props typées
- ✅ Exemples d'usage

---

### Phase 4 : Audit Accessibilité WCAG
**Durée :** 1 jour  
**Objectif :** 0 violation WCAG 2.1 AA

**Tâches :**
- [ ] Audit avec axe DevTools
- [ ] Audit avec WAVE
- [ ] Navigation clavier complète
- [ ] Tests screen reader (NVDA, VoiceOver)
- [ ] Corrections des violations

**Critères d'acceptation :**
- ✅ 0 violation WCAG 2.1 AA
- ✅ Navigation clavier fonctionnelle
- ✅ Focus states visibles
- ✅ ARIA labels complets

---

### Phase 5 : Validation Finale
**Durée :** 1 jour  
**Objectif :** Validation complète

**Tâches :**
- [ ] Tests E2E avec Playwright
- [ ] Tests cross-browser
- [ ] Tests responsive (mobile, tablette, desktop)
- [ ] Tests de charge
- [ ] Documentation finale

**Critères d'acceptation :**
- ✅ 0 bug critique
- ✅ Compatible Chrome, Firefox, Safari, Edge
- ✅ Responsive sur tous les appareils
- ✅ Documentation complète

---

## 📈 Métriques de Succès

| Métrique | Actuel | Cible |
|----------|--------|-------|
| Coverage tests | 0% | 80% |
| Lighthouse Performance | ~70 | 90+ |
| Lighthouse Accessibility | ~80 | 95+ |
| Violations WCAG | ~10 | 0 |
| Composants documentés | 0% | 100% |
| Bugs critiques | - | 0 |

---

## 🎯 Définition de "Terminé"

Pour chaque phase :
- [ ] Code implémenté
- [ ] Tests écrits et passants
- [ ] Documentation mise à jour
- [ ] Review effectuée
- [ ] Validation manuelle
- [ ] Métriques atteintes

---

## 📝 Notes

### Outils Recommandés
- **Tests :** Jest, React Testing Library, Playwright
- **Lighthouse :** Chrome DevTools, lighthouse-ci
- **Storybook :** @storybook/nextjs
- **Accessibilité :** axe DevTools, WAVE

### Risques
- ⚠️ Tests E2E peuvent être longs
- ⚠️ Storybook peut nécessiter configuration Next.js
- ⚠️ Certaines optimisations peuvent casser des fonctionnalités

### Atténuation
- ✅ Tests unitaires d'abord, E2E ensuite
- ✅ Utiliser Storybook pour Next.js 16
- ✅ Validation manuelle après chaque optimisation

---

**Sprint 3 : Démarrage le 23 mars 2026**

*Document de référence pour le Sprint 3*
