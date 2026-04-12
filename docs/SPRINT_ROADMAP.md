# 🏃 Sprint Roadmap - Design System Mah.AI

**Date de création :** 23 mars 2026  
**Document de suivi :** Tous les sprints du Design System

---

## 📅 Vue d'ensemble des Sprints

| Sprint | Phase | Statut | Dates | Objectif |
|--------|-------|--------|-------|----------|
| **Sprint 1** | Phase 1 | ✅ TERMINÉ | 23/03 | Documentation (DESIGN_TOKENS.md) |
| **Sprint 1** | Phase 2 | ✅ TERMINÉ | 23/03 | Consolidation CSS (448 → 0 --luxury-*) |
| **Sprint 1** | Phase 3 | 🔄 EN COURS | 23/03 | Composants UI unifiés |
| **Sprint 1** | Phase 4 | ⏳ À FAIRE | 24/03 | Responsive & Accessibilité |
| **Sprint 1** | Phase 5 | ⏳ À FAIRE | 25/03 | Refactoring & Performance |
| **Sprint 2** | - | ⏳ À FAIRE | 26-28/03 | Découpage gros fichiers CSS |

---

## 📋 Sprint 1 - Phase 3 : Composants UI Unifiés

### Objectif
Créer 4 composants UI réutilisables avec leurs styles et tests

### Tâches

| # | Tâche | Priorité | Statut | Fichier(s) |
|---|-------|----------|--------|------------|
| 3.1 | Créer composant Button | 🔴 Haute | ⏳ | `components/ui/Button/` |
| 3.2 | Créer composant Card | 🔴 Haute | ⏳ | `components/ui/Card/` |
| 3.3 | Créer composant Input | 🟡 Moyenne | ⏳ | `components/ui/Input/` |
| 3.4 | Créer composant Modal | 🟡 Moyenne | ⏳ | `components/ui/Modal/` |
| 3.5 | Créer index.ts pour exports | 🟢 Basse | ⏳ | `components/ui/index.ts` |

### Critères d'acceptation
- [ ] Chaque composant a son fichier `.tsx`
- [ ] Chaque composant a son fichier `.module.css`
- [ ] Chaque composant supporte dark/light mode
- [ ] Chaque composant a des variants documentés
- [ ] Accessibilité : focus states, ARIA labels
- [ ] Touch targets ≥ 44px sur mobile

---

## 📋 Sprint 1 - Phase 4 : Responsive & Accessibilité

### Objectif
Rendre le site fully responsive et accessible WCAG 2.1 AA

### Tâches

| # | Tâche | Priorité | Statut | Fichier(s) |
|---|-------|----------|--------|------------|
| 4.1 | Ajouter breakpoints tablettes | 🔴 Haute | ⏳ | `tailwind.config.js` |
| 4.2 | Rendre sidebar catalogue collapsible | 🔴 Haute | ⏳ | `catalogue.css`, `CataloguePage.tsx` |
| 4.3 | Touch targets 44px minimum | 🔴 Haute | ⏳ | `globals.css` |
| 4.4 | Ajouter toggle reduced-motion | 🟡 Moyenne | ⏳ | `globals.css`, `MotionToggle.tsx` |
| 4.5 | Navigation clavier complète | 🟡 Moyenne | ⏳ | Tous composants |
| 4.6 | Labels ARIA manquants | 🟡 Moyenne | ⏳ | Tous composants |

### Critères d'acceptation
- [ ] Site navigable au clavier uniquement
- [ ] Tous les touch targets ≥ 44px
- [ ] Sidebar catalogue collapsible sur tablettes
- [ ] Toggle reduced-motion fonctionnel
- [ ] Score Lighthouse Accessibility ≥ 95

---

## 📋 Sprint 1 - Phase 5 : Refactoring & Performance

### Objectif
Extraire styles inline et optimiser les performances

### Tâches

| # | Tâche | Priorité | Statut | Fichier(s) |
|---|-------|----------|--------|------------|
| 5.1 | Extraire styles inline Navbar | 🔴 Haute | ⏳ | `LuxuryNavbar.tsx` → `.module.css` |
| 5.2 | Extraire styles inline Footer | 🟡 Moyenne | ⏳ | `LuxuryFooter.tsx` → `.module.css` |
| 5.3 | Optimiser LuxuryCursor.tsx | 🟡 Moyenne | ⏳ | `LuxuryCursor.tsx` |
| 5.4 | Découper recharge.css | 🟢 Basse | ⏳ | `recharge.css` → composants |
| 5.5 | Découper catalogue.css | 🟢 Basse | ⏳ | `catalogue.css` → composants |

### Critères d'acceptation
- [ ] 0 style inline dans Navbar/Footer
- [ ] LuxuryCursor optimisé (RAF arrêtée si inactif)
- [ ] recharge.css < 500 lignes
- [ ] catalogue.css < 500 lignes
- [ ] Score Lighthouse Performance ≥ 90

---

## 📋 Sprint 2 - Phase 6 : Découpage Gros Fichiers CSS

### Objectif
Réduire la taille des fichiers CSS > 1000 lignes

### Fichiers cibles

| Fichier | Lignes actuelles | Cible | Action |
|---------|------------------|-------|--------|
| `profil.css` | 2105 | < 500 | Découper en composants |
| `recharge.css` | 1698 | < 500 | Découper en composants |
| `catalogue.css` | 1800 | < 500 | Découper en composants |

### Tâches

| # | Tâche | Priorité | Statut |
|---|-------|----------|--------|
| 6.1 | Identifier composants dans profil.css | 🔴 Haute | ⏳ |
| 6.2 | Extraire ProfileCard, ProfileForm | 🟡 Moyenne | ⏳ |
| 6.3 | Identifier composants dans recharge.css | 🔴 Haute | ⏳ |
| 6.4 | Extraire ProviderCard, PaymentForm | 🟡 Moyenne | ⏳ |
| 6.5 | Identifier composants dans catalogue.css | 🔴 Haute | ⏳ |
| 6.6 | Extraire FilterPanel, PaperCard | 🟡 Moyenne | ⏳ |

---

## 📊 Métriques Globales

| Métrique | Avant Sprint 1 | Cible | Actuel (Phase 2) |
|----------|----------------|-------|------------------|
| Variables `--luxury-*` | 448 | 0 | **0** ✅ |
| Lignes CSS totales | ~5000 | ~3000 | ~4500 |
| Composants réutilisables | 5 | 15+ | 5 |
| Touch targets < 44px | ~20 | 0 | ~20 |
| Fichiers CSS > 1000 lignes | 4 | 0 | 4 |
| Lighthouse Performance | ~70 | 90+ | ~70 |
| Lighthouse Accessibility | ~80 | 95+ | ~80 |

---

## 🎯 Définition de "Terminé"

Pour chaque tâche :
- [ ] Code implémenté
- [ ] Tests manuels (light + dark mode)
- [ ] Tests accessibilité (clavier, screen reader)
- [ ] Tests responsive (mobile, tablette, desktop)
- [ ] Documentation mise à jour
- [ ] Review par un autre agent (si disponible)

---

## 📝 Notes de Sprint

### Sprint 1 - Phase 1 (✅ Terminé)
- `DESIGN_TOKENS.md` créé avec tous les tokens
- Documentation complète des couleurs, typographie, espacements

### Sprint 1 - Phase 2 (✅ Terminé)
- 448 occurrences de `--luxury-*` supprimées
- 6 fichiers CSS standardisés
- 0 régression visuelle
- Rapport créé : `SPRINT_1_PHASE_2_PROGRESS.md`

### Sprint 1 - Phase 3 (🔄 En cours)
- Démarrage : 23/03
- Composants à créer : Button, Card, Input, Modal

---

**Dernière mise à jour :** 23 mars 2026  
**Prochain sprint review :** Phase 3 complète
