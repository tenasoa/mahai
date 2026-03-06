# 🚀 Mah.AI — Pages Publiques

**Plateforme EdTech made in 🇲🇬 Madagascar**

Sujets d'examens nationaux (BAC, BEPC, CEPE, Concours FP) + Corrections IA + Examens blancs

---

## 📋 Vue d'ensemble

Ce repository contient l'implémentation complète des **pages publiques** de Mah.AI, construites avec Next.js 14 App Router et respectant 100% la stack Zero Budget.

### ✅ Pages créées

- ✅ **Landing Page** (`/`) — Hero, features bento grid, how it works, testimonials, CTA
- ✅ **Page Pricing** (`/pricing`) — Packs de crédits, FAQ tarifs, paiements Mobile Money
- ✅ **Page À propos** (`/a-propos`) — Mission, vision, valeurs, comment ça marche
- ✅ **Page CGU** (`/cgu`) — Conditions générales d'utilisation complètes
- ✅ **Page FAQ** (`/faq`) — Questions fréquentes avec accordéon interactif

---

## 🛠️ Stack Technique

| Couche | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **Framework** | Next.js App Router | 14.2.0 | SSR, SEO, performance |
| **Language** | TypeScript | 5.4.2 | Type safety, DX |
| **Styling** | Tailwind CSS | 3.4.1 | Utility-first, mobile-first |
| **UI Components** | shadcn/ui + Radix UI | Latest | Composants accessibles |
| **Auth** | Clerk | 5.0.0 | Gratuit jusqu'à 10K MAU |
| **Database** | Supabase PostgreSQL | 2.39.7 | Free tier 500 MB |
| **File Storage** | Cloudflare R2 | - | Free tier 10 GB/mois |
| **Fonts** | Bricolage Grotesque + DM Mono | - | Design system Mah.AI |
| **Icons** | Lucide React | 0.358.0 | Icons modernes |
| **Analytics** | Vercel Analytics | 1.2.2 | Gratuit intégré |

---

## 🏗️ Structure du Projet

```
mahai-public-pages/
├── src/
│   ├── app/
│   │   ├── (public)/              # Route group pages publiques
│   │   │   ├── layout.tsx         # Layout Nav + Footer
│   │   │   ├── catalogue/
│   │   │   │   ├── page.tsx       # Liste sujets (TODO)
│   │   │   │   └── [id]/page.tsx  # Détail sujet (TODO)
│   │   │   ├── pricing/page.tsx   # ✅ Tarifs
│   │   │   ├── a-propos/page.tsx  # ✅ Mission & Vision
│   │   │   ├── cgu/page.tsx       # ✅ CGU
│   │   │   └── faq/page.tsx       # ✅ FAQ
│   │   ├── page.tsx               # ✅ Landing page
│   │   ├── layout.tsx             # Layout racine (Clerk, fonts)
│   │   └── api/                   # API Routes (TODO)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── nav.tsx            # ✅ Navigation
│   │   │   └── footer.tsx         # ✅ Footer
│   │   └── ui/                    # shadcn/ui components (à ajouter)
│   ├── lib/
│   │   ├── utils.ts               # ✅ Helpers (cn, formatAriary, etc.)
│   │   └── supabase.ts            # ✅ Client Supabase
│   └── styles/
│       └── globals.css            # ✅ Styles globaux + Tailwind
├── public/                        # Assets statiques (TODO: images, favicon)
├── middleware.ts                  # ✅ Clerk middleware
├── tailwind.config.ts             # ✅ Config Tailwind + design system
├── tsconfig.json                  # ✅ TypeScript strict
├── next.config.mjs                # ✅ Config Next.js
├── package.json                   # ✅ Dependencies
└── .env.example                   # ✅ Variables d'environnement
```

---

## 🚀 Installation & Setup

### Prérequis

- Node.js 18+ et pnpm (ou npm/yarn)
- Compte Clerk (gratuit jusqu'à 10K MAU)
- Compte Supabase (free tier 500 MB)
- Compte Cloudflare R2 (optionnel pour MVP)

### 1. Cloner et installer

```bash
cd mahai-public-pages
pnpm install
```

### 2. Configuration environnement

Copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Remplir les variables obligatoires :

```env
# Clerk (clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # Attention: JAMAIS côté client !

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Lancer le serveur de développement

```bash
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🎨 Design System

### Couleurs

Le design system Mah.AI est défini dans `tailwind.config.ts` :

| Couleur | Hex | Usage |
|---------|-----|-------|
| **Teal** | `#0AFFE0` | Primaire, CTA, liens |
| **Green** | `#00FF88` | Success, accents |
| **Gold** | `#FFD166` | Highlights, badges |
| **Rose** | `#FF6B9D` | Alerts, accents |
| **Blue** | `#4F8EF7` | Info |
| **Purple** | `#A78BFA` | Accents |

### Typographies

- **Sans-serif** : Bricolage Grotesque (300, 400, 500, 700, 800)
- **Monospace** : DM Mono (300, 400, 500)

### Utilisation

```tsx
// Gradient text
<h1 className="text-gradient-teal">Titre avec gradient</h1>

// Bouton primaire
<button className="px-6 py-3 bg-teal text-bg rounded-xl hover:bg-teal-600">
  CTA
</button>

// Card avec hover effect
<div className="rounded-xl border border-border bg-bg2 hover:border-border-2">
  Contenu
</div>
```

---

## 📱 Responsive Design

Toutes les pages sont **mobile-first** et optimisées pour :

- 📱 Mobile (320px+)
- 📱 Tablette (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large desktop (1440px+)

Breakpoints Tailwind :
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

---

## ✅ Checklist avant production

### SEO & Performance

- [ ] Ajouter `sitemap.xml` et `robots.txt`
- [ ] Optimiser images (WebP, AVIF)
- [ ] Ajouter favicons (16x16, 32x32, 180x180)
- [ ] Générer `og-image.png` (1200x630)
- [ ] Compléter Google Search Console verification
- [ ] Activer Vercel Analytics
- [ ] Tester performance Lighthouse (>90)

### Contenu

- [ ] Remplacer testimonials placeholder par vrais témoignages
- [ ] Ajouter images/illustrations sur landing page
- [ ] Compléter numéros de téléphone/WhatsApp dans footer
- [ ] Faire relire CGU par un avocat malgache
- [ ] Traduire FAQ selon retours utilisateurs beta

### Technique

- [ ] Créer shadcn/ui components (Button, Card, Badge, etc.)
- [ ] Implémenter pages Catalogue + Détail sujet
- [ ] Créer API routes (sujets, achats, crédits)
- [ ] Intégration Supabase (récupération données réelles)
- [ ] Setup Cloudflare R2 pour images
- [ ] Configurer webhook Clerk → Supabase
- [ ] Tests E2E avec Playwright
- [ ] Setup CI/CD GitHub Actions

### Legal & Compliance

- [ ] Finaliser CGU avec avocat
- [ ] Créer page Confidentialité (RGPD)
- [ ] Créer page Mentions légales
- [ ] Cookie consent banner
- [ ] Conditions Mobile Money (MVola, Orange, Airtel)

---

## 🚢 Déploiement

### Vercel (recommandé)

1. Push le code sur GitHub
2. Connecter le repo à Vercel
3. Ajouter les variables d'environnement
4. Déployer → automatique !

```bash
# OU via CLI
pnpm i -g vercel
vercel --prod
```

### Variables d'environnement Vercel

Ajouter dans **Settings > Environment Variables** :

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL (https://mah-ai.mg)
NODE_ENV (production)
```

---

## 📊 Prochaines étapes

### Phase 1 : Core MVP (2-4 semaines)

1. ✅ Pages publiques (FAIT)
2. 🔄 Pages Catalogue + Détail sujet
3. 🔄 Authentification Clerk complète
4. 🔄 API Routes + Supabase integration
5. 🔄 Système de crédits

### Phase 2 : Features MVP (4-6 semaines)

6. Dashboard étudiant
7. Upload fichiers R2
8. Corrections IA (OpenAI integration)
9. Paiement Mobile Money (MVola API)
10. Examens blancs

### Phase 3 : Growth (6-12 mois)

11. Espace contributeur
12. Corrections professeurs
13. Analytics & reporting
14. App mobile PWA
15. Multilingue (Malagasy)

---

## 🤝 Contribution

Ce projet est actuellement en développement privé. Pour toute question :

📧 Email : dev@mah-ai.mg  
🐛 Issues : Activer après MVP public

---

## 📜 Licence

Propriétaire — Mah.AI SARL © 2026

Tous droits réservés. Ce code ne peut être utilisé, copié ou distribué sans autorisation écrite.

---

**Fait avec ❤️ à Madagascar 🇲🇬**
