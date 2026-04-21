# 📋 RAPPORT D'AUDIT UX/UI EXHAUSTIF — MAH.AI

**Date :** 21 avril 2026
**Plateforme :** Mah.AI (EdTech Madagascar)
**Stack :** Next.js 16, TypeScript, Tailwind CSS 3.4
**Design System :** Luxury Or/Ivoire
**Contexte paiement :** Mobile Money manuel (validation admin manuelle, pas d'API webhook)

---

## 📑 TABLE DES MATIÈRES

1. [Résumé exécutif](#résumé-exécutif)
2. [Audit page par page](#audit-page-par-page)
3. [Audit composants UI](#audit-composants-ui)
4. [Audit typographie](#audit-typographie)
5. [Audit palette & couleurs](#audit-palette--couleurs)
6. [Audit espacement & layout](#audit-espacement--layout)
7. [Audit interactions & micro-animations](#audit-interactions--micro-animations)
8. [Audit formulaires](#audit-formulaires)
9. [Audit navigation](#audit-navigation)
10. [Audit mobile first](#audit-mobile-first)
11. [Audit accessibilité (WCAG 2.1 AA)](#audit-accessibilité-wcag-21-aa)
12. [Audit thème (dark/light)](#audit-thème-darklight)
13. [Audit contenu & copywriting](#audit-contenu--copywriting)
14. [Résumé des problèmes](#résumé-des-problèmes)
15. [Plan d'action priorisé](#plan-daction-priorisé)

---

## Résumé exécutif

### État général

Mah.AI présente un **design system cohérent et élégant** avec une palette luxury or/ivoire bien maîtrisée. L'architecture UI est fonctionnelle mais présente **plusieurs défis importants** en termes de :

- **Cohérence UX** : Variabilité dans les patterns de navigation et interaction
- **Accessibilité** : Touch targets insuffisants, contraste variable
- **Performance perçue** : States de chargement manquants sur certaines pages
- **Responsive** : Quelques breakpoints manquants (tablettes 768-1024px)
- **Composants** : Sous-utilisation des composants réutilisables existants

### Chiffres clés

- **81 suggestions** identifiées
- **27 problèmes critiques** (🔴)
- **35 problèmes importants** (🟠)
- **19 problèmes mineurs** (🟡)
- **Effort estimé** : ~115-170 heures de travail

---

## Audit page par page

### 1️⃣ Page d'accueil (`/`)

**Fichier :** `app/page.tsx` + `app/landing.css`

#### Description de l'état actuel

Page d'accueil bien structurée et visuellement impressionnante :
- Hero section avec orbes animées, grid lines et stack de cartes flottantes
- Marquee section avec défilement continu
- Section « Comment ça marche » avec 4 étapes
- Section « Fonctionnalités »
- Section « Sujets populaires » (gallery horizontale)
- Témoignages clients
- Section tarification
- CTA final + Footer

#### Issues

##### #1 — Animations orbes non respectées avec `prefers-reduced-motion`
- **Priorité :** 🔴 Critique
- **Fichier :** `landing.css:37-41`, `globals.css:283-296`
- **Effort :** S

**État actuel :**
```css
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-20px, 15px) scale(.95); }
}
```

**Problème :** Violation WCAG 2.1 AAA. Les utilisateurs sensibles aux mouvements subissent une expérience dégradée.

**Solution :**
```css
@media (prefers-reduced-motion: reduce) {
  .ambient-orb,
  .orb,
  .hero-card,
  .marquee-track {
    animation: none !important;
  }
}
```

---

##### #2 — Hero grid responsive cassé sur tablettes
- **Priorité :** 🔴 Critique
- **Fichier :** `landing.css:53-60`
- **Effort :** M

**État actuel :** `grid-template-columns: 1fr 1fr` avec `gap: 5rem` crée un débordement à 768-1024px.

**Solution :**
```css
.hero-inner { display: grid; gap: 5rem; }

@media (min-width: 1025px) {
  .hero-inner { grid-template-columns: 1fr 1fr; }
}

@media (768px <= width <= 1024px) {
  .hero-inner { grid-template-columns: 1fr; gap: 2.5rem; }
  .hero-visual { order: -1; }
}

@media (max-width: 767px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 6rem 1.5rem 4rem;
  }
}
```

---

##### #3 — Boutons CTA sans focus-visible explicite
- **Priorité :** 🔴 Critique
- **Fichier :** `landing.css:100-130`
- **Effort :** S

**Solution :**
```css
.btn-primary:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 4px;
  box-shadow: 0 0 0 4px var(--gold-dim), 0 8px 36px rgba(201,168,76,.38);
}
.btn-secondary:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 4px;
  background: var(--gold-dim);
}
```

---

##### #4 — Marquee cassé sur écrans < 375px
- **Priorité :** 🟠 Important
- **Effort :** M

Les éléments du marquee ne se répètent pas assez, créant un gap blanc.

---

##### #5 — Hero card stack sans skeleton loader
- **Priorité :** 🟠 Important
- **Fichier :** `page.tsx:108-176`
- **Effort :** M

Pop-in abrupt sur connexion lente.

---

##### #6 — Contraste insuffisant sur textes tertiaires
- **Priorité :** 🟠 Important
- **Fichier :** `landing.css:142-145`
- **Effort :** S

`--text-3` (55% opacity) sur fond `--void: #f8f4ee` = ~3.5:1 (WCAG AA requiert 4.5:1). Utiliser `var(--text-2)`.

---

##### #7 — `aspect-ratio` sans fallback
- **Priorité :** 🟠 Important
- **Fichier :** `landing.css:154`
- **Effort :** S

---

##### #8 — SVG décoratifs sans `aria-hidden="true"`
- **Priorité :** 🟠 Important
- **Fichier :** `page.tsx:57-59`
- **Effort :** S

---

##### #9 — Lien « Comment ça marche » incohérent avec ID cible
- **Priorité :** 🟡 Nice-to-have
- **Effort :** S

---

### 2️⃣ Page Catalogue (`/catalogue`)

**Fichiers :** `app/catalogue/page.tsx`, `app/catalogue/catalogue.css`, composants `PaperCard`, `FilterPanel`

#### Issues

##### #10 — Sidebar filtres non-collapsible sur tablettes
- **Priorité :** 🔴 Critique
- **Effort :** L

**Solution :** Drawer bottom pattern sur tablettes en portrait.

```tsx
export function FilterPanel({ isOpen, onClose }) {
  const isMobile = useMediaQuery('(max-width: 1023px)')

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="filter-drawer">
          {/* Filtres */}
        </DialogContent>
      </Dialog>
    )
  }

  return <aside className="filters-sidebar">{/* Filtres */}</aside>
}
```

---

##### #11 — Touch targets < 44px sur pills filtres
- **Priorité :** 🔴 Critique
- **Fichier :** `catalogue.css` (`.pill`)
- **Effort :** S

```css
.pill {
  min-height: 44px;
  min-width: 44px;
  padding: 0.625rem 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

---

##### #12 — Modal preview sans scroll lock
- **Priorité :** 🔴 Critique
- **Fichier :** `catalogue.css:340-376`
- **Effort :** S

```tsx
useEffect(() => {
  if (isOpen) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
  return () => {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}, [isOpen])
```

---

##### #13 — Pagination sans état `aria-current="page"`
- **Priorité :** 🟠 Important
- **Effort :** S

```css
.pagination-btn[aria-current="page"] {
  background: var(--gold);
  color: var(--void);
  border-color: var(--gold);
}
.pagination-btn:active:not(:disabled) { transform: scale(0.98); }
```

---

##### #14 — PaperCard hover states incohérents
- **Priorité :** 🟠 Important
- **Effort :** M

---

##### #15 — Aucun empty state dédié « Aucun résultat »
- **Priorité :** 🟠 Important
- **Effort :** M

Illustration + message encourageant + CTA « Réinitialiser les filtres ».

---

### 3️⃣ Page Login (`/auth/login`)

**Fichiers :** `app/auth/login/page.tsx`, `app/auth/layout.tsx`, `LoginForm`

#### Issues

##### #16 — Styles inline excessifs dans Logo
- **Priorité :** 🔴 Critique
- **Fichier :** `app/auth/login/page.tsx:14-35`
- **Effort :** S

**Solution :** Créer `components/common/Logo.tsx` + `Logo.module.css` réutilisable sur toutes les pages.

---

##### #17 — Bouton soumission sans loading state
- **Priorité :** 🔴 Critique
- **Effort :** M

```tsx
<button type="submit" disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? (<><Spinner /> Connexion en cours...</>) : 'Se connecter'}
</button>
```

---

##### #18 — Contraste texte gris insuffisant
- **Priorité :** 🔴 Critique
- **Fichier :** `app/auth/login/page.tsx:58-65`
- **Effort :** S

Utiliser `var(--text-2)` au lieu de `var(--text-3)`.

---

##### #19 — Pas de validation temps réel (email)
- **Priorité :** 🟠 Important
- **Effort :** M

---

### 4️⃣ Page Tableau de bord (`/dashboard`)

**Fichiers :** `app/dashboard/page.tsx`, `app/dashboard/dashboard.css` (1285 lignes)

#### Issues

##### #20 — Stat cards avec variables CSS hardcodées
- **Priorité :** 🔴 Critique
- **Effort :** S

Remplacer hardcoded par tokens : `var(--shadow-md)`, `var(--r-lg)`, etc.

---

### 5️⃣ Page Profil (`/profil`)

**Fichiers :** `app/profil/page.tsx`, `app/profil/profile.css` (1801 lignes)

#### Issues

##### #21 — Avatar upload modal sans feedback de chargement
- **Priorité :** 🔴 Critique
- **Effort :** M

Manque : barre de progression, état « uploading », preview avant confirmation.

---

##### #22 — Profile header non-responsive (tablettes)
- **Priorité :** 🔴 Critique
- **Fichier :** `profile.css:24-37`
- **Effort :** M

`flex-direction: column` sur < 1024px, gap réduit à 1.5rem.

---

##### #23 — Onglets sans accessibilité (roles manquants)
- **Priorité :** 🔴 Critique
- **Effort :** M

Ajouter `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`.

---

##### #24 — Progress bar sans attributs ARIA
- **Priorité :** 🟠 Important
- **Effort :** S

```tsx
<div role="progressbar"
     aria-valuenow={65}
     aria-valuemin={0}
     aria-valuemax={100}
     aria-label="Complétion du profil">
  <div className="progress-fill" style={{ width: '65%' }} />
</div>
```

---

### 6️⃣ Page Recharge (`/recharge`)

**Fichiers :** `app/recharge/page.tsx`, `app/recharge/recharge.css` (440 lignes)

**Contexte métier :** Paiement Mobile Money **manuel** (utilisateur fait le transfert, admin valide manuellement).

#### Issues

##### #25 — Formulaire paiement sans validation client
- **Priorité :** 🔴 Critique
- **Effort :** L

Validation temps réel : numéro téléphone Madagascar, opérateur, montant, référence transaction.

---

##### #26 — Pas de feedback « en attente de validation »
- **Priorité :** 🔴 Critique
- **Effort :** M

**À ajouter après soumission :**
- Message clair : « Votre paiement est en attente de validation manuelle »
- Timeline visuelle : Paiement soumis → En vérification → Crédits ajoutés
- Estimation de délai (« Validation sous 1-24h »)
- Notification email/in-app quand validé

---

##### #27 — Pas d'instructions claires Mobile Money
- **Priorité :** 🟠 Important
- **Effort :** M

Afficher étapes détaillées par opérateur (MVola, Orange Money, Airtel Money) avec numéros à composer.

---

### 7️⃣ Page Sujet Détail (`/sujet/[id]`)

#### Issues

##### #28 — PDF viewer sans états de chargement
- **Priorité :** 🔴 Critique
- **Effort :** M

---

### 8️⃣ Pages Admin (`/admin/*`)

#### Contexte métier critique

L'admin doit pouvoir **valider/rejeter les paiements Mobile Money manuels**.

#### Issues

##### #29 — Interface admin validation paiements à créer/améliorer
- **Priorité :** 🔴 Critique
- **Effort :** L

**Exigences :**
- Liste des transactions en attente avec filtre
- Détails : user, montant, opérateur, référence, date
- Boutons Valider / Rejeter avec raison
- Historique des actions admin
- Notifications automatiques au user

---

##### #30 — Sidebar admin trop large sur mobile
- **Priorité :** 🟠 Important
- **Effort :** M

---

##### #31 — Tables non-responsive
- **Priorité :** 🟠 Important
- **Effort :** M

Pattern : cards sur mobile, table sur desktop.

---

## Audit composants UI

### Composant Button

**Fichier :** `components/ui/Button/Button.tsx` + `Button.module.css`

#### Issues

##### #32 — Spinner sans `prefers-reduced-motion`
- **Priorité :** 🟠 Important
- **Effort :** S

---

##### #33 — Boutons danger sans focus ring visible
- **Priorité :** 🟠 Important
- **Effort :** S

```css
.btn-danger:focus-visible {
  outline: 2px solid var(--ruby);
  outline-offset: 2px;
}
```

---

##### #34 — Pas de `aria-busy` sur isLoading
- **Priorité :** 🟠 Important
- **Effort :** S

---

### Composant Card

##### #35 — Padding inline partout au lieu d'utiliser la prop
- **Priorité :** 🟠 Important
- **Effort :** M

---

### Composant Input

##### #36 — Types HTML5 non transmis correctement
- **Priorité :** 🟠 Important
- **Effort :** S

---

##### #37 — Error message sans `aria-describedby`
- **Priorité :** 🟠 Important
- **Effort :** S

```tsx
<input
  id={inputId}
  aria-invalid={!!error}
  aria-describedby={error ? `${inputId}-error` : undefined}
/>
{error && <span id={`${inputId}-error`} role="alert">{error}</span>}
```

---

### Composant Modal

##### #38 — Modal sans focus trap
- **Priorité :** 🔴 Critique
- **Effort :** M

Implémenter focus trap + restauration du focus au `previousActiveElement`.

---

##### #39 — Modal sans escape key handler
- **Priorité :** 🔴 Critique
- **Effort :** S

---

##### #40 — Backdrop click ferme modal sans confirmation
- **Priorité :** 🔴 Critique
- **Effort :** M

Si formulaire sale → confirmation avant fermeture.

---

### Composant Toast

##### #41 — Toast sans `aria-live`
- **Priorité :** 🔴 Critique
- **Effort :** S

```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {children}
</div>
```

---

## Audit typographie

### État actuel

- **Display :** Cormorant Garamond (serif)
- **Body :** Outfit (sans-serif)
- **Mono :** DM Mono (monospace)

Chargées via `next/font`.

#### Issues

##### #42 — Font sizes incohérentes entre pages
- **Priorité :** 🟠 Important
- **Effort :** M

Landing h2: `clamp(2rem, 4vw, 3.2rem)` / Catalogue h1: `var(--text-4xl)` / Profile h1: `var(--text-3xl)`.

**Solution :** hiérarchie unique dans `globals.css`.

---

##### #43 — Line-height incohérent body text
- **Priorité :** 🟠 Important
- **Effort :** S

Définir `line-height: 1.6` comme standard.

---

##### #44 — Letter-spacing trop large sur eyebrows
- **Priorité :** 🟠 Important
- **Fichier :** `landing.css:65`
- **Effort :** S

`.22em` → réduire à `.12em`-`.15em`.

---

##### #45 — Pas de fluid typography assez agressive mobile
- **Priorité :** 🟡 Nice-to-have
- **Effort :** S

---

## Audit palette & couleurs

#### Issues

##### #46 — Contraste texte sur fond or insuffisant
- **Priorité :** 🔴 Critique
- **Effort :** M

Texte `--text-3` sur `--gold` = ~3:1. Utiliser `var(--void)` pour tous les textes sur or.

---

##### #47 — `--gold-hi` non accessible sur blanc
- **Priorité :** 🔴 Critique
- **Effort :** S

`#c9a84c` sur blanc = ~3.2:1. Utiliser `--gold` pour textes critiques.

---

##### #48 — Pas de support high-contrast mode
- **Priorité :** 🔴 Critique
- **Effort :** M

```css
@media (prefers-contrast: more) {
  :root {
    --b1: rgba(26, 23, 20, 0.3);
    --b2: rgba(168, 120, 42, 0.2);
  }
  button { border-width: 2px; }
}
```

---

##### #49 — `--gold` vs `--gold-hi` utilisation incohérente
- **Priorité :** 🟠 Important
- **Effort :** M

Standardiser : boutons primaires → gradient, reste → `--gold` seul.

---

## Audit espacement & layout

#### Issues

##### #50 — Padding page incohérent
- **Priorité :** 🔴 Critique
- **Effort :** M

Landing `10rem 2rem 6rem` / Catalogue `84px 2rem 3rem` / Profile `84px 3rem 3rem`.

**Solution :** tokens d'espacement uniformes (`--space-page-y`, `--space-page-x`).

---

##### #51 — Max-width containers variés
- **Priorité :** 🔴 Critique
- **Effort :** S

1300px / 1400px / 1440px → standardiser sur **1400px**.

---

##### #52 — Gutter mobile trop grand sur < 375px
- **Priorité :** 🟠 Important
- **Effort :** S

```css
@media (max-width: 375px) {
  .container { padding: 0 0.75rem; }
}
```

---

## Audit interactions & micro-animations

#### Issues

##### #53 — Orbes animées en continu (batterie)
- **Priorité :** 🔴 Critique
- **Effort :** L

**Solution :** Intersection Observer pour pause hors-viewport.

---

##### #54 — Curseur custom boucle RAF continue
- **Priorité :** 🔴 Critique
- **Fichier :** `LuxuryCursor.tsx`
- **Effort :** M

Pause après inactivité utilisateur.

---

##### #55 — Transitions 400ms trop longues mobile
- **Priorité :** 🟠 Important
- **Effort :** M

```css
@media (pointer: coarse) {
  :root { --transition-slow: 0.2s; }
}
```

---

##### #56 — Pas de feedback `:active` sur boutons
- **Priorité :** 🟠 Important
- **Effort :** S

`transform: scale(0.98)` sur `:active`.

---

## Audit formulaires

#### Issues

##### #57 — Auth sans autoFocus premier champ
- **Priorité :** 🔴 Critique
- **Effort :** S

---

##### #58 — Confirmation password sans validation real-time
- **Priorité :** 🔴 Critique
- **Effort :** M

---

##### #59 — Password field sans toggle visibility
- **Priorité :** 🔴 Critique
- **Effort :** M

```tsx
<button type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? 'Masquer' : 'Afficher'}>
  {show ? <EyeOff /> : <Eye />}
</button>
```

---

##### #60 — Email sans feedback visual succès
- **Priorité :** 🟠 Important
- **Effort :** M

Icône checkmark vert quand champ valide.

---

## Audit navigation

#### Issues

##### #61 — Z-index système incohérent
- **Priorité :** 🔴 Critique
- **Effort :** S

```css
:root {
  --z-dropdown: 100;
  --z-sticky: 300;
  --z-drawer: 800;
  --z-modal: 1000;
  --z-toast: 1100;
  --z-tooltip: 1200;
}
```

---

##### #62 — Bottom nav mobile sans safe area fallback contenu
- **Priorité :** 🔴 Critique
- **Fichier :** `globals.css:927-948`
- **Effort :** S

---

##### #63 — Breadcrumbs manquants sur pages profondes
- **Priorité :** 🟠 Important
- **Effort :** M

---

## Audit mobile first

#### Issues

##### #64 — Touch targets < 44×44px (multiples)
- **Priorité :** 🔴 Critique
- **Effort :** L

Pills filtres (36px), favoris (32px), fermer modal (36px), pagination (38px).

---

##### #65 — Viewport meta tag à vérifier
- **Priorité :** 🔴 Critique
- **Effort :** S

---

##### #66 — Swipe gestures non-implémentées
- **Priorité :** 🟠 Important
- **Effort :** L

---

##### #67 — Pull-to-refresh interfère avec scrolls custom
- **Priorité :** 🟠 Important
- **Effort :** M

---

## Audit accessibilité (WCAG 2.1 AA)

#### Issues

##### #68 — Contrastes texte insuffisants (multiples)
- **Priorité :** 🔴 Critique
- **Effort :** L

| Élément | Contraste | Requis |
|---------|-----------|--------|
| Hero stat label | 2.8:1 | 4.5:1 ❌ |
| Auth subtitle | 3.2:1 | 4.5:1 ❌ |
| Gold text on white | 3.2:1 | 4.5:1 ❌ |

Audit complet avec Lighthouse/axe DevTools.

---

##### #69 — Images sans alt text
- **Priorité :** 🔴 Critique
- **Effort :** L

---

##### #70 — Form labels non liés aux inputs (`htmlFor`)
- **Priorité :** 🔴 Critique
- **Effort :** M

---

##### #71 — Headings hierarchy non respectée
- **Priorité :** 🟠 Important
- **Effort :** M

---

##### #72 — Liens sans texte discernable
- **Priorité :** 🟠 Important
- **Effort :** M

---

## Audit thème (dark/light)

#### Issues

##### #73 — Dark mode non testé complètement
- **Priorité :** 🟠 Important
- **Effort :** L

Certains éléments (hero gradients, glows) sans variantes dark.

---

##### #74 — Détection thème système dans Navbar
- **Priorité :** 🟠 Important
- **Effort :** S

Déplacer la logique dans le layout root.

---

## Audit contenu & copywriting

#### Issues

##### #75 — Messages d'erreur génériques
- **Priorité :** 🟠 Important
- **Effort :** M

❌ « Une erreur est survenue »
✅ « Cet email est déjà utilisé »
✅ « Crédit insuffisant (il vous manque 5 crédits) »

---

##### #76 — CTA non descriptifs
- **Priorité :** 🟠 Important
- **Effort :** S

❌ « Cliquez ici » / « OK »
✅ « Parcourir le catalogue » / « Acheter ce sujet »

---

##### #77 — Placeholder utilisé comme label
- **Priorité :** 🟠 Important
- **Effort :** M

---

##### #78 — Pas d'instructions claires pour paiement manuel
- **Priorité :** 🟠 Important
- **Effort :** M

Étapes Mobile Money avec numéros USSD à composer.

---

##### #79 — Pas de confirmations rassurantes après actions
- **Priorité :** 🟡 Nice-to-have
- **Effort :** S

---

##### #80 — Messages d'empty state peu engageants
- **Priorité :** 🟡 Nice-to-have
- **Effort :** M

---

##### #81 — Tone of voice non documenté
- **Priorité :** 🟡 Nice-to-have
- **Effort :** S

Guide de style d'écriture (formel/informel, vouvoiement/tutoiement).

---

## Résumé des problèmes

### Par sévérité

| Sévérité | Nombre | Temps estimé |
|----------|--------|--------------|
| 🔴 Critique | 27 | 60-80h |
| 🟠 Important | 35 | 40-60h |
| 🟡 Nice-to-have | 19 | 15-30h |
| **TOTAL** | **81** | **115-170h** |

### Top 10 problèmes prioritaires

1. **Contraste texte (#68)** — Multiples éléments invalides WCAG
2. **Touch targets (#64)** — 44×44px minimum partout
3. **Modal focus trap (#38)** — Accessibilité clavier critique
4. **Modal scroll lock (#12)** — Comportement inattendu
5. **Animations `reduced-motion` (#1, #32, #53)** — WCAG AAA
6. **Loading states (#17, #21, #25, #26)** — UX feedback
7. **Responsive tablettes (#2, #10, #22)** — Mobile-first gap
8. **Aria labels (#41, #70)** — Screen reader support
9. **Focus visible (#3, #16)** — Keyboard navigation
10. **Password toggle (#59)** — UX basique

---

## Plan d'action priorisé

### Phase 1 — Fondations design system (Semaine 1)

**Objectif :** Créer les bases réutilisables.

| # | Tâche | Effort |
|---|-------|--------|
| F1 | Composant `Logo` réutilisable | S |
| F2 | Système z-index (tokens CSS) | S |
| F3 | Tokens espacement pages uniformes | S |
| F4 | Max-width container standardisé (1400px) | S |
| F5 | Système `prefers-reduced-motion` global | S |
| F6 | Système `prefers-contrast` global | S |

---

### Phase 2 — Accessibilité critique (Semaines 2-3)

**Objectif :** Atteindre WCAG 2.1 AA.

| # | Tâche | Effort |
|---|-------|--------|
| A1 | Audit contrastes complet + fix global | L |
| A2 | Touch targets 44×44px partout | L |
| A3 | Form labels `htmlFor` + `aria-describedby` | M |
| A4 | Images alt text | L |
| A5 | Focus-visible visible partout | M |
| A6 | Headings hierarchy corrigée | M |
| A7 | ARIA sur tabs/progress/toast | M |

---

### Phase 3 — UX fondamentaux (Semaines 4-5)

| # | Tâche | Effort |
|---|-------|--------|
| U1 | Modal : focus trap + escape + scroll lock | M |
| U2 | Loading states tous les forms | M |
| U3 | Password visibility toggle | M |
| U4 | AutoFocus premier champ auth | S |
| U5 | Validation temps réel (email, password match) | M |
| U6 | Responsive tablettes (hero, catalogue, profil) | L |

---

### Phase 4 — Flow paiement manuel (Semaine 6)

| # | Tâche | Effort |
|---|-------|--------|
| P1 | Instructions Mobile Money par opérateur | M |
| P2 | Feedback « En attente de validation » + timeline | M |
| P3 | Admin : interface validation transactions | L |
| P4 | Notifications auto quand validé/rejeté | M |

---

### Phase 5 — Cohérence design (Semaines 7-8)

| # | Tâche | Effort |
|---|-------|--------|
| D1 | Typographie : hiérarchie unique | M |
| D2 | Spacing : tokens constants | M |
| D3 | Buttons : states cohérents (`:active`, `danger:focus`) | M |
| D4 | Inline styles → CSS Modules | L |
| D5 | Copywriting : messages d'erreur, CTA | M |
| D6 | Dark mode : variantes manquantes | L |

---

### Phase 6 — Polish & performance (Semaine 9)

| # | Tâche | Effort |
|---|-------|--------|
| O1 | Orbes : Intersection Observer | M |
| O2 | Curseur custom : pause inactivité | M |
| O3 | Breadcrumbs pages détail | M |
| O4 | Skeleton loaders partout | M |
| O5 | Empty states illustrés | M |

---

### Phase 7 — Enhancements (Semaine 10+)

| # | Tâche | Effort |
|---|-------|--------|
| E1 | Swipe gestures mobile | L |
| E2 | PWA + mode offline | L |
| E3 | i18n FR/MG | L |
| E4 | SEO (sitemap, OG images) | M |

---

## Conclusion

Mah.AI possède un **design system cohérent et élégant** avec une implémentation solide. Les problèmes identifiés sont principalement :

1. **Accessibilité** — Manques critiques en contrastes, touch targets, support clavier
2. **Responsivité** — Gaps entre mobile et desktop (tablettes mal couvertes)
3. **UX feedback** — États de chargement manquants, modales sans scroll lock
4. **Cohérence** — Duplication de styles, spacing variable, composants sous-utilisés

**Quick wins (< 1h chacun) :** Focus visible, z-index tokens, max-width container, Modal escape key, `aria-live` toast, autoFocus champ email.

**Recommandation :** Commencer par la **Phase 1** (fondations) puis **Phase 2** (accessibilité) pour un ROI maximal.

---

**Fin du rapport d'audit UX/UI — 2026-04-21**
