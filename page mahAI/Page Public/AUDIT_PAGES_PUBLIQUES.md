# 🔍 AUDIT PAGES PUBLIQUES — Mah.AI

**Date** : 2026-03-06  
**Scope** : Analyse des 3 composants React existants vs stack Zero Budget  
**Objectif** : Migration vers Next.js 14 App Router + création nouvelles pages

---

## ✅ POINTS POSITIFS

### Design System cohérent
- **Variables CSS** bien définies (`--teal`, `--bg`, `--font`, etc.)
- **Typographie** : Bricolage Grotesque + DM Mono — excellent choix
- **Palette** : Teal/Green/Gold/Rose — identité visuelle forte
- **Animations** : Fluides, modernes, performantes (CSS animations)
- **Mobile-first** : Media queries bien pensées

### Contenu aligné avec la vision
- **Ton malgache** : "Mah.AI", expressions locales, tons accessible
- **Pricing** : Ariary (Ar), crédits, packs cohérents avec stratégie
- **Features** : Catalogue, corrections IA, examens blancs → alignés vision produit
- **Stats** : 200+ sujets, 10 000+ étudiants cibles, 87% taux de réussite

### UX bien pensée
- **Navigation** : Fixe, backdrop-blur, réactive au scroll
- **Bento grids** : Mise en page moderne, hiérarchie visuelle claire
- **Micro-interactions** : Hover effects, mouse glow, reveal on scroll
- **Breadcrumbs** : Navigation claire sur page sujet
- **Filters** : Sidebar avec chips, range sliders, year pills

---

## ❌ PROBLÈMES CRITIQUES

### 1. Architecture incompatible avec Next.js
**État actuel** :
```jsx
// MahAI_LandingPage.jsx, MahAI_Catalogue.jsx, MahAI_PageSujet.jsx
import { useState } from "react";

const GLOBAL_CSS = `...`; // CSS injecté via useEffect

export default function Component() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_CSS;
    document.head.appendChild(style);
  }, []);
}
```

**Problèmes** :
- ❌ **Pas de SSR** : CSS injecté côté client → FOUC (Flash of Unstyled Content)
- ❌ **Pas de routing Next.js** : Composants standalone, pas de `page.tsx`
- ❌ **Pas de layouts partagés** : Code dupliqué (nav, footer, mesh background)
- ❌ **Pas de metadata SEO** : Aucun `<head>` géré par Next.js
- ❌ **Pas de Server Components** : Tout en client, perte de performance
- ❌ **CSS non optimisé** : Pas de Tailwind, pas de modules CSS

### 2. Stack technique non conforme
**Attendu (Stack Zero Budget)** :
- Next.js 14 App Router
- Tailwind CSS + shadcn/ui
- TypeScript strict
- Clerk pour auth
- Supabase pour DB
- Cloudflare R2 pour fichiers

**Actuel** :
- ✅ React (OK)
- ❌ Vanilla CSS inline (au lieu de Tailwind)
- ❌ JavaScript (au lieu de TypeScript)
- ❌ Pas d'intégration Clerk visible
- ❌ Pas d'appels API Supabase
- ❌ Pas de Server Actions

### 3. Données en dur
**Exemples** :
```jsx
// MahAI_Catalogue.jsx - ligne 155
const SUBJECTS = [
  { id:1, type:"BAC", matiere:"Mathématiques", serie:"C&D", annee:2024, ... },
  { id:2, type:"BAC", matiere:"Physique-Chimie", ... },
  // ...
];
```

**Problème** :
- ❌ Aucune connexion à Supabase
- ❌ Pas de pagination serveur
- ❌ Pas de recherche full-text
- ❌ Données statiques non maintenables

### 4. Authentification absente
**Constat** :
```jsx
// Composants nav affichent un avatar fictif
<div className="nav-avatar">👤</div>
<div className="nav-credits">🪙 12 crédits</div>
```

**Problème** :
- ❌ Pas de `<ClerkProvider>`
- ❌ Pas de `useUser()` hook
- ❌ Pas de gestion des rôles (étudiant/contributeur/admin)
- ❌ Pas de routes protégées

### 5. Performance non optimisée
**Problèmes** :
- ❌ Toutes les images chargées en `<img>` au lieu de `next/image`
- ❌ Pas de lazy loading des composants lourds
- ❌ Pas de prefetching des routes
- ❌ Bundle JavaScript non split

---

## 📋 STRUCTURE NEXT.JS RECOMMANDÉE

Selon **MahAI_Guide_Technique_Partie1.md** (lignes 173-227) :

```
src/app/
├── layout.tsx              # Layout racine (html, body, Clerk, fonts)
├── page.tsx                # Landing page (/)
│
├── (public)/               # Groupe : pages publiques
│   ├── catalogue/
│   │   ├── page.tsx        # Liste sujets (/catalogue)
│   │   └── [id]/page.tsx   # Détail sujet (/catalogue/[id])
│   ├── pricing/page.tsx    # Tarifs (/pricing)
│   ├── a-propos/page.tsx   # Mission (/a-propos)
│   ├── cgu/page.tsx        # CGU (/cgu)
│   └── layout.tsx          # Layout public (nav + footer)
│
├── (auth)/                 # Groupe : authentification
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   └── onboarding/page.tsx
│
├── (dashboard)/            # Groupe : espace étudiant (protégé)
│   ├── layout.tsx          # Sidebar + header
│   ├── accueil/page.tsx
│   ├── mes-sujets/page.tsx
│   └── ...
│
└── api/                    # API Routes
    ├── auth/webhook/route.ts
    ├── sujets/route.ts
    └── ...
```

**Pourquoi cette structure ?** :
- ✅ **Route Groups** `(public)`, `(auth)`, `(dashboard)` → layouts distincts
- ✅ **Layouts partagés** → nav/footer réutilisés sans duplication
- ✅ **File-based routing** → URL automatiques depuis noms de dossiers
- ✅ **Server Components par défaut** → performance optimale
- ✅ **Metadata** → SEO géré par `export const metadata`

---

## 🎯 PLAN D'ACTION

### Phase 1 : Setup infrastructure ✅
- [x] Auditer composants existants
- [ ] Créer structure Next.js App Router officielle
- [ ] Configurer Tailwind + shadcn/ui
- [ ] Setup Clerk provider
- [ ] Créer layout racine + layouts groupes

### Phase 2 : Migration pages existantes 🔄
- [ ] Migrer Landing Page → `src/app/page.tsx`
- [ ] Migrer Catalogue → `src/app/(public)/catalogue/page.tsx`
- [ ] Migrer Page Sujet → `src/app/(public)/catalogue/[id]/page.tsx`
- [ ] Convertir CSS inline → Tailwind classes
- [ ] Extraire composants réutilisables (Nav, Footer, Cards)

### Phase 3 : Nouvelles pages publiques 🆕
- [ ] Créer `/pricing` (P1)
- [ ] Créer `/a-propos` (P2)
- [ ] Créer `/cgu` (P2)
- [ ] Créer `/faq` (P3)
- [ ] Créer `/contact` (P3)

### Phase 4 : Intégration stack 🔌
- [ ] Connexion Supabase (récupération sujets depuis DB)
- [ ] Intégration Clerk (auth + rôles)
- [ ] Cloudflare R2 (images optimisées)
- [ ] API Routes (achats crédits, recherche)

---

## 🚨 DÉCISIONS CLÉS

### CSS : Tailwind ou garder le CSS actuel ?
**Recommandation** : **Migration progressive vers Tailwind**

**Justification** :
- ✅ Tailwind = standard industrie, maintenance facile
- ✅ shadcn/ui = composants prêts, cohérents
- ✅ DX (Developer Experience) meilleure
- ⚠️ Migration complète = 3-5 jours de travail
- 💡 **Compromis** : Garder design system actuel, traduire en Tailwind utilities

### TypeScript : Migration ou rester en JS ?
**Recommandation** : **TypeScript strict dès maintenant**

**Justification** :
- ✅ Stack officielle = TypeScript strict
- ✅ Évite bugs en production
- ✅ Meilleure DX (autocomplete, type safety)
- ✅ Prisma génère types automatiquement
- ⚠️ Courbe apprentissage si nouveau
- 💡 **Plan** : Créer toutes nouvelles pages en `.tsx`, migrer anciennes progressivement

### Composants : Extraire en lib ou inline ?
**Recommandation** : **Extraire composants réutilisables**

**Structure** :
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── nav.tsx
│   │   ├── footer.tsx
│   │   └── mesh-background.tsx
│   ├── catalog/
│   │   ├── subject-card.tsx
│   │   ├── filter-sidebar.tsx
│   │   └── search-bar.tsx
│   └── landing/
│       ├── hero-section.tsx
│       ├── features-bento.tsx
│       └── pricing-cards.tsx
```

---

## 📊 ESTIMATION EFFORT

| Tâche | Complexité | Temps estimé |
|-------|-----------|--------------|
| Setup Next.js + Tailwind + Clerk | Moyenne | 4h |
| Migration Landing Page | Moyenne | 6h |
| Migration Catalogue | Haute | 8h |
| Migration Page Sujet | Haute | 6h |
| Création page Pricing | Faible | 3h |
| Création page À propos | Faible | 2h |
| Création page CGU | Faible | 2h |
| Création page FAQ | Moyenne | 3h |
| Extraction composants réutilisables | Moyenne | 4h |
| Intégration Supabase (data réelle) | Haute | 6h |
| Tests + debugging | - | 6h |
| **TOTAL** | - | **~50h** |

---

## ✅ NEXT STEPS

**Ordre d'exécution recommandé** :

1. ✅ **Créer structure Next.js complète** (dossiers vides)
2. ✅ **Setup Tailwind + shadcn/ui**
3. ✅ **Créer layout racine + layouts groupes**
4. ✅ **Migrer design system CSS → Tailwind config**
5. ✅ **Créer composants UI de base** (Button, Card, Badge, etc.)
6. 🔄 **Migrer Landing Page** (conversion complète)
7. 🔄 **Créer nouvelles pages publiques** (Pricing, À propos, CGU, FAQ)
8. 🔄 **Migrer Catalogue + Page Sujet**
9. 🔌 **Intégration Supabase + Clerk**
10. 🚀 **Tests + deployment Vercel**

---

## 💡 RECOMMANDATIONS STRATÉGIQUES

### Court terme (cette semaine)
- ⚡ **Priorité absolue** : Créer structure Next.js officielle
- ⚡ Créer page Pricing (P1 pour monétisation)
- ⚡ Setup Clerk (auth = bloquant pour dashboard)

### Moyen terme (2-4 semaines)
- Migrer toutes pages publiques vers Next.js
- Intégration complète Supabase
- Tests utilisateurs sur landing + pricing

### Long terme (phase croissance)
- Page contributeur (saisie sujets)
- Dashboard étudiant complet
- Examens blancs

---

**📌 Conclusion** : Les composants existants sont d'excellente qualité en termes de design et UX, mais nécessitent une **refonte architecturale complète** pour respecter la stack Zero Budget et bénéficier des avantages Next.js (SSR, SEO, performance, TypeScript).

La migration est **inévitable** pour la réussite du MVP. Estimation : **50h de travail**.

**Question clé** : Veux-tu que je commence par la migration des pages existantes ou par la création des nouvelles pages publiques ?
