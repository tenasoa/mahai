# 🏆 LIGHTHOUSE TEST GUIDE

**Date :** 23 mars 2026  
**Objectif :** Performance ≥ 90, Accessibility ≥ 95

---

## 📦 Installation

```bash
# Installer Lighthouse CLI
npm install -g lighthouse

# Ou utiliser via npx
npx lighthouse --version
```

---

## 🚀 Exécution des Tests

### Test Complet

```bash
# Build du projet
cd mahai
pnpm build

# Démarrer le serveur de production
pnpm start

# Dans un autre terminal, exécuter Lighthouse
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./lighthouse-report.html \
  --view
```

### Pages à Tester

| Page | URL | Priorité |
|------|-----|----------|
| Accueil | `/` | 🔴 Haute |
| Catalogue | `/catalogue` | 🔴 Haute |
| Recharge | `/recharge` | 🔴 Haute |
| Dashboard | `/dashboard` | 🔴 Haute |
| Profil | `/profil` | 🟡 Moyenne |
| Sujet Detail | `/sujet/[id]` | 🟡 Moyenne |

---

## 📊 Métriques Cibles

### Performance (≥ 90)

| Métrique | Cible | Poids |
|----------|-------|-------|
| First Contentful Paint | < 1.5s | 10% |
| Speed Index | < 3.4s | 10% |
| Largest Contentful Paint | < 2.5s | 25% |
| Time to Interactive | < 3.8s | 30% |
| Total Blocking Time | < 200ms | 25% |
| Cumulative Layout Shift | < 0.1 | 0% |

### Accessibility (≥ 95)

| Catégorie | Cible |
|-----------|-------|
| Navigation au clavier | ✅ |
| Focus states | ✅ |
| ARIA labels | ✅ |
| Contrast ratios | ✅ |
| Alt text images | ✅ |

---

## ✅ Checklist d'Optimisation

### Images
- [ ] Utiliser le format WebP
- [ ] Lazy loading (`loading="lazy"`)
- [ ] Dimensions explicites (width/height)
- [ ] Compression appropriée

### CSS
- [ ] CSS Modules utilisés
- [ ] Pas de CSS inline
- [ ] Critical CSS extrait
- [ ] Unused CSS minimisé

### JavaScript
- [ ] Code splitting par page
- [ ] Tree-shaking activé
- [ ] Pas de blocking scripts
- [ ] Debounce/throttle sur events

### Fonts
- [ ] `font-display: swap` utilisé
- [ ] Subsetting des caractères
- [ ] Preload des fonts critiques

---

## 🔧 Commandes Utiles

### Rapport HTML
```bash
npx lighthouse http://localhost:3000 \
  --output=html \
  --output-path=./report.html \
  --view
```

### Rapport JSON
```bash
npx lighthouse http://localhost:3000 \
  --output=json \
  --output-path=./report.json
```

### Mobile Emulation
```bash
npx lighthouse http://localhost:3000 \
  --preset=mobile \
  --output=html \
  --output-path=./mobile-report.html
```

### Desktop
```bash
npx lighthouse http://localhost:3000 \
  --preset=desktop \
  --output=html \
  --output-path=./desktop-report.html
```

### Performance Budget
```bash
npx lighthouse http://localhost:3000 \
  --budget-path=./budget.json \
  --output=html
```

---

## 📄 Exemple de Budget (budget.json)

```json
{
  "extends": "lighthouse:default",
  "settings": {
    "onlyCategories": ["performance", "accessibility"]
  },
  "budgets": [
    {
      "path": "/*",
      "resourceSizes": [
        {"resourceType": "script", "budget": 300},
        {"resourceType": "stylesheet", "budget": 50},
        {"resourceType": "image", "budget": 500},
        {"resourceType": "font", "budget": 100},
        {"resourceType": "total", "budget": 1000}
      ],
      "resourceCounts": [
        {"resourceType": "third-party", "budget": 10}
      ]
    }
  ]
}
```

---

## 🎯 Optimisations Spécifiques

### 1. Images
```tsx
// Utiliser next/image
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  loading="lazy"
  quality={80}
  format="webp"
/>
```

### 2. Fonts
```css
/* globals.css */
@font-face {
  font-family: 'Cormorant Garamond';
  src: url('/fonts/cormorant.woff2') format('woff2');
  font-display: swap;
}
```

### 3. Code Splitting
```tsx
// Chargement dynamique
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

### 4. Critical CSS
```css
/* Inline critical CSS dans layout.tsx */
<style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
```

---

## 📈 Suivi Continu

### CI/CD Integration
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Lighthouse
        uses: treosh/lighthouse-ci-action@v8
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/catalogue
            http://localhost:3000/recharge
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Score Tracking
```bash
# Script de vérification
pnpm build && pnpm start &
sleep 5
npx lighthouse http://localhost:3000 --output=json --output-path=./lh.json

# Extraire les scores
cat lh.json | jq '.categories | {performance: .performance.score, accessibility: .accessibility.score}'
```

---

## ✅ Critères d'Acceptation

| Métrique | Minimum | Cible | Statut |
|----------|---------|-------|--------|
| Performance | 85 | 90+ | ⏳ À tester |
| Accessibility | 90 | 95+ | ⏳ À tester |
| Best Practices | 90 | 95+ | ⏳ À tester |
| SEO | 90 | 95+ | ⏳ À tester |

---

**Prochaine étape :** Exécuter les tests et valider les scores

*Guide créé le 23 mars 2026*
