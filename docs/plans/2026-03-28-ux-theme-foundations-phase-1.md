# Phase 1 UX Theme Foundations Implementation Plan

> **Execution:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** stabiliser les fondations du design system Mah.AI en centralisant les tokens runtime et en supprimant la concurrence entre `globals.css` et `dashboard-theme.css`.

**Architecture:** `app/globals.css` devient la source de vérité unique pour les tokens CSS partagés à toute l'application. `app/dashboard-theme.css` est réduit à une couche de compatibilité légère pour les pages admin/contributeur qui importent encore ce fichier, sans redéfinir le thème de base.

**Tech Stack:** Next.js App Router, CSS global, Tailwind config, Node test runner (`node --test`).

---

### Task 1: Cadrer le backlog exécutable

**Files:**
- Create: `docs/plans/2026-03-28-ux-theme-foundations-phase-1.md`
- Review: `docs/DESIGN_TOKENS.md`
- Review: `app/globals.css`
- Review: `app/dashboard-theme.css`

**Step 1: Confirmer le périmètre phase 1**

Vérifier que la phase 1 couvre uniquement:
- source de vérité des tokens;
- variables CSS manquantes;
- compatibilité dashboard/admin/contributeur;
- vérification locale minimale.

**Step 2: Définir les livrables**

Livrables attendus:
- un backlog exécutable sauvegardé;
- un test rouge puis vert sur les tokens globaux;
- `globals.css` enrichi avec les tokens manquants et utilisés en runtime;
- `dashboard-theme.css` sans second `:root` concurrent.

### Task 2: Écrire le test de régression des tokens

**Files:**
- Create: `__tests__/design-system/theme-foundations.test.mjs`
- Review: `app/globals.css`
- Review: `app/dashboard-theme.css`

**Step 1: Write the failing test**

Le test doit vérifier:
- que `app/globals.css` définit en `:root` les tokens `--void-rgb`, `--depth-rgb`, `--card-hover`, `--lift`, `--glow-sm`, `--glow-md`, `--glow-lg`, `--ruby-dim`, `--ruby-line`, `--sage-dim`, `--sage-line`, `--amber-dim`, `--amber-line`, `--blue`, `--blue-dim`, `--blue-line`, `--glass`, `--sh-gold`, `--sh-ruby`, `--ease-out`, `--ease-elastic`;
- que le bloc `[data-theme="dark"]` redéfinit les versions dark des tokens critiques;
- que `app/dashboard-theme.css` n’expose plus de bloc `:root` ni de bloc `[data-theme="light"]`.

**Step 2: Run test to verify it fails**

Run: `node --test __tests__/design-system/theme-foundations.test.mjs`
Expected: FAIL sur les tokens absents et sur la présence du `:root` concurrent dans `app/dashboard-theme.css`.

### Task 3: Centraliser les tokens globaux

**Files:**
- Modify: `app/globals.css`
- Review: `tailwind.config.js`
- Review: `app/landing.css`
- Review: `app/catalogue/catalogue.css`
- Review: `components/layout/LuxuryNavbar.module.css`

**Step 1: Ajouter les tokens runtime manquants**

Ajouter dans `:root` et `[data-theme="dark"]`:
- RGB backgrounds (`--void-rgb`, `--depth-rgb`);
- surfaces dérivées (`--card-hover`, `--lift`, `--glass`);
- ombres/glows (`--glow-sm`, `--glow-md`, `--glow-lg`, `--sh-gold`, `--sh-ruby`);
- accents sémantiques (`--ruby-dim`, `--ruby-line`, `--sage-dim`, `--sage-line`, `--amber-dim`, `--amber-line`, `--blue`, `--blue-dim`, `--blue-line`);
- easing (`--ease-out`, `--ease-elastic`).

**Step 2: Conserver la compatibilité avec le code existant**

Ne pas retirer les tokens déjà consommés par Tailwind ou les composants existants. Les nouveaux tokens doivent être cohérents avec la palette Mah.AI déjà documentée.

### Task 4: Réduire `dashboard-theme.css` à une couche de compatibilité

**Files:**
- Modify: `app/dashboard-theme.css`
- Review: `app/admin/admin.css`
- Review: `app/contributeur/contributeur.css`
- Review: `components/admin/AdminSidebar.tsx`

**Step 1: Supprimer le second thème**

Retirer les blocs:
- `:root { ... }`
- `[data-theme="light"] { ... }`

**Step 2: Garder uniquement la compatibilité locale**

Conserver dans `app/dashboard-theme.css` uniquement:
- les utilitaires encore utilisés par les écrans dashboard/admin/contributeur;
- les focus states et helpers si encore nécessaires;
- des commentaires expliquant qu’il s’agit d’une couche de compatibilité, pas d’une source de vérité de tokens.

### Task 5: Vérifier localement

**Files:**
- Test: `__tests__/design-system/theme-foundations.test.mjs`
- Verify: `app/globals.css`
- Verify: `app/dashboard-theme.css`

**Step 1: Run test to verify it passes**

Run: `node --test __tests__/design-system/theme-foundations.test.mjs`
Expected: PASS

**Step 2: Run lint on touched files**

Run: `pnpm lint`
Expected: pas de nouvelle erreur bloquante introduite par la phase 1.

**Step 3: Vérification manuelle rapide**

Contrôler que les pages suivantes gardent des tokens cohérents:
- accueil;
- dashboard;
- catalogue;
- admin;
- contributeur.

### Backlog priorisé

1. Écrire le test rouge sur les tokens partagés.
2. Enrichir `app/globals.css` avec les tokens runtime manquants.
3. Réduire `app/dashboard-theme.css` à une compatibilité sans `:root`.
4. Vérifier `node --test`.
5. Vérifier `pnpm lint`.
