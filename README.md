# 🚀 Mah.AI — Plateforme d'examens pour Madagascar

**Next.js 16 + Turbopack + Vercel Blob + Paiements manuels**

---

## 🎯 Vue d'ensemble

Mah.AI est une plateforme EdTech qui démocratise l'accès aux sujets d'examens nationaux malgaches (BAC, BEPC, CEPE) avec :
- 📚 Catalogue de sujets annotés
- 🤖 Corrections IA détaillées
- ⏱ Examens blancs chronométrés
- 💳 Système de crédits (MVola, Orange, Airtel)

---

## 🛠️ Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Framework** | Next.js 16 App Router | 16.x |
| **Bundler** | Turbopack | Inclus |
| **Language** | TypeScript | 5.6+ |
| **Styling** | Tailwind CSS | 4.x |
| **Auth** | Clerk | 7.x |
| **Database** | Supabase PostgreSQL | - |
| **Storage** | Vercel Blob | 2.x |
| **Validation** | Zod | 4.x |

---

## 🚀 Installation

### 1. Prérequis

```bash
node --version  # v20+
pnpm --version  # v8+
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration

```bash
# Copier .env.example vers .env.local
cp .env.example .env.local

# Remplir les variables
```

### 4. Base de données

```bash
# Générer le client Prisma
pnpm db:generate

# Appliquer les migrations (après avoir configuré DATABASE_URL)
pnpm db:push
```

### 5. Lancer en développement

```bash
pnpm dev
# → http://localhost:3000
```

---

## 📁 Structure du projet

```
mah-ai_qwen/
├── src/
│   ├── app/
│   │   ├── (public)/           # Pages publiques
│   │   ├── (dashboard)/        # Espace connecté
│   │   ├── (admin)/            # Admin panel
│   │   ├── api/                # API routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui
│   │   ├── layout/             # Nav, Footer, Sidebar
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── db/prisma.ts
│   │   ├── storage/blob.ts
│   │   └── utils/format.ts
│   │
│   └── types/
│       └── index.ts
│
├── prisma/
│   └── schema.prisma
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🔐 Authentification (Proxy)

Pas de middleware ! Auth explicite dans chaque page :

```typescript
// app/(dashboard)/page.tsx
import { auth } from '@clerk/nextjs/server'

export default async function Dashboard() {
  const { userId } = await auth()
  
  if (!userId) redirect('/sign-in')
  
  return <div>Dashboard</div>
}
```

---

## 📦 Storage (Vercel Blob)

```typescript
// Upload d'un PDF
import { uploadSujetPDF } from '@/lib/storage/blob'

const { url } = await uploadSujetPDF(file, sujetId)
```

---

## 💳 Paiements manuels

Workflow :
1. Étudiant sélectionne pack crédits
2. Upload capture MVola/Orange
3. Admin valide dans dashboard
4. Crédits ajoutés au compte

---

## 📊 Schéma de base de données

Voir `prisma/schema.prisma` :

- `User` — Utilisateurs avec rôles multiples
- `Sujet` — Sujets d'examens
- `Achat` — Achats de sujets
- `Transaction` — Paiements crédits
- `Gain` — Gains contributeurs
- `Notification` — Notifications
- `ExamenBlanc` — Examens blancs

---

## 🎨 Design System

### Couleurs

- `--teal: #0AFFE0` — Primaire
- `--green: #00FF88` — Success
- `--gold: #FFD166` — Premium
- `--rose: #FF6B9D` — Alerts

### Typographie

- **Bricolage Grotesque** — Titres, body
- **DM Mono** — Prix, badges, code

---

## 📋 Roadmap

### Phase 0 : MVP (5 jours)
- [x] Setup Next.js 16 + Turbopack
- [x] Structure de base
- [ ] Landing Page
- [ ] Catalogue
- [ ] Page Sujet
- [ ] Recharge crédits (manuel)
- [ ] Admin validation

### Phase 1 : Opérations (3 semaines)
- [ ] Contribution (upload sujets)
- [ ] Vérification
- [ ] Dashboard étudiant complet
- [ ] Examens blancs

### Phase 2 : Automatisation (6 semaines)
- [ ] Paiements automatiques (MVola API)
- [ ] Notifications
- [ ] Professeurs

### Phase 3 : Scale (4 semaines)
- [ ] Admin Panel complet
- [ ] Migration R2 (optionnel)
- [ ] i18n Malagasy

---

## 🔧 Commandes

```bash
# Développement
pnpm dev              # Next.js + Turbopack

# Build
pnpm build
pnpm start

# Database
pnpm db:generate      # Prisma generate
pnpm db:push          # Push schema to DB
pnpm db:studio        # Prisma Studio

# Linting
pnpm lint
```

---

## 📝 License

Propriétaire — Mah.AI © 2026

---

**Made with ❤️ for Madagascar 🇲🇬**
